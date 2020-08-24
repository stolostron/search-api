/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */
import { gql } from 'apollo-server-express';

export const typeDef = gql`
# Search API - Queries
type Query {
  # Special query to search for applications and their related resources efficiently.
  # Optionally, pass name and namespace to filter the results.
  applications(name:String namespace: String): [Application]
  subscriptions(name:String namespace: String): [Subscription]
  placementRules(name:String namespace: String): [PlacementRule]
  channels(name: String namespace: String): [Channel]

  # Aggregated data from all applications.
  globalAppData: GlobalAppData

  # Search for resources.
  search(input: [SearchInput]): [SearchResult]

  # Get all values for the given property.
  # If a query is passed, then results will be filtered to only those matching the query.
  searchComplete(property: String!, query: SearchInput, limit: Int): [String]

  # Get all Properties available for search.
  searchSchema: JSON

  # Get saved search queries for the current user.
  savedSearches: [userSearch]
}

# Search API - Mutations
type Mutation {
  # Delete search query for the current user.
  deleteSearch(resource: JSON): JSON

  # Save a search query for the current user.
  saveSearch(resource: JSON): JSON
}
`;

export const resolver = {};
