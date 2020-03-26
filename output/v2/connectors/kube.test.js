'use strict';

var _kube = require('./kube');

var _kube2 = _interopRequireDefault(_kube);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2018. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

const asyncReturn = (value, waitTime = 500) => new Promise(res => setTimeout(res, waitTime, value));

describe('KubeConnector', () => {
  describe('Get', () => {
    test('calls default connector', _asyncToGenerator(function* () {
      const mockHttp = jest.fn(function () {
        return asyncReturn({ body: { test: 'value' } }, 200);
      });

      const connector = new _kube2.default({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        httpLib: mockHttp
      });

      yield connector.get('/api/test');

      expect(mockHttp.mock.calls).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    }));

    test('calls httpLib with correct arguments', _asyncToGenerator(function* () {
      const mockHttp = jest.fn(function () {
        return asyncReturn({ body: { test: 'value' } }, 200);
      });

      const connector = new _kube2.default({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        token: 'localdev',
        httpLib: mockHttp
      });

      yield connector.get('/api/test');

      expect(mockHttp.mock.calls).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    }));

    test('correctly merges additional arguments', _asyncToGenerator(function* () {
      const mockHttp = jest.fn(function () {
        return new Promise(function (res) {
          return setTimeout(res, 200, { body: { test: 'value' } });
        });
      });

      const connector = new _kube2.default({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        token: 'localdev',
        httpLib: mockHttp
      });

      yield connector.get('/api/test', { headers: { 'x-custom-header': 'test-value' } });

      expect(mockHttp.mock.calls[0]).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    }));
  });

  describe('Post', () => {
    test('calls httpLib with correct arguments', _asyncToGenerator(function* () {
      const mockHttp = jest.fn(function () {
        return asyncReturn({ body: { test: 'value' } }, 200);
      });

      const connector = new _kube2.default({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        token: 'localdev',
        httpLib: mockHttp
      });

      yield connector.post('/api/test', { body: 'test-value' });

      expect(mockHttp.mock.calls[0]).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    }));
  });
});
//# sourceMappingURL=kube.test.js.map