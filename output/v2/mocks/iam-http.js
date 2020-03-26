'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMockHttp;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
/* eslint-disable global-require */

function createMockHttp() {
  const state = {
    namespaces: {
      kind: 'ProjectList',
      apiVersion: 'project.openshift.io/v1',
      metadata: { selfLink: '/apis/project.openshift.io/v1/projects' },
      items: [{
        metadata: {
          name: 'default',
          selfLink: '/apis/project.openshift.io/v1/projects/default',
          uid: 'd039f9ea-152f-11ea-920f-00000a1012a4',
          resourceVersion: '21120909',
          creationTimestamp: '2019-12-02T18:16:08Z'
        },
        spec: { finalizers: [] },
        status: { phase: 'Active' }
      }, {
        metadata: {
          name: 'kube-system',
          selfLink: '/apis/project.openshift.io/v1/projects/kube-system',
          uid: 'ce32a2c7-152f-11ea-920f-00000a1012a4',
          resourceVersion: '21133087',
          creationTimestamp: '2019-12-02T18:16:05Z'
        },
        spec: { finalizers: [] },
        status: { phase: 'Active' }
      }]
    }
  };

  return (() => {
    var _ref = _asyncToGenerator(function* (params) {
      switch (true) {
        case params.url.includes('project.openshift.io/v1/projects'):
          return state.namespaces;
        default:
          return state.namespaces;
      }
    });

    function MockLib(_x) {
      return _ref.apply(this, arguments);
    }

    return MockLib;
  })();
}
//# sourceMappingURL=iam-http.js.map