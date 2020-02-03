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
    # keep this for now because the app ui is asking for this string; will remove it once we have the UI use _uid
    name: String
    namespace: String
    dashboard: String
    #get nb of remote clusters related to this app
    remoteCls: Int
    #Get nb of hub subscriptions in this format Failed=2;Propagated=2;null=3
    hubSubs: String
    #Get nb of remote subscriptions in this format Failed=2;Subscribed=2;null=3
    remoteSubs: String
    #Get nb of pods in this format Failed=2;Success=10
    pods: String
    # Subscriptions propagated to managed clusters by this application.
    hubSubscriptions: [Subscription]
    policies: [Policy]
    created: String
  }

  type Subscription {
    _uid: String
  }

  # This is the parent policy on the MCM hub.
  type Policy {
    _uid: String
    name: String
    namespace: String
  }
`;

export const resolver = {
  Query: {
    applications: (parent, args, { appModel }) => appModel.resolveApplications(),
  },
  Application: {
    _uid: parent => parent['app._uid'],
    name: parent => parent['app.name'],
    namespace: parent => parent['app.namespace'],
    dashboard: parent => parent['app.dashboard'],
    remoteCls: (parent, args, { appModel }) => appModel.resolveApplicationClustersCount(parent),
    hubSubs: (parent, args, { appModel }) => appModel.resolveSubscriptionsCount(parent, false),
    remoteSubs: (parent, args, { appModel }) => appModel.resolveSubscriptionsCount(parent, true),
    pods: (parent, args, { appModel }) => appModel.resolveApplicationPodsCount(parent),
    hubSubscriptions: (parent, args, { appModel }) => appModel.resolveAppHubSubs(parent),
    policies: (parent, args, { appModel }) => appModel.resolveApplicationPolicies(parent),
    created: parent => parent['app.created'],
  },
  Subscription: {
    _uid: parent => parent['sub._uid'],
  },
};
