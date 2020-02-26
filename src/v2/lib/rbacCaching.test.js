/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2030. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import { getUserRbacFilter, getClusterRbacConfig } from './rbacCaching';

describe('RBAC Caching', () => {
  test('Tests creation of rbac string for search queries', async () => {
    const req = {
      kubeToken: 'Bearer localdev',
      user: {
        name: 'kube:admin',
        idToken: 'Bearer localdev',
        namespaces: {
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
        },
      },
    };
    const objAliases = ['n'];
    const rbacFilter = await getUserRbacFilter(req, objAliases);
    expect(rbacFilter).toMatchSnapshot();
  });
  test('Test User Resources', async () => {
    const token = 'Bearer localdev';
    const userRes = await getClusterRbacConfig(token);

    expect(userRes).toMatchSnapshot();
  });
});
