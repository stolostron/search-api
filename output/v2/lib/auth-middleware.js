'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Get a Kubernetes token from the authorization token.
// - When the actor is a user we receive an access_token, and exchange it for an id_token.
// - When the actor is a service id, there isn't a Kubernetes token, so we use the
//   service account token. This is only possible if the service id role is ClusterAdmin.
let getKubeToken = (() => {
  var _ref = _asyncToGenerator(function* ({
    authorization,
    shouldLocalAuth
  }) {
    if (_lodash2.default.isEmpty(authorization) && shouldLocalAuth || process.env.MOCK === 'true') {
      // special case for graphiql to work locally
      // do not exchange for idtoken since authorization header is empty
      return process.env.SERVICEACCT_TOKEN || 'localdev';
    }
    const idToken = authorization.replace('Bearer ', '');
    if (!idToken) {
      throw new Error('Authentication error: invalid token parsed from cookie');
    }

    return idToken;
  });

  return function getKubeToken(_x) {
    return _ref.apply(this, arguments);
  };
})();

// Get the namespaces authorized for the access_token.
// usertoken - could be from a user or service id.


let getNamespaces = (() => {
  var _ref2 = _asyncToGenerator(function* (usertoken) {
    const options = {
      url: `${_config2.default.get('API_SERVER_URL')}/apis/project.openshift.io/v1/projects`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${usertoken}`
      },
      json: true,
      fullResponse: false
    };
    if (process.env.NODE_ENV === 'test') {
      const mockReq = (0, _iamHttp2.default)();
      return mockReq(options);
    }
    const nsResponse = yield (0, _request2.default)(options);
    return Array.isArray(nsResponse.items) ? nsResponse.items.map(function (ns) {
      return ns.metadata.name;
    }) : [];
  });

  return function getNamespaces(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

// Middleware to:
// - Set namespaces to filter this request.
// - Set user for the request
// - Set token for kubernetes requests.


exports.default = createAuthMiddleWare;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _iamHttp = require('../mocks/iam-http');

var _iamHttp2 = _interopRequireDefault(_iamHttp);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

// Async middleware error handler
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};function createAuthMiddleWare({
  cache = (0, _lruCache2.default)({
    max: 1000,
    maxAge: 2 * 60 * 1000 // 2 mins. Must keep low because user's permissions can change.
  }),
  shouldLocalAuth
} = {}) {
  return asyncMiddleware((() => {
    var _ref3 = _asyncToGenerator(function* (req, res, next) {
      const idToken = yield getKubeToken({
        authorization: req.headers.authorization || req.headers.Authorization,
        shouldLocalAuth
      });
      req.kubeToken = idToken;
      // Get the namespaces for the user.
      // We cache the promise to prevent starting the same request multiple times.
      let nsPromise = cache.get(`namespaces_${idToken}`);
      if (!nsPromise) {
        nsPromise = getNamespaces(idToken);
        cache.set(`namespaces_${idToken}`, nsPromise);
      }
      req.user = {
        // temporarily using the idToken as userName until we figure out how to exchange token for name
        name: idToken,
        namespaces: yield nsPromise,
        idToken
      };

      next();
    });

    return function (_x3, _x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  })());
}
//# sourceMappingURL=auth-middleware.js.map