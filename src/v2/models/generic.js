// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import _ from 'lodash';
import crypto from 'crypto';
import KubeModel from './kube';
import logger from '../lib/logger';

const routePrefix = '/apis/action.open-cluster-management.io/v1beta1/namespaces';
const clusterActionApiVersion = 'action.open-cluster-management.io/v1beta1';
const authApiVersion = 'authorization.k8s.io/v1';
const selfSubjectAccessReviewLink = '/apis/authorization.k8s.io/v1/selfsubjectaccessreviews';
const resultStatus = 'status.result';
const localClustername = 'local-cluster';

function getGroupFromApiVersion(apiVersion) {
  if (apiVersion.indexOf('/') >= 0) {
    return { apiGroup: apiVersion.split('/')[0], version: apiVersion.split('/')[1] };
  }
  return { apiGroup: '', version: apiVersion };
}

function getApiGroupFromApiVersionOrPath(apiVersion, path, kind) {
  if (apiVersion) {
    return getGroupFromApiVersion(apiVersion);
  }
  let apiGroup = ''; // api group to differentiate between duplicate resources (ie. endpoints & subscriptions)
  let version = '';
  const pathData = path.split('/');
  // eslint-disable-next-line
  // When splitting the path, the item at pathData[3] is either the api version (if the resource has an apiGroup namespaced or not),
  // resource kind (if the resource is non-namespaced AND doesn’t have an apiGroup) or namespaces (if the resource is namespaced AND doesn’t have an apiGroup).
  // knowing this we grab the apiGroup if pathData[3] is not the kind or 'namespaces'
  if (pathData[3] !== kind && pathData[3] !== 'namespaces') {
    // eslint-disable-next-line prefer-destructuring
    apiGroup = pathData[2];
    // eslint-disable-next-line prefer-destructuring
    version = pathData[3];
  } else {
    // eslint-disable-next-line prefer-destructuring
    version = pathData[1];
  }
  return { apiGroup, version };
}

export default class GenericModel extends KubeModel {
  async userAccess({
    resource, kind, action, namespace = '', apiGroup = '*', name = '', version = '*',
  }) {
    let computedResource;
    if (!resource) {
      computedResource = (await this.getResourceInfo({
        apiVersion: (apiGroup === '*' || apiGroup === '')
          ? version
          : `${apiGroup}/${version}`,
        kind,
      }))[1].name;
    }
    const body = {
      apiVersion: authApiVersion,
      kind: 'SelfSubjectAccessReview',
      spec: {
        resourceAttributes: {
          verb: action,
          resource: resource || computedResource,
          namespace,
          group: apiGroup,
          name,
          version,
        },
      },
    };
    const response = await this.kubeConnector.post(selfSubjectAccessReviewLink, body, {}, true);
    if (response.status === 'Failure' || response.code >= 400) {
      throw new Error(`Get User Access Failed [${response.code}] - ${response.message}`);
    }
    return { ...response.status, ...response.spec.resourceAttributes };
  }

  async getLogs(containerName, podName, podNamespace, clusterName) {
    if (clusterName === localClustername) {
      return this.kubeConnector.get(`/api/v1/namespaces/${podNamespace}/pods/${podName}/log?container=${containerName}&tailLines=1000`, {}, true).catch((err) => {
        logger.error(err);
        throw err;
      });
    }
    return this.kubeConnector.get(`/apis/proxy.open-cluster-management.io/v1beta1/namespaces/${clusterName
    }/clusterstatuses/${clusterName}/log/${podNamespace}/${podName}/${containerName}?tailLines=1000`, { json: false }, true).catch((err) => {
      logger.error(err);
      throw err;
    });
  }

  // Generic query to get local and remote resource data
  // Remote resources are queried using ManagedClusterView
  async getResource(args) {
    const {
      apiVersion,
      selfLink,
      cluster = '',
      kind,
      name,
      namespace = '',
      updateInterval,
      deleteAfterUse = true,
    } = args;
    const path = selfLink || `${await this.getResourceEndPoint({ apiVersion, kind, metadata: { namespace } })}/${name}`;
    if (cluster === localClustername) {
      return this.kubeConnector.get(path, {}, true).catch((err) => {
        logger.error(err);
        throw err;
      });
    }

    if (cluster !== localClustername && kind === 'secret') {
      // We do not allow users to view secrets as this could allow lesser permissioned users to get around RBAC.
      return [{
        message: 'Viewing managed cluster secrets is not allowed for security reasons. To view this secret, you must access it from the specific managed cluster.',
      }];
    }

    // Check if the ManagedClusterView already exists if not create it
    const managedClusterViewName = crypto.createHash('sha512').update(`${cluster}-${name}-${kind}`).digest('hex').substr(0, 63);

    const resourceResponse = await this.kubeConnector.get(
      `/apis/view.open-cluster-management.io/v1beta1/namespaces/${cluster}/managedclusterviews/${managedClusterViewName}`,
      {},
      true,
    ).catch((err) => {
      logger.error(err);
      throw err;
    });
    if (resourceResponse.status === 'Failure' || resourceResponse.code >= 400) {
      const { apiGroup, version } = getApiGroupFromApiVersionOrPath(apiVersion, path, kind);
      const response = await this.kubeConnector.managedClusterViewQuery(
        cluster,
        apiGroup,
        version,
        kind,
        name,
        namespace,
        updateInterval,
        deleteAfterUse,
      ).catch((err) => {
        logger.error(err);
        throw err;
      });

      const resourceResult = _.get(response, resultStatus);
      if (resourceResult) {
        return resourceResult;
      }

      return [{ message: 'Unable to load resource data. Verify that the resource you are looking for exists, and check if the cluster that hosts the resource is online.' }];
    }
    return _.get(resourceResponse, resultStatus);
  }

  async updateResource(args) {
    const {
      body, cluster,
    } = args;
    const requestBody = { body };

    const {
      apiVersion, kind, metadata: { name, namespace },
    } = body;
    const path = `${await this.getResourceEndPoint({ apiVersion, kind, metadata: { namespace } })}/${name}`;

    if (cluster === localClustername) {
      const localResponse = await this.kubeConnector.put(path, requestBody, true);
      if (localResponse.message) {
        throw new Error(`${localResponse.code} - ${localResponse.message}`);
      }
      return localResponse;
    }
    const { apiGroup, version } = getApiGroupFromApiVersionOrPath(apiVersion, path, kind);
    // Else If updating resource on remote cluster use an Action Type Work
    // Limit workName to 63 characters
    let workName = `update-resource-${this.kubeConnector.uid()}`;
    workName = workName.substring(0, 63);
    const jsonBody = {
      apiVersion: clusterActionApiVersion,
      kind: 'ManagedClusterAction',
      metadata: {
        name: workName,
        namespace: cluster,
      },
      spec: {
        cluster: {
          name: cluster,
        },
        type: 'Action',
        scope: {
          resourceType: apiGroup ? `${kind.toLowerCase()}.${version}.${apiGroup}` : `${kind.toLowerCase()}`,
          namespace,
        },
        actionType: 'Update',
        kube: {
          resource: apiGroup ? `${kind.toLowerCase()}.${version}.${apiGroup}` : `${kind.toLowerCase()}`,
          name,
          namespace,
          template: body,
        },
      },
    };
    const actionPath = `${routePrefix}/${cluster}/managedclusteractions`;
    const response = await this.kubeConnector.post(actionPath, jsonBody, {}, true);
    if (response.code || response.message) {
      logger.error(`OCM ERROR ${response.code} - ${response.message}`);
      return [{
        code: response.code,
        message: response.message,
      }];
    }
    const { cancel, promise: pollPromise } = this.kubeConnector.pollView(`${actionPath}/${workName}`);

    try {
      const result = await Promise.race([pollPromise, this.kubeConnector.timeout()]);
      if (result) {
        this.kubeConnector.delete(`${routePrefix}/${cluster}/managedclusteractions/${response.metadata.name}`, {}, {}, true)
          .catch((e) => logger.error(`Error deleting work ${response.metadata.name}`, e.message));
      }
      const reason = _.get(result, 'status.conditions[0].reason');
      if (reason && reason !== 'ActionDone') {
        const message = _.get(result, 'status.conditions[0].message');
        throw new Error(`Failed to Update ${name}. ${reason}. ${message}.`);
      } else {
        return _.get(result, resultStatus);
      }
    } catch (e) {
      logger.error('Resource Action Error:', e.message);
      cancel();
      throw e;
    }
  }

  async deleteResource(args) {
    const {
      apiVersion, selfLink, name, namespace, cluster, kind, childResources,
    } = args;
    if (childResources) {
      const errors = this.deleteChildResource(childResources);
      if (errors && errors.length > 0) {
        throw new Error(`OCM ERROR: Unable to delete child resource(s) - ${JSON.stringify(errors)}`);
      }
    }

    const path = selfLink || `${await this.getResourceEndPoint({ apiVersion, kind, metadata: { namespace } })}/${name}`;
    // Local cluster case
    if ((cluster === '' || cluster === localClustername || cluster === undefined)) {
      const localResponse = await this.kubeConnector.delete(path, {}, {}, true);
      if (localResponse.status === 'Failure' || localResponse.code >= 400) {
        throw new Error(`Failed to delete the requested resource [${localResponse.code}] - ${localResponse.message}`);
      }
      return localResponse;
    }

    const { apiGroup, version } = getApiGroupFromApiVersionOrPath(apiVersion, path, kind);

    // Else if deleting resource on remote cluster use Action Type Work
    // Limit workName to 63 characters
    let workName = `delete-resource-${this.kubeConnector.uid()}`;
    workName = workName.substring(0, 63);
    const jsonBody = {
      apiVersion: clusterActionApiVersion,
      kind: 'ManagedClusterAction',
      metadata: {
        name: workName,
        namespace: cluster,
      },
      spec: {
        cluster: {
          name: cluster,
        },
        type: 'Action',
        scope: {
          resourceType: apiGroup ? `${kind.toLowerCase()}.${version}.${apiGroup}` : `${kind.toLowerCase()}`,
          namespace,
        },
        actionType: 'Delete',
        kube: {
          resource: apiGroup ? `${kind.toLowerCase()}.${version}.${apiGroup}` : `${kind.toLowerCase()}`,
          name,
          namespace,
        },
      },
    };

    const apiPath = `${routePrefix}/${cluster}/managedclusteractions`;
    const response = await this.kubeConnector.post(apiPath, jsonBody, {}, true);
    if (response.code || response.message) {
      logger.error(`OCM ERROR ${response.code} - ${response.message}`);
      return [{
        code: response.code,
        message: response.message,
      }];
    }
    const managedClusterViewName = _.get(response, 'metadata.name');
    const { cancel, promise: pollPromise } = this.kubeConnector.pollView(`${apiPath}/${managedClusterViewName}`);
    try {
      const result = await Promise.race([pollPromise, this.kubeConnector.timeout()]);
      if (result) {
        this.kubeConnector.delete(`${routePrefix}/${cluster}/managedclusteractions/${response.metadata.name}`, {}, {}, true)
          .catch((e) => logger.error(`Error deleting work ${response.metadata.name}`, e.message));
      }
      const reason = _.get(result, 'status.conditions[0].reason');
      if (reason && reason !== 'ActionDone') {
        const message = _.get(result, 'status.conditions[0].message');
        throw new Error(`Failed to Delete ${name}. ${reason}. ${message}.`);
      } else {
        return _.get(result, 'metadata.name');
      }
    } catch (e) {
      logger.error('Resource Action Error:', e.message);
      cancel();
      throw e;
    }
  }

  // Delete a ManagedClusterView resource
  async deleteManagedClusterView(managedClusterNamespace, managedClusterViewName) {
    await this.kubeConnector.deleteManagedClusterView(
      managedClusterNamespace,
      managedClusterViewName,
    ).catch((err) => {
      logger.error(err);
      return null;
    });
  }
}
