'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserRbacFilter = exports.getClusterRbacConfig = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let getClusterRbacConfig = exports.getClusterRbacConfig = (() => {
  var _ref = _asyncToGenerator(function* (kubeToken) {
    if (kubeToken !== undefined) {
      const kubeConnector = !isTest ? new _kube2.default({ token: `${kubeToken}` }) : new _kube4.default();
      // eslint-disable-next-line prefer-const
      let [roles, roleBindings, clusterRoles, clusterRoleBindings] = yield Promise.all([kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/roles'), kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/rolebindings'), kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/clusterroles'), kubeConnector.get('/apis/rbac.authorization.k8s.io/v1/clusterrolebindings')]);
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
        clusterRoleBindings
      };
    }
    return {};
  });

  return function getClusterRbacConfig(_x) {
    return _ref.apply(this, arguments);
  };
})();

let checkIfOpenShiftPlatform = (() => {
  var _ref2 = _asyncToGenerator(function* (kubeToken) {
    const url = '/apis/authorization.openshift.io/v1';
    const kubeConnector = !isTest ? new _kube2.default({ token: `${kubeToken}` }) : new _kube4.default();
    const res = yield kubeConnector.get(url);

    if (res && res.resources) {
      const selfReview = res.resources.filter(function (r) {
        return r.kind === 'SelfSubjectRulesReview';
      });
      _logger2.default.debug('SelfSubjectRulesReview:', selfReview);
      if (selfReview.length > 0) {
        _logger2.default.debug('Found API "authorization.openshift.io/v1" so assuming that we are running in OpenShift');
        isOpenshift = true;
        return;
      }
    }
    isOpenshift = false;
  });

  return function checkIfOpenShiftPlatform(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let getNonNamespacedResources = (() => {
  var _ref3 = _asyncToGenerator(function* (kubeToken) {
    const startTime = Date.now();
    const resources = [];
    const kubeConnector = !isTest ? new _kube2.default({ token: `${kubeToken}` }) : new _kube4.default();

    // Get non-namespaced resources WITH an api group
    resources.push(kubeConnector.post('/apis', {}).then((() => {
      var _ref4 = _asyncToGenerator(function* (res) {
        if (res) {
          const apiGroups = res.groups.map(function (group) {
            return group.preferredVersion.groupVersion;
          });
          const results = yield Promise.all(apiGroups.map(function (group) {
            const mappedResources = kubeConnector.get(`/apis/${group}`).then(function (result) {
              const groupResources = _lodash2.default.get(result, 'resources', []);
              const nonNamespaced = groupResources.filter(function (resource) {
                return resource.namespaced === false;
              }).map(function (resource) {
                return resource.name;
              });
              return nonNamespaced.filter(function (item) {
                return item.length > 0;
              }).map(function (item) {
                return { name: item, apiGroup: group };
              });
            });
            return mappedResources;
          }));
          return _lodash2.default.flatten(results.filter(function (item) {
            return item.length > 0;
          }));
        }
        return 'Error getting available apis.';
      });

      return function (_x4) {
        return _ref4.apply(this, arguments);
      };
    })()));

    // Get non-namespaced resources WITHOUT an api group
    resources.push(kubeConnector.get('/api/v1').then(function (res) {
      if (res) {
        return res.resources.filter(function (resource) {
          return resource.namespaced === false;
        }).map(function (item) {
          return { name: item.name, apiGroup: 'null' };
        });
      }
      return 'Error getting available apis.';
    }));
    _logger2.default.perfLog(startTime, 500, 'getNonNamespacedResources()');
    return _lodash2.default.flatten(resources);
  });

  return function getNonNamespacedResources(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let getNonNamespacedAccess = (() => {
  var _ref5 = _asyncToGenerator(function* (kubeToken) {
    const startTime = Date.now();
    const kubeConnector = !isTest ? new _kube2.default({ token: `${kubeToken}` }) : new _kube4.default();
    const nonNamespacedResources = yield getNonNamespacedResources(kubeToken);
    const results = yield Promise.all(nonNamespacedResources.map(function (resource) {
      const jsonBody = {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            verb: 'get',
            resource: resource.name
          }
        }
      };
      return kubeConnector.post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews', jsonBody).then(function (res) {
        if (res && res.status && res.status.allowed) {
          return `'null_${resource.apiGroup}_${resource.name}'`;
        }
        return null;
      });
    }));
    _logger2.default.perfLog(startTime, 500, 'getNonNamespacedAccess()');
    return results.filter(function (r) {
      return r !== null;
    });
  });

  return function getNonNamespacedAccess(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

let getUserAccess = (() => {
  var _ref6 = _asyncToGenerator(function* (kubeToken, namespace) {
    const kubeConnector = !isTest ? new _kube2.default({ token: `${kubeToken}` }) : new _kube4.default();
    const url = `/apis/authorization.${!isOpenshift ? 'k8s' : 'openshift'}.io/v1/${!isOpenshift ? '' : `namespaces/${namespace}/`}selfsubjectrulesreviews`;
    const jsonBody = {
      apiVersion: `authorization.${!isOpenshift ? 'k8s' : 'openshift'}.io/v1`,
      kind: 'SelfSubjectRulesReview',
      spec: {
        namespace
      }
    };
    return kubeConnector.post(url, jsonBody).then(function (res) {
      let userResources = [];
      if (res && res.status) {
        const results = isOpenshift ? res.status.rules : res.status.resourceRules;
        results.forEach(function (item) {
          if (item.verbs.includes('*') && item.resources.includes('*')) {
            // if user has access to everything then add just an *
            userResources = userResources.concat(['*']);
          } else if (item.verbs.includes('get') && item.resources.length > 0) {
            // TODO need to include access for 'patch' and 'delete'
            // RBAC string is defined as "namespace_apigroup_kind"
            const resources = [];
            const ns = namespace === '' || namespace === undefined ? 'null_' : `${namespace}_`;
            const apiGroup = item.apiGroups[0] === '' || item.apiGroups[0] === undefined ? 'null_' : `${item.apiGroups[0]}_`;
            // Filter sub-resources, those contain '/'
            item.resources.filter(function (r) {
              return r.indexOf('/') === -1;
            }).forEach(function (resource) {
              resources.push(`'${ns + apiGroup + resource}'`);
            });
            userResources = userResources.concat(resources);
          }
          return null;
        });
      }
      userResources.push(`'${namespace}_null_releases'`);
      return userResources.filter(function (r) {
        return r !== null;
      });
    });
  });

  return function getUserAccess(_x6, _x7) {
    return _ref6.apply(this, arguments);
  };
})();

let buildRbacString = (() => {
  var _ref7 = _asyncToGenerator(function* (req, objAliases) {
    const { user: { namespaces, idToken } } = req;
    const startTime = Date.now();
    if (isOpenshift === null) yield checkIfOpenShiftPlatform(idToken);
    const userCache = cache.get(idToken);
    let data = [];
    if (!userCache || !userCache.userAccessPromise || !userCache.userNonNamespacedAccessPromise) {
      const userAccessPromise = Promise.all(namespaces.map(function (namespace) {
        return getUserAccess(idToken, namespace);
      }));
      const userNonNamespacedAccessPromise = getNonNamespacedAccess(idToken);
      cache.set(idToken, _extends({}, userCache, { userAccessPromise, userNonNamespacedAccessPromise }));
      _logger2.default.info('Saved userAccess and nonNamespacesAccess promises to user cache.');
      data = [yield userAccessPromise, yield userNonNamespacedAccessPromise];
    } else {
      data = [yield userCache.userAccessPromise, yield userCache.userNonNamespacedAccessPromise];
    }

    const rbacData = new Set(_lodash2.default.flattenDeep(data));
    const aliasesData = objAliases.map(function (alias) {
      return [...rbacData].map(function (item) {
        return `${alias}._rbac = ${item}`;
      });
    });
    const aliasesStrings = aliasesData.map(function (a) {
      return a.join(' OR ');
    });

    _logger2.default.perfLog(startTime, 1000, `buildRbacString(namespaces count:${namespaces && namespaces.length} )`);
    return `(${aliasesStrings.join(') AND (')})`;
  });

  return function buildRbacString(_x8, _x9) {
    return _ref7.apply(this, arguments);
  };
})();

let getUserRbacFilter = exports.getUserRbacFilter = (() => {
  var _ref8 = _asyncToGenerator(function* (req, objAliases) {
    let rbacFilter = null;
    // update/add user on active list
    activeUsers[req.user.name] = Date.now();
    const currentUser = cache.get(req.user.idToken);
    // 1. if user exists -> return the cached RBAC string
    if (currentUser) {
      rbacFilter = yield buildRbacString(req, objAliases);
    }
    // 2. if (users 1st time querying || they have been removed b/c inactivity || they otherwise dont have an rbacString) -> create the RBAC String
    if (!rbacFilter) {
      const currentUserCache = cache.get(req.user.idToken); // Get user cache again because it may have changed.
      cache.set(req.user.idToken, _extends({}, currentUserCache));
      rbacFilter = buildRbacString(req, objAliases);
      return rbacFilter;
    }
    return rbacFilter;
  });

  return function getUserRbacFilter(_x10, _x11) {
    return _ref8.apply(this, arguments);
  };
})();

// Poll users access every 1 mins(default) in the background to determine RBAC revalidation


exports.default = pollUserAccess;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _asyncPolling = require('async-polling');

var _asyncPolling2 = _interopRequireDefault(_asyncPolling);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _kube = require('../connectors/kube');

var _kube2 = _interopRequireDefault(_kube);

var _kube3 = require('../mocks/kube');

var _kube4 = _interopRequireDefault(_kube3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */
/* eslint-disable max-len */

// Mocked connectors for testing


let isOpenshift = null;
const isTest = _config2.default.get('NODE_ENV') === 'test';
let activeUsers = [];
let adminAccessToken;
const cache = (0, _lruCache2.default)({
  max: 1000,
  maxAge: _config2.default.get('RBAC_INACTIVITY_TIMEOUT') // default is 10 mins
});

function pollUserAccess() {
  (0, _asyncPolling2.default)((() => {
    var _ref9 = _asyncToGenerator(function* (end) {
      if (_config2.default.get('NODE_ENV') !== 'test') {
        const startTime = Date.now();
        _logger2.default.debug('Polling - Revalidating user access to determine if rbac needs to be updated');
        // filter out inactive users and remove them from cache
        Object.entries(activeUsers).forEach(function (user) {
          const active = Date.now() - user[1] < _config2.default.get('RBAC_INACTIVITY_TIMEOUT');
          if (!active) {
            _logger2.default.info('User is no longer active, removing from cache');
            delete activeUsers[user[0]];
            cache.del(user[0]);
          }
        });
        // If role/roleBinding/clusterRole/clusterRoleBinding resources changed -> need to delete all active user RBAC cache
        const roleAccessCache = cache.get('user-role-access-data');
        // Need to use admin token to retrieve role data as admin has access to all data.
        if (!adminAccessToken) {
          adminAccessToken = process.env.NODE_ENV === 'production' ? _fs2.default.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8') : process.env.SERVICEACCT_TOKEN || '';
        }
        getClusterRbacConfig(adminAccessToken).then(function (res) {
          // If we dont have this cached we need to set it
          if (!roleAccessCache) {
            cache.set('user-role-access-data', res);
          } else {
            // Otherwise re-validate access
            const rolesCache = _lodash2.default.get(roleAccessCache, 'roles', '');
            const clusterRolesCache = _lodash2.default.get(roleAccessCache, 'clusterRoles', '');
            const roleBindingsCache = _lodash2.default.get(roleAccessCache, 'roleBindings', '');
            const clusteroleBindingsCache = _lodash2.default.get(roleAccessCache, 'clusterRoleBindings', '');
            if (JSON.stringify(res.roles) !== JSON.stringify(rolesCache) || JSON.stringify(res.clusterRoles) !== JSON.stringify(clusterRolesCache) || JSON.stringify(res.roleBindings) !== JSON.stringify(roleBindingsCache) || JSON.stringify(res.clusterRoleBindings) !== JSON.stringify(clusteroleBindingsCache)) {
              // Delete the entire cache & remove all active users
              cache.reset();
              activeUsers = [];
              // re-initialize the access cache with new data
              cache.set('user-role-access-data', res);
              _logger2.default.info('Role configuration has changed. User RBAC cache has been deleted');
            }
          }
        });
        _logger2.default.perfLog(startTime, 300, 'asyncPolling()');
      }
      // Notify polling when your job is done
      end();
      // Schedule the next call (ms)
    });

    return function (_x12) {
      return _ref9.apply(this, arguments);
    };
  })(), _config2.default.get('RBAC_POLL_INTERVAL')).run(); // default 1 mins (60000ms)
}
//# sourceMappingURL=rbacCaching.js.map