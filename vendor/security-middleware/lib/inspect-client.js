const request = require('request').defaults({ rejectUnauthorized: false });
const config = require('./config/auth-config.js');
// const fs = require('fs');

module.exports.inspect = (req, token, cb) => {
  // token review api to validate Bearer token/ retrieve user info
  // const serviceaccounttoken = fs.readFileSync(config.ocp.serviceaccount_tokenpath).toString();
  const serviceaccounttoken = config.ocp.serviceaccount_token;

  const options = {
    url: `${config.ocp.apiserver_url}/apis/authentication.k8s.io/v1/tokenreviews`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${serviceaccounttoken}`,
    },
    json: true,
    body: {
      apiVersion: 'authentication.k8s.io/v1',
      kind: 'TokenReview',
      spec: {
        token,
      },
    },
  };
  // retrieving user info through token review api
  request.post(options, (err, resp, reviewbody) => cb(err, resp, reviewbody));
};
