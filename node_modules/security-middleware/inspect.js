const express = require('express');

const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const log4js = require('log4js');

const logger = log4js.getLogger();
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const request = require('request').defaults({ rejectUnauthorized: false });
const configjs = require('./lib/config/init-auth-config.js');
const inspectClient = require('./lib/inspect-client');

const log4jsConfig = process.env.LOG4JS_CONFIG ? JSON.parse(process.env.LOG4JS_CONFIG) : undefined;
log4js.configure(log4jsConfig || './config/log4js.json');


const app = (req, res, next) => {
  let token;
  if (req.headers.authorization || req.headers.Authorization) {
    token = req.headers.authorization ? req.headers.authorization : req.headers.Authorization;
    const words = token.trim().split(/[\s,]+/);
    if (!(words[0].toLowerCase().match('bearer'))) {
      return res.status(403).send('No bearer in value');
    }
    if (words[1] && words[1].length > 1) {
      [, token] = words;
    }
  } else if (req.cookies['acm-access-token-cookie']) {
    token = `Bearer ${req.cookies['acm-access-token-cookie']}`;
  }

  if (!token) {
    return res.status(401).send('The request is unauthorized, no token provided.');
  }

  inspectClient.inspect(req, token, (err, response, body) => {
    if (err) {
      return res.status(500).send(err.details);
    } if (body && body.status && body.status.error) {
      return res.status(401).send(body.status.error);
    } if (body && body.status && body.status.user) {
      req.user = body.status.user;
      req.token = token;
      logger.debug(req.user);
      return next();
    }
    return res.status(401).send('The token provided is not valid');
  });
  return null;
};

const logout = (req, res) => {
  const token = req.headers['x-forwarded-access-token'] || req.cookies['acm-access-token-cookie'] || req.session.passport.user.token;
  inspectClient.inspect(req, token, (tokenErr, rspns, body) => {
    if (tokenErr) {
      return res.status(500).send(tokenErr.details);
    } if (body && body.status && body.status.error) {
      return res.status(401).send(body.status.error);
    } if (body && body.status && body.status.user) {
      const { user } = body.status;
      configjs.initialize((configErr, config) => {
        if (configErr) {
          logger.error('Initilize config failed', configErr);
          process.exit(1);
        }
        const logoutOptions = {
          url: `${config.ocp.apiserver_url}/apis/oauth.openshift.io/v1/oauthaccesstokens/${token}`,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        request.delete(logoutOptions, (err, response) => {
          if (err) {
            return res.status(500).send(err.details);
          }
          if (response.statusCode !== 200) {
            return res.status(response.statusCode).send(response.statusMessage);
          }
          const domainName = req.hostname;
          if (user && user.username && user.username === 'kube:admin') {
            const tPath = config.ocp.oauth2_tokenpath;
            const oauthHost = tPath.substring(0, tPath.length - 12);
            req.logout();
            if (req.session) {
              req.session.destroy((destroyErr) => {
                if (err) {
                  return logger.error(destroyErr);
                }
                res.clearCookie('connect.sid');
                res.clearCookie('acm-access-token-cookie');
                res.clearCookie('_oauth_proxy', { domain: domainName, path: '/' });
                return res.status(200).json({ admin: true, logoutPath: `${oauthHost}/logout` });
              });
            } else {
              res.clearCookie('connect.sid');
              res.clearCookie('acm-access-token-cookie');
              res.clearCookie('_oauth_proxy', { domain: domainName, path: '/' });
              return res.status(200).json({ admin: true, logoutPath: `${oauthHost}/logout` });
            }
          } else if (req.session) {
            req.session.destroy((destroyErr) => {
              if (destroyErr) {
                return logger.error(destroyErr);
              }
              res.clearCookie('connect.sid');
              res.clearCookie('acm-access-token-cookie');
              res.clearCookie('_oauth_proxy', { domain: domainName, path: '/' });
              req.logout();
              return res.status(200).json({ admin: false });
            });
          } else {
            res.clearCookie('connect.sid');
            res.clearCookie('acm-access-token-cookie');
            res.clearCookie('_oauth_proxy', { domain: domainName, path: '/' });
            req.logout();
            return res.status(200).json({ admin: false });
          }
          return null;
        });
      });
    }
    return null;
  });
};

const ui = () => {
  let contextpath = '';

  router.get('*', (req, res, next) => {
    contextpath = req.baseUrl;
    next();
  });

  if (process.env.NODE_ENV === 'production') {
    router.all('*', app);
  } else {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    configjs.initialize((err, config) => {
      if (err) {
        logger.error('Initilized failed', err);
        process.exit(1);
      }
      // token review api to validate Bearer token/ retrieve user info

      const options = {
        url: `${config.ocp.apiserver_url}/apis/authentication.k8s.io/v1/tokenreviews`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${config.ocp.serviceaccount_token}`,
        },
        json: true,
        body: {
          apiVersion: 'authentication.k8s.io/v1',
          kind: 'TokenReview',
          spec: {
            token: config.ocp.serviceaccount_token,
          },
        },
      };

      const callbackUrl = `${config.ocp.oauth2_redirecturl}`;

      passport.use(new OAuth2Strategy({
        // state: true,
        authorizationURL: `${config.ocp.oauth2_authorizepath}`,
        tokenURL: `${config.ocp.oauth2_tokenpath}`,
        clientID: config.ocp.oauth2_clientid,
        clientSecret: config.ocp.oauth2_clientsecret,
        callbackURL: callbackUrl,
        scope: 'user:full',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, cb) => {
        options.body.spec.token = accessToken;

        // retrieving user info through token review api
        request.post(options, (err1, resp2, reviewbody) => {
          if (err1) {
            return cb(err1);
          }
          if (reviewbody.status && reviewbody.status.user) {
            // eslint-disable-next-line no-param-reassign
            reviewbody.status.user.token = accessToken;
            return cb(null, reviewbody.status.user);
          }
          return cb(new Error('Server Error'));
        });
      }));

      passport.serializeUser((user, done) => {
        done(null, user);
      });

      passport.deserializeUser((user, done) => {
        done(null, user);
      });
    });

    router.use(session(
      {
        secret: process.env.OAUTH2_CLIENT_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 12 * 60 * 60 * 1000 },
      },
    ));
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(passport.initialize());
    router.use(passport.session());

    router.get(`${contextpath}/auth/login`, passport.authenticate('oauth2'));

    router.get(`${contextpath}/auth/callback`, passport.authenticate('oauth2', { failureRedirect: `${contextpath}/auth/login` }), (req, res) => {
      res.cookie(
        'acm-access-token-cookie',
        req.session.passport.user.token,
        {
          httpOnly: true, // server-side only
          secure: true,   // https only
          sameSite: false // allow different site for non-production
        }
      );
      req.user = req.session.passport.user;
      const redirectURL = req.cookies.redirectURL === '' ? `${contextpath}/welcome` : req.cookies.redirectURL;
      res.clearCookie('redirectURL');
      res.redirect(redirectURL);
    });

    router.get(`${contextpath}/logout`, logout);

    router.all('*', (req, res, next) => {
      if ((!req.session || !req.session.passport || !req.session.passport.user) && !req.cookies['acm-access-token-cookie']) {
        const redirect = req.originalUrl.endsWith('logout') ? contextpath : req.originalUrl;
        res.cookie('redirectURL', redirect);
        res.redirect(`${contextpath}/auth/login`);
      } else {
        // cookie exists, need to validate before proceeding
        const token = req.cookies['acm-access-token-cookie'] || req.session.passport.user.token;
        logger.debug('Already logged in: ', token);
        inspectClient.inspect(req, token, (err, response, body) => {
          if (err) {
            return res.status(500).send(err.details);
          } if (body && body.status && body.status.user && response.statusCode === 201) {
            req.user = body.status.user;
            logger.debug(req.user);
            logger.info('Security middleware check passed');
            return next();
          }
          logger.info('Security middleware check failed; redirecting to login');
          return res.redirect(`${contextpath}/auth/login`);
        });
      }
    });
  }


  return router;
};

module.exports.logout = logout;
module.exports.app = app;
module.exports.ui = ui;
