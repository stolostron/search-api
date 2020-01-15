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
   * Resolve Applications.
   * This is more efficient than searching for `kind:application`
   */
  async resolveApplications() {
    await this.checkSearchServiceAvailable();
    return this.searchConnector.runApplicationsQuery();
  }

  /*
   * Resolve Policies for an Application.
   * This returns the parent policies (in the hub).
   */
  async resolveApplicationPolicies(application) {
    await this.checkSearchServiceAvailable();
    // Run a single query to get policies for all the applications.
    if (!this.policiesPromise) {
      this.policiesPromise = this.searchConnector.runApplicationPoliciesQuery();
    }
    const policies = await this.policiesPromise;

    // Filter the policy rows to the current application.
    const appPolicies = policies.filter(p => p['app._uid'] === application['app._uid']) || [];

    // The query returns a row for each cluster where the policy is violated.
    // We need to reduce the results to collapse into a single row per policy.
    return appPolicies.reduce((prev = [], current) => {
      if (prev.find(p => p['policy._ui'] === current['policy._uid'])) {
        const policy = prev.find(p => p['policy._ui'] === current['policy._uid']);
        policy.clusters.push({ name: current['vama.cluster'] });
      } else {
        const policy = current;
        policy.clusters = [{ name: current['vama.cluster'] }];
        prev.push(policy);
      }
      return prev;
    }, []);
  }

  async resolveApplicationClusters(application) {
    await this.checkSearchServiceAvailable();
    // Run a query to get managed clusters for a specific application.
    return this.searchConnector.runAppClustersQuery(application['app._uid']);
  }

  async resolveAppManagedSubs(application) {
    await this.checkSearchServiceAvailable();
    // Run a query to get subscriptions on managed clusters for a specific application.
    return this.searchConnector.runAppManagedSubscriptionsQuery(application['app._uid']);
  }
}
