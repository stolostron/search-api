// Copyright (c) 2021 Red Hat, Inc.

import { gql } from 'apollo-server-express';

export const typeDef = gql`
  # Special query for the Overview page.
  type Overview {
    # Total Clusters  
    clusterTotal: Int
    
    # Total number of clusters with at least 1 Policy with compliant:NotCompliant
    nonCompliantClusterTotal: Int
  }
`;

export const resolver = {
  Query: {
    overview: () => ({}),
  },
  Overview: {
    clusterTotal: (parent, args, { overviewModel }) => overviewModel.resolveClustersCount(),
    nonCompliantClusterTotal: (parent, args, { overviewModel }) => overviewModel.resolveNonCompliantClusters(),
  },
};
