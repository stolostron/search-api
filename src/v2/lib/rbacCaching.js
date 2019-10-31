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
import lru from 'lru-cache';
import asyncPolling from 'async-polling';
import config from '../../../config';
import logger from '../lib/logger';
import IDConnector from '../connectors/idmgmt';
import KubeConnector from '../connectors/kube';

let isOpenshift = null;
const activeUsers = {};
const cache = lru({
  max: 1000,
  maxAge: config.get('RBAC_INACTIVITY_TIMEOUT'), // default is 10 mins
});

export async function getUserResources(token) {
  if (token !== undefined) {
    const idmgmtConnector = new IDConnector({ iamToken: token });
    // eslint-disable-next-line prefer-const
    let [userRoles, userNamespaces] = await Promise.all([
      idmgmtConnector.get('/identity/api/v1/teams/roleMappings'),
      idmgmtConnector.get('/identity/api/v1/teams/resources?resourceType=namespace'),
    ]);
    userNamespaces = userNamespaces && userNamespaces.filter(ns => ns.namespaceId).map(ns => ns.namespaceId);

    return { userRoles, userNamespaces };
  }
  return {};
}

async function checkIfOpenShiftPlatform(kubeToken) {
  const url = '/apis/authorization.openshift.io/v1';
  const kubeConnector = new KubeConnector({ token: kubeToken });
  const res = await kubeConnector.get(url);

  if (res.statusCode === 200) {
    const selfReview = res.body.resources.filter(r => r.kind === 'SelfSubjectRulesReview');
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
  const kubeConnector = new KubeConnector({ token: kubeToken });

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
  logger.perfLog(startTime, 300, 'getNonNamespacedResources()');
  return _.flatten(resources);
}

async function getNonNamespacedAccess(kubeToken) {
  const startTime = Date.now();
  const kubeConnector = new KubeConnector({ token: kubeToken });
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
  logger.perfLog(startTime, 300, 'getNonNamespacedAccess()');
  return results;
}

async function getUserAccess(kubeToken, namespace) {
  const startTime = Date.now();
  const kubeConnector = new KubeConnector({ token: kubeToken });
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
          item.resources.forEach((resource) => {
            resources.push(`'${ns + apiGroup + resource}'`);
          });
          userResources = userResources.concat(resources);
        }
        return null;
      });
    }
    userResources.push(`'${namespace}_null_releases'`);
    logger.perfLog(startTime, 500, 'getUserAccess()');
    return userResources;
  });
}

async function buildRbacString(accessToken, kubeToken, user, objAliases) {
  let aliasesStrings = null;
  const aliasesData = [];
  if (isOpenshift === null) await checkIfOpenShiftPlatform(kubeToken);
  const userCache = cache.get(accessToken);
  let data = [];
  if (!userCache || !userCache.userAccessPromise || !userCache.userNonNamespacedAccessPromise) {
    const userAccessPromise = Promise.all(user.userNamespaces.map(namespace => getUserAccess(kubeToken, namespace)));
    const userNonNamespacedAccessPromise = getNonNamespacedAccess(kubeToken);
    cache.set(accessToken, { ...userCache, userAccessPromise, userNonNamespacedAccessPromise });
    data = [await userAccessPromise, await userNonNamespacedAccessPromise];
  } else {
    data = [await userCache.userAccessPromise, await userCache.userNonNamespacedAccessPromise];
  }
  _.flatten(data).forEach((item) => {
    objAliases.forEach((alias, i) => {
      if (!aliasesData[i]) {
        aliasesData[i] = [];
      }
      const rbacString = `${alias}._rbac = ${item}`;
      if (!aliasesData[i].includes(rbacString)) { // no duplicates
        aliasesData[i].push(rbacString);
      }
    });
  });
  aliasesStrings = aliasesData.map(a => a.join(' OR '));
  return `(${aliasesStrings.join(') AND (')})`;
}

export async function getUserRbacFilter(req, objAliases) {
  let rbacFilter = null;
  // update/add user on active list
  activeUsers[req.user.accessToken] = Date.now();
  const currentUser = cache.get(req.user.accessToken);
  // 1. if user exists -> return the cached RBAC string
  if (currentUser) {
    rbacFilter = await buildRbacString(req.user.accessToken, req.kubeToken, currentUser, objAliases);
  }
  // 2. if (users 1st time querying, they have been removed b/c inactivity, they otherwise dont have an rbacString) -> create the RBAC String
  if (!rbacFilter) {
    // We dont have user data in cache yet - need to create it here
    const { userRoles, userNamespaces } = await getUserResources(req.user.accessToken);
    const newUser = {
      userAccessPromise: currentUser && currentUser.userAccessPromise ? currentUser.userAccessPromise : undefined,
      userNonNamespacedAccessPromise: currentUser && currentUser.userNonNamespacedAccessPromise ? currentUser.userNonNamespacedAccessPromise : undefined,
      userRoles,
      userNamespaces,
    };
    rbacFilter = buildRbacString(req.user.accessToken, req.kubeToken, newUser, objAliases);
    cache.set(req.user.accessToken, newUser);
    return rbacFilter;
  }
  return rbacFilter;
}

// Poll users access every 2 mins(default) in the background to determine RBAC revalidation
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
      // if a users access has changed reset the roles and namespaces
      Object.keys(activeUsers).forEach((token) => {
        // Check if user exists and they are active (done something within the last 10 mins)
        const userCache = cache.get(token);
        getUserResources(token).then((res) => {
          const userRolesCache = userCache && userCache.userRoles;
          const userNamespacesCache = userCache && userCache.userNamespaces;
          if (JSON.stringify(res.userRoles) !== JSON.stringify(userRolesCache)
            || JSON.stringify(res.userNamespaces) !== JSON.stringify(userNamespacesCache)) {
            logger.info('User access has changed - deleting users RBAC cache');
            cache.del(token);
            delete activeUsers[token];
          }
        });
      });
      logger.perfLog(startTime, 300, 'asyncPolling()');
    }
    // Notify polling when your job is done
    end();
    // Schedule the next call (ms)
  }, config.get('RBAC_POLL_INTERVAL')).run(); // default 1 mins (60000ms)
}
