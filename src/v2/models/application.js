/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

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
    if (result[r[statusKey]]) {
      result[r[statusKey]] += 1;
    } else {
      result[r[statusKey]] = 1;
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
    await this.checkSearchServiceAvailable();
    const queryFn = this.searchConnector[searchConnectorQueryName];
    if (queryFn && typeof queryFn === 'function') {
      if (!this[`${searchConnectorQueryName}Promise`]) {
        this[`${searchConnectorQueryName}Promise`] = this.searchConnector[searchConnectorQueryName]();
      }
      return this[`${searchConnectorQueryName}Promise`];
    }
    logger.error('Expected to recive a function.', queryFn, searchConnectorQueryName);
    return Promise.reject(new Error('Expected to recive a function.'));
  }

  /*
   * Resolve Applications.
   * This is more efficient than searching for `kind:application`
   */
  async resolveApplications({ name, namespace }) {
    await this.checkSearchServiceAvailable();

    if (name != null && namespace != null) {
      const apps = await this.searchConnector.runApplicationsQuery();
      return apps.filter(app => (app['app.name'] === name && app['app.namespace'] === namespace));
    } else if (name == null || namespace == null) {
      logger.warn('To filter applications must you provide both name and namespace. Returning all apps.');
    }

    return this.searchConnector.runApplicationsQuery();
  }

  /*
   * For a given application, return the number of clusters where it has resources.
   */
  async resolveAppClustersCount(appUid) {
    const clusters = await this.runQueryOnlyOnce('runAppClustersQuery');
    const c = clusters.find(app => app['app._uid'] === appUid);
    return c ? c.count : 0;
  }

  /*
   * For a given application, resolve the hub subscriptions.
   */
  async resolveAppHubSubscriptions(appUid) {
    const subs = await this.runQueryOnlyOnce('runAppHubSubscriptionsQuery');
    return subs.filter(s => s['app._uid'] === appUid);
  }

  /*
   * For a given application, resolve the pod count, grouped by status.
   */
  async resolveAppPodsCount(appUid) {
    const pods = await this.runQueryOnlyOnce('runAppPodsCountQuery');
    return groupByStatus(pods.filter(p => p['app._uid'] === appUid), 'pod.status');
  }

  /*
   * For a given application, resolve the mote subscriptions, grouped by status.
   */
  async resolveAppRemoteSubscriptions(appUid) {
    const subs = await this.runQueryOnlyOnce('runAppRemoteSubscriptionsQuery');
    return groupByStatus(subs.filter(s => s['app._uid'] === appUid), 'sub.status');
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
}
