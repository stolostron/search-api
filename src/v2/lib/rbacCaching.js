/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
/* eslint-disable max-len */
import _ from 'lodash';
import fs from 'fs';
import lru from 'lru-cache';
import asyncPolling from 'async-polling';
import config from '../../../config';
import logger from '../lib/logger';
import KubeConnector from '../connectors/kube';
// Mocked connectors for testing
import MockKubeConnector from '../mocks/kube';

let isOpenshift = null;
const isTest = config.get('NODE_ENV') === 'test';
let activeUsers = [];
const cache = lru({
  max: 1000,
  maxAge: config.get('RBAC_INACTIVITY_TIMEOUT'), // default is 10 mins
});

export async function getUserResources(kubeToken) {
  if (kubeToken !== undefined) {
    const kubeConnector = !isTest
      ? new KubeConnector({ token: `Bearer ${kubeToken}` })
      : new MockKubeConnector();
    // eslint-disable-next-line prefer-const
    let [roles, clusterRoles, roleBindings, clusterRoleBindings] = await Promise.all([
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/roles'),
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/rolebindings'),
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/clusterroles'),
      kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/clusterrolebindings'),
    ]);
    // Get just the items, whole response contians resourceVersion whichs changes everytime
    // check if we can just do resourceVersion
    clusterRoles = clusterRoles && clusterRoles.items;
    roleBindings = roleBindings && roleBindings.items;
    clusterRoleBindings = clusterRoleBindings && clusterRoleBindings.items;
    return {
      roles,
      clusterRoles,
      roleBindings,
      clusterRoleBindings,
    };
  }
  return {};
}

async function getUserNamespaces(kubeToken) {
  const kubeConnector = !isTest
    ? new KubeConnector({ token: `Bearer ${kubeToken}` })
    : new MockKubeConnector();
  let namespaces = await kubeConnector.get('/apis/project.openshift.io/v1/projects', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  namespaces = Array.isArray(namespaces.items) ? namespaces.items.map(ns => ns.metadata.name) : [];
  if (!namespaces || namespaces.length === 0) {
    logger.warn('User doesn\'t have access to any namespaces');
  }
  return namespaces || [];
}

async function checkIfOpenShiftPlatform(kubeToken) {
  const url = '/apis/authorization.openshift.io/v1';
  const kubeConnector = !isTest
    ? new KubeConnector({ token: `Bearer ${kubeToken}` })
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
    ? new KubeConnector({ token: `Bearer ${kubeToken}` })
    : new MockKubeConnector();

  // Get non-namespaced resources WITH an api group
  resources.push(kubeConnector.post('/apis', {}).then(async (res) => {
    if (res) {
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
    if (res) {
      return res.resources.filter(resource => resource.namespaced === false)
        .map(item => ({ name: item.name, apiGroup: 'null' }));
    }
    return 'Error getting available apis.';
  }));
  logger.perfLog(startTime, 500, 'getNonNamespacedResources()');
  return _.flatten(resources);
}

async function getNonNamespacedAccess(kubeToken) {
  const startTime = Date.now();
  const kubeConnector = !isTest
    ? new KubeConnector({ token: `Bearer ${kubeToken}` })
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
    ? new KubeConnector({ token: `Bearer ${kubeToken}` })
    : new MockKubeConnector();
  const url = `/apis/authorization.${!isOpenshift ? 'k8s' : 'openshift'}.io/v1/${!isOpenshift ? '' : `namespaces/${namespace}/`}selfsubjectrulesreviews`;
  const jsonBody = {
    apiVersion: `authorization.${!isOpenshift ? 'k8s' : 'openshift'}.io/v1`,
    kind: 'SelfSubjectRulesReview',
    spec: {
      namespace,
    },
  };
  return kubeConnector.post(url, jsonBody).then((res) => {
    let userResources = [];
    if (res && res.status) {
      const results = isOpenshift ? res.status.rules : res.status.resourceRules;
      results.forEach((item) => {
        if (item.verbs.includes('*') && item.resources.includes('*')) {
          // if user has access to everything then add just an *
          userResources = userResources.concat(['*']);
        } else if (item.verbs.includes('get') && item.resources.length > 0) { // TODO need to include access for 'patch' and 'delete'
          // RBAC string is defined as "namespace_apigroup_kind"
          const resources = [];
          const ns = (namespace === '' || namespace === undefined) ? 'null_' : `${namespace}_`;
          const apiGroup = (item.apiGroups[0] === '' || item.apiGroups[0] === undefined) ? 'null_' : `${item.apiGroups[0]}_`;
          // Filter sub-resources, those contain '/'
          item.resources.filter(r => r.indexOf('/') === -1).forEach((resource) => {
            resources.push(`'${ns + apiGroup + resource}'`);
          });
          userResources = userResources.concat(resources);
        }
        return null;
      });
    }
    userResources.push(`'${namespace}_null_releases'`);
    return userResources.filter(r => r !== null);
  });
}

async function buildRbacString(userName, kubeToken, objAliases) {
  const startTime = Date.now();
  if (isOpenshift === null) await checkIfOpenShiftPlatform(kubeToken);
  const userCache = cache.get(userName);
  let data = [];
  if (!userCache || !userCache.userAccessPromise || !userCache.userNonNamespacedAccessPromise) {
    const userAccessPromise = Promise.all(userCache.namespaces.map(namespace => getUserAccess(kubeToken, namespace)));
    const userNonNamespacedAccessPromise = getNonNamespacedAccess(kubeToken);
    cache.set(userName, { ...userCache, userAccessPromise, userNonNamespacedAccessPromise });
    logger.info('Saved userAccess and nonNamespacesAccess promises to user cache.');
    data = [await userAccessPromise, await userNonNamespacedAccessPromise];
  } else {
    data = [await userCache.userAccessPromise, await userCache.userNonNamespacedAccessPromise];
  }

  const rbacData = new Set(_.flattenDeep(data));
  const aliasesData = objAliases.map(alias => [...rbacData].map(item => `${alias}._rbac = ${item}`));
  const aliasesStrings = aliasesData.map(a => a.join(' OR '));

  logger.perfLog(startTime, 1000, `buildRbacString(namespaces count:${userCache.namespaces && userCache.namespaces.length} )`);
  return `(${aliasesStrings.join(') AND (')})`;
}

export async function getUserRbacFilter(req, objAliases) {
  let rbacFilter = null;
  // update/add user on active list
  activeUsers[req.user.name] = Date.now();
  let SERVICEACCT_TOKEN = cache.get('admin_access_token');
  if (!SERVICEACCT_TOKEN) {
    SERVICEACCT_TOKEN = process.env.NODE_ENV === 'production'
      ? fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8')
      : process.env.SERVICEACCT_TOKEN || '';
    cache.set('admin_access_token', SERVICEACCT_TOKEN);
  }
  const roleAccessCache = cache.get('user-role-access-data');
  if (!roleAccessCache) {
    const {
      roles,
      clusterRoles,
      roleBindings,
      clusterRoleBindings,
    } = await getUserResources(SERVICEACCT_TOKEN);
    cache.set('user-role-access-data', {
      roles,
      clusterRoles,
      roleBindings,
      clusterRoleBindings,
    });
  }
  const currentUser = cache.get(req.user.name);
  if (!currentUser || (currentUser && !currentUser.namespaces)) {
    const userNamespaces = await getUserNamespaces(req.user.idToken);
    cache.set(req.user.name, { ...currentUser, namespaces: userNamespaces });
  }
  // 1. if user exists -> return the cached RBAC string
  if (currentUser) {
    rbacFilter = await buildRbacString(req.user.name, req.user.idToken, objAliases);
  }
  // 2. if (users 1st time querying || they have been removed b/c inactivity || they otherwise dont have an rbacString) -> create the RBAC String
  if (!rbacFilter) {
    const currentUserCache = cache.get(req.user.name); // Get user cache again because it may have changed.
    cache.set(req.user.name, { ...currentUserCache });
    rbacFilter = buildRbacString(req.user.name, req.user.idToken, objAliases);
    return rbacFilter;
  }
  return rbacFilter;
}

// Poll users access every 1 mins(default) in the background to determine RBAC revalidation
export default function pollUserAccess() {
  asyncPolling(async (end) => {
    if (config.get('NODE_ENV') !== 'test') {
      const startTime = Date.now();
      logger.info('Polling - Revalidating user access to determine if rbac needs to be updated');
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
      let SERVICEACCT_TOKEN = cache.get('admin_access_token');
      if (!SERVICEACCT_TOKEN) {
        SERVICEACCT_TOKEN = process.env.NODE_ENV === 'production'
          ? fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8')
          : process.env.SERVICEACCT_TOKEN || '';
        cache.set('admin_access_token', SERVICEACCT_TOKEN);
      }

      getUserResources(SERVICEACCT_TOKEN).then((res) => {
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
