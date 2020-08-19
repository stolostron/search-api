/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import _ from 'lodash';
import { isRequired } from '../lib/utils';
import logger from '../lib/logger';

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
  resources.forEach((r) => {
    const status = _.get(r, statusKey);
    if (result[status]) {
      result[status] += 1;
    } else {
      result[status] = 1;
    }
  });
  return result;
}

export default class AppModel {
  constructor({ searchConnector = isRequired('searchConnector') }) {
    this.searchConnector = searchConnector;
  }

  checkSearchServiceAvailable() {
    if (!this.searchConnector.isServiceAvailable()) {
      logger.error('Unable to resolve search request because Redis is unavailable.');
      throw Error('Search service is unavailable');
    }
  }

  /*
   * An instance of AppModel is created for every API request.
   * This is used for queries that run only once, for example, when
   * resolving an application list, we'll resolve subscriptions only once
   * for all applications, then use the same result for each app resolver.
   */
  async runQueryOnlyOnce(searchConnectorQueryName) {
    this.checkSearchServiceAvailable();
    const queryFn = this.searchConnector[searchConnectorQueryName];
    if (queryFn && typeof queryFn === 'function') {
      if (!this[`${searchConnectorQueryName}Promise`]) {
        this[`${searchConnectorQueryName}Promise`] = this.searchConnector[searchConnectorQueryName]();
      }
      return this[`${searchConnectorQueryName}Promise`];
    }
    logger.error('Expected to receive a function.', queryFn, searchConnectorQueryName);
    return Promise.reject(new Error('Expected to receive a function.'));
  }

  /* ***  GLOBAL APPLICATION DATA RESOLVERS *** */

  /*
   * Number of channels associated to any application.
   */
  async resolveGlobalAppChannelsCount() {
    const ch = await this.searchConnector.runGlobalAppChannelsQuery();
    return ch.length;
  }

  /*
   * Number of clusters where any application has resources.
   */
  async resolveGlobalAppClusterCount() {
    const clusters = await this.searchConnector.runGlobalAppClusterCountQuery();
    return clusters.length;
  }

  /*
   * Number of hub subscriptions associated to any application.
   */
  async resolveGlobalAppHubSubscriptionsCount() {
    const subs = await this.searchConnector.runGlobalAppHubSubscriptionsQuery();
    return subs.length;
  }

  /*
   * Remote subscriptions associated to any application. Grouped by state.
   */
  async resolveGlobalAppRemoteSubscriptions() {
    const subs = await this.searchConnector.runGlobalAppRemoteSubscriptionsQuery();
    return groupByStatus(subs, 'sub.status');
  }

  /* *** APPLICATION RESOLVERS *** */

  /*
   * Resolve Applications.
   * This is more efficient than searching for `kind:application`
   */
  async resolveApplications({ name, namespace }) {
    this.checkSearchServiceAvailable();

    const apps = await this.searchConnector.runApplicationsQuery();
    if (name != null && namespace != null) {
      const resolvedApps = await apps;
      return resolvedApps.filter((app) => (app['app.name'] === name && app['app.namespace'] === namespace));
    }
    return apps;
  }

  /*
   * For a given application, return the number of clusters where it has resources.
   */
  async resolveAppClustersCount(appUid) {
    const clusters = await this.runQueryOnlyOnce('runAppClustersQuery');
    const c = clusters.find((app) => app['app._uid'] === appUid);
    return c ? c.count : 0;
  }

  /*
   * For a given application, resolve the hub subscriptions.
   */
  async resolveAppHubSubscriptions(appUid) {
    const subs = await this.runQueryOnlyOnce('runAppHubSubscriptionsQuery');
    return subs.filter((s) => s['app._uid'] === appUid);
  }

  /*
   * For a given application, resolve the hub channels.
   */
  async resolveAppHubChannels(appUid) {
    const subs = await this.runQueryOnlyOnce('runAppHubChannelsQuery');
    return subs.filter((s) => s['app._uid'] === appUid);
  }

  /*
   * For a given application, resolve the pod count, grouped by status.
   */
  async resolveAppPodsCount(appUid) {
    const pods = await this.runQueryOnlyOnce('runAppPodsCountQuery');
    return groupByStatus(pods.filter((p) => p['app._uid'] === appUid), 'pod.status');
  }

  /*
   * For a given application, resolve the mote subscriptions, grouped by status.
   */
  async resolveAppRemoteSubscriptions(appUid) {
    const subs = await this.runQueryOnlyOnce('runAppRemoteSubscriptionsQuery');
    return groupByStatus(subs.filter((s) => s['app._uid'] === appUid), 'sub.status');
  }

  /* *** SUBSCRIPTION RESOLVERS *** */

  /*
   * Resolve Suscriptions.
   */
  async resolveSubscriptions({ name, namespace }) {
    this.checkSearchServiceAvailable();

    const subs = await this.searchConnector.runSubscriptionsQuery();
    if (name != null && namespace != null) {
      const resolvedSubs = await subs;
      return resolvedSubs.filter((sub) => (sub['sub.name'] === name && sub['sub.namespace'] === namespace));
    }
    return subs;
  }

  /*
   * For a given subscription, return the number of clusters where it has resources.
   */
  async resolveSubClustersCount(subUid) {
    const clusters = await this.runQueryOnlyOnce('runSubClustersQuery');
    const c = clusters.find((sub) => sub['sub._uid'] === subUid);
    return c ? c.count : 0;
  }

  /*
   * For a given subscription, return the number of related applications.
   */
  async resolveSubAppsCount(subUid) {
    const apps = await this.runQueryOnlyOnce('runSubAppsQuery');
    const a = apps.find((sub) => sub['sub._uid'] === subUid);
    return a ? a.count : 0;
  }
}
