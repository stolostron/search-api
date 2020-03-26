'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    storage: '10%'
  }),
  node: (id = 0) => ({
    kind: 'node',
    name: `mock-1.1.1.${id}`,
    cpus: 10,
    role: 'master'
  }),
  pod: id => ({
    kind: 'pod',
    name: `mock-cluster${id > 0 ? `-${id}` : ''}`,
    namespace: 'kube-system',
    restarts: 20,
    creationTimestamp: '2018-09-27 16:52:20 -0400 EDT',
    status: 'Running',
    hostIP: '179.160.35.59',
    podIP: '179.160.35.59'
  })
};

// export function repeat(map, count) {
//   return new Array(count).fill(0).map(map);
// }

const mockSearchResult = exports.mockSearchResult = {
  /**
   * Mock search results.
   *
   * Pass the kind and amount of objects to mock.
   * For example, to mock a search that returns 2 clusters and 5 pods:
   *    { cluster: 2, pod:5 }
   */
  mock: args => {
    const mockResult = [];

    // Get items
    Object.keys(args).forEach(kind => {
      for (let i = 0; i < args[kind]; i += 1) {
        const mockItem = _extends({}, resourceTemplate[kind](i));
        mockResult.push(mockItem);
      }
    });

    return mockResult;
  }
};

/* eslint-disable class-methods-use-this */
class MockSearchConnector {
  isServiceAvailable() {
    return _asyncToGenerator(function* () {
      return true;
    })();
  }

  // Search Query Mocks
  runSearchQuery() {
    return _asyncToGenerator(function* () {
      return mockSearchResult.mock({ cluster: 2, node: 3, pod: 5 });
    })();
  }

  runSearchQueryCountOnly() {
    return _asyncToGenerator(function* () {
      return 10;
    })();
  }

  getAllProperties() {
    return _asyncToGenerator(function* () {
      return ['kind', 'name', 'namespace', 'cpu', 'created'];
    })();
  }

  getAllValues(property) {
    return _asyncToGenerator(function* () {
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
    })();
  }

  findRelationships() {
    return _asyncToGenerator(function* () {
      return [{
        kind: 'cluster',
        count: 1,
        items: [{
          _uid: '123', kind: 'cluster', name: 'mockCluster', namespace: 'mockCluster-ns'
        }]
      }];
    })();
  }

  // Application Query Mocks
  runApplicationsQuery() {
    return _asyncToGenerator(function* () {
      return [{
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'app.created': '2020-01-23T13:56:32Z',
        'app.dashboard': 'localhost/grafana/dashboard/db/app01-dashboard-via-federated-prometheus?namespace=sample',
        'app.name': 'app01',
        'app.namespace': 'sample',
        'app.selfLink': '/apis/app.k8s.io/v1beta1/namespaces/sample/applications/app01'
      }, {
        'app._uid': 'local-cluster/app-02-uid',
        'app.created': '2020-01-23T13:56:32Z',
        'app.dashboard': 'localhost/grafana/dashboard/db/app02-dashboard-via-federated-prometheus?namespace=test',
        'app.name': 'app02',
        'app.namespace': 'test',
        'app.selfLink': '/apis/app.k8s.io/v1beta1/namespaces/test/applications/app02'
      }];
    })();
  }

  runAppClustersQuery() {
    return _asyncToGenerator(function* () {
      return [{
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        count: 5
      }];
    })();
  }

  runAppHubSubscriptionsQuery() {
    return _asyncToGenerator(function* () {
      return [{
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'sub._uid': 'local-cluster/bdced01f-3bd4-11ea-a488-00000a100f99',
        'sub.channel': 'dev1/dev1'
      }, {
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'sub._uid': 'local-cluster/b218636d-3d5e-11ea-8ed1-00000a100f99',
        'sub.status': 'Propagated',
        'sub.channel': 'default/mortgage-channel'
      }, {
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'sub._uid': 'local-cluster/66426f24-3bd3-11ea-a488-00000a100f99',
        'sub.status': 'Propagated',
        'sub.channel': 'dev1/dev1'
      }];
    })();
  }

  runAppPodsCountQuery() {
    return _asyncToGenerator(function* () {
      return [{
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'pod.status': 'Running'
      }, {
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'pod.status': 'Running'
      }, {
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'pod.status': 'Failed'
      }];
    })();
  }

  runAppRemoteSubscriptionsQuery() {
    return _asyncToGenerator(function* () {
      return [{
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'sub._uid': 'local-cluster/b218636d-3d5e-11ea-8ed1-00000a100f99',
        'sub.status': 'Subscribed'
      }];
    })();
  }

  /*
   * Global Application queries mocks.
   */
  runGlobalAppChannelsQuery() {
    return _asyncToGenerator(function* () {
      return [{ 'ch._uid': 'local-cluster/mock-channel-1-uid' }, { 'ch._uid': 'local-cluster/mock-channel-2-uid' }];
    })();
  }

  runGlobalAppClusterCountQuery() {
    return _asyncToGenerator(function* () {
      return [{ 'app._uid': 'local-cluster/mock-cluster-1-uid' }, { 'app._uid': 'local-cluster/mock-cluster-2-uid' }];
    })();
  }

  runGlobalAppHubSubscriptionsQuery() {
    return _asyncToGenerator(function* () {
      return [{
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'sub._uid': 'local-cluster/bdced01f-3bd4-11ea-a488-00000a100f99',
        'sub.channel': 'dev1/dev1'
      }, {
        'app._uid': 'local-cluster/29a848d6-3de8-11ea-9f0f-00000a100f99',
        'sub._uid': 'local-cluster/b218636d-3d5e-11ea-8ed1-00000a100f99',
        'sub.status': 'Propagated',
        'sub.channel': 'default/mortgage-channel'
      }];
    })();
  }

  runGlobalAppRemoteSubscriptionsQuery() {
    return _asyncToGenerator(function* () {
      return [{
        'sub._uid': 'cluster-1/mock-remote-subscription-2-uid',
        'sub.status': 'Subscribed'
      }, {
        'sub._uid': 'cluster-2/mock-remote-subscription-2-uid',
        'sub.status': 'Propagated'
      }];
    })();
  }
}
exports.default = MockSearchConnector;
//# sourceMappingURL=search.js.map