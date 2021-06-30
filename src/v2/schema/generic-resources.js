// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project
import { gql } from 'apollo-server-express';

export const typeDef = gql`
  type logs {
    containerName: String!
    podName: String!
    podNamespace: String!
    clusterName: String!
  }

  type getResource {
    apiVersion: String
    kind: String
    name: String
    namespace: String
    cluster: String
    selfLink: String
    updateInterval: Int
    deleteAfterUse: Boolean
  }

  type updateResource {
    selfLink: String
    namespace: String
    kind: String
    name: String
    body: JSON
    cluster: String
  }

  type deleteResource {
    selfLink: String
    apiVersion: String
    name: String
    namespace: String
    cluster: String
    kind: String
    childResources: JSON
  }
`;

export const resolver = {
  Query: {
    getResource: (parent, args, { genericModel }) => genericModel.getResource(args),
    logs: (parent, args, { genericModel }) => genericModel.getLogs(args.containerName, args.podName, args.podNamespace, args.clusterName),
  },
  Mutation: {
    updateResource: (parent, args, { genericModel }) => genericModel.updateResource(args),
    deleteResource: (root, args, { genericModel }) => genericModel.deleteResource(args),
  },
};
