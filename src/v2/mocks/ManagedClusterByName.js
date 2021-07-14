// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export default {
  'hub-cluster': {
    kind: 'ManagedCluster',
    apiVersion: 'cluster.open-cluster-management.io/v1',
    metadata: {
      name: 'hub-cluster',
      selfLink: '/apis/cluster.open-cluster-management.io/v1/managedclusters/hub-cluster',
      uid: 'd9f3a5aa-9f19-11e8-855e-f2b998610544',
      resourceVersion: '136558',
      creationTimestamp: '2018-08-13T16:56:41Z',
      labels: {
        cloud: 'IBM',
        datacenter: 'raleigh',
        environment: 'Dev',
        name: 'hub-cluster',
        owner: 'development',
        region: 'US',
        vendor: 'ICP',
      },
    },
    spec: {
      kubernetesApiEndpoints: {
        serverEndpoints: [
          {
            serverAddress: '9.42.80.212:8001',
          },
        ],
      },
      authInfo: {},
    },
    status: {
      conditions: [
        {
          lastTransitionTime: '2020-06-18T15:19:22Z',
          message: 'Accepted by hub cluster admin',
          reason: 'HubClusterAdminAccepted',
          status: 'True',
          type: 'HubAcceptedManagedCluster',
        },
        {
          lastTransitionTime: '2020-06-18T20:52:17Z',
          message: 'Registration agent stopped updating its lease within 246 minutes.',
          reason: 'ManagedClusterLeaseUpdateStopped',
          status: 'True',
          type: 'ManagedClusterConditionAvailable',
        },
        {
          lastTransitionTime: '2020-06-18T16:00:07Z',
          message: 'Managed cluster joined',
          reason: 'ManagedClusterJoined',
          status: 'True',
          type: 'ManagedClusterJoined',
        },
      ],
    },
  },
  'new-cluster': {
    kind: 'ManagedCluster',
    apiVersion: 'cluster.open-cluster-management.io/v1',
    metadata: {
      name: 'new-cluster',
      selfLink: '/apis/cluster.open-cluster-management.io/v1/managedclusters/new-cluster',
      uid: 'd9f3a6aa-9f19-11f8-855e-f2b908610543',
      resourceVersion: '137558',
      creationTimestamp: '2018-08-13T16:56:41Z',
      labels: {
        cloud: 'IBM',
        datacenter: 'raleigh',
        environment: 'Dev',
        name: 'new-cluster',
        owner: 'development',
        region: 'US',
        vendor: 'ICP',
      },
    },
    spec: {
      kubernetesApiEndpoints: {
        serverEndpoints: [
          {
            serverAddress: '9.42.80.212:8001',
          },
        ],
      },
      authInfo: {},
    },
    status: {
      conditions: [
        {
          type: '',
          status: '',
          lastHeartbeatTime: '2018-08-15T19:41:20Z',
          lastTransitionTime: null,
        },
      ],
    },
  },
  'managed-cluster': {
    kind: 'ManagedCluster',
    apiVersion: 'cluster.open-cluster-management.io/v1',
    metadata: {
      name: 'managed-cluster',
      selfLink: '/apis/cluster.open-cluster-management.io/v1/managedclusters/mycluster.icp',
      uid: 'd9f3a5aa-9f19-11e8-855e-f2b998610544',
      resourceVersion: '136558',
      creationTimestamp: '2018-08-13T16:56:41Z',
      labels: {
        cloud: 'IBM',
        datacenter: 'toronto',
        environment: 'Dev',
        name: 'managed-cluster',
        owner: 'marketing',
        region: 'US',
        vendor: 'ICP',
      },
    },
    spec: {
      kubernetesApiEndpoints: {
        serverEndpoints: [
          {
            serverAddress: '9.42.80.212:8001',
          },
        ],
      },
      authInfo: {},
    },
    status: {},
  },
};
