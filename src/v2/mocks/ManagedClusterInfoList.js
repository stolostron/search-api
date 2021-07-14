// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

const mockResponse = {
  body: {
    kind: 'ManagedClusterInfoList',
    apiVersion: 'internal.open-cluster-management.io/v1beta1',
    metadata: {
      selfLink: '/apis/internal.open-cluster-management.io/v1beta1/managedclusterinfos',
      resourceVersion: '11543',
    },
    items: [
      {
        kind: 'ManagedClusterInfo',
        apiVersion: 'internal.open-cluster-management.io/v1beta1',
        metadata: {
          name: 'mycluster',
          namespace: 'mycluster',
          selfLink: '/apis/internal.open-cluster-management.io/v1beta1/namespaces/mycluster/managedclusterinfos/mycluster',
          uid: 'a83b98b7-b03e-11e8-bd43-b69970856045',
          resourceVersion: '723',
          creationTimestamp: '2018-09-04T12:32:59Z',
          labels: {
            cloud: 'IBM',
            datacenter: 'toronto',
            environment: 'Dev',
            name: 'mycluster',
            owner: 'marketing',
            region: 'US',
            vendor: 'ICP',
          },
        },
        spec: {
          masterEndpoint: '9.42.23.230',
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
        kind: 'ManagedClusterInfo',
        apiVersion: 'internal.open-cluster-management.io/v1beta1',
        metadata: {
          name: 'hub-cluster',
          namespace: 'hub-cluster',
          selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/mycluster/clusterstatuses/mycluster',
          uid: 'a83b98b7-b03e-11e8-bd43-b69970856045',
          resourceVersion: '723',
          creationTimestamp: '2018-09-04T12:32:59Z',
          labels: {
            cloud: 'IBM',
            datacenter: 'toronto',
            environment: 'Dev',
            name: 'hub-cluster',
            owner: 'marketing',
            region: 'US',
            vendor: 'ICP',
          },
          annotations: {
            'mcm.ibm.com/deployer-prefix': 'md',
            'mcm.ibm.com/user-group': 'aGNtOmNsdXN0ZXJzLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'mcm.ibm.com/user-identity': 'aGNtOmNsdXN0ZXJzOm15Y2x1c3RlcjpteWNsdXN0ZXI=',
          },
        },
        spec: {
          masterEndpoint: '9.42.23.230',
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
        status: {
          distributionInfo: {
            ocp: {
              availableUpdates: [
                '4.2.8',
                '4.2.7',
                '4.2.2',
                '4.2.9',
              ],
              desiredVersion: '4.2.2',
              upgradeFailed: false,
              version: '4.2.0',
            },
            type: 'OCP',
          },
          nodeList: [
            '',
            '',
            '',
          ],
        },
      },
      {
        kind: 'ManagedClusterInfo',
        apiVersion: 'internal.open-cluster-management.io/v1beta1',
        metadata: {
          name: 'new-cluster',
          namespace: 'new-cluster',
          selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/kube-system/clusterstatuses/new-cluster',
          uid: 'a83b98b7-b03e-11e8-bd43-b69970856045',
          resourceVersion: '723',
          creationTimestamp: '2018-09-04T12:32:59Z',
          labels: {
            cloud: 'IBM',
            datacenter: 'toronto',
            environment: 'Dev',
            name: 'new-cluster',
            owner: 'marketing',
            region: 'US',
            vendor: 'ICP',
          },
          annotations: {
            'mcm.ibm.com/deployer-prefix': 'md',
            'mcm.ibm.com/user-group': 'aGNtOmNsdXN0ZXJzLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'mcm.ibm.com/user-identity': 'aGNtOmNsdXN0ZXJzOm15Y2x1c3RlcjpteWNsdXN0ZXI=',
          },
        },
        spec: {
          masterEndpoint: '9.42.23.230',
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
        status: {
          nodeList: [
            '',
            '',
            '',
            '',
          ],
        },
      },
      {
        kind: 'ManagedClusterInfo',
        apiVersion: 'internal.open-cluster-management.io/v1beta1',
        metadata: {
          name: 'managed-cluster',
          namespace: 'managed-cluster',
          selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/mycluster/clusterstatuses/mycluster',
          uid: 'a83b98b7-b03e-11e8-bd43-b69970856045',
          resourceVersion: '723',
          creationTimestamp: '2018-09-04T12:32:59Z',
          labels: {
            cloud: 'IBM',
            datacenter: 'toronto',
            environment: 'Dev',
            name: 'managed-cluster',
            owner: 'marketing',
            region: 'US',
            vendor: 'ICP',
          },
          annotations: {
            'mcm.ibm.com/deployer-prefix': 'md',
            'mcm.ibm.com/user-group': 'aGNtOmNsdXN0ZXJzLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'mcm.ibm.com/user-identity': 'aGNtOmNsdXN0ZXJzOm15Y2x1c3RlcjpteWNsdXN0ZXI=',
          },
        },
        spec: {
          masterEndpoint: '9.42.23.230',
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
        status: {
          nodeList: [
            '',
            '',
          ],
        },
      },
    ],
  },
};

export default mockResponse;
