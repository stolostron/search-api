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
    # Policies for which this application has violations. This is the parent policy on the MCM hub.
    policies: [Policy]
  }

  type Cluster {
    name: String
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
    policies: (parent, args, { appModel }) => appModel.resolveApplicationPolicies(parent),
  },
  Policy: {
    uid: parent => parent['policy._uid'],
    name: parent => parent['policy.name'],
    namespace: parent => parent['policy.namespace'],
    clusters: parent => parent.clusters,
  },
};
