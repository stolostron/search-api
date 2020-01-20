/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

const resourceTemplate = {
  cluster: id => ({
    kind: 'cluster',
    name: `mock-cluster${id > 0 ? `-${id}` : ''}`,
    namespace: 'mock-mcm-cluster',
    status: 'ok',
    endpoint: '',
    nodes: 10,
    cpu: '30%',
    memory: '20%',
    storage: '10%',
  }),
  node: (id = 0) => ({
    kind: 'node',
    name: `mock-1.1.1.${id}`,
    cpus: 10,
    role: 'master',
  }),
  pod: id => ({
    kind: 'pod',
    name: `mock-cluster${id > 0 ? `-${id}` : ''}`,
    namespace: 'kube-system',
    restarts: 20,
    creationTimestamp: '2018-09-27 16:52:20 -0400 EDT',
    status: 'Running',
    hostIP: '179.160.35.59',
    podIP: '179.160.35.59',
  }),
};

// export function repeat(map, count) {
//   return new Array(count).fill(0).map(map);
// }

export const mockSearchResult = {
  /**
   * Mock search results.
   *
   * Pass the kind and amount of objects to mock.
   * For example, to mock a search that returns 2 clusters and 5 pods:
   *    { cluster: 2, pod:5 }
   */
  mock: (args) => {
    const mockResult = [];

    // Get items
    Object.keys(args).forEach((kind) => {
      for (let i = 0; i < args[kind]; i += 1) {
        const mockItem = { ...resourceTemplate[kind](i) };
        mockResult.push(mockItem);
      }
    });

    return mockResult;
  },
};


/* eslint-disable class-methods-use-this */
export default class MockSearchConnector {
  async isServiceAvailable() {
    return true;
  }


  // Search Query Mocks
  async runSearchQuery() {
    return mockSearchResult.mock({ cluster: 2, node: 3, pod: 5 });
  }

  async runSearchQueryCountOnly() {
    return 10;
  }

  async getAllProperties() {
    return ['kind', 'name', 'namespace', 'cpu', 'created'];
  }

  async getAllValues(property) {
    switch (property) {
      case 'kind':
        return ['cluster', 'application', 'deployable', 'compliance'];
      case 'namespace':
        return ['default', 'kube-system'];
      case 'cpu':
        return ['<', '>', '!='];
      case 'created':
        return ['hour', 'day', 'week', 'month', 'year'];
      default:
        return ['kind', 'name', 'namespace', 'cpu', 'created'];
    }
  }

  async findRelationships() {
    return [{
      kind: 'cluster',
      count: 1,
      items: [{
        _uid: '123', kind: 'cluster', name: 'mockCluster', namespace: 'mockCluster-ns',
      }],
    }];
  }

  // Application Query Mocks
  async runApplicationsQuery() {
    return [{
      'app._uid': 'local-cluster/1d4bb419-3666-11ea-9e7f-00000a100f99',
      'app.name': 'samplebook-gbapp',
      'app.namespace': 'sample',
      'app.created': '2020-01-14T00:37:59Z',
    }];
  }

  async runAppClustersQuery() {
    return [{
      'cluster._uid': 'd7827dc7-361e-11ea-afe0-0a580afe088d',
      'cluster.name': 'local-cluster',
      'cluster.namespace': 'local-cluster-ns',
    }];
  }

  async runAppManagedSubscriptionsQuery() {
    return [{
      'sub._uid': 'test-sub-91007918-3666-11ea-8828-00000a101862',
      'sub.name': 'test-subscription',
      'sub.namespace': 'kube-system',
    }];
  }

  async runApplicationPoliciesQuery() {
    return [{
      'app._uid': 'local-cluster/1d4bb419-3666-11ea-9e7f-00000a100f99',
      'policy._uid': 'test-policy-91007918-3666-11ea-8828-00000a101862',
      'policy.name': 'test-policy',
      'policy.namespace': 'kube-system',
    }];
  }
}
