// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

const mockResponse = {
  body: {
    kind: 'ManagedClusterList',
    apiVersion: 'cluster.open-cluster-management.io/v1',
    metadata: {
      selfLink: '/apis/cluster.open-cluster-management.io/v1/managedclusters',
      resourceVersion: '136667',
    },
    items: [
      {
        kind: 'ManagedCluster',
        apiVersion: 'cluster.open-cluster-management.io/v1',
        metadata: {
          name: 'managed-cluster',
          selfLink: '/apis/cluster.open-cluster-management.io/v1/managedclusters/managed-cluster',
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
                serverAddress: '2.2.2.2:8001',
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
          ],
          capacity: {
            cpu: '18',
            memory: '32013Mi',
            nodes: '2',
            storage: '100Gi',
          },
          allocatable: {
            cpu: '6598m',
            memory: '6728Mi',
            pods: '5071',
            storage: '60Gi',
          },
        },
      },
      {
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
                serverAddress: '1.1.1.1:8001',
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
          capacity: {
            cpu: '16',
            memory: '32013Mi',
            nodes: '3',
            storage: '80Gi',
          },
          allocatable: {
            cpu: '6598m',
            memory: '6728Mi',
            pods: '5071',
            storage: '60Gi',
          },
        },
      },
      {
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
                serverAddress: '3.3.3.3:8001',
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
              status: 'False',
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
          capacity: {
            cpu: '16',
            memory: '32013Mi',
            nodes: '4',
            storage: '80Gi',
          },
          allocatable: {
            cpu: '7483m',
            memory: '5390Mi',
            pods: '5031',
            storage: '63Gi',
          },
        },
      },
    ],
  },
};

export default mockResponse;
