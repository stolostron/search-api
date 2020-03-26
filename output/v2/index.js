'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GRAPHIQL_PATH = exports.GRAPHQL_PATH = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _apolloServerExpress = require('apollo-server-express');

var _apolloErrors = require('apollo-errors');

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _securityMiddleware = require('security-middleware');

var _securityMiddleware2 = _interopRequireDefault(_securityMiddleware);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _logger = require('./lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _redisGraph = require('./connectors/redisGraph');

var _redisGraph2 = _interopRequireDefault(_redisGraph);

var _application = require('./models/application');

var _application2 = _interopRequireDefault(_application);

var _search = require('./models/search');

var _search2 = _interopRequireDefault(_search);

var _userSearch = require('./models/userSearch');

var _userSearch2 = _interopRequireDefault(_userSearch);

var _search3 = require('./mocks/search');

var _search4 = _interopRequireDefault(_search3);

var _schema = require('./schema/');

var _schema2 = _interopRequireDefault(_schema);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _authMiddleware = require('./lib/auth-middleware');

var _authMiddleware2 = _interopRequireDefault(_authMiddleware);

var _kube = require('./mocks/kube');

var _kube2 = _interopRequireDefault(_kube);

var _kube3 = require('./connectors/kube');

var _kube4 = _interopRequireDefault(_kube3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

const GRAPHQL_PATH = exports.GRAPHQL_PATH = `${_config2.default.get('contextPath')}/graphql`;
const GRAPHIQL_PATH = exports.GRAPHIQL_PATH = `${_config2.default.get('contextPath')}/graphiql`;

const isProd = _config2.default.get('NODE_ENV') === 'production';
const isTest = _config2.default.get('NODE_ENV') === 'test';

const formatError = error => {
  const { originalError } = error;
  if ((0, _apolloErrors.isInstance)(originalError)) {
    _logger2.default.error(JSON.stringify(error.originalError, null, 2));
  }
  return (0, _apolloErrors.formatError)(error);
};

const graphQLServer = (0, _express2.default)();
graphQLServer.use((0, _compression2.default)());

const requestLogger = isProd ? (0, _morgan2.default)('combined', {
  skip: (req, res) => res.statusCode < 400
}) : (0, _morgan2.default)('dev');

graphQLServer.use('*', (0, _helmet2.default)({
  frameguard: false,
  noSniff: false,
  xssFilter: false,
  noCache: true
}), requestLogger, (0, _cookieParser2.default)());

graphQLServer.get('/livenessProbe', (req, res) => {
  res.send(`Testing livenessProbe --> ${new Date().toLocaleString()}`);
});

graphQLServer.get('/readinessProbe', (req, res) => {
  res.send(`Testing readinessProbe --> ${new Date().toLocaleString()}`);
});

const auth = [];

if (isProd) {
  _logger2.default.info('Authentication enabled');
  auth.push(_securityMiddleware2.default.app, (0, _authMiddleware2.default)());
} else {
  auth.push((0, _authMiddleware2.default)({ shouldLocalAuth: true }));
  graphQLServer.use(GRAPHIQL_PATH, (0, _apolloServerExpress.graphiqlExpress)({ endpointURL: GRAPHQL_PATH }));
}

if (isTest) {
  _logger2.default.info('Running in mock mode');
  _logger2.default.info('Using Mocked search connector.');
} else {
  _logger2.default.info('Using RedisGraph search connector.');
}

graphQLServer.use(...auth);
graphQLServer.use(GRAPHQL_PATH, _bodyParser2.default.json(), (0, _apolloServerExpress.graphqlExpress)((() => {
  var _ref = _asyncToGenerator(function* (req) {
    let searchConnector;
    let kubeConnector;
    if (isTest) {
      searchConnector = new _search4.default();
      kubeConnector = new _kube2.default();
    } else {
      searchConnector = new _redisGraph2.default({ rbac: req.user.namespaces, req });
      kubeConnector = new _kube4.default({ token: req.kubeToken });
    }

    const context = {
      req,
      appModel: new _application2.default({ searchConnector }),
      searchModel: new _search2.default({ searchConnector }),
      queryModel: new _userSearch2.default({ kubeConnector })
    };

    return { formatError, schema: _schema2.default, context };
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})()));

exports.default = graphQLServer;
//# sourceMappingURL=index.js.map