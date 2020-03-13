// const request = require('request').defaults({ rejectUnauthorized: false });
import request from './request';

const config = require('../../../config');
// const fs = require('fs');
// const log4js = require('log4js');

// const logger = log4js.getLogger('service-account');
// const serviceAccountPath = '/var/run/secrets/kubernetes.io/serviceaccount';

module.exports.getOauthInfo = (req, cb) => {
  // let serviceaccountToken = null;
  // try {
  //   if (process.env.NODE_ENV === 'production') {
  //     serviceaccountToken = fs.readFileSync(`${serviceAccountPath}/token`, 'utf8');
  //   } else {
  //     serviceaccountToken = process.env.SERVICEACCT_TOKEN || '';
  //   }
  // } catch (err) {
  //   logger.error('Error reading service account token', err && err.message);
  // }

  // for both running local and inside cluster, the below endpoint can be used to
  // get the oauth2 server and authorizepath  and tokenpath endpoints.
  const options = {
    url: `${config.get('API_SERVER_URL')}/.well-known/oauth-authorization-server/`, // userinfo?access_token=${req.idToken}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${req.idToken}`,
    },
    json: true,
  };

  request.get(options, (err, response, body) => {
    if (err) {
      return cb(err);
    } if (response.statusCode === 200 && body) {
      return cb(null, body);
    }
    return cb(new Error(`Server Error: ${response.statusCode}`));
  });
};
