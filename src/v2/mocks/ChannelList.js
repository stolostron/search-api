// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project
export const mockChannelsResponse = {
  body: {
    kind: 'ChannelList',
    metadata: {
      continue: '',
      resourceVersion: '6470654',
      selfLink: '/apis/apps.open-cluster-management.io/v1/channels',
    },
    apiVersion: 'apps.open-cluster-management.io/v1',
    items: [
      {
        apiVersion: 'apps.open-cluster-management.io/v1',
        kind: 'Channel',
        metadata: {
          annotations: {
            'open-cluster-management.io/user-group': 'c3lzdGVtOmNsdXN0ZXItYWRtaW5zLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'open-cluster-management.io/user-identity': 'a3ViZTphZG1pbg==',
          },
          creationTimestamp: '2020-10-22T14:47:17Z',
          generation: 1,
          name: 'ggithubcom-fxiang1-app-samples',
          namespace: 'ggithubcom-fxiang1-app-samples-ns',
          resourceVersion: '423984',
          selfLink: '/apis/apps.open-cluster-management.io/v1/namespaces/ggithubcom-fxiang1-app-samples-ns/channels/ggithubcom-fxiang1-app-samples',
          uid: 'af6dd93d-e545-4376-8d12-0c28277f0bd4',
        },
        spec: {
          pathname: 'https://github.com/fxiang1/app-samples.git',
          type: 'Git',
        },
      },
      {
        apiVersion: 'apps.open-cluster-management.io/v1',
        kind: 'Channel',
        metadata: {
          annotations: {
            'open-cluster-management.io/user-group': 'c3lzdGVtOmNsdXN0ZXItYWRtaW5zLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'open-cluster-management.io/user-identity': 'a3ViZTphZG1pbg==',
          },
          creationTimestamp: '2020-10-27T20:56:21Z',
          generation: 1,
          name: 'ggithubcom-kevinfcormier-sample-repo',
          namespace: 'ggithubcom-kevinfcormier-sample-repo-ns',
          resourceVersion: '5456091',
          selfLink: '/apis/apps.open-cluster-management.io/v1/namespaces/ggithubcom-kevinfcormier-sample-repo-ns/channels/ggithubcom-kevinfcormier-sample-repo',
          uid: '5d3ee038-b441-49ef-bf9a-30d30af13ab1',
        },
        spec: {
          pathname: 'https://github.com/KevinFCormier/sample-repo.git',
          secretRef: {
            name: 'ggithubcom-kevinfcormier-sample-repo-auth',
          },
          type: 'Git',
        },
      },
      {
        apiVersion: 'apps.open-cluster-management.io/v1',
        kind: 'Channel',
        metadata: {
          annotations: {
            'open-cluster-management.io/user-group': 'c3lzdGVtOmNsdXN0ZXItYWRtaW5zLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'open-cluster-management.io/user-identity': 'a3ViZTphZG1pbg==',
          },
          creationTimestamp: '2020-10-22T14:47:17Z',
          generation: 1,
          name: 'hkubernetes-chartsstoragegoogleapiscom',
          namespace: 'hkubernetes-chartsstoragegoogleapiscom-ns',
          resourceVersion: '423993',
          selfLink: '/apis/apps.open-cluster-management.io/v1/namespaces/hkubernetes-chartsstoragegoogleapiscom-ns/channels/hkubernetes-chartsstoragegoogleapiscom',
          uid: '592a18c7-8409-4708-a025-12fb58524812',
        },
        spec: {
          pathname: 'https://kubernetes-charts.storage.googleapis.com',
          type: 'HelmRepo',
        },
      },
      {
        apiVersion: 'apps.open-cluster-management.io/v1',
        kind: 'Channel',
        metadata: {
          annotations: {
            'open-cluster-management.io/user-group': 'c3lzdGVtOmNsdXN0ZXItYWRtaW5zLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'open-cluster-management.io/user-identity': 'a3ViZTphZG1pbg==',
          },
          creationTimestamp: '2020-10-27T16:20:49Z',
          generation: 1,
          name: 'oec2-dummy-dev1',
          namespace: 'oec2-dummy-dev1-ns',
          resourceVersion: '5262671',
          selfLink: '/apis/apps.open-cluster-management.io/v1/namespaces/oec2-dummy-dev1-ns/channels/oec2-dummy-dev1',
          uid: '7b41db1b-6dd2-4f0a-8235-0d9cb8688491',
        },
        spec: {
          pathname: 'http://ec2-dummy/dev1',
          type: 'ObjectBucket',
        },
      },
    ],
  },
};

export const mockChannelSecretResponse = {
  body: {
    kind: 'Secret',
    apiVersion: 'v1',
    metadata: {
      name: 'ggithubcom-kevinfcormier-sample-repo-auth',
      namespace: 'ggithubcom-kevinfcormier-sample-repo-ns',
      selfLink: '/api/v1/namespaces/ggithubcom-kevinfcormier-sample-repo-ns/secrets/ggithubcom-kevinfcormier-sample-repo-auth',
      uid: 'e10bb428-324b-46a8-9d2b-3a84bb64ee84',
      resourceVersion: '5492077',
      creationTimestamp: '2020-10-27T13:21:52Z',
      labels: {
        'apps.open-cluster-management.io/serving-channel': 'true',
      },
      annotations: {
        'apps.open-cluster-management.io/serving-channel': 'ggithubcom-kevinfcormier-sample-repo-ns/ggithubcom-kevinfcormier-sample-repo',
      },
    },
    data: {
      accessToken: 'c29tZS1mYWtlLWFjY2Vzcy10b2tlbg==',
      user: 'ZmFrZXVzZXI=',
    },
    type: 'Opaque',
  },
};
