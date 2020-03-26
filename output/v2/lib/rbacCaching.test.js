'use strict';

var _rbacCaching = require('./rbacCaching');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2030. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

describe('RBAC Caching', () => {
  test('Tests creation of rbac string for search queries', _asyncToGenerator(function* () {
    const req = {
      kubeToken: 'Bearer localdev',
      user: {
        name: 'kube:admin',
        idToken: 'Bearer localdev',
        namespaces: ['default', 'kube-system']
      }
    };
    const objAliases = ['n'];
    const rbacFilter = yield (0, _rbacCaching.getUserRbacFilter)(req, objAliases);
    expect(rbacFilter).toMatchSnapshot();
  }));
  test('Test User Resources', _asyncToGenerator(function* () {
    const token = 'Bearer localdev';
    const userRes = yield (0, _rbacCaching.getClusterRbacConfig)(token);

    expect(userRes).toMatchSnapshot();
  }));
});
//# sourceMappingURL=rbacCaching.test.js.map