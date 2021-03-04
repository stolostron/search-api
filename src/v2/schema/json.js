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
import { gql } from 'apollo-server-express';
import GraphQLJSON from 'graphql-type-json';

export const typeDef = gql`
scalar JSON
`;

export const resolver = {
  JSON: GraphQLJSON,
};
