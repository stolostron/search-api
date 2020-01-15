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
    uid: String
    name: String
    namespace: String
    # Clusters with subscriptions propagated by this application.
    clusters: [Cluster]
    # Subscriptions propagated to managed clusters by this application.
    managedSubscriptions: [Subscription]
    # Policies for which this application has violations. This is the parent policy on the MCM hub.
    policies: [Policy]
    created: String
  }

  type Cluster {
    uid: String
    name: String
    namespace: String
  }

  type Subscription {
    uid: String
    name: String
    namespace: String
  }

  # This is the parent policy on the MCM hub.
  type Policy {
    uid: String
    name: String
    namespace: String
    # Clusters where this policy has been propagated and has a violation.
    clusters: [Cluster]
  }
`;

export const resolver = {
  Query: {
    applications: (parent, args, { appModel }) => appModel.resolveApplications(),
  },
  Application: {
    uid: parent => parent['app._uid'],
    name: parent => parent['app.name'],
    namespace: parent => parent['app.namespace'],
    clusters: (parent, args, { appModel }) => appModel.resolveApplicationClusters(parent),
    managedSubscriptions: (parent, args, { appModel }) => appModel.resolveAppManagedSubs(parent),
    policies: (parent, args, { appModel }) => appModel.resolveApplicationPolicies(parent),
    created: parent => parent['app.created'],
  },
  Policy: {
    uid: parent => parent['policy._uid'],
    name: parent => parent['policy.name'],
    namespace: parent => parent['policy.namespace'],
    clusters: parent => parent.clusters,
  },
  Subscription: {
    uid: parent => parent['sub._uid'],
    name: parent => parent['sub.name'],
    namespace: parent => parent['sub.namespace'],
  },
  Cluster: {
    uid: parent => parent['cluster._uid'],
    name: parent => parent['cluster.name'],
    namespace: parent => parent['cluster.namespace'],
  },
};
