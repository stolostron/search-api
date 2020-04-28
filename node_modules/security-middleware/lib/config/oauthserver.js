const request = require('request').defaults({ rejectUnauthorized: false });
const config = require('./auth-config.js');

module.exports.info = (cb) => {
  // for both  running local and inside  cluster, the below endpoint can used to
  // get the oauth2 server and authorizepath  and tokenpath endpoints.
  const options = {
    url: `${config.ocp.apiserver_url}/.well-known/oauth-authorization-server`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.ocp.serviceaccount_token}`,
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
