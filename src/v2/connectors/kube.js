/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.

import _ from 'lodash';
import request from '../lib/request';
import config from '../../../config';

export default class KubeConnector {
  constructor({
    token = 'localdev',
    kubeApiEndpoint = `${config.get('API_SERVER_URL')}` || 'https://kubernetes.default.svc',
    httpLib = request,
    impersonateUser = '',
  } = {}) {
    this.kubeApiEndpoint = kubeApiEndpoint;
    this.token = token;
    this.http = httpLib;
    this.impersonateUser = impersonateUser;
  }

  /**
   * Excecute Kube API GET requests.
   *
   * @param {*} path - API path
   * @param {*} opts - HTTP request options
   */
  get(path = '', opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
    if (this.impersonateUser !== '') {
      defaults.headers['Imporsonate-User'] = this.impersonateUser;
    }

    return this.http(_.merge(defaults, opts)).then(res => res.body);
  }

  post(path = '', jsonBody, opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: jsonBody,
    };
    if (this.impersonateUser !== '') {
      defaults.headers['Imporsonate-User'] = this.impersonateUser;
    }
    return this.http(_.merge(defaults, opts)).then(res => res.body);
  }

  patch(path = '', jsonBody, opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json-patch+json',
      },
      json: jsonBody,
    };
    if (this.impersonateUser !== '') {
      defaults.headers['Imporsonate-User'] = this.impersonateUser;
    }

    return this.http(_.merge(defaults, opts)).then(res => res.body);
  }
}
