// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export const getSavedSearchesResponse = {
  body: {
    spec: {
      savedSearches: [
        {
          description: 'Query for all pods',
          id: '1570469623824',
          name: 'All pods',
          searchText: 'kind:pod',
        },
        {
          description: 'Query for all deploys',
          id: '1234567890',
          name: 'All deployments',
          searchText: 'kind:deployment',
        },
      ],
    },
  },
};

export const updateSavedSearchResponse = {
  body: {
    savedSearches: [
      {
        description: 'Query for all pods',
        id: '1570469623824',
        name: 'All pods',
        searchText: 'kind:pod',
      },
      {
        description: 'Query for all deploys on hub cluster',
        id: '1234567890',
        name: 'All deployments',
        searchText: 'kind:deployment cluster:local-cluster',
      },
    ],
  },
};

export const deleteSavedSearchResponse = {
  body: {
    savedSearches: [
      {
        description: 'Query for all pods',
        id: '1570469623824',
        name: 'All pods',
        searchText: 'kind:pod',
      },
    ],
  },
};
