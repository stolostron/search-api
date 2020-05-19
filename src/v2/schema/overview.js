// Copyright (c) 2020 Red Hat, Inc.

export const typeDef = `
  # Special query for the Overview page.
  type Overview {
    # Total Clusters  
    clusters: Int
    
    # Pods in managed clusters grouped by pod status, in this format { Running: 10, ImageLoopBackOff: 2 }.
    podStates: JSON

    # Total number of clusters with at least 1 Policy with compliant:NotCompliant
    nonCompliantClusters: Int
}
`;

export const resolver = {
  Query: {
    overview: () => ({}),
  },
  Overview: {
    clusters: (parent, args, { overviewModel }) => overviewModel.resolveClustersCount(),
    podStates: (parent, args, { overviewModel }) => overviewModel.resolvePodStates(),
    nonCompliantClusters: (parent, args, { overviewModel }) => overviewModel.resolveNonCompliantClusters(),
  },
};
