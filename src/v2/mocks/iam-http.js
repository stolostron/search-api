/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
/* eslint-disable global-require */

export default function createMockHttp() {
  const state = {
    namespaces: {
      body: [
        {
          crn: 'crn:v1:icp:private:k8:mycluster:n/default:::',
          serviceName: 'k8',
          region: 'mycluster',
          scope: 'namespace',
          namespaceId: 'default',
          actions: 'CRUD',
        },
        {
          crn: 'crn:v1:icp:private:k8:mycluster:n/kube-system:::',
          serviceName: 'k8',
          region: 'mycluster',
          scope: 'namespace',
          namespaceId: 'kube-system',
          actions: 'CRUD',
        },
      ],
    },
  };

  return async function MockLib(params) {
    switch (true) {
      case params.url.includes('resourceType=namespace'):
        return state.namespaces;
      default:
        return state.namespaces;
    }
  };
}

