// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export const mockAppsResponse = {
    body: {
      kind: 'ApplicationList',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applications',
        resourceVersion: '77111',
      },
      items: [
        {
          metadata: {
            name: 'gbapp-gbapp',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applications/gbapp-gbapp',
            uid: '8301b18b-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '281',
            creationTimestamp: '2018-11-12T18:48:14Z',
            labels: {
              app: 'gbapp',
              chart: 'gbapp-0.1.0',
              heritage: 'Tiller',
              name: 'gbapp-gbapp',
              release: 'gbapp',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
              'apps.open-cluster-management.io/applicationrelationships': 'gbapp-gbapp-appfrontend,gbapp-gbapp-master,gbapp-gbapp-slave',
              'apps.open-cluster-management.io/dashboard': 'https://9.42.81.137:8443/grafana/dashboard/db/gbapp-gbapp-dashboard-via-federated-prometheus',
              'apps.open-cluster-management.io/deployables': 'gbapp-gbapp,gbapp-gbapp-redismaster,gbapp-gbapp-redisslave',
              'apps.open-cluster-management.io/placementbindings': 'gbapp-gbapp,gbapp-gbapp-redismaster',
              'apps.open-cluster-management.io/subscriptions': 'default/gbapp-gbapp-subscription-1',
            },
          },
          spec: {
            componentKinds: [
              {
                group: 'core',
                kind: 'Pods',
              },
            ],
            descriptor: {},
            selector: {
              matchExpressions: [
                {
                  key: 'app',
                  operator: 'In',
                  values: [
                    'gbapp',
                    'gbf',
                    'gbrm',
                    'gbrs',
                  ],
                },
              ],
            },
          },
          status: {
          },
        },
      ],
    },
  };
  
  export const mockArgoAppsResponse = {
    body: {
      apiVersion: 'argoproj.io/v1alpha1',
      items: [
        {
          apiVersion: 'argoproj.io/v1alpha1',
          kind: 'Application',
          metadata: {
            creationTimestamp: '2021-04-27T15:05:27Z',
            generation: 1586,
            name: 'kevin-helloworld',
            namespace: 'default',
            resourceVersion: '12070872',
            selfLink: '/apis/argoproj.io/v1alpha1/namespaces/default/applications/kevin-helloworld',
            uid: '3ca6512f-0a32-46c2-93cb-a7ad52c2bea3',
          },
          spec: {
            destination: {
              name: 'local-cluster',
              namespace: 'kevin-helloworld-argo',
            },
            project: 'default',
            source: {
              path: 'helloworld',
              repoURL: 'https://github.com/fxiang1/app-samples.git',
              targetRevision: 'HEAD',
            },
            syncPolicy: {
              automated: {
                prune: true,
                selfHeal: true,
              },
              syncOptions: [
                'CreateNamespace=true',
              ],
            },
          },
        },
        {
          apiVersion: 'argoproj.io/v1alpha1',
          kind: 'Application',
          metadata: {
            creationTimestamp: '2021-04-27T15:08:31Z',
            generation: 1812,
            name: 'kevin-helloworld-managed',
            namespace: 'default',
            resourceVersion: '12072072',
            selfLink: '/apis/argoproj.io/v1alpha1/namespaces/default/applications/kevin-helloworld-managed',
            uid: 'c41023fa-14cd-4c4a-81b0-7b1719ec33b9',
          },
          spec: {
            destination: {
              name: 'ui-remote',
              namespace: 'kevin-helloworld-argo-managed',
            },
            project: 'default',
            source: {
              path: 'helloworld',
              repoURL: 'https://github.com/fxiang1/app-samples.git',
              targetRevision: 'HEAD',
            },
            syncPolicy: {
              automated: {
                prune: true,
                selfHeal: true,
              },
              syncOptions: [
                'CreateNamespace=true',
              ],
            },
          },
        },
      ],
      kind: 'ApplicationList',
      metadata: {
        continue: '',
        selfLink: '/apis/argoproj.io/v1alpha1/namespaces/default/applications',
      },
    },
  };
  
  export const mockSingleAppResponse = {
    body: {
      kind: 'Application',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        name: 'gbapp-gbapp',
        namespace: 'default',
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applications/gbapp-gbapp',
        uid: '8301b18b-e6ab-11e8-b778-9e17a0ceb481',
        resourceVersion: '281',
        creationTimestamp: '2018-11-12T18:48:14Z',
        labels: {
          app: 'gbapp',
          chart: 'gbapp-0.1.0',
          heritage: 'Tiller',
          name: 'gbapp-gbapp',
          release: 'gbapp',
        },
        annotations: {
          'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
          'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
          'apps.open-cluster-management.io/applicationrelationships': 'gbapp-gbapp-appfrontend,gbapp-gbapp-master,gbapp-gbapp-slave',
          'apps.open-cluster-management.io/dashboard': 'https://9.42.82.240:8443/grafana/dashboard/db/gbapp-gbapp-dashboard-via-federated-prometheus',
          'apps.open-cluster-management.io/deployables': 'gbapp-gbapp,gbapp-gbapp-redismaster,gbapp-gbapp-redisslave',
          'apps.open-cluster-management.io/placementbindings': 'gbapp-gbapp,gbapp-gbapp-redismaster',
          'apps.open-cluster-management.io/subscriptions': 'default/gbapp-gbapp-subscription-1',
        },
      },
      spec: {
        componentKinds: [
          {
            group: 'core',
            kind: 'Pods',
          },
        ],
        descriptor: {},
        selector: {
          matchExpressions: [
            {
              key: 'app',
              operator: 'In',
              values: [
                'gbapp',
                'gbf',
                'gbrm',
                'gbrs',
              ],
            },
          ],
        },
      },
      status: {
      },
    },
  };
  
  export const gbappPB = {
    body: {
      apiVersion: 'mcm.ibm.com/v1alpha1',
      kind: 'PlacementBinding',
      metadata: {
        annotations: {
          'mcm.ibm.com/user-group': 'c3lzdGVtOm1hc3RlcnMsc3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
          'mcm.ibm.com/user-identity': 'YWRtaW4=',
        },
        creationTimestamp: '2019-01-04T15:42:07Z',
        labels: {
          app: 'gbapp',
          chart: 'gbapp-0.1.0',
          heritage: 'Tiller',
          name: 'gbapp-gbapp',
          release: 'gbapp',
          servicekind: 'CacheService',
        },
        name: 'gbapp-gbapp',
        namespace: 'kube-system',
        resourceVersion: '169',
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/kube-system/placementbindings/gbapp-gbapp',
        uid: '4adbeea1-1037-11e9-9498-02257a13dd26',
      },
      placementRef: {
        apiGroup: 'mcm.ibm.com',
        kind: 'PlacementPolicy',
        name: 'gbapp-gbapp',
      },
      subjects: [
        {
          apiGroup: 'mcm.ibm.com',
          kind: 'Deployable',
          name: 'gbapp-gbapp',
        },
      ],
    },
  };
  
  export const gbappRedisMasterPB = {
    body: {
      apiVersion: 'mcm.ibm.com/v1alpha1',
      kind: 'PlacementBinding',
      metadata: {
        annotations: {
          'mcm.ibm.com/user-group': 'c3lzdGVtOm1hc3RlcnMsc3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
          'mcm.ibm.com/user-identity': 'YWRtaW4=',
        },
        creationTimestamp: '2019-01-04T15:42:07Z',
        labels: {
          app: 'gbapp',
          chart: 'gbapp-0.1.0',
          heritage: 'Tiller',
          name: 'gbapp-gbapp',
          release: 'gbapp',
          servicekind: 'CacheService',
        },
        name: 'gbapp-gbapp-redismaster',
        namespace: 'kube-system',
        resourceVersion: '169',
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/kube-system/placementbindings/gbapp-gbapp-redismaster',
        uid: '4adbeea1-1037-11e9-9498-02257a13dd26',
      },
      placementRef: {
        apiGroup: 'mcm.ibm.com',
        kind: 'PlacementPolicy',
        name: 'gbapp-gbapp-redismaster',
      },
      subjects: [
        {
          apiGroup: 'mcm.ibm.com',
          kind: 'Deployable',
          name: 'gbapp-gbapp-redismaster',
        },
      ],
    },
  };
  
  export const mockAppRelationships = {
    body: {
      kind: 'ApplicationRelationshipList',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applicationrelationships',
        resourceVersion: '130498',
      },
      items: [
        {
          metadata: {
            name: 'bookinfo[]--usesCreated-->details[]',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applicationrelationships/bookinfo%5B%5D--usesCreated--%3Edetails%5B%5D',
            uid: 'ed8997c7-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '21',
            creationTimestamp: '2018-11-12T18:44:03Z',
            labels: {
              destinationKind: 'Deployable',
              destinationName: 'details',
              hcmapp: 'mcmappdemo',
              placementpolicy: 'bookinfo',
              servicekind: 'ApplicationService',
              sourceKind: 'Deployable',
              sourceName: 'bookinfo',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            source: {
              name: 'bookinfo',
              kind: 'Deployable',
            },
            type: 'usesCreated',
            destination: {
              name: 'details',
              kind: 'Deployable',
            },
            livenessProbe: {},
          },
          status: {},
        },
        {
          metadata: {
            name: 'bookinfo[]--usesCreated-->reviews[]',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applicationrelationships/bookinfo%5B%5D--usesCreated--%3Ereviews%5B%5D',
            uid: 'ede373ca-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '24',
            creationTimestamp: '2018-11-12T18:44:04Z',
            labels: {
              destinationKind: 'Deployable',
              destinationName: 'reviews',
              hcmapp: 'mcmappdemo',
              placementpolicy: 'bookinfo',
              servicekind: 'ApplicationService',
              sourceKind: 'Deployable',
              sourceName: 'bookinfo',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            source: {
              name: 'bookinfo',
              kind: 'Deployable',
            },
            type: 'usesCreated',
            destination: {
              name: 'reviews',
              kind: 'Deployable',
            },
            livenessProbe: {},
          },
          status: {},
        },
        {
          metadata: {
            name: 'gbapp-gbapp-master',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applicationrelationships/gbapp-gbapp-master',
            uid: '8303a19d-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '240',
            creationTimestamp: '2018-11-12T18:48:14Z',
            labels: {
              app: 'gbapp',
              chart: 'gbapp-0.1.0',
              destinationKind: 'Deployable',
              destinationName: 'gbapp-gbapp-redismaster',
              heritage: 'Tiller',
              release: 'gbapp',
              sourceKind: 'Deployable',
              sourceName: 'gbapp-gbapp',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            source: {
              name: 'gbapp-gbapp',
              kind: 'Deployable',
            },
            type: 'usesCreated',
            destination: {
              name: 'gbapp-gbapp-redismaster',
              kind: 'Deployable',
            },
            livenessProbe: {},
          },
          status: {},
        },
        {
          metadata: {
            name: 'gbapp-gbapp-slave',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applicationrelationships/gbapp-gbapp-slave',
            uid: '83058fb8-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '244',
            creationTimestamp: '2018-11-12T18:48:14Z',
            labels: {
              app: 'gbapp',
              chart: 'gbapp-0.1.0',
              destinationKind: 'Deployable',
              destinationName: 'gbapp-gbapp-redisslave',
              heritage: 'Tiller',
              release: 'gbapp',
              sourceKind: 'Deployable',
              sourceName: 'gbapp-gbapp',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            source: {
              name: 'gbapp-gbapp',
              kind: 'Deployable',
            },
            type: 'usesCreated',
            destination: {
              name: 'gbapp-gbapp-redisslave',
              kind: 'Deployable',
            },
            livenessProbe: {},
          },
          status: {},
        },
        {
          metadata: {
            name: 'reviews[]--usesCreated-->ratings[]',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applicationrelationships/reviews%5B%5D--usesCreated--%3Eratings%5B%5D',
            uid: 'f0a049af-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '27',
            creationTimestamp: '2018-11-12T18:44:09Z',
            labels: {
              destinationKind: 'Deployable',
              destinationName: 'ratings',
              hcmapp: 'mcmappdemo',
              placementpolicy: 'bookinfo',
              servicekind: 'ApplicationService',
              sourceKind: 'Deployable',
              sourceName: 'reviews',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            source: {
              name: 'reviews',
              kind: 'Deployable',
            },
            type: 'usesCreated',
            destination: {
              name: 'ratings',
              kind: 'Deployable',
            },
            livenessProbe: {},
          },
          status: {},
        },
      ],
    },
  };
  
  export const mockAppPlacementBindings = {
    body: {
      kind: 'PlacementBindingList',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/placementbindings',
        resourceVersion: '130498',
      },
      items: [
        gbappRedisMasterPB.body,
        gbappPB.body,
      ],
    },
  };
  
  export const mockApplicationWorks = {
    body: {
      kind: 'WorkList',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/cluster1/works',
        resourceVersion: '79740',
      },
      items: [
        {
          metadata: {
            name: 'gbapp-gbapp-cluster1',
            namespace: 'cluster1',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/cluster1/works/gbapp-gbapp-cluster1',
            uid: '8ae796f6-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '258',
            creationTimestamp: '2018-11-12T18:48:27Z',
            labels: {
              clusterName: 'cluster1',
              deployable: 'gbapp-gbapp',
              placementPolicy: 'gbapp-gbapp',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'aGNtOmNsdXN0ZXJzLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'aGNtOmNsdXN0ZXJzOmNsdXN0ZXIxOmNsdXN0ZXIx',
            },
            ownerReferences: [
              {
                apiVersion: 'mcm.ibm.com/__internal',
                kind: 'placementpolicy',
                name: 'gbapp-gbapp',
                uid: '830687cb-e6ab-11e8-b778-9e17a0ceb481',
                controller: true,
                blockOwnerDeletion: true,
              },
            ],
          },
          spec: {
            cluster: {
              name: 'cluster1',
            },
            type: 'Deployer',
            scope: {},
            helm: {
              chartURL: 'https://raw.githubusercontent.com/abdasgupta/helm-repo/master/3.1-mcm-guestbook/gbf-0.1.0.tgz',
              namespace: 'default',
            },
          },
          status: {
            type: 'Completed',
            lastUpdateTime: '2018-11-12T18:48:30Z',
          },
        },
        {
          metadata: {
            name: 'gbapp-gbapp-redismaster-cluster1',
            namespace: 'cluster1',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/cluster1/works/gbapp-gbapp-redismaster-cluster1',
            uid: '8d49a01f-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '265',
            creationTimestamp: '2018-11-12T18:48:31Z',
            labels: {
              clusterName: 'cluster1',
              deployable: 'gbapp-gbapp',
              placementPolicy: 'gbapp-gbapp',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'aGNtOmNsdXN0ZXJzLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'aGNtOmNsdXN0ZXJzOmNsdXN0ZXIxOmNsdXN0ZXIx',
            },
            ownerReferences: [
              {
                apiVersion: 'mcm.ibm.com/__internal',
                kind: 'placementpolicy',
                name: 'gbapp-gbapp-redismaster',
                uid: '8307a1ec-e6ab-11e8-b778-9e17a0ceb481',
                controller: true,
                blockOwnerDeletion: true,
              },
            ],
          },
          spec: {
            cluster: {
              name: 'cluster1',
            },
            type: 'Deployer',
            scope: {},
            helm: {
              chartURL: 'https://raw.githubusercontent.com/abdasgupta/helm-repo/master/3.1-mcm-guestbook/gbrm-0.1.0.tgz',
              namespace: 'default',
            },
          },
          status: {
            type: 'Completed',
            lastUpdateTime: '2018-11-12T18:48:32Z',
          },
        },
        {
          metadata: {
            name: 'gbapp-gbapp-redisslave-cluster1',
            namespace: 'cluster1',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/cluster1/works/gbapp-gbapp-redisslave-cluster1',
            uid: '8fab98b3-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '276',
            creationTimestamp: '2018-11-12T18:48:35Z',
            labels: {
              clusterName: 'cluster1',
              deployable: 'gbapp-gbapp',
              placementPolicy: 'gbapp-gbapp',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'aGNtOmNsdXN0ZXJzLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'aGNtOmNsdXN0ZXJzOmNsdXN0ZXIxOmNsdXN0ZXIx',
            },
            ownerReferences: [
              {
                apiVersion: 'mcm.ibm.com/__internal',
                kind: 'placementpolicy',
                name: 'gbapp-gbapp-redisslave',
                uid: '830a0150-e6ab-11e8-b778-9e17a0ceb481',
                controller: true,
                blockOwnerDeletion: true,
              },
            ],
          },
          spec: {
            cluster: {
              name: 'cluster1',
            },
            type: 'Deployer',
            scope: {},
            helm: {
              chartURL: 'https://raw.githubusercontent.com/abdasgupta/helm-repo/master/3.1-mcm-guestbook/gbrs-0.1.0.tgz',
              namespace: 'default',
            },
          },
          status: {
            type: 'Completed',
            lastUpdateTime: '2018-11-12T18:48:36Z',
          },
        },
      ],
    },
  };
  
  export const mockDeployablesResponse = {
    body: {
      kind: 'DeployableList',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables',
        resourceVersion: '78753',
      },
      items: [
        {
          metadata: {
            name: 'app04',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/app04',
            uid: 'f65064f3-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '29',
            creationTimestamp: '2018-11-12T18:44:18Z',
            labels: {
              hcmapp: 'app04',
              placementpolicy: 'app04',
              servicekind: 'ApplicationService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'aHR0cHM6Ly9teWNsdXN0ZXIuaWNwOjk0NDMvb2lkYy9lbmRwb2ludC9PUCNhZG1pbg==',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartName: 'ibm-nginx-dev',
                repository: 'ibm-charts',
                version: '1.0.1',
                namespace: 'default',
              },
            },
          },
          status: {},
        },
        {
          metadata: {
            name: 'bookinfo',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/bookinfo',
            uid: 'ed6e5202-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '17',
            creationTimestamp: '2018-11-12T18:44:03Z',
            labels: {
              hcmapp: 'mcmappdemo',
              name: 'bookinfo',
              placementpolicy: 'bookinfo',
              servicekind: 'ApplicationService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'aHR0cHM6Ly9teWNsdXN0ZXIuaWNwOjk0NDMvb2lkYy9lbmRwb2ludC9PUCNhZG1pbg==',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartName: 'productpage-mcm',
                repository: 'custom-local',
                version: '0.1.5',
                namespace: 'default',
              },
            },
            dependencies: [
              {
                type: 'usesCreated',
                destination: {
                  name: 'details',
                  kind: 'Deployable',
                },
                livenessProbe: {},
              },
              {
                type: 'usesCreated',
                destination: {
                  name: 'reviews',
                  kind: 'Deployable',
                },
                livenessProbe: {},
              },
            ],
          },
          status: {},
        },
        {
          metadata: {
            name: 'details',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/details',
            uid: 'ed9139d6-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '23',
            creationTimestamp: '2018-11-12T18:44:03Z',
            labels: {
              hcmapp: 'mcmappdemo',
              name: 'details',
              placementpolicy: 'bookinfo',
              servicekind: 'ApplicationService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'aHR0cHM6Ly9teWNsdXN0ZXIuaWNwOjk0NDMvb2lkYy9lbmRwb2ludC9PUCNhZG1pbg==',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartName: 'details-mcm',
                repository: 'custom-local',
                version: '0.1.5',
                namespace: 'default',
              },
            },
          },
          status: {},
        },
        {
          metadata: {
            name: 'gbapp-gbapp',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/gbapp-gbapp',
            uid: '830687cb-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '236',
            creationTimestamp: '2018-11-12T18:48:14Z',
            labels: {
              app: 'gbapp',
              chart: 'gbapp-0.1.0',
              heritage: 'Tiller',
              name: 'gbapp-gbapp',
              release: 'gbapp',
              servicekind: 'ApplicationService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOm1hc3RlcnMsc3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'YWRtaW4=',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartURL: 'https://raw.githubusercontent.com/abdasgupta/helm-repo/master/3.1-mcm-guestbook/gbf-0.1.0.tgz',
                namespace: 'default',
              },
            },
          },
          status: {},
        },
        {
          metadata: {
            name: 'gbapp-gbapp-redismaster',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/gbapp-gbapp-redismaster',
            uid: '8307a1ec-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '237',
            creationTimestamp: '2018-11-12T18:48:14Z',
            labels: {
              app: 'gbapp',
              chart: 'gbapp-0.1.0',
              heritage: 'Tiller',
              name: 'gbapp-gbapp-redismaster',
              release: 'gbapp',
              servicekind: 'CacheService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOm1hc3RlcnMsc3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'YWRtaW4=',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartURL: 'https://raw.githubusercontent.com/abdasgupta/helm-repo/master/3.1-mcm-guestbook/gbrm-0.1.0.tgz',
                namespace: 'default',
              },
            },
          },
          status: {},
        },
        {
          metadata: {
            name: 'gbapp-gbapp-redisslave',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/gbapp-gbapp-redisslave',
            uid: '830a0150-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '238',
            creationTimestamp: '2018-11-12T18:48:14Z',
            labels: {
              app: 'gbapp',
              chart: 'gbapp-0.1.0',
              heritage: 'Tiller',
              name: 'gbapp-gbapp-redisslave',
              release: 'gbapp',
              servicekind: 'CacheService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOm1hc3RlcnMsc3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'YWRtaW4=',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartURL: 'https://raw.githubusercontent.com/abdasgupta/helm-repo/master/3.1-mcm-guestbook/gbrs-0.1.0.tgz',
                namespace: 'default',
              },
            },
          },
          status: {},
        },
        {
          metadata: {
            name: 'ratings',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/ratings',
            uid: 'ed91178b-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '22',
            creationTimestamp: '2018-11-12T18:44:03Z',
            labels: {
              hcmapp: 'mcmappdemo',
              name: 'ratings',
              placementpolicy: 'bookinfo',
              servicekind: 'ApplicationService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'aHR0cHM6Ly9teWNsdXN0ZXIuaWNwOjk0NDMvb2lkYy9lbmRwb2ludC9PUCNhZG1pbg==',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartName: 'ratings-mcm',
                repository: 'custom-local',
                version: '0.1.5',
                namespace: 'default',
              },
            },
          },
          status: {},
        },
        {
          metadata: {
            name: 'reviews',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/deployables/reviews',
            uid: 'ed7015f5-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '18',
            creationTimestamp: '2018-11-12T18:44:03Z',
            labels: {
              hcmapp: 'mcmappdemo',
              name: 'reviews',
              placementpolicy: 'bookinfo',
              servicekind: 'ApplicationService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
              'mcm.ibm.com/user-identity': 'aHR0cHM6Ly9teWNsdXN0ZXIuaWNwOjk0NDMvb2lkYy9lbmRwb2ludC9PUCNhZG1pbg==',
            },
          },
          spec: {
            deployer: {
              kind: 'helm',
              helm: {
                chartName: 'reviews-mcm',
                repository: 'custom-local',
                version: '0.1.5',
                namespace: 'default',
              },
            },
            dependencies: [
              {
                type: 'usesCreated',
                destination: {
                  name: 'ratings',
                  kind: 'Deployable',
                },
                livenessProbe: {},
              },
            ],
          },
          status: {},
        },
      ],
    },
  };
  
  export const mockPlacementPoliciesResponse = {
    body: {
      kind: 'PlacementPolicyList',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/placementpolicies',
        resourceVersion: '78936',
      },
      items: [
        {
          metadata: {
            name: 'app04',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/placementpolicies/app04',
            uid: 'f65197a2-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '62',
            creationTimestamp: '2018-11-12T18:44:18Z',
            labels: {
              hcmapp: 'app04',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            clusterReplicas: 1,
            clusterLabels: {
              matchLabels: {
                name: 'cluster2',
              },
            },
            resourceHint: {
              type: 'cpu',
            },
            resourceSelector: {},
          },
          status: {
            decisions: [
              {
                clusterName: 'cluster2',
                clusterNamespace: 'cluster2',
              },
            ],
          },
        },
        {
          metadata: {
            name: 'bookinfo',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/placementpolicies/bookinfo',
            uid: 'ed6e751c-e6aa-11e8-b778-9e17a0ceb481',
            resourceVersion: '46',
            creationTimestamp: '2018-11-12T18:44:03Z',
            labels: {
              hcmapp: 'mcmappdemo',
              name: 'bookinfo',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            clusterReplicas: 1,
            clusterLabels: {
              matchLabels: {
                environment: 'Dev',
              },
            },
            resourceHint: {
              type: 'cpu',
            },
            resourceSelector: {},
          },
          status: {
            decisions: [
              {
                clusterName: 'cluster2',
                clusterNamespace: 'cluster2',
              },
            ],
          },
        },
        {
          metadata: {
            name: 'gbapp-gbapp',
            namespace: 'default',
            selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/placementpolicies/gbapp-gbapp',
            uid: '830b0e5f-e6ab-11e8-b778-9e17a0ceb481',
            resourceVersion: '278',
            creationTimestamp: '2018-11-12T18:48:14Z',
            labels: {
              app: 'gbapp',
              chart: 'gbapp-0.1.0',
              heritage: 'Tiller',
              name: 'gbapp-gbapp',
              release: 'gbapp',
              servicekind: 'CacheService',
            },
            annotations: {
              'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
              'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            },
          },
          spec: {
            clusterReplicas: 2,
            clusterLabels: {
              matchLabels: {
                environment: 'Dev',
              },
            },
            resourceHint: {
              type: 'cpu',
            },
            resourceSelector: {},
          },
          status: {
            decisions: [
              {
                clusterName: 'cluster2',
                clusterNamespace: 'cluster2',
              },
              {
                clusterName: 'cluster1',
                clusterNamespace: 'cluster1',
              },
            ],
          },
        },
      ],
    },
  };
  
  export const mockCreateAppResponse = {
    body: {
      kind: 'Application',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        name: 'testapp',
        namespace: 'default',
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applications/testapp',
        uid: 'f849165a-b2a8-11e8-bd43-b69970856045',
        resourceVersion: '59905',
        creationTimestamp: '2018-09-07T14:19:02Z',
        labels: {
          deployable: 'deployable01',
          hcmapp: 'testapp',
        },
        annotations: {
          'mcm.ibm.com/user-group': 'c3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
          'mcm.ibm.com/user-identity': 'aHR0cHM6Ly9teWNsdXN0ZXIuaWNwOjk0NDMvb2lkYy9lbmRwb2ludC9PUCNhZG1pbg==',
        },
      },
      spec: {
        componentKinds: [
          {
            group: 'mcm.ibm.com/v1alpha1',
            kind: 'PlacementPolicy',
          },
          {
            group: 'mcm.ibm.com/v1alpha1',
            kind: 'Deployable',
          },
        ],
        descriptor: {},
        selector: {
          matchLabels: {
            hcmapp: 'testapp',
          },
        },
      },
      status: {
        Deployable: {
          metadata: {
            creationTimestamp: null,
          },
          spec: {
            deployer: {
              helm: {},
            },
          },
          status: {},
        },
      },
    },
  };
  
  export const mockDeleteAppResponse = {
    body: {
      kind: 'Application',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        name: 'testapp',
        namespace: 'default',
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/applications/testapp',
        uid: '07094028-b2a7-11e8-bd43-b69970856045',
        resourceVersion: '59872',
        creationTimestamp: '2018-09-07T14:05:08Z',
        labels: {
          deployable: 'deployable01',
          hcmapp: 'testapp',
        },
        annotations: {
          'mcm.ibm.com/user-group': 'c3lzdGVtOmF1dGhlbnRpY2F0ZWQ=',
          'mcm.ibm.com/user-identity': 'aHR0cHM6Ly9teWNsdXN0ZXIuaWNwOjk0NDMvb2lkYy9lbmRwb2ludC9PUCNhZG1pbg==',
        },
      },
      spec: {
        componentKinds: [
          {
            group: 'mcm.ibm.com/v1alpha1',
            kind: 'PlacementPolicy',
          },
          {
            group: 'mcm.ibm.com/v1alpha1',
            kind: 'Deployable',
          },
        ],
        descriptor: {},
        selector: {
          matchLabels: {
            hcmapp: 'testapp',
          },
        },
      },
      status: {
        Deployable: {
          metadata: {
            creationTimestamp: null,
          },
          spec: {
            deployer: {
              helm: {},
            },
          },
          status: {},
        },
      },
    },
  };
  