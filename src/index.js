/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright Contributors to the Open Cluster Management project

import https from 'https';
import fs from 'fs';
import log4js from 'log4js';
import config from '../config';

const logger = log4js.getLogger('server');

const log4jsConfig = process.env.LOG4JS_CONFIG ? JSON.parse(process.env.LOG4JS_CONFIG) : undefined;
log4js.configure(log4jsConfig || 'config/log4js.json');

if (process.env.VCS_REF) {
  logger.info('Built from git commit: ', process.env.VCS_REF);
}

const GRAPHQL_PORT = process.env.PORT || config.get('httpPort') || 4010;
const CONTEXT_PATH = config.get('contextPath');

const graphQLServer = require('./v2').default;

const privateKey = fs.readFileSync(process.env.serverKey || './sslcert/searchapi.key', 'utf8');
const certificate = fs.readFileSync(process.env.serverCert || './sslcert/searchapi.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, graphQLServer);

server.listen(GRAPHQL_PORT, () => {
  logger.info(`[pid ${process.pid}] [env ${process.env.NODE_ENV}] [version V2] started.`);
  logger.info(`Search API is now running on https://localhost:${GRAPHQL_PORT}${CONTEXT_PATH}/graphql`);
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`GraphQL is now running on https://localhost:${GRAPHQL_PORT}${CONTEXT_PATH}/graphql`);
  }
});
