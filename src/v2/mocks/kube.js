/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

/**
 * NOTE: For brevity the response objects for user access infomation have been GREATLY reduced.
 */

/* eslint-disable class-methods-use-this */
export default class MockKubeConnector {
  async get(url) {
    if (url === '/apis/authorization.openshift.io/v1') {
      // Get request for Openshift check
      return {
        kind: 'APIResourceList',
        apiVersion: 'v1',
        groupVersion: 'authorization.openshift.io/v1',
        resources: [
          {
            name: 'selfsubjectrulesreviews',
            singularName: '',
            namespaced: true,
            kind: 'SelfSubjectRulesReview',
            verbs: [
              'create',
            ],
          },
        ],
      };
    } else if (url.includes('/api/v1')) {
      // Get request for non-namespaced resources without a group
      return {
        kind: 'APIResourceList',
        groupVersion: 'v1',
        resources: [
          {
            name: 'namespaces',
            singularName: '',
            namespaced: false,
            kind: 'Namespace',
            verbs: [
              'create',
              'delete',
              'get',
              'list',
              'patch',
              'update',
              'watch',
            ],
            shortNames: [
              'ns',
            ],
          },
        ],
      };
    } else if (url.includes('v1/roles')) {
      return {
        kind: 'RoleList',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        metadata: {
          selfLink: '/apis/rbac.authorization.k8s.io/v1/roles',
        },
        items: [{
          metadata: {
            name: 'prometheus-k8s',
            namespace: 'default',
            selfLink:
             '/apis/rbac.authorization.k8s.io/v1/namespaces/default/roles/prometheus-k8s',
            uid: '10c4e691-4af3-11ea-b9dd-00000a102771',
            resourceVersion: '10954',
            creationTimestamp: '2020-02-09T04:17:20Z',
          },
          rules: [{
            verbs: ['get', 'list', 'watch'],
            apiGroups: [''],
            resources: ['services', 'endpoints', 'pods'],
          }],
        }],
      };
    } else if (url.includes('v1/clusterroles')) {
      return {
        kind: 'RoleBindingList',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        metadata: {
          selfLink: '/apis/rbac.authorization.k8s.io/v1/rolebindings',
        },
        items: [{
          metadata: {
            name: 'system:deployers',
            namespace: 'cert-manager',
            selfLink:
             '/apis/rbac.authorization.k8s.io/v1/namespaces/cert-manager/rolebindings/system%3Adeployers',
            uid: 'c532cf60-4b03-11ea-9c46-00000a10276e',
            resourceVersion: '59172',
            creationTimestamp: '2020-02-09T06:16:55Z',
            annotations: {
              'openshift.io/description':
                'Allows deploymentconfigs in this namespace to rollout pods in this namespace...',
            },
          },
          subjects: [{
            kind: 'ServiceAccount',
            name: 'deployer',
            namespace: 'cert-manager',
          }],
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: 'system:deployer',
          },
        }],
      };
    } else if (url.includes('v1/rolebindings')) {
      return {
        kind: 'ClusterRoleList',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        metadata: {
          selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles',
        },
        items: [{
          metadata: {
            name: 'admin',
            selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles/admin',
            uid: 'ee11bac6-4af1-11ea-969d-00000a10275c',
            resourceVersion: '78126',
            creationTimestamp: '2020-02-09T04:09:12Z',
            labels: { 'kubernetes.io/bootstrapping': 'rbac-defaults' },
            annotations: { 'rbac.authorization.kubernetes.io/autoupdate': 'true' },
          },
          rules: [{
            verbs: ['create', 'update', 'patch', 'delete'],
            apiGroups: ['operators.coreos.com'],
            resources: ['subscriptions'],
          }],
        }],
      };
    } else if (url.includes('v1/clusterrolebindings')) {
      return {
        kind: 'ClusterRoleBindingList',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        metadata: {
          selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
        },
        items: [{
          metadata: {
            name: 'admin-users',
            selfLink:
             '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/admin-users',
            uid: 'b1ecadaa-4b03-11ea-92a9-00000a1027bc',
            resourceVersion: '58885',
            creationTimestamp: '2020-02-09T06:16:23Z',
            annotations: {
              'kubectl.kubernetes.io/last-applied-configuration':
                // eslint-disable-next-line
                '{"apiVersion":"rbac.authorization.k8s.io/v1","kind":"ClusterRoleBinding","metadata":{"annotations":{},"name":"admin-users"},"roleRef":{"apiGroup":"rbac.authorization.k8s.io","kind":"ClusterRole","name":"cluster-admin"},"subjects":[{"kind":"ServiceAccount","name":"default","namespace":"kube-system"},{"kind":"ServiceAccount","name":"default","namespace":"icp-system"}]}\n'
            },
          },
          subjects: [
            {
              kind: 'ServiceAccount',
              name: 'default',
              namespace: 'kube-system',
            },
            {
              kind: 'ServiceAccount',
              name: 'default',
              namespace: 'icp-system',
            },
          ],
          roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: 'cluster-admin',
          },
        }],
      };
    } else if (url.includes('project.openshift.io/v1/projects')) {
      return {
        kind: 'ProjectList',
        apiVersion: 'project.openshift.io/v1',
        metadata: { selfLink: '/apis/project.openshift.io/v1/projects' },
        items: [{
          metadata: {
            name: 'default',
            selfLink: '/apis/project.openshift.io/v1/projects/default',
            uid: 'ef8d61de-4af1-11ea-969d-00000a10275c',
            resourceVersion: '69436',
            creationTimestamp: '2020-02-09T04:09:15Z',
            annotations: {
              'mcm.ibm.com/accountID': 'id-mycluster-account',
              'mcm.ibm.com/type': 'System',
              'openshift.io/sa.scc.mcs': 's0:c16,c0',
              'openshift.io/sa.scc.supplemental-groups': '1000240000/10000',
              'openshift.io/sa.scc.uid-range': '1000240000/10000',
            },
          },
          spec: { finalizers: ['kubernetes'] },
          status: { phase: 'Active' },
        }],
      };
    }
    // return null if request has not been mocked.
    return null;
  }
  async post(url /* , body */) {
    if (url === '/apis') {
      return {
        kind: 'APIGroupList',
        apiVersion: 'v1',
        groups: [
          {
            name: 'authorization.openshift.io',
            versions: [
              {
                groupVersion: 'authorization.openshift.io/v1',
                version: 'v1',
              },
            ],
            preferredVersion: {
              groupVersion: 'authorization.openshift.io/v1',
              version: 'v1',
            },
          },
        ],
      };
    } else if (url.includes('selfsubjectaccessreviews')) {
      return {
        kind: 'SelfSubjectAccessReview',
        apiVersion: 'authorization.k8s.io/v1',
        metadata: {
          creationTimestamp: null,
        },
        spec: {
          resourceAttributes: {
            verb: 'get',
            resource: 'selfsubjectrulesreviews',
          },
        },
        status: {
          allowed: true,
          reason: 'RBAC: allowed by ClusterRoleBinding "oidc-admin-binding" of ClusterRole "cluster-admin" to User "admin"',
        },
      };
    } else if (url.includes('default/selfsubjectrulesreviews')) {
      return {
        kind: 'SelfSubjectRulesReview',
        apiVersion: 'authorization.openshift.io/v1',
        spec: {
          scopes: null,
        },
        status: {
          rules: [
            {
              verbs: [
                '*',
              ],
              attributeRestrictions: null,
              apiGroups: [
                '*',
              ],
              resources: [
                '*',
              ],
            },
            {
              verbs: [
                'create',
              ],
              attributeRestrictions: null,
              apiGroups: [
                'authorization.openshift.io',
              ],
              resources: [
                'selfsubjectrulesreviews',
              ],
            },
            {
              verbs: [
                'get',
                'list',
              ],
              attributeRestrictions: null,
              apiGroups: [
                'authorization.openshift.io',
              ],
              resources: [
                'clusterroles',
              ],
            },
          ],
        },
      };
    }
    // return null if request has not been mocked.
    return null;
  }
}
