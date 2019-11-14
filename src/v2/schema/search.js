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

  input SearchInput {
    keywords: [String]
    filters: [SearchFilter]
    # Max number of results. Default limit: 10,000. For unlimited results use -1.
    limit: Int
    # Filter relationships to the specified kinds.  If empty, all relationships will be included. This filter is used with the \`related\` field on SearchResult.
    relatedKinds: [String]
  }

  type SearchResult {
    count: Int
    items: JSON
    related: [SearchRelatedResult]
  }

  type SearchRelatedResult {
    kind: String!
    count: Int
    items: JSON
  }
`;

export const resolver = {
  Query: {
    search: (parent, { input }) => input,
    searchComplete: (parent, { property, query = {}, limit }, { searchModel }) =>
      searchModel.resolveSearchComplete({ property, filters: lodash.get(query, 'filters', []) }, limit),
    searchSchema: (parent, args, { searchModel }) => searchModel.searchSchema(),
  },
  SearchResult: {
    count: (parent, args, { searchModel }) => searchModel.resolveSearchCount(parent),
    items: (parent, args, { searchModel }) => searchModel.resolveSearch(parent),
    related: (parent, args, { searchModel }, info) => {
      const selections = lodash.get(info, 'fieldNodes[0].selectionSet.selections', [])
        .map(s => lodash.get(s, 'name.value', []));
      const count = selections.includes('count');
      return searchModel.resolveRelated(parent, count);
    },
  },
};
