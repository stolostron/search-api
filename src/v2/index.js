/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { isInstance as isApolloErrorInstance, formatError as formatApolloError } from 'apollo-errors';
import inspect from 'security-middleware';
import morgan from 'morgan';
import helmet from 'helmet';
import noCache from 'nocache';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import logger from './lib/logger';
import { getServiceAccountToken } from './lib/utils';

import RedisGraphConnector from './connectors/redisGraph';

import AppModel from './models/application';
import OverviewModel from './models/overview';
import QueryModel from './models/userSearch';
import SearchModel from './models/search';

import MockSearchConnector from './mocks/search';
import schema from './schema';
import config from '../../config';
import authMiddleware from './lib/auth-middleware';
import MockKubeConnector from './mocks/kube';
import KubeConnector from './connectors/kube';

export const GRAPHQL_PATH = `${config.get('contextPath')}/graphql`;
export const GRAPHIQL_PATH = `${config.get('contextPath')}/graphiql`;

const isProd = config.get('NODE_ENV') === 'production';
const isTest = config.get('NODE_ENV') === 'test';
const serviceaccountToken = getServiceAccountToken();

const formatError = (error) => {
  const { originalError } = error;
  if (isApolloErrorInstance(originalError)) {
    logger.error(JSON.stringify(error.originalError, null, 2));
  }
  return formatApolloError(error);
};

const apolloServer = new ApolloServer({
  ...schema,
  formatError,
  playground: {
    endpoint: GRAPHQL_PATH,
  },
  context: ({ req }) => {
    let searchConnector;
    let kubeConnector;

    if (isTest) {
      searchConnector = new MockSearchConnector({ rbac: req.user.namespaces, req });
      kubeConnector = new MockKubeConnector();
    } else {
      searchConnector = new RedisGraphConnector({ rbac: req.user.namespaces, req });
      // KubeConnector uses admin token.
      // This allows non-admin users have access to the userpreference resource for saved searches
      kubeConnector = new KubeConnector({ token: serviceaccountToken });
    }

    return {
      req,
      appModel: new AppModel({ searchConnector }),
      overviewModel: new OverviewModel({ searchConnector }),
      queryModel: new QueryModel({ kubeConnector }),
      searchModel: new SearchModel({ searchConnector }),
    };
  },
});

const graphQLServer = express();
graphQLServer.use(compression());

const requestLogger = isProd
  ? morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
  })
  : morgan('dev');

graphQLServer.use('*', helmet({
  frameguard: false,
  noSniff: false,
  xssFilter: false,
}), noCache(), requestLogger, cookieParser());

graphQLServer.get('/livenessProbe', (req, res) => {
  res.send(`Testing livenessProbe --> ${new Date().toLocaleString()}`);
});

graphQLServer.get('/readinessProbe', (req, res) => {
  res.send(`Testing readinessProbe --> ${new Date().toLocaleString()}`);
});

const auth = [];

if (isProd) {
  logger.info('Authentication enabled');
  auth.push(inspect.app, authMiddleware());
} else {
  auth.push(authMiddleware({ shouldLocalAuth: true }));
}

if (isTest) {
  logger.info('Running in mock mode');
  logger.info('Using Mocked search connector.');
} else {
  logger.info('Using RedisGraph search connector.');
}

graphQLServer.use(...auth);

apolloServer.applyMiddleware({ app: graphQLServer, path: GRAPHQL_PATH });

export default graphQLServer;
