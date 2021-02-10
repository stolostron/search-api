// Copyright (c) 2021 Red Hat, Inc.

import { gql } from 'apollo-server-express';

export const typeDef = gql`
  # Special query for the Overview page.
  type Overview {
    # Total Clusters  
    clusterCount: Int
    
    # Total number of clusters with at least 1 Policy with compliant:NotCompliant
    nonCompliantClusterCount: Int
  }
`;

export const resolver = {
  Query: {
    overview: () => ({}),
  },
  Overview: {
    clusterCount: (parent, args, { overviewModel }) => overviewModel.resolveClustersCount(),
    nonCompliantClusterCount: (parent, args, { overviewModel }) => overviewModel.resolveNonCompliantClusterCount(),
  },
};
