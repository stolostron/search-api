// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export const mockPolicyListResponse = {
  body:
    {
      kind: 'ResourceView',
      apiVersion: 'mcm.ibm.com/v1alpha1',
      metadata: {
        name: 'policy-1546551175122',
        namespace: 'default',
        selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/default/resourceviews/policy-1546551175122',
        uid: '21c50bb6-0f9f-11e9-a535-e2d4c161f9ad',
        resourceVersion: '30574',
        creationTimestamp: '2019-01-03T21:32:55Z',
        labels: {
          name: 'policy-1546551175122',
        },
        annotations: {
          'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
          'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
        },
      },
      spec: {
        clusterSelector: {
          matchLabels: {
            name: 'cluster2',
          },
        },
        scope: {
          resource: 'policy',
          resourceName: 'policy-all',
          namespace: 'mcm-cluster2',
        },
      },
      status: {
        conditions: [{
          type: 'Completed',
          lastUpdateTime: '2019-01-03T21:32:55Z',
        }],
        results: {
          cluster2: {
            apiVersion: 'policy.open-cluster-management.io/v1',
            kind: 'Policy',
            metadata: {
              annotations: {
                'seed-generation': '7',
              },
              creationTimestamp: '2019-01-03T16:29:46Z',
              finalizers: [
                'finalizer.mcm.ibm.com',
              ],
              generation: 1,
              labels: {
                compliance: 'compliance-all',
                ignore: 'false',
              },
              name: 'policy-all',
              namespace: 'mcm-cluster2',
              ownerReferences: [{
                apiVersion: 'compliance.mcm.ibm.com/v1alpha1',
                blockOwnerDeletion: true,
                controller: true,
                kind: 'Compliance',
                name: 'compliance-all',
                uid: 'c8ad7adb-0f74-11e9-9723-0e8b333ab57e',
              }],
              resourceVersion: '5543743',
              selfLink: '/apis/policy.open-cluster-management.io/v1/namespaces/mcm-cluster2/policies/policy-all',
              uid: 'c8af7ef9-0f74-11e9-9723-0e8b333ab57e',
            },
            spec: {
              complianceType: 'musthave',
              namespaces: {
                exclude: [
                  'kube*',
                ],
                include: [
                  'default',
                ],
              },
              'object-templates': [{
                complianceType: 'musthave',
                objectDefinition: {
                  apiVersion: 'v1',
                  kind: 'Pod',
                  metadata: {
                    name: 'nginx',
                  },
                  spec: {
                    containers: [{
                      image: 'nginx:1.7.9',
                      name: 'nginx',
                      ports: [{
                        containerPort: 80,
                      }],
                    }],
                  },
                },
                status: {
                  Compliant: 'Compliant',
                  Validity: {},
                  conditions: [{
                    lastTransitionTime: '2019-01-03T21:32:49Z',
                    message: 'pods `nginx` exists as it should be, therefore the this Object template is compliant',
                    reason: 'K8s `must have` object already exists',
                    status: 'True',
                    type: 'notification',
                  }],
                },
              },
              {
                complianceType: 'musthave',
                objectDefinition: {
                  apiVersion: 'v1',
                  kind: 'Namespace',
                  metadata: {
                    labels: {
                      name: 'production',
                    },
                    name: 'production',
                  },
                },
                status: {
                  Compliant: 'Compliant',
                  Validity: {},
                  conditions: [{
                    lastTransitionTime: '2019-01-03T21:32:49Z',
                    message: 'namespaces `production` exists as it should be, therefore the this Object template is compliant',
                    reason: 'K8s `must have` object already exists',
                    status: 'True',
                    type: 'notification',
                  }],
                },
              },
              {
                complianceType: 'musthave',
                objectDefinition: {
                  apiVersion: 'rbac.authorization.k8s.io/v1',
                  kind: 'RoleBinding',
                  metadata: {
                    name: 'operate-pods-rolebinding',
                    namespace: 'default',
                  },
                  roleRef: {
                    apiGroup: 'rbac.authorization.k8s.io',
                    kind: 'Role',
                    name: 'operator',
                  },
                  subjects: [{
                    apiGroup: 'rbac.authorization.k8s.io',
                    kind: 'User',
                    name: 'jane',
                  }],
                },
                status: {
                  Compliant: 'Compliant',
                  Validity: {},
                  conditions: [{
                    lastTransitionTime: '2019-01-03T21:32:49Z',
                    message: 'rolebindings `operate-pods-rolebinding` exists as it should be, therefore the this Object template is compliant',
                    reason: 'K8s `must have` object already exists',
                    status: 'True',
                    type: 'notification',
                  }],
                },
              },
              {
                complianceType: 'musthave',
                objectDefinition: {
                  apiVersion: 'policy/v1beta1',
                  kind: 'PodSecurityPolicy',
                  metadata: {
                    annotations: {
                      'seccomp.security.alpha.kubernetes.io/allowedProfileNames': '*',
                    },
                    name: 'privileged-mcm',
                  },
                  spec: {
                    allowPrivilegeEscalation: true,
                    allowedCapabilities: [
                      '*',
                    ],
                    fsGroup: {
                      rule: 'RunAsAny',
                    },
                    hostIPC: true,
                    hostNetwork: true,
                    hostPID: true,
                    hostPorts: [{
                      max: 65535,
                      min: 0,
                    }],
                    privileged: true,
                    runAsUser: {
                      rule: 'RunAsAny',
                    },
                    seLinux: {
                      rule: 'RunAsAny',
                    },
                    supplementalGroups: {
                      rule: 'RunAsAny',
                    },
                    volumes: [
                      '*',
                    ],
                  },
                },
                status: {
                  Compliant: 'Compliant',
                  Validity: {},
                  conditions: [{
                    lastTransitionTime: '2019-01-03T21:32:49Z',
                    message: 'podsecuritypolicies `privileged-mcm` exists as it should be, therefore the this Object template is compliant',
                    reason: 'K8s `must have` object already exists',
                    status: 'True',
                    type: 'notification',
                  }],
                },
              },
              {
                complianceType: 'musthave',
                objectDefinition: {
                  apiVersion: 'networking.k8s.io/v1',
                  kind: 'NetworkPolicy',
                  metadata: {
                    name: 'allow-all-mcm',
                  },
                  spec: {
                    ingress: [{}],
                    podSelector: {},
                  },
                },
                status: {
                  Compliant: 'Compliant',
                  Validity: {},
                  conditions: [{
                    lastTransitionTime: '2019-01-03T21:32:49Z',
                    message: 'networkpolicies `allow-all-mcm` exists as it should be, therefore the this Object template is compliant',
                    reason: 'K8s `must have` object already exists',
                    status: 'True',
                    type: 'notification',
                  }],
                },
              },
              {
                complianceType: 'musthave',
                objectDefinition: {
                  apiVersion: 'v1',
                  kind: 'LimitRange',
                  metadata: {
                    name: 'mem-limit-range',
                  },
                  spec: {
                    limits: [{
                      default: {
                        memory: '512Mi',
                      },
                      defaultRequest: {
                        memory: '256Mi',
                      },
                      type: 'Container',
                    }],
                  },
                },
                status: {
                  Compliant: 'Compliant',
                  Validity: {},
                  conditions: [{
                    lastTransitionTime: '2019-01-03T21:32:53Z',
                    message: 'limitranges `mem-limit-range` exists as it should be, therefore the this Object template is compliant',
                    reason: 'K8s `must have` object already exists',
                    status: 'True',
                    type: 'notification',
                  }],
                },
              },
              ],
              remediationAction: 'enforce',
              'role-templates': [{
                apiVersion: 'roletemplate.mcm.ibm.com/v1alpha1',
                complianceType: 'musthave',
                metadata: {
                  creationTimestamp: null,
                  name: 'operator-role',
                },
                rules: [{
                  complianceType: 'musthave',
                  policyRule: {
                    apiGroups: [
                      'extensions',
                      'apps',
                    ],
                    resources: [
                      'deployments',
                    ],
                    verbs: [
                      'get',
                      'list',
                      'watch',
                      'create',
                      'delete',
                      'patch',
                    ],
                  },
                }],
                selector: {
                  matchLabels: {
                    hipaa: 'true',
                  },
                },
                status: {
                  Compliant: 'Compliant',
                  Validity: {
                    valid: true,
                  },
                },
              }],
            },
            status: {
              compliant: 'Compliant',
              valid: true,
            },
          },
        },
      },
    },
};

export const mockSinglePolicyResponse = {
  body: {
    apiVersion: 'policy.open-cluster-management.io/v1',
    kind: 'Policy',
    metadata: {
      creationTimestamp: '2018-09-04T16:13:50Z',
      finalizers: [
        'finalizer.mcm.ibm.com',
      ],
      generation: 1,
      labels: {
        compliance: 'compliance-xz',
      },
      name: 'policy-xz-1',
      namespace: 'mycluster',
      ownerReferences: [
        {
          apiVersion: 'compliance.mcm.ibm.com/v1alpha1',
          blockOwnerDeletion: true,
          controller: true,
          kind: 'Compliance',
          name: 'compliance-xz',
          uid: '82de70e7-b05d-11e8-9a12-005056a0d11b',
        },
      ],
      resourceVersion: '4349995',
      selfLink: '/apis/policy.open-cluster-management.io/v1/namespaces/mycluster/policies/policy-xz-1',
      uid: '82e00acc-b05d-11e8-9a12-005056a0d11b',
    },
    spec: {
      complianceType: '',
      namespaces: {
        exclude: [
          'kube*',
        ],
        include: [
          'default',
        ],
      },
      remediationAction: 'inform',
      'role-templates': [
        {
          apiVersion: 'roletemplate.mcm.ibm.com/v1alpha1',
          complianceType: 'musthave',
          kind: 'RoleTemplate',
          metadata: {
            creationTimestamp: null,
            name: 'role-xz-1',
          },
          rules: [
            {
              complianceType: 'musthave',
              policyRule: {
                apiGroups: [
                  'extensions',
                  'apps',
                ],
                resources: [
                  'deployments',
                ],
                verbs: [
                  'get',
                  'list',
                  'watch',
                  'create',
                  'delete',
                  'patch',
                ],
              },
            },
          ],
          selector: {
            matchLabels: {
              cloud: 'IBM',
            },
          },
          status: {
            Compliant: 'NonCompliant',
            Validity: {
              valid: true,
            },
            conditions: [
              {
                lastTransitionTime: '2018-09-06T15:14:44Z',
                message: 'k8s RBAC role is missing: role-xz-1',
                reason: 'K8s RBAC role is missing',
                status: 'True',
                type: 'completed',
              },
            ],
          },
        },
      ],
    },
    status: {
      Compliant: 'NonCompliant',
      Valid: true,
    },
  },
};

export const mockCreatePolicy = {
  body: {
    apiVersion: 'policy.open-cluster-management.io/v1',
    kind: 'Policy',
    metadata: {
      creationTimestamp: '2018-09-06T17:12:34Z',
      generation: 1,
      name: 'test-policy',
      namespace: 'default',
      resourceVersion: '4385854',
      selfLink: '/apis/policy.open-cluster-management.io/v1/namespaces/default/policies/test-policy',
      uid: '0c388331-b1f8-11e8-9a12-005056a0d11b',
    },
    spec: {
      namespaces: {
        exclude: [
          'kube*',
        ],
        include: [
          'default',
        ],
      },
      remediationAction: 'enforce',
      'role-templates': [
        {
          apiVersion: 'roletemplate.mcm.ibm.com/v1alpha1',
          complianceType: 'musthave',
          kind: 'RoleTemplate',
          metadata: {
            name: 'test-role',
            namespace: '',
          },
          rules: [
            {
              PolicyRule: {
                apiGroups: [
                  'extensions',
                  'apps',
                ],
                resources: [
                  'deployments',
                ],
                verbs: [
                  'get',
                  'list',
                  'watch',
                  'delete',
                ],
              },
              complianceType: 'musthave',
            },
            {
              PolicyRule: {
                apiGroups: [
                  'core',
                ],
                resources: [
                  'pods',
                ],
                verbs: [
                  'create',
                  'update',
                  'patch',
                ],
              },
              complianceType: 'mustnothave',
            },
            {
              PolicyRule: {
                apiGroups: [
                  'core',
                ],
                resources: [
                  'secrets',
                ],
                verbs: [
                  'get',
                  'watch',
                  'list',
                  'create',
                  'delete',
                  'update',
                  'patch',
                ],
              },
            },
          ],
          selector: {
            matchLabels: {
              cloud: 'IBM',
            },
          },
        },
      ],
    },
  },
};

export const mockPlacementPolicyResponse = {
  body: {
    kind: 'PlacementPolicyList',
    apiVersion: 'mcm.ibm.com/v1alpha1',
    metadata: {
      selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/mcm/placementpolicies',
      resourceVersion: '51490',
    },
    items: [
      {
        metadata: {
          name: 'placement-xz',
          namespace: 'mcm',
          selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/mcm/placementpolicies/placement-xz',
          uid: '3df1e8f5-1053-11e9-a535-e2d4c161f9ad',
          resourceVersion: '51486',
          creationTimestamp: '2019-01-04T19:02:11Z',
          annotations: {
            'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
          },
        },
        spec: {
          clusterLabels: {
            matchLabels: {
              cloud: 'IBM',
            },
          },
          resourceHint: {

          },
        },
        status: {
          decisions: [
            {
              clusterName: 'cluster3',
              clusterNamespace: 'cluster3',
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

export const mockPlacementBindingResponse = {
  body: {
    kind: 'PlacementBindingList',
    apiVersion: 'mcm.ibm.com/v1alpha1',
    metadata: {
      selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/mcm/placementbindings',
      resourceVersion: '48564',
    },
    items: [
      {
        metadata: {
          name: 'binding-xz',
          namespace: 'mcm',
          selfLink: '/apis/mcm.ibm.com/v1alpha1/namespaces/mcm/placementbindings/binding-xz',
          uid: '7fc24685-0ec6-11e9-a535-e2d4c161f9ad',
          resourceVersion: '249',
          creationTimestamp: '2019-01-02T19:42:12Z',
          annotations: {
            'mcm.ibm.com/user-group': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50cyxzeXN0ZW06c2VydmljZWFjY291bnRzOmt1YmUtc3lzdGVtLHN5c3RlbTphdXRoZW50aWNhdGVk',
            'mcm.ibm.com/user-identity': 'c3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOmRlZmF1bHQ=',
            'seed-generation': '1',
          },
          finalizers: [
            'finalizer.mcm.ibm.com',
          ],
        },
        subjects: [
          {
            kind: 'Compliance',
            name: 'compliance-all',
          },
        ],
        placementRef: {
          name: 'placement-xz',
        },
      },
    ],
  },
};

export const mockDeleteResponse = {
  body: {
    apiVersion: 'policy.open-cluster-management.io/v1',
    kind: 'Policy',
    metadata: {
      creationTimestamp: '2018-09-06T15:06:23Z',
      deletionGracePeriodSeconds: 0,
      deletionTimestamp: '2018-09-06T15:09:33Z',
      finalizers: [
        'finalizer.mcm.ibm.com',
      ],
      generation: 2,
      name: 'test-policy',
      namespace: 'default',
      resourceVersion: '4348453',
      selfLink: '/apis/policy.open-cluster-management.io/v1/namespaces/default/policies/test-policy',
      uid: '6b4cc90c-b1e6-11e8-9a12-005056a0d11b',
    },
    spec: {
      complianceType: '',
      namespaces: {
        exclude: [
          'kube*',
        ],
        include: [
          'default',
        ],
      },
      remediationAction: 'enforce',
      'role-templates': [
        {
          apiVersion: 'roletemplate.mcm.ibm.com/v1alpha1',
          complianceType: 'musthave',
          kind: 'RoleTemplate',
          metadata: {
            creationTimestamp: null,
            name: 'test-role',
          },
          rules: [
            {
              complianceType: 'musthave',
              policyRule: {
                apiGroups: [
                  'extensions',
                  'apps',
                ],
                resources: [
                  'deployments',
                ],
                verbs: [
                  'get',
                  'list',
                  'watch',
                  'delete',
                ],
              },
            },
            {
              complianceType: 'mustnothave',
              policyRule: {
                apiGroups: [
                  'core',
                ],
                resources: [
                  'pods',
                ],
                verbs: [
                  'create',
                  'update',
                  'patch',
                ],
              },
            },
            {
              complianceType: 'musthave',
              policyRule: {
                apiGroups: [
                  'core',
                ],
                resources: [
                  'secrets',
                ],
                verbs: [
                  'get',
                  'watch',
                  'list',
                  'create',
                  'delete',
                  'update',
                  'patch',
                ],
              },
            },
          ],
          selector: {
            matchLabels: {
              cloud: 'IBM',
            },
          },
          status: {
            Compliant: 'Compliant',
            Validity: {
              valid: true,
            },
            conditions: [
              {
                lastTransitionTime: '2018-09-06T15:06:24Z',
                message: 'k8s RBAC role "test-role" was missing ',
                reason: 'K8s RBAC role created',
                status: 'True',
                type: 'completed',
              },
            ],
          },
        },
      ],
    },
    status: {
      Compliant: 'Compliant',
      Valid: true,
    },
  },
};
