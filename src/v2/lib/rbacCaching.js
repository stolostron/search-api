/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.

import _ from 'lodash';
import lru from 'lru-cache';
import asyncPolling from 'async-polling';
import config from '../../../config';
import { getServiceAccountToken } from '../lib/utils';
import logger from '../lib/logger';
import KubeConnector from '../connectors/kube';
// Mocked connectors for testing
import MockKubeConnector from '../mocks/kube';

let isOpenshift = null;
const isTest = config.get('NODE_ENV') === 'test';
let activeUsers = [];
let serviceaccountToken;
const cache = lru({
  max: 1000,
  maxAge: config.get('RBAC_INACTIVITY_TIMEOUT'), // default is 10 mins
});

export async function getClusterRbacConfig(kubeToken) {
  if (kubeToken !== undefined) {
    const kubeConnector = !isTest
      ? new KubeConnector({ token: kubeToken })
      : new MockKubeConnector();
    // eslint-disable-next-line prefer-const
    let [roles, roleBindings, clusterRoles, clusterRoleBindings] = await Promise.all([
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/roles'),
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/rolebindings'),
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/clusterroles'),
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/clusterrolebindings'),
    ]);
    // Get just the items, whole response contians resourceVersion whichs changes everytime
    // check if we can just do resourceVersion
    roles = roles && roles.items;
    roleBindings = roleBindings && roleBindings.items;
    clusterRoles = clusterRoles && clusterRoles.items;
    clusterRoleBindings = clusterRoleBindings && clusterRoleBindings.items;
    return {
      roles,
      roleBindings,
      clusterRoles,
      clusterRoleBindings,
    };
  }
  return {};
}

async function checkIfOpenShiftPlatform(kubeToken) {
  const url = '/apis/authorization.openshift.io/v1';
  const kubeConnector = !isTest
    ? new KubeConnector({ token: `${kubeToken}` })
    : new MockKubeConnector();
  const res = await kubeConnector.get(url);

  if (res && res.resources) {
    const selfReview = res.resources.filter(r => r.kind === 'SelfSubjectRulesReview');
    logger.debug('SelfSubjectRulesReview:', selfReview);
    if (selfReview.length > 0) {
      logger.debug('Found API "authorization.openshift.io/v1" so assuming that we are running in OpenShift');
      isOpenshift = true;
      return;
    }
  }
  isOpenshift = false;
}

async function getNonNamespacedResources(kubeToken) {
  const startTime = Date.now();
  const resources = [];
  const kubeConnector = !isTest
    ? new KubeConnector({ token: `${kubeToken}` })
    : new MockKubeConnector();

  // Get non-namespaced resources WITH an api group
  resources.push(kubeConnector.post('/apis', {}).then(async (res) => {
    if (res && res.groups) {
      const apiGroups = res.groups.map(group => group.preferredVersion.groupVersion);
      const results = await Promise.all(apiGroups.map((group) => {
        const mappedResources = kubeConnector.get(`/apis/${group}`).then((result) => {
          const groupResources = _.get(result, 'resources', []);
          const nonNamespaced = groupResources.filter(resource => resource.namespaced === false)
            .map(resource => resource.name);
          return nonNamespaced.filter(item => item.length > 0)
            .map(item => ({ name: item, apiGroup: group }));
        });
        return mappedResources;
      }));
      return _.flatten(results.filter(item => item.length > 0));
    }
    return 'Error getting available apis.';
  }));

  // Get non-namespaced resources WITHOUT an api group
  resources.push(kubeConnector.get('/api/v1').then((res) => {
    if (res && res.resources) {
      return res.resources.filter(resource => resource.namespaced === false && resource.name.indexOf('/') === -1)
        .map(item => ({ name: item.name, apiGroup: 'null' }));
    }
    return 'Error getting available apis.';
  }));
  logger.perfLog(startTime, 500, 'getNonNamespacedResources()');
  return _.flatten(await Promise.all(resources));
}

async function getNonNamespacedAccess(kubeToken) {
  const startTime = Date.now();
  const kubeConnector = !isTest
    ? new KubeConnector({ token: `${kubeToken}` })
    : new MockKubeConnector();
  const nonNamespacedResources = await getNonNamespacedResources(kubeToken);
  const results = await Promise.all(nonNamespacedResources.map((resource) => {
    const jsonBody = {
      apiVersion: 'authorization.k8s.io/v1',
      kind: 'SelfSubjectAccessReview',
      spec: {
        resourceAttributes: {
          verb: 'get',
          resource: resource.name,
        },
      },
    };
    return kubeConnector.post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews', jsonBody).then((res) => {
      if (res && res.status && res.status.allowed) {
        return `'null_${resource.apiGroup}_${resource.name}'`;
      }
      return null;
    });
  }));
  logger.perfLog(startTime, 500, 'getNonNamespacedAccess()');
  return results.filter(r => r !== null);
}

async function getUserAccess(kubeToken, namespace) {
  const kubeConnector = !isTest
    ? new KubeConnector({ token: kubeToken })
    : new MockKubeConnector();
  const url = `/apis/authorization.${!isOpenshift ?
    'k8s' : 'openshift'}.io/v1/${!isOpenshift ? '' : `namespaces/${namespace}/`}selfsubjectrulesreviews`;
  const jsonBody = {
    apiVersion: `authorization.${!isOpenshift ? 'k8s' : 'openshift'}.io/v1`,
    kind: 'SelfSubjectRulesReview',
    spec: {
      namespace,
    },
  };

  const res = await kubeConnector.post(url, jsonBody);
  const rules = (isOpenshift ? res.status.rules : res.status.resourceRules) || [];

  // Check if user can get all resources in namespace.
  if (rules.find((r) => {
    const { verbs = [], apiGroups = [], resources = [] } = r;
    if ((verbs.includes('*') || verbs.includes('get')) && (apiGroups && apiGroups.includes('*')) && resources.includes('*')) {
      return true;
    }
    return false;
  })) {
    return [`${namespace}_*_*`];
  }

  // Build rbac list for this namespace.
  return rules.map((rule) => {
    if (rule.verbs.includes('get')) {
      // RBAC string is defined as "namespace_apigroup_kind"
      const resources = [];
      const ns = (namespace === '' || namespace === undefined) ? 'null_' : `${namespace}_`;
      // eslint-disable-next-line no-unused-expressions
      rule.apiGroups && rule.apiGroups.forEach((api) => {
        const apiGroup = (api === '') ? 'null' : api;
        // Filter sub-resources, those contain '/'
        rule.resources.filter(r => r.indexOf('/') === -1).forEach((resource) => {
          resources.push(`'${ns}_${apiGroup}_${resource}'`);
        });
      });
      return resources;
    }
    return null;
  }).filter(r => r !== null);
}

async function buildRbacString(req, objAliases) {
  const { user: { namespaces, idToken } } = req;
  const startTime = Date.now();
  if (isOpenshift === null) await checkIfOpenShiftPlatform(idToken);
  const userCache = cache.get(idToken);
  let data = [];
  if (!userCache || !userCache.userAccessPromise || !userCache.userNonNamespacedAccessPromise) {
    const userAccessPromise = Promise.all(namespaces.map(namespace => getUserAccess(idToken, namespace)));
    const userNonNamespacedAccessPromise = getNonNamespacedAccess(idToken);
    cache.set(idToken, { ...userCache, userAccessPromise, userNonNamespacedAccessPromise });
    logger.info('Saved userAccess and nonNamespacesAccess promises to user cache.');
    data = [await userAccessPromise, await userNonNamespacedAccessPromise];
  } else {
    data = [await userCache.userAccessPromise, await userCache.userNonNamespacedAccessPromise];
  }

  const rbacData = new Set(_.flattenDeep(data));
  const aliasesData = objAliases.map(alias => [...rbacData].map((item) => {
    // If user can get all reasources in the namespace, we get an rbac string with the format `namespace_*_*`.
    if (item.endsWith('_*_*')) {
      // Adds the openCypher clause: `substring(n._rbac,0, 9) = 'namespace'`
      return `substring(${alias}._rbac, 0, ${item.length - 4}) = '${item.substring(0, item.length - 4)}'`;
    }
    return `${alias}._rbac = ${item}`;
  }));
  const aliasesStrings = aliasesData.map(a => a.join(' OR '));

  logger.perfLog(startTime, 1000, `buildRbacString(namespaces count:${namespaces && namespaces.length} )`);
  return `(${aliasesStrings.join(') AND (')})`;
}

export async function getUserRbacFilter(req, objAliases) {
  let rbacFilter = null;
  // update/add user on active list
  activeUsers[req.user.name] = Date.now();
  const currentUser = cache.get(req.user.idToken);
  // 1. if user exists -> return the cached RBAC string
  if (currentUser) {
    rbacFilter = await buildRbacString(req, objAliases);
  }
  // 2. if (users 1st time querying || they have been removed b/c inactivity || they otherwise dont have an rbacString)
  //    then  create the RBAC String
  if (!rbacFilter) {
    const currentUserCache = cache.get(req.user.idToken); // Get user cache again because it may have changed.
    cache.set(req.user.idToken, { ...currentUserCache });
    rbacFilter = buildRbacString(req, objAliases);
    return rbacFilter;
  }
  return rbacFilter;
}

// Poll users access every 1 mins(default) in the background to determine RBAC revalidation
export default function pollUserAccess() {
  asyncPolling(async (end) => {
    if (config.get('NODE_ENV') !== 'test') {
      const startTime = Date.now();
      logger.debug('Polling - Revalidating user access to determine if rbac needs to be updated');
      // filter out inactive users and remove them from cache
      Object.entries(activeUsers).forEach((user) => {
        const active = Date.now() - user[1] < config.get('RBAC_INACTIVITY_TIMEOUT');
        if (!active) {
          logger.info('User is no longer active, removing from cache');
          delete activeUsers[user[0]];
          cache.del(user[0]);
        }
      });
      // If role/roleBinding/clusterRole/clusterRoleBinding resources changed -> need to delete all active user RBAC cache
      const roleAccessCache = cache.get('user-role-access-data');
      // Need to use admin token to retrieve role data as admin has access to all data.
      if (!serviceaccountToken) {
        serviceaccountToken = getServiceAccountToken();
      }
      getClusterRbacConfig(serviceaccountToken).then((res) => {
        // If we dont have this cached we need to set it
        if (!roleAccessCache) {
          cache.set('user-role-access-data', res);
        } else { // Otherwise re-validate access
          const rolesCache = _.get(roleAccessCache, 'roles', '');
          const clusterRolesCache = _.get(roleAccessCache, 'clusterRoles', '');
          const roleBindingsCache = _.get(roleAccessCache, 'roleBindings', '');
          const clusteroleBindingsCache = _.get(roleAccessCache, 'clusterRoleBindings', '');
          if (JSON.stringify(res.roles) !== JSON.stringify(rolesCache)
            || JSON.stringify(res.clusterRoles) !== JSON.stringify(clusterRolesCache)
            || JSON.stringify(res.roleBindings) !== JSON.stringify(roleBindingsCache)
            || JSON.stringify(res.clusterRoleBindings) !== JSON.stringify(clusteroleBindingsCache)) {
            // Delete the entire cache & remove all active users
            cache.reset();
            activeUsers = [];
            // re-initialize the access cache with new data
            cache.set('user-role-access-data', res);
            logger.info('Role configuration has changed. User RBAC cache has been deleted');
          }
        }
      });
      logger.perfLog(startTime, 300, 'asyncPolling()');
    }
    // Notify polling when your job is done
    end();
    // Schedule the next call (ms)
  }, config.get('RBAC_POLL_INTERVAL')).run(); // default 1 mins (60000ms)
}
