/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import _ from 'lodash';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import request from '../lib/request';
import config from '../../../config';
import logger from '../lib/logger';

export default class KubeConnector {
  constructor({
    token = 'localdev',
    kubeApiEndpoint = `${config.get('API_SERVER_URL')}` || 'https://kubernetes.default.svc',
    httpLib = request,
    namespaces = [],
    pollTimeout = config.get('acmPollTimeout'),
    pollInterval = config.get('acmPollInterval'),
    uid = uuidv4,
  } = {}) {
    this.kubeApiEndpoint = kubeApiEndpoint;
    this.token = token;
    this.http = httpLib;
    this.namespaces = namespaces;
    this.pollInterval = pollInterval;
    this.pollTimeout = pollTimeout;
    this.uid = uid;
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
    return this.http(_.merge(defaults, opts)).then((res) => res.body);
  }

  put(path = '', opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    };
    return this.http(_.merge(defaults, opts)).then((res) => res.body);
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
    return this.http(_.merge(defaults, opts)).then((res) => res.body);
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
    return this.http(_.merge(defaults, opts)).then((res) => res.body);
  }

  delete(path = '', jsonBody, opts = {}) {
    const defaults = {
      url: `${this.kubeApiEndpoint}${path}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: jsonBody,
    };
    return this.http(_.merge(defaults, opts)).then((res) => res.body);
  }

  async getK8sPaths() {
    if (!this.k8sPaths) {
      this.k8sPaths = this.get('/').catch((err) => {
        logger.error(err);
        throw err;
      });
    }
    return (await this.k8sPaths).paths;
  }

  timeout() {
    return new Promise((r, reject) => setTimeout(reject, this.pollTimeout, new Error('Manager request timed out')));
  }

  pollView(viewLink) {
    let cancel;

    const promise = new Promise((resolve, reject) => {
      let pendingRequest = false;
      const intervalID = setInterval(async () => {
        if (!pendingRequest) {
          pendingRequest = true;
          try {
            const links = viewLink.split('/');
            const viewName = links.pop();
            const link = `${links.join('/')}?fieldSelector=metadata.name=${viewName}`;

            logger.debug('start polling: ', new Date(), link);
            const response = await this.get(link, {}, true);
            pendingRequest = false;
            if (response.code || response.message) {
              clearInterval(intervalID);
              return reject(response);
            }
            // We are looking for the type to be Processing for ManagedClusterView resources
            // TODO remove the 'Completed' logic when resource view is removed
            const isComplete = _.get(response, 'items[0].status.conditions[0].type') || _.get(response, 'items[0].status.status') || _.get(response, 'items[0].status.type') || _.get(response, 'items[0].status.conditions[0].type', 'NO');
            if (isComplete === 'Processing' || isComplete === 'Completed') {
              clearInterval(intervalID);
              logger.debug('start to get resource: ', new Date(), viewLink);
              const result = await this.get(viewLink, {}, true);
              if (result.code || result.message) {
                return reject(result);
              }
              resolve(result);
            }
          } catch (err) {
            clearInterval(intervalID);
            reject(err);
          }
        }
        return null;
      }, this.pollInterval);

      cancel = () => {
        clearInterval(intervalID);
        // reject or resolve?
        reject();
      };
    });

    return { cancel, promise };
  }

  // eslint-disable-next-line max-len
  async managedClusterViewQuery(managedClusterNamespace, apiGroup, version, kind, resourceName, namespace, updateInterval, deleteAfterUse) {
    // name cannot be long than 63 chars in length
    const name = crypto.createHash('sha1').update(`${managedClusterNamespace}-${resourceName}-${kind}`).digest('hex').substr(0, 63);

    // scope.name is required, and either GKV (scope.apiGroup+kind+version) or scope.resource
    const body = {
      apiVersion: 'view.open-cluster-management.io/v1beta1',
      kind: 'ManagedClusterView',
      metadata: {
        labels: {
          name,
        },
        name,
        namespace: managedClusterNamespace,
      },
      spec: {
        scope: {
          name: resourceName,
          resource: apiGroup ? `${kind.toLowerCase()}.${version}.${apiGroup}` : `${kind.toLowerCase()}`,
        },
      },
    };
    // Only set namespace if not null
    if (namespace) {
      body.spec.scope.namespace = namespace;
    }
    if (updateInterval) {
      body.spec.scope.updateIntervalSeconds = updateInterval; // default is 30 secs
    }
    // Create ManagedClusterView
    const apiPath = `/apis/view.open-cluster-management.io/v1beta1/namespaces/${managedClusterNamespace}/managedclusterviews`;
    const managedClusterViewResponse = await this.post(apiPath, body);
    if (_.get(managedClusterViewResponse, 'status.conditions[0].status') === 'False' || managedClusterViewResponse.code >= 400) {
      throw new Error(`Create ManagedClusterView Failed [${managedClusterViewResponse.code}] - ${managedClusterViewResponse.message}`);
    }
    // Poll ManagedClusterView until success or failure
    const managedClusterViewName = _.get(managedClusterViewResponse, 'metadata.name');
    const { cancel, promise: pollPromise } = this.pollView(`${apiPath}/${managedClusterViewName}`);
    try {
      const result = await Promise.race([pollPromise, this.timeout()]);
      if (result && deleteAfterUse) {
        this.deleteManagedClusterView(managedClusterNamespace, managedClusterViewResponse.metadata.name);
      }
      return result;
    } catch (e) {
      logger.error(`ManagedClusterView Query Error for ${kind}`, e.message);
      cancel();
      throw e;
    }
  }

  async deleteManagedClusterView(managedClusterNamespace, managedClusterViewName) {
    this.delete(`/apis/view.open-cluster-management.io/v1beta1/namespaces/${managedClusterNamespace}/managedclusterviews/${managedClusterViewName}`)
      .catch((e) => logger.error(`Error deleting managed cluster view ${managedClusterViewName}`, e.message));
  }

  /**
   * Excecute Kube API GET requests for namespaces resources.
   *
   * @param {*} urlTemplate - function from namespace to url path
   * @param {*} opts - default namespace list override
   * @param {*} opts - kind of returned items--used to create valid k8s yaml
   */
  async getResources(urlTemplate, { namespaces, kind } = {}) {
    const namespaceList = (namespaces || this.namespaces);

    const requests = namespaceList.map(async (ns) => {
      let response;
      try {
        response = await this.get(urlTemplate(ns));
      } catch (err) {
        logger.error(`OCM REQUEST ERROR  for ${urlTemplate(ns)} - ${err.message}`);
        return [];
      }

      if (response.code || response.message) {
        logger.error(`OCM ERROR ${response.code} (${urlTemplate(ns)}) - ${response.message}`);
        return [];
      }

      // if all responses aren't objects, throw error
      const strs = [];
      const items = (response.items ? response.items : [response]);
      items.forEach((item) => {
        if (typeof item === 'string') {
          strs.push(item);
        }
      });
      if (strs.length > 0) {
        logger.error(`OCM RESPONSE ERROR for ${urlTemplate(ns)}: Expected Objects but Returned this: ${strs.join(', ')}`);
        return [];
      }

      return items.map((item) => (kind ? ({
        apiVersion: response.apiVersion,
        kind,
        ...item,
      }) : item));
    });

    return _.flatten(await Promise.all(requests));
  }
}
