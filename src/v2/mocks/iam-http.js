/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
/* eslint-disable global-require */

export default function createMockHttp() {
  const state = {
    namespaces: {
      kind: 'ProjectList',
      apiVersion: 'project.openshift.io/v1',
      metadata: { selfLink: '/apis/project.openshift.io/v1/projects' },
      items: [
        {
          metadata: {
            name: 'default',
            selfLink: '/apis/project.openshift.io/v1/projects/default',
            uid: 'd039f9ea-152f-11ea-920f-00000a1012a4',
            resourceVersion: '21120909',
            creationTimestamp: '2019-12-02T18:16:08Z',
          },
          spec: { finalizers: [] },
          status: { phase: 'Active' },
        },
        {
          metadata: {
            name: 'kube-system',
            selfLink: '/apis/project.openshift.io/v1/projects/kube-system',
            uid: 'ce32a2c7-152f-11ea-920f-00000a1012a4',
            resourceVersion: '21133087',
            creationTimestamp: '2019-12-02T18:16:05Z',
          },
          spec: { finalizers: [] },
          status: { phase: 'Active' },
        },
      ],
    },
  };

  return async function MockLib(params) {
    switch (true) {
      case params.url.includes('project.openshift.io/v1/projects'):
        return state.namespaces;
      default:
        return state.namespaces;
    }
  };
}

