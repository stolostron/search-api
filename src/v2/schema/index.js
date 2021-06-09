/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */
// Copyright Contributors to the Open Cluster Management project

import _ from 'lodash';
import { gql } from 'apollo-server-express';

import * as application from './application';
import * as json from './json';
import * as query from './query';
import * as search from './search';
import * as userSearch from './user-search';
import * as message from './message';

const modules = [
  application,
  json,
  query,
  search,
  userSearch,
  message,
];

const mainDefs = [gql`
schema {
  query: Query,
  mutation: Mutation,
}
`];

export const typeDefs = mainDefs.concat(modules.map((m) => m.typeDef));
export const resolvers = _.merge(...modules.map((m) => m.resolver));

export default { typeDefs, resolvers };
