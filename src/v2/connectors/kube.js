/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import _ from 'lodash';
import config from '../../../config';
import request from '../lib/request';

export default class KubeConnector {
  constructor({
    token = 'Bearer localdev',
    kubeApiEndpoint = `${config.get('cfcRouterUrl')}/kubernetes`,
  } = {}) {
    this.kubeApiEndpoint = kubeApiEndpoint;
    this.token = token;
  }

  /**
   * Excecute Kube API GET requests.
   *
   * @param {*} path - API path
   * @param {*} opts - HTTP request options
   * @param {*} noCache - Don't use a previously cached request.
   */
  get(path = '', opts = {}) {
    const options = _.merge({
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'GET',
      headers: {
        Authorization: this.token,
      },
    }, opts);

    const newRequest = request(options).then(res => res.body);

    return newRequest;
  }

  post(path, jsonBody, opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'POST',
      headers: {
        Authorization: this.token,
      },
      json: jsonBody,
    };

    return request(_.merge(defaults, opts)).then(res => res.body);
  }
}
