/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */
// Copyright Contributors to the Open Cluster Management project
import { gql } from 'apollo-server-express';

export const typeDef = gql`
type userSearch {
  id: String
  name: String
  description: String
  searchText: String
}
`;

export const resolver = {
  Query: {
    savedSearches: (parent, args, { queryModel, req }) => queryModel.getSearches({ ...args, req }),
  },
  Mutation: {
    saveSearch: (root, args, { queryModel, req }) => queryModel.saveSearch({ ...args, req }),
    deleteSearch: (root, args, { queryModel, req }) => queryModel.deleteSearch({ ...args, req }),
  },
};
