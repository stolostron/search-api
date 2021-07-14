// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export default {
  'hub-cluster': {
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
        {
          name: '9.37.137.174',
          cluster: {
            clusterip: '9.42.23.230',
            metadata: {
              name: 'hub-cluster',
            },
          },
          labels: {
            'beta.kubernetes.io/arch': 'amd64',
            'beta.kubernetes.io/os': 'linux',
            'kubernetes.io/hostname': '9.37.137.174',
            'node-role.kubernetes.io/worker': 'true',
          },
          roles: [
            'worker',
          ],
          conditions: [
            {
              lastHeartbeatTime: '2018-09-05T15:36:06Z',
              lastTransitionTime: '2018-08-18T15:53:48Z',
              message: 'kubelet is posting ready status. AppArmor enabled',
              reason: 'KubeletReady',
              status: 'True',
              type: 'Ready',
            },
          ],
        },
        {
          name: '9.37.137.92',
          cluster: {
            clusterip: '9.42.23.230',
            metadata: {
              name: 'hub-cluster',
            },
          },
          labels: {
            'beta.kubernetes.io/arch': 'amd64',
            'beta.kubernetes.io/os': 'linux',
            'kubernetes.io/hostname': '9.37.137.92',
            'node-role.kubernetes.io/worker': 'true',
          },
          roles: [
            'worker',
          ],
          conditions: [
            {
              lastHeartbeatTime: '2018-09-05T15:36:06Z',
              lastTransitionTime: '2018-08-18T15:53:48Z',
              message: 'kubelet is posting ready status. AppArmor enabled',
              reason: 'KubeletReady',
              status: 'True',
              type: 'Ready',
            },
          ],
        },
        {
          name: '9.42.23.230',
          cluster: {
            clusterip: '9.42.23.230',
            metadata: {
              name: 'hub-cluster',
            },
          },
          labels: {
            'beta.kubernetes.io/arch': 'amd64',
            'beta.kubernetes.io/os': 'linux',
            etcd: 'true',
            'kubernetes.io/hostname': '9.42.23.230',
            management: 'true',
            master: 'true',
            'node-role.kubernetes.io/etcd': 'true',
            'node-role.kubernetes.io/management': 'true',
            'node-role.kubernetes.io/master': 'true',
            'node-role.kubernetes.io/proxy': 'true',
            proxy: 'true',
            role: 'master',
          },
          roles: [
            'etcd',
            'management',
            'master',
            'proxy',
          ],
          conditions: [
            {
              lastHeartbeatTime: '2018-09-05T15:36:06Z',
              lastTransitionTime: '2018-08-18T15:53:48Z',
              message: 'kubelet is posting ready status. AppArmor enabled',
              reason: 'KubeletReady',
              status: 'True',
              type: 'Ready',
            },
          ],
        },
      ],
    },
  },
  'new-cluster': {
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
      monitoringEndpoint: {
        ip: '9.42.23.230',
        hostname: 'mycluster.prometheus.icp',
      },
      monitoringSecretRef: {
        name: 'cluster-prometheus-secret',
      },
      kluterletVersion: '3.1.0-rc1.1+5d3ffb594d62d7-dirty',
    },
  },
  'managed-cluster': {
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
      monitoringEndpoint: {
        ip: '9.42.23.230',
        hostname: 'mycluster.prometheus.icp',
      },
      monitoringSecretRef: {
        name: 'cluster-prometheus-secret',
      },
      kluterletVersion: '3.1.0-rc1.1+5d3ffb594d62d7-dirty',
    },
  },
};
