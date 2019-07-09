/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
import lodash from 'lodash';

export const typeDef = `
  input SearchFilter {
    property: String!
    values: [String]
  }

  type SearchRelatedResult {
    kind: String!
    count: Int
    items: JSON
  }

  input SearchInput {
    keywords: [String]
    filters: [SearchFilter]
  }

  type SearchResult {
    count: Int
    items: JSON
    # FUTURE: This isn't fully implemented yet.
    related: [SearchRelatedResult]
  }
`;

export const resolver = {
  Query: {
    search: (parent, { input }) => input,
    searchComplete: (parent, { property, query = {} }, { searchModel }) =>
      searchModel.resolveSearchComplete({ property, filters: lodash.get(query, 'filters', []) }),
    searchSchema: (parent, args, { searchModel }) => searchModel.searchSchema(),
  },
  SearchResult: {
    count: (parent, args, { searchModel }) => searchModel.resolveSearchCount(parent),
    items: (parent, args, { searchModel }) => searchModel.resolveSearch(parent),
    related: (parent, args, { searchModel }) => searchModel.resolveRelated(parent),
  },
};
