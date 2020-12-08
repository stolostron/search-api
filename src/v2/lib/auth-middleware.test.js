/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */

import createAuthMiddleWare from './auth-middleware';

describe('Auth Middleware', () => {
  test('should set kubeToken to "Bearer localdev" in development', () => new Promise((done) => {
    const mockRequest = { headers: { authorization: 'Bearer localdev' } };
    const authMiddleware = createAuthMiddleWare({ shouldLocalAuth: true });

    authMiddleware(mockRequest, null, (err) => {
      expect(err).not.toBeDefined();
      expect(mockRequest.kubeToken).toBe('localdev');
      done();
    });
  }));

  test('should accept token from acm-access-token-cookie', () => new Promise((done) => {
    const mockRequest = { headers: {}, cookies: { 'acm-access-token-cookie': 'fake-auth-token-cookie' } };
    const authMiddleware = createAuthMiddleWare({ shouldLocalAuth: false });

    authMiddleware(mockRequest, null, (err) => {
      expect(err).not.toBeDefined();
      expect(mockRequest.kubeToken).toBe('fake-auth-token-cookie');
      done();
    });
  }));
});
