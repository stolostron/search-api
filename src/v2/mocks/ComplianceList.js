// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export const mockComplianceListResponse = {
  body: {
    apiVersion: 'compliance.mcm.ibm.com/v1alpha1',
    items: [
      {
        apiVersion: 'compliance.mcm.ibm.com/v1alpha1',
        kind: 'Compliance',
        metadata: {
          annotations: {
            'seed-generation': '1',
          },
          creationTimestamp: '2019-01-02T19:42:12Z',
          finalizers: ['finalizer.mcm.ibm.com'],
          generation: 1,
          name: 'compliance-xz',
          namespace: 'mcm',
          resourceVersion: '5533372',
          selfLink: '/apis/compliance.mcm.ibm.com/v1alpha1/namespaces/mcm/compliances/compliance-xz',
          uid: '7fc1f4a2-0ec6-11e9-8fd0-0ebe277f4f9c',
        },
        spec: {
          'runtime-rules': [{
            apiVersion: 'policy.open-cluster-management.io/v1',
            kind: 'Policy',
            metadata: {
              creationTimestamp: null,
              labels: {
                hipaa: 'true',
              },
              name: 'policy-all',
            },
            spec: {
              complianceType: 'musthave',
              namespaces: {
                exclude: ['kube*'],
                include: ['default'],
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
                  Validity: {},
                },
              }, {
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
                  Validity: {},
                },
              }, {
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
                  Validity: {},
                },
              }, {
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
                    allowedCapabilities: ['*'],
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
                    volumes: ['*'],
                  },
                },
                status: {
                  Validity: {},
                },
              }, {
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
                  Validity: {},
                },
              }, {
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
                  Validity: {},
                },
              }],
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
                    apiGroups: ['extensions', 'apps'],
                    resources: ['deployments'],
                    verbs: ['get', 'list', 'watch', 'create', 'delete', 'patch'],
                  },
                }],
                selector: {
                  matchLabels: {
                    hipaa: 'true',
                  },
                },
                status: {
                  Validity: {},
                },
              }],
            },
            status: {},
          }],
        },
        status: {
          placementBindings: ['binding-xz'],
          placementPolicies: ['placement-xz'],
          status: {
            cluster1: {
              aggregatePoliciesStatus: {
                'policy-all': {
                  compliant: 'Compliant',
                  valid: true,
                },
              },
              clustername: 'cluster1',
              compliant: 'Compliant',
            },
            cluster2: {
              aggregatePoliciesStatus: {
                'policy-all': {
                  compliant: 'Compliant',
                  valid: true,
                },
              },
              clustername: 'cluster2',
              compliant: 'Compliant',
            },
            cluster3: {
              aggregatePoliciesStatus: {
                'policy-all': {
                  compliant: 'Compliant',
                  valid: true,
                },
              },
              clustername: 'cluster3',
              compliant: 'Compliant',
            },
          },
        },
      },
    ],
    kind: 'ComplianceList',
    metadata: {
      continue: '',
      resourceVersion: '4401288',
      selfLink: '/apis/compliance.mcm.ibm.com/v1alpha1/namespaces/mcm/compliances',
    },
  },
};

export const mockCreateCompliance = {
  body: {
    apiVersion: 'compliance.mcm.ibm.com/v1alpha1',
    kind: 'Compliance',
    metadata: {
      creationTimestamp: '2018-09-06T18:19:43Z',
      generation: 1,
      name: 'test-compliance',
      namespace: 'mcm',
      resourceVersion: '4405693',
      selfLink: '/apis/compliance.mcm.ibm.com/v1alpha1/namespaces/mcm/compliances/test-compliance',
      uid: '6d5dbb6e-b201-11e8-9a12-005056a0d11b',
    },
    spec: {
      'runtime-rules': [
        {
          apiVersion: 'policy.open-cluster-management.io/v1',
          kind: 'Policy',
          metadata: {
            description: 'Instance descriptor for policy resource',
            name: 'test-policy-1',
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
            remediationAction: 'inform',
            'role-templates': [
              {
                apiVersion: 'roletemplate.mcm.ibm.com/v1alpha1',
                complianceType: 'musthave',
                kind: 'RoleTemplate',
                metadata: {
                  name: 'role-xz-1',
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
                        'create',
                        'delete',
                        'patch',
                      ],
                    },
                    complianceType: 'musthave',
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
        {
          apiVersion: 'policy.open-cluster-management.io/v1',
          kind: 'Policy',
          metadata: {
            description: 'Instance descriptor for policy resource',
            name: 'test-policy-2',
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
                  name: 'role-xz-2',
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
      ],
    },
  },
};

export const mockDeleteResponse = {
  body: {
    apiVersion: 'compliance.mcm.ibm.com/v1alpha1',
    kind: 'Compliance',
    metadata: {
      annotations: {
        'seed-generation': '1',
      },
      creationTimestamp: '2019-01-02T19:42:12Z',
      finalizers: ['finalizer.mcm.ibm.com'],
      generation: 1,
      name: 'compliance-all',
      namespace: 'mcm',
      resourceVersion: '5533372',
      selfLink: '/apis/compliance.mcm.ibm.com/v1alpha1/namespaces/mcm/compliances/compliance-all',
      uid: '7fc1f4a2-0ec6-11e9-8fd0-0ebe277f4f9c',
    },
    spec: {
      'runtime-rules': [{
        apiVersion: 'policy.open-cluster-management.io/v1',
        kind: 'Policy',
        metadata: {
          creationTimestamp: null,
          labels: {
            hipaa: 'true',
          },
          name: 'policy-all',
        },
        spec: {
          complianceType: 'musthave',
          namespaces: {
            exclude: ['kube*'],
            include: ['default'],
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
              Validity: {},
            },
          }, {
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
              Validity: {},
            },
          }, {
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
              Validity: {},
            },
          }, {
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
                allowedCapabilities: ['*'],
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
                volumes: ['*'],
              },
            },
            status: {
              Validity: {},
            },
          }, {
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
              Validity: {},
            },
          }, {
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
              Validity: {},
            },
          }],
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
                apiGroups: ['extensions', 'apps'],
                resources: ['deployments'],
                verbs: ['get', 'list', 'watch', 'create', 'delete', 'patch'],
              },
            }],
            selector: {
              matchLabels: {
                hipaa: 'true',
              },
            },
            status: {
              Validity: {},
            },
          }],
        },
        status: {},
      }],
    },
    status: {
      placementBindings: ['binding-xz'],
      placementPolicies: ['placement-xz'],
      status: {
        cluster1: {
          aggregatePoliciesStatus: {
            'policy-all': {
              compliant: 'Compliant',
              valid: true,
            },
          },
          clustername: 'cluster1',
          compliant: 'Compliant',
        },
        cluster2: {
          aggregatePoliciesStatus: {
            'policy-all': {
              compliant: 'Compliant',
              valid: true,
            },
          },
          clustername: 'cluster2',
          compliant: 'Compliant',
        },
        cluster3: {
          aggregatePoliciesStatus: {
            'policy-all': {
              compliant: 'Compliant',
              valid: true,
            },
          },
          clustername: 'cluster3',
          compliant: 'Compliant',
        },
      },
    },
  },
};
