'use strict';

var _authMiddleware = require('./auth-middleware');

var _authMiddleware2 = _interopRequireDefault(_authMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Auth Middleware', () => {
  test('Sets kubeToken to Bearer localdev in development', done => {
    const mockRequest = { headers: { authorization: 'Bearer localdev' } };
    const authMiddleware = (0, _authMiddleware2.default)({ shouldLocalAuth: true });

    authMiddleware(mockRequest, null, err => {
      expect(err).not.toBeDefined();
      expect(mockRequest.kubeToken).toBe('localdev');
      done();
    });
  });
}); /** *****************************************************************************
     * Licensed Materials - Property of IBM
     * (c) Copyright IBM Corporation 2019. All Rights Reserved.
     *
     * Note to U.S. Government Users Restricted Rights:
     * Use, duplication or disclosure restricted by GSA ADP Schedule
     * Contract with IBM Corp.
     ****************************************************************************** */
//# sourceMappingURL=auth-middleware.test.js.map