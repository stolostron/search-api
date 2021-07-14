// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

export const getResourceMock = {
  body: {
    getResource: {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata: {
        name: 'monitoring-prometheus-nodeexporter-n6h9b',
        generateName: 'monitoring-prometheus-nodeexporter-',
        namespace: 'kube-system',
        selfLink: '/api/v1/namespaces/kube-system/pods/monitoring-prometheus-nodeexporter-n6h9b',
        uid: 'afaa79bb-70dd-11e9-865a-00000a15079c',
        resourceVersion: '3839',
        creationTimestamp: '2019-05-07T15:35:04Z',
        labels: {
          app: 'monitoring-prometheus',
          chart: 'ibm-icpmonitoring',
          component: 'nodeexporter',
          'controller-revision-hash': '79d7d4c8fc',
          heritage: 'Tiller',
          'pod-template-generation': '1',
          release: 'monitoring',
          role: 'nodeexporter',
        },
        annotations: {
          'kubernetes.io/psp': 'ibm-privileged-psp',
          productID: 'none',
          productName: 'node-exporter',
          productVersion: 'v0.16.0',
          'scheduler.alpha.kubernetes.io/critical-pod': '',
        },
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'DaemonSet',
            name: 'monitoring-prometheus-nodeexporter',
            uid: 'afa50102-70dd-11e9-865a-00000a15079c',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        volumes: [
          {
            name: 'proc',
            hostPath: {
              path: '/proc',
              type: '',
            },
          },
          {
            name: 'sys',
            hostPath: {
              path: '/sys',
              type: '',
            },
          },
          {
            name: 'router-config',
            configMap: {
              name: 'monitoring-prometheus-exporter-router-nginx-config',
              items: [
                {
                  key: 'nodeexporter.nginx.conf',
                  path: 'nginx.conf',
                },
              ],
              defaultMode: 420,
            },
          },
          {
            name: 'router-entry',
            configMap: {
              name: 'monitoring-monitoring-router-entry-config',
              defaultMode: 484,
            },
          },
          {
            name: 'monitoring-ca-certs',
            secret: {
              secretName: 'cluster-ca-cert',
              defaultMode: 420,
            },
          },
          {
            name: 'monitoring-certs',
            secret: {
              secretName: 'monitoring-monitoring-exporter-certs',
              defaultMode: 420,
            },
          },
          {
            name: 'default-token-vk7mp',
            secret: {
              secretName: 'default-token-vk7mp',
              defaultMode: 420,
            },
          },
        ],
        containers: [
          {
            name: 'nodeexporter',
            image: 'some-server.com/node-exporter:v0.16.0-f3',
            args: [
              '--path.procfs=/host/proc',
              '--path.sysfs=/host/sys',
              '--web.listen-address=0.0.0.0:9100',
            ],
            resources: {
              limits: {
                memory: '256Mi',
              },
              requests: {
                memory: '64Mi',
              },
            },
            volumeMounts: [
              {
                name: 'proc',
                readOnly: true,
                mountPath: '/host/proc',
              },
              {
                name: 'sys',
                readOnly: true,
                mountPath: '/host/sys',
              },
              {
                name: 'default-token-vk7mp',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            livenessProbe: {
              httpGet: {
                path: '/metrics',
                port: 9100,
                scheme: 'HTTP',
              },
              initialDelaySeconds: 30,
              timeoutSeconds: 30,
              periodSeconds: 10,
              successThreshold: 1,
              failureThreshold: 3,
            },
            readinessProbe: {
              httpGet: {
                path: '/metrics',
                port: 9100,
                scheme: 'HTTP',
              },
              initialDelaySeconds: 30,
              timeoutSeconds: 30,
              periodSeconds: 10,
              successThreshold: 1,
              failureThreshold: 3,
            },
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'IfNotPresent',
            securityContext: {
              runAsUser: 65534,
              procMount: 'Default',
            },
          },
          {
            name: 'router',
            image: 'some-server.com/icp-management-ingress:latest',
            command: [
              '/opt/ibm/router/entry/entrypoint.sh',
            ],
            env: [
              {
                name: 'NODE_NAME',
                valueFrom: {
                  fieldRef: {
                    apiVersion: 'v1',
                    fieldPath: 'spec.nodeName',
                  },
                },
              },
            ],
            resources: {
              limits: {
                memory: '256Mi',
              },
              requests: {
                memory: '64Mi',
              },
            },
            volumeMounts: [
              {
                name: 'router-config',
                mountPath: '/opt/ibm/router/conf',
              },
              {
                name: 'router-entry',
                mountPath: '/opt/ibm/router/entry',
              },
              {
                name: 'monitoring-ca-certs',
                mountPath: '/opt/ibm/router/caCerts',
              },
              {
                name: 'monitoring-certs',
                mountPath: '/opt/ibm/router/certs',
              },
              {
                name: 'default-token-vk7mp',
                readOnly: true,
                mountPath: '/var/run/secrets/kubernetes.io/serviceaccount',
              },
            ],
            terminationMessagePath: '/dev/termination-log',
            terminationMessagePolicy: 'File',
            imagePullPolicy: 'IfNotPresent',
          },
        ],
        restartPolicy: 'Always',
        terminationGracePeriodSeconds: 30,
        dnsPolicy: 'ClusterFirst',
        serviceAccountName: 'default',
        serviceAccount: 'default',
        nodeName: '10.21.7.156',
        hostNetwork: true,
        hostPID: true,
        securityContext: {},
        imagePullSecrets: [
          {
            name: 'infra-registry-key',
          },
        ],
        affinity: {
          nodeAffinity: {
            requiredDuringSchedulingIgnoredDuringExecution: {
              nodeSelectorTerms: [
                {
                  matchFields: [
                    {
                      key: 'metadata.name',
                      operator: 'In',
                      values: [
                        '10.21.7.156',
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        schedulerName: 'default-scheduler',
        tolerations: [
          {
            key: 'node.kubernetes.io/memory-pressure',
            operator: 'Exists',
            effect: 'NoSchedule',
          },
          {
            key: 'node.kubernetes.io/unschedulable',
            operator: 'Exists',
            effect: 'NoSchedule',
          },
          {
            key: 'node.kubernetes.io/network-unavailable',
            operator: 'Exists',
            effect: 'NoSchedule',
          },
          {
            key: 'dedicated',
            operator: 'Exists',
            effect: 'NoSchedule',
          },
          {
            key: 'node.kubernetes.io/not-ready',
            operator: 'Exists',
            effect: 'NoExecute',
          },
          {
            key: 'node.kubernetes.io/unreachable',
            operator: 'Exists',
            effect: 'NoExecute',
          },
          {
            key: 'node.kubernetes.io/disk-pressure',
            operator: 'Exists',
            effect: 'NoSchedule',
          },
        ],
        priorityClassName: 'system-cluster-critical',
        priority: 2000000000,
        enableServiceLinks: true,
      },
      status: {
        phase: 'Running',
        conditions: [
          {
            type: 'Initialized',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2019-05-07T15:35:04Z',
          },
          {
            type: 'Ready',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2019-05-07T15:36:04Z',
          },
          {
            type: 'ContainersReady',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2019-05-07T15:36:04Z',
          },
          {
            type: 'PodScheduled',
            status: 'True',
            lastProbeTime: null,
            lastTransitionTime: '2019-05-07T15:35:04Z',
          },
        ],
        hostIP: '10.21.7.156',
        podIP: '10.21.7.156',
        startTime: '2019-05-07T15:35:04Z',
        containerStatuses: [
          {
            name: 'nodeexporter',
            state: {
              running: {
                startedAt: '2019-05-07T15:35:33Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'some-server.com/node-exporter:v0.16.0-f3',
            imageID: 'docker-pullable://some-server.com/node-exporter@sha256:abc123',
            containerID: 'docker://abc123',
          },
          {
            name: 'router',
            state: {
              running: {
                startedAt: '2019-05-07T15:35:34Z',
              },
            },
            lastState: {},
            ready: true,
            restartCount: 0,
            image: 'some-server.com/icp-management-ingress:latest',
            imageID: 'docker-pullable://some-server.com/icp-management-ingress@sha256:abc123',
            containerID: 'docker://abc123',
          },
        ],
        qosClass: 'Burstable',
      },
    },
  },
};

export const updateResourceLocalMock = {
  body: {
    data: {
      updateResource: {
        kind: 'Namespace',
        apiVersion: 'v1',
        metadata: {
          name: 'klusterlet',
          selfLink: '/api/v1/namespaces/klusterlet',
          uid: '34ddc94d-70dc-11e9-865a-00000a15079c',
          resourceVersion: '2120711',
          creationTimestamp: '2019-05-07T15:24:29Z',
          labels: {
            icp: 'system',
            test: 'test',
          },
        },
        spec: {
          finalizers: [
            'kubernetes',
          ],
        },
        status: {
          phase: 'Active',
        },
      },
    },
  },
};

export const mockedUpdateWorkResponse = {
  body: {
    metadata: {
      name: 'update-resource-1',
      selfLink: '/path/to/resourceview/test-path-to-update-work',
    },
  },
};

export const mockedUpdatePollResponse = {
  body: {
    metadata: {
      name: 'update-resource-1234',
    },
    status: {
      result: {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          creationTimestamp: '2019-04-16T01:40:57Z',
          name: 'platform-auth-service',
          namespace: 'kube-system',
          resourceVersion: '6278503',
          selfLink: '/api/v1/namespaces/kube-system/secret/platform-auth-service',
          uid: 'ae97cf94-5fe8-11e9-bfe4-00000a150993',
        },
      },
    },
    items: [{
      status: {
        status: 'Completed',
      },
    }],
  },
};

export const deleteLocalResource = {
  body: {
    data: {
      deleteResource: {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
          name: 'test-delete-pod',
          namespace: 'kube-system',
        },
      },
    },
  },
};

export const deleteRemoteResourceAction = {
  body: {
    apiVersion: 'action.open-cluster-management.io/v1beta1',
    kind: 'ManagedClusterAction',
    metadata: {
      name: 'delete-resource-1234',
      namespace: 'remote-test-delete',
    },
  },
};

export const deleteRemoteResourceActionResult = {
  body: {
    items: [{
      status: {
        status: 'Completed',
      },
    }],
  },
};
