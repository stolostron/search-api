// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import { gql } from 'apollo-server-express';

export const typeDef = gql`
type userAccess {
  resource: String
  action: String
}
`;

export const resolver = {
  Query: {
    userAccess: (parent, args, { genericModel }) => genericModel.userAccess(args),
  },
};
