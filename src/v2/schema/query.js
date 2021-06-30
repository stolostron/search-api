/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */
// Copyright Contributors to the Open Cluster Management project
import { gql } from 'apollo-server-express';

export const typeDef = gql`
  # Search API - Queries
  type Query {
    # Special query to search for applications and their related resources efficiently.
    # Optionally, pass name and namespace to filter the results.
    applications(name: String, namespace: String): [Application]
    subscriptions(name: String, namespace: String): [Subscription]
    placementRules(name: String, namespace: String): [PlacementRule]
    channels(name: String, namespace: String): [Channel]

    # Search for resources.
    search(input: [SearchInput]): [SearchResult]

    # Additional information about the search service status. This is similar to errors, but without implying that there was a problem.
    messages: [Message]

    # Get all values for the given property.
    # If a query is passed, then results will be filtered to only those matching the query.
    searchComplete(property: String!, query: SearchInput, limit: Int): [String]

    # Get all Properties available for search.
    searchSchema: JSON

    # Get saved search queries for the current user.
    savedSearches: [userSearch]

    # Resolves if the current user is authorized to access a given resource.
    userAccess(resource: String, kind: String, action: String!, namespace: String, apiGroup: String, name: String, version: String): JSON
    
    # Get any kubernetes resource from any managed cluster.
    getResource(apiVersion: String, kind: String, name: String, namespace: String, cluster: String, selfLink: String, updateInterval: Int, deleteAfterUse: Boolean): JSON

    # Retrieves logs for the given container.
    logs(containerName: String!, podName: String!, podNamespace: String!, clusterName: String!): String

    # Resolves the data needed to render the overview page.
    overview(demoMode: Boolean): Overview
  }

  # Search API - Mutations
  type Mutation {
    # Delete search query for the current user.
    deleteSearch(resource: JSON): JSON

    # Save a search query for the current user.
    saveSearch(resource: JSON): JSON

    # Update any Kubernetes resources on both local and managed clusters.
    updateResource(selfLink: String, namespace: String, kind: String, name: String, body: JSON, cluster: String): JSON
  
    # Delete any Kubernetes resource via selfLink
    deleteResource(selfLink: String, apiVersion: String, name: String, namespace: String, cluster: String, kind: String, childResources: JSON): JSON  
  }

  # Common fields for all Kubernetes objects
  interface K8sObject {
    metadata: Metadata
  }

  # Common fields in all Kubernetes metadata objects.
  type Metadata {
    annotations: JSON
    creationTimestamp: String
    labels: JSON
    name: String
    namespace: String
    resourceVersion: String
    selfLink: String
    status: String
    uid: String
  }
`;

export const resolver = {
  K8sObject: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType() {
      return null;
    },
  },
};
