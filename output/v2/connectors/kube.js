'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _request = require('../lib/request');

var _request2 = _interopRequireDefault(_request);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class KubeConnector {
  constructor({
    token = 'localdev',
    kubeApiEndpoint = `${_config2.default.get('API_SERVER_URL')}` || 'https://kubernetes.default.svc',
    httpLib = _request2.default
  } = {}) {
    this.kubeApiEndpoint = kubeApiEndpoint;
    this.token = token;
    this.http = httpLib;
  }

  /**
   * Excecute Kube API GET requests.
   *
   * @param {*} path - API path
   * @param {*} opts - HTTP request options
   * @param {*} noCache - Don't use a previously cached request.
   */
  get(path = '', opts = {}) {
    const options = _lodash2.default.merge({
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }, opts);

    return this.http(_lodash2.default.merge(options, opts)).then(res => res.body);
  }

  post(path = '', jsonBody, opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      json: jsonBody
    };

    return this.http(_lodash2.default.merge(defaults, opts)).then(res => res.body);
  }

  patch(path = '', jsonBody, opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json-patch+json'
      },
      json: jsonBody
    };

    return this.http(_lodash2.default.merge(defaults, opts)).then(res => res.body);
  }
}
exports.default = KubeConnector; /** *****************************************************************************
                                  * Licensed Materials - Property of IBM
                                  * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
                                  *
                                  * Note to U.S. Government Users Restricted Rights:
                                  * Use, duplication or disclosure restricted by GSA ADP Schedule
                                  * Contract with IBM Corp.
                                  ****************************************************************************** */
//# sourceMappingURL=kube.js.map