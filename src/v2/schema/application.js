/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

export const typeDef = `
  type Application {
    _uid: String
    created: String

    # Grafana dashboard for this application.
    dashboard: String

    labels: [String]
    name: String
    namespace: String
    selfLink: String

    # Number of clusters where this application has created any resources.
    clusterCount: Int

    # Hub subscriptions associated with this application.
    # Hub subscriptions are those without '_hostingSubscription' AND with _hubClusterResource=true
    hubSubscriptions: [Subscription]

    # Pods associated with this app, grouped by pod status, in this format { Running: 2, ImageLoopBackOff: 10 }.
    podStatusCount: JSON

    # Remote subscriptions for this app, grouped by status, in this format { Failed:2, Subscribed: 2, null: 3 }.
    # Remote subscriptions are those with the '_hostingSubscription' property.
    remoteSubscriptionStatusCount: JSON
  }

  type Subscription {
    _uid: String
    status: String
    channel: String
  }

  # Aggregated data from all applications.
  type GlobalAppData {
    # All chanels being referenced by any application.
    channelsCount: Int

    # Number of clusters where any application has created resources.
    clusterCount: Int

    # Subscriptions in the hub associated with any application.
    # Subscriptions without '_hostingSubscription' AND with _hubClusterResource=true
    hubSubscriptionCount: Int

    # Remote Subscriptions grouped by status, in this format { Failed:2, Subscribed: 2, null: 3 }.
    # Remote subscriptions are those with the '_hostingSubscription' property.
    remoteSubscriptionStatusCount: JSON
  }
`;

export const resolver = {
  Query: {
    globalAppData: () => ({}),
    applications: (parent, { name, namespace }, { appModel }) => appModel.resolveApplications({ name, namespace }),
  },
  Application: {
    _uid: parent => parent['app._uid'],
    created: parent => parent['app.created'],
    dashboard: parent => parent['app.dashboard'],
    labels: parent => (parent['app.label'] ? parent['app.label'].split(';').map(l => l.trim()) : []),
    name: parent => parent['app.name'],
    namespace: parent => parent['app.namespace'],
    selfLink: parent => parent['app.selfLink'],
    clusterCount: (parent, args, { appModel }) => appModel.resolveAppClustersCount(parent['app._uid']),
    hubSubscriptions: (parent, args, { appModel }) => appModel.resolveAppHubSubscriptions(parent['app._uid']),
    podStatusCount: (parent, args, { appModel }) => appModel.resolveAppPodsCount(parent['app._uid']),
    remoteSubscriptionStatusCount: (parent, args, { appModel }) =>
      appModel.resolveAppRemoteSubscriptions(parent['app._uid']),
  },
  GlobalAppData: {
    channelsCount: (parent, args, { appModel }) => appModel.resolveGlobalAppChannelsCount(),
    clusterCount: (parent, args, { appModel }) => appModel.resolveGlobalAppClusterCount(),
    hubSubscriptionCount: (parent, args, { appModel }) => appModel.resolveGlobalAppHubSubscriptionsCount(),
    remoteSubscriptionStatusCount: (parent, args, { appModel }) => appModel.resolveGlobalAppRemoteSubscriptions(),
  },
  Subscription: {
    _uid: parent => parent['sub._uid'],
    status: parent => parent['sub.status'],
    channel: parent => parent['sub.channel'],
  },
};
