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
        namespaces: [
          'default',
          'kube-system',
        ],
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
