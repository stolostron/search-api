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
    #Get nb of remote subscriptions, grouped by status, in this format Failed=2;Subscribed=2;null=3
    remoteSubs: String
    #Get nb of pods grouped by pod status, in this format Running=2;ImageLoopBackOff=10
    pods: String
    # Hub Subscriptions used by this application.
    hubSubscriptions: [Subscription]
    policies: [Policy]
    created: String
  }

  type Subscription {
    _uid: String
    status: String
    channel: String
  }

  # This is the parent policy on the MCM hub.
  type Policy {
    _uid: String
    app: String
    name: String
    namespace: String
    kind: String
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
    remoteSubs: (parent, args, { appModel }) => appModel.resolveSubscriptionsCount(parent, true),
    pods: (parent, args, { appModel }) => appModel.resolveApplicationPodsCount(parent),
    hubSubscriptions: (parent, args, { appModel }) => appModel.resolveAppHubSubs(parent),
    policies: (parent, args, { appModel }) => appModel.resolveApplicationPolicies(parent),
    created: parent => parent['app.created'],
  },
  Policy: {
    _uid: parent => parent['policy._uid'],
    app: parent => parent['app._uid'],
    name: parent => parent['policy.name'],
    namespace: parent => parent['policy.namespace'],
    kind: parent => parent['vama.kind'],
  },
  Subscription: {
    _uid: parent => parent['sub._uid'],
    status: parent => parent['sub.status'],
    channel: parent => parent['sub.channel'],
  },
};
