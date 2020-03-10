/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import createAuthMiddleWare from './auth-middleware';

describe('Auth Middleware', () => {
  test('Sets kubeToken to Bearer localdev in development', (done) => {
    const mockRequest = { headers: { authorization: 'Bearer localdev' } };
    const authMiddleware = createAuthMiddleWare({ shouldLocalAuth: true });

    authMiddleware(mockRequest, null, (err) => {
      expect(err).not.toBeDefined();
      expect(mockRequest.kubeToken).toBe('localdev');
      done();
    });
  });
});
