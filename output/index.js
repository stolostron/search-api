'use strict';

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

const logger = _log4js2.default.getLogger('server');

const log4jsConfig = process.env.LOG4JS_CONFIG ? JSON.parse(process.env.LOG4JS_CONFIG) : undefined;
_log4js2.default.configure(log4jsConfig || 'config/log4js.json');

if (process.env.VCS_REF) {
  logger.info('Built from git commit: ', process.env.VCS_REF);
}

const GRAPHQL_PORT = process.env.PORT || _config2.default.get('httpPort') || 4010;
const CONTEXT_PATH = _config2.default.get('contextPath');

const graphQLServer = require('./v2').default;

const privateKey = _fs2.default.readFileSync(process.env.serverKey || './sslcert/searchapi.key', 'utf8');
const certificate = _fs2.default.readFileSync(process.env.serverCert || './sslcert/searchapi.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const server = _https2.default.createServer(credentials, graphQLServer);

server.listen(GRAPHQL_PORT, () => {
  logger.info(`[pid ${process.pid}] [env ${process.env.NODE_ENV}] [version V2] started.`);
  logger.info(`Search API is now running on https://localhost:${GRAPHQL_PORT}${CONTEXT_PATH}/graphql`);
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`GraphiQL is now running on https://localhost:${GRAPHQL_PORT}${CONTEXT_PATH}/graphiql`);
  }
});
//# sourceMappingURL=index.js.map