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
    if (url.includes('/apis/authorization.openshift.io/v1')) {
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
    } else if (url.includes('/apis/authorization.openshift.io/v1')) {
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
    }
    // return null if request has not been mocked.
    return null;
  }
  async post(url, body) {
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
    } else if (url.includes('kube-system/selfsubjectrulesreviews')) {
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
    } else if (body.spec.resourceAttributes.resource === 'namespaces') {
      return {
        kind: 'SelfSubjectAccessReview',
        apiVersion: 'authorization.k8s.io/v1',
        metadata: {
          creationTimestamp: null,
        },
        spec: {
          resourceAttributes: {
            verb: 'get',
            resource: 'namespaces',
          },
        },
        status: {
          allowed: true,
          reason: 'RBAC: allowed by ClusterRoleBinding "oidc-admin-binding" of ClusterRole "cluster-admin" to User "admin"',
        },
      };
    } else if (body.spec.resourceAttributes.resource === 'selfsubjectrulesreviews') {
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
    }
    // return null if request has not been mocked.
    return null;
  }
}
