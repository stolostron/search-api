/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import createAuthMiddleWare from './auth-middleware';

describe('Auth Middleware', () => {
  const mockCache = {
    set: jest.fn(),
    get: jest.fn(),
  };

  const mockHttpLib = jest.fn().mockReturnValue({ body: { id_token: 'test-id-token' } });

  test('Sets kubeToken to Bearer localdev in development', (done) => {
    const mockRequest = { headers: { authorization: '' } };
    const authMiddleware = createAuthMiddleWare({ shouldLocalAuth: true });

    authMiddleware(mockRequest, null, (err) => {
      expect(err).not.toBeDefined();
      expect(mockRequest.kubeToken).toBe('Bearer localdev');
      done();
    });
  });

  test('Caches token on first authorization', (done) => {
    const mockRequest = { headers: { authorization: 'substring-for-auth' } };
    const authMiddleware = createAuthMiddleWare({
      cache: mockCache,
      httpLib: mockHttpLib,
      shouldLocalAuth: false,
    });

    authMiddleware(mockRequest, null, (err) => {
      expect(err).not.toBeDefined();
      expect(mockRequest.kubeToken).toBe('Bearer test-id-token');
      expect(mockHttpLib.mock.calls).toHaveLength(1);
      expect(mockCache.set.mock.calls).toHaveLength(1);
      expect(mockCache.set.mock.calls[0]).toMatchSnapshot();
      done();
    });
  });

  test('Retrieves token from cache if present', (done) => {
    mockHttpLib.mockClear();
    mockCache.get.mockClear();

    const mockRequest = { headers: { authorization: 'substring-for-auth' } };
    mockCache.get.mockReturnValueOnce('test-cached-token');

    const authMiddleware = createAuthMiddleWare({
      cache: mockCache,
      httpLib: mockHttpLib,
      shouldLocalAuth: false,
    });

    authMiddleware(mockRequest, null, (err) => {
      expect(err).not.toBeDefined();
      expect(mockHttpLib.mock.calls).toHaveLength(0);
      expect(mockRequest.kubeToken).toBe('Bearer test-cached-token');
      expect(mockCache.get.mock.calls).toHaveLength(1);
      expect(mockCache.get.mock.calls[0]).toMatchSnapshot();
      done();
    });
  });
});
