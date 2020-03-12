const oauthserver = require('./oauthserver');
const config = require('./auth-config');

module.exports.initialize = (cb) => {
  oauthserver.info((err, authserverinfo) => {
    if (err) {
      return cb(err);
    }
    config.ocp.oauth2_tokenpath = authserverinfo.token_endpoint;
    config.ocp.oauth2_authorizepath = authserverinfo.authorization_endpoint;

    return cb(null, config);
  });
};
