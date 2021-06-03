/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import _ from 'lodash';
import { isRequired } from '../lib/utils';
import logger from '../lib/logger';
import { checkSearchServiceStatus } from './searchServiceStatus';

// Returns the local and remote cluster counts for a specific resource
function getLocalRemoteClusterCounts(resourceUid, resourceType, data) {
  const clusterCount = {
    localCount: 0,
    remoteCount: 0,
  };
  data.forEach((res) => {
    if (res[`${resourceType}._uid`] === resourceUid) {
      if (res.local) {
        clusterCount.localCount = res.clusterCount || 0;
      } else {
        clusterCount.remoteCount = res.clusterCount || 0;
      }
    }
  });
  return clusterCount;
}

const SUB_NAME = 'sub.name';
const SUB_NAMESPACE = 'sub.namespace';

const ARGO_LABEL_PREFIX = 'apps.open-cluster-management.io/';

function filterLocalSubscriptions(subs) {
  const localSuffix = '-local';

  // Filter subscriptions ending with '-local' unless there is no corresponding subscription without '-local'
  // These subscriptions are added automatically when a PlacementRule subscribes the local cluster, and they
  // are not really part of the application definition
  return subs.filter((sub) => {
    const subName = sub[SUB_NAME];

    if (!(subName && subName.endsWith(localSuffix))) {
      return true;
    }
    const subNameWithoutLocal = subName.substr(0, subName.length - localSuffix.length);
    return subs.find((subNonLocal) => subNonLocal[SUB_NAMESPACE] === sub[SUB_NAMESPACE]
      && subNonLocal[SUB_NAME] === subNameWithoutLocal) === undefined;
  });
}

function labelValue(label) {
  return label.split('=')[1];
}

export default class AppModel {
  constructor({ searchConnector = isRequired('searchConnector'), kubeConnector = isRequired('kubeConnector') }) {
    this.kubeConnector = kubeConnector;
    this.searchConnector = searchConnector;
  }

  async checkSearchServiceAvailable() {
    await checkSearchServiceStatus(this.searchConnector, this.kubeConnector);
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
    logger.error('Expected to receive a function.', queryFn, searchConnectorQueryName);
    return Promise.reject(new Error('Expected to receive a function.'));
  }

  /* *** APPLICATION RESOLVERS *** */

  /*
   * Resolve Applications.
   * This is more efficient than searching for `kind:application`
   */
  async resolveApplications({ name, namespace }) {
    await this.checkSearchServiceAvailable();

    const apps = _.sortBy(
      _.flatten(await Promise.all([this.searchConnector.runApplicationsQuery(), this.searchConnector.runArgoApplicationsQuery()])),
      [
        // Account for applicationSet being used as name in default sort
        (o) => (o['app.applicationSet'] ? `${o['app.applicationSet']}/${o['app.name']}` : o['app.name']),
        'app.namespace',
        'app.cluster',
      ],
    );
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
    return getLocalRemoteClusterCounts(appUid, 'app', clusters);
  }

  /*
   * For a given application, return the destination cluster
   */
  async resolveAppDestinationCluster(app) {
    if (app['app.apigroup'] === 'argoproj.io') {
      if (app['app.destinationServer'] === 'https://kubernetes.default.svc' || app['app.destinationName'] === 'in-cluster') {
        return app['app.cluster'];
      }
      const clusterSecrets = await this.runQueryOnlyOnce('runArgoClusterSecretsQuery');
      const secret = clusterSecrets
        .filter((s) => s['s.cluster'] === app['app.cluster'])
        .find((s) => (app['app.destinationName'] && s['s.label'].includes(`${ARGO_LABEL_PREFIX}cluster-name=${app['app.destinationName']}`))
          // cluster-server label will only contain hostname, limited to 63 chars
          || (app['app.destinationServer'] && s['s.label'].find((l) => l.startsWith(`${ARGO_LABEL_PREFIX}cluster-server=`)
                && app['app.destinationServer'].includes(labelValue(l)))));
      const label = secret && secret['s.label'].find((l) => l.startsWith(`${ARGO_LABEL_PREFIX}cluster-name=`));
      if (label) {
        return labelValue(label);
      }
    }
    return null;
  }

  /*
   * For a given application, resolve the hub subscriptions.
   */
  async resolveAppHubSubscriptions(appUid) {
    const subs = await this.runQueryOnlyOnce('runAppHubSubscriptionsQuery');
    const filteredSubs = filterLocalSubscriptions(subs);
    return filteredSubs.filter((s) => s['app._uid'] === appUid);
  }

  /*
   * For a given application, resolve the hub channels.
   */
  async resolveAppHubChannels(appUid) {
    const subs = await this.runQueryOnlyOnce('runAppHubChannelsQuery');
    const filteredSubs = filterLocalSubscriptions(subs);
    return filteredSubs.filter((s) => s['app._uid'] === appUid);
  }

  /* *** SUBSCRIPTION RESOLVERS *** */

  /*
   * Resolve Suscriptions.
   */
  async resolveSubscriptions({ name, namespace }) {
    await this.checkSearchServiceAvailable();

    const subs = await this.searchConnector.runSubscriptionsQuery();
    const resolvedSubs = filterLocalSubscriptions(await subs);

    if (name != null && namespace != null) {
      return resolvedSubs.filter((sub) => (sub[SUB_NAME] === name && sub[SUB_NAMESPACE] === namespace));
    }
    return resolvedSubs;
  }

  /*
   * For a given subscription, return the number of clusters where it has resources.
   */
  async resolveSubClustersCount(subUid) {
    const clusters = await this.runQueryOnlyOnce('runSubClustersQuery');
    return getLocalRemoteClusterCounts(subUid, 'sub', clusters);
  }

  /*
   * For a given subscription, return the number of related applications.
   */
  async resolveSubAppsCount(subUid) {
    const apps = await this.runQueryOnlyOnce('runSubAppsQuery');
    const a = apps.find((sub) => sub['sub._uid'] === subUid);
    return a ? a.count : 0;
  }

  /*
   * Resolve PlacementRules.
   */
  async resolvePlacementRules({ name, namespace }) {
    await this.checkSearchServiceAvailable();

    const prs = await this.searchConnector.runPlacementRulesQuery();
    if (name != null && namespace != null) {
      const resolvedPRs = await prs;
      return resolvedPRs.filter((pr) => (pr['pr.name'] === name && pr['pr.namespace'] === namespace));
    }
    return prs;
  }

  /*
   * For a given placement rule, return the number of clusters it matches.
   */
  async resolvePRClustersCount(prUid) {
    const clusters = await this.runQueryOnlyOnce('runPRClustersQuery');
    return getLocalRemoteClusterCounts(prUid, 'pr', clusters);
  }

  /*
   * Resolve Channels.
   */
  async resolveChannels({ name, namespace }) {
    await this.checkSearchServiceAvailable();

    const chs = await this.searchConnector.runChannelsQuery();
    if (name != null && namespace != null) {
      const resolvedChs = await chs;
      return resolvedChs.filter((ch) => (ch['ch.name'] === name && ch['ch.namespace'] === namespace));
    }
    return chs;
  }

  /*
   * For a given channel, return whether any of the subscriptions use local placement
   */
  async resolveChannelLocalPlacement(chUid) {
    const subs = await this.runQueryOnlyOnce('runChannelSubsQuery');
    const s = subs.find((ch) => ch['ch._uid'] === chUid);
    return s ? s.localPlacement.includes('true') : false;
  }

  /*
   * For a given channel, return the number of subscriptions it matches.
   */
  async resolveChannelSubsCount(chUid) {
    const subs = await this.runQueryOnlyOnce('runChannelSubsQuery');
    const s = subs.find((ch) => ch['ch._uid'] === chUid);
    return s ? s.count : 0;
  }

  /*
   * For a given channel, return the number of clusters it matches.
   */
  async resolveChannelClustersCount(chUid) {
    const clusters = await this.runQueryOnlyOnce('runChannelClustersQuery');
    return getLocalRemoteClusterCounts(chUid, 'ch', clusters);
  }
}
