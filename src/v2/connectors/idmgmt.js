/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import _ from 'lodash';
import config from '../../../config';
import requestLib from '../lib/request';

export default class IDConnector {
  constructor({
    httpLib = requestLib,
    iamToken = 'a token',
    idmgmtApiEndpoint = `${config.get('cfcRouterUrl')}/idmgmt`,
  } = {}) {
    this.http = httpLib;
    this.iamToken = iamToken;
    this.idmgmtApiEndpoint = idmgmtApiEndpoint;
  }

  get(path = '', opts = {}) {
    const defaults = {
      url: `${this.idmgmtApiEndpoint}${path}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.iamToken}`,
      },
    };

    return this.http(_.merge(defaults, opts)).then(res => res.body);
  }
}
