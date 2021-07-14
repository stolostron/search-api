// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export const mockClusterResponse = {
  body: {
    items: [
      {
        kind: 'Cluster',
        apiVersion: 'clusterregistry.k8s.io/v1alpha1',
        metadata: {
          name: 'managed-cluster',
          namespace: 'default',
          selfLink: '/apis/clusterregistry.k8s.io/v1alpha1/namespaces/default/clusters/cluster1',
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
          annotations: {
            'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
          },
          finalizers: [
            'finalizer.hcm.ibm.com',
          ],
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
              type: 'OK',
              status: '',
              lastHeartbeatTime: '2018-08-15T19:41:20Z',
              lastTransitionTime: null,
            },
          ],
        },
      },
    ],
  },
};

export const mockLogsResponse = {
  body: '[2020-05-13T20:24:23.321] [INFO] [search-api] [server] Built from git commit:  0.0.0-sha.f31e583\n[2020-05-13T20:24:23.674] [INFO] [search-api] [server] Initializing new Redis client.\n[2020-05-13T20:24:23.674] [INFO] [search-api] [server] Starting Redis client using SSL endpoint:  search-prod-28a0e-search-redisgraph:6380\n[2020-05-13T20:24:23.725] [INFO] [search-api] [server] Authentication enabled\n[2020-05-13T20:24:23.725] [INFO] [search-api] [server] Using RedisGraph search connector.\n[2020-05-13T20:24:23.740] [INFO] [search-api] [server] [pid 1] [env production] [version V2] started.\n[2020-05-13T20:24:23.740] [INFO] [search-api] [server] Search API is now running on https://localhost:4010/searchapi/graphql\n[2020-05-13T20:24:23.740] [INFO] [search-api] [server] RedisGraph address: "172.30.110.50" family: IPv4',
};
