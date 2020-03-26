'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../lib/utils');

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

/*
 * Format results grouping by status.
 * Sample output:
 *   {
 *     ContainerCreating: 1,
 *     Running: 3,
 *   }
 */
function groupByStatus(resources, statusKey) {
  const result = {};
  resources.forEach(r => {
    if (result[r[statusKey]]) {
      result[r[statusKey]] += 1;
    } else {
      result[r[statusKey]] = 1;
    }
  });
  return result;
}

class AppModel {
  constructor({ searchConnector = (0, _utils.isRequired)('searchConnector') }) {
    this.searchConnector = searchConnector;
  }

  checkSearchServiceAvailable() {
    if (!this.searchConnector.isServiceAvailable()) {
      _logger2.default.error('Unable to resolve search request because Redis is unavailable.');
      throw Error('Search service is unavailable');
    }
  }

  /*
   * An instance of AppModel is created for every API request.
   * This is used for queries that run only once, for example, when
   * resolving an application list, we'll resolve subscriptions only once
   * for all applications, then use the same result for each app resolver.
   */
  runQueryOnlyOnce(searchConnectorQueryName) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.checkSearchServiceAvailable();
      const queryFn = _this.searchConnector[searchConnectorQueryName];
      if (queryFn && typeof queryFn === 'function') {
        if (!_this[`${searchConnectorQueryName}Promise`]) {
          _this[`${searchConnectorQueryName}Promise`] = _this.searchConnector[searchConnectorQueryName]();
        }
        return _this[`${searchConnectorQueryName}Promise`];
      }
      _logger2.default.error('Expected to recive a function.', queryFn, searchConnectorQueryName);
      return Promise.reject(new Error('Expected to recive a function.'));
    })();
  }

  /*
   * Resolve Applications.
   * This is more efficient than searching for `kind:application`
   */
  resolveApplications({ name, namespace }) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.checkSearchServiceAvailable();

      if (name != null && namespace != null) {
        const apps = yield _this2.searchConnector.runApplicationsQuery();
        return apps.filter(function (app) {
          return app['app.name'] === name && app['app.namespace'] === namespace;
        });
      } else if (name == null || namespace == null) {
        _logger2.default.warn('To filter applications must you provide both name and namespace. Returning all apps.');
      }

      return _this2.searchConnector.runApplicationsQuery();
    })();
  }

  /*
   * For a given application, return the number of clusters where it has resources.
   */
  resolveAppClustersCount(appUid) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const clusters = yield _this3.runQueryOnlyOnce('runAppClustersQuery');
      const c = clusters.find(function (app) {
        return app['app._uid'] === appUid;
      });
      return c ? c.count : 0;
    })();
  }

  /*
   * For a given application, resolve the hub subscriptions.
   */
  resolveAppHubSubscriptions(appUid) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const subs = yield _this4.runQueryOnlyOnce('runAppHubSubscriptionsQuery');
      return subs.filter(function (s) {
        return s['app._uid'] === appUid;
      });
    })();
  }

  /*
   * For a given application, resolve the pod count, grouped by status.
   */
  resolveAppPodsCount(appUid) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const pods = yield _this5.runQueryOnlyOnce('runAppPodsCountQuery');
      return groupByStatus(pods.filter(function (p) {
        return p['app._uid'] === appUid;
      }), 'pod.status');
    })();
  }

  /*
   * For a given application, resolve the mote subscriptions, grouped by status.
   */
  resolveAppRemoteSubscriptions(appUid) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const subs = yield _this6.runQueryOnlyOnce('runAppRemoteSubscriptionsQuery');
      return groupByStatus(subs.filter(function (s) {
        return s['app._uid'] === appUid;
      }), 'sub.status');
    })();
  }

  /* ***  GLOBAL APPLICATION DATA RESOLVERS *** */

  /*
   * Number of channels associated to any application.
   */
  resolveGlobalAppChannelsCount() {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const ch = yield _this7.searchConnector.runGlobalAppChannelsQuery();
      return ch.length;
    })();
  }

  /*
   * Number of clusters where any application has resources.
   */
  resolveGlobalAppClusterCount() {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const clusters = yield _this8.searchConnector.runGlobalAppClusterCountQuery();
      return clusters.length;
    })();
  }

  /*
   * Number of hub subscriptions associated to any application.
   */
  resolveGlobalAppHubSubscriptionsCount() {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      const subs = yield _this9.searchConnector.runGlobalAppHubSubscriptionsQuery();
      return subs.length;
    })();
  }

  /*
   * Remote subscriptions associated to any application. Grouped by state.
   */
  resolveGlobalAppRemoteSubscriptions() {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      const subs = yield _this10.searchConnector.runGlobalAppRemoteSubscriptionsQuery();
      return groupByStatus(subs, 'sub.status');
    })();
  }
}
exports.default = AppModel;
//# sourceMappingURL=application.js.map