'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolver = exports.typeDef = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
const typeDef = exports.typeDef = `
  input SearchFilter {
    property: String!
    values: [String]
  }

  input SearchInput {
    keywords: [String]
    filters: [SearchFilter]
    # Max number of results. Default limit: 10,000. For unlimited results use -1.
    limit: Int
    # Filter relationships to the specified kinds.
    # If empty, all relationships will be included. This filter is used with the 'related' field on SearchResult.
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

const resolver = exports.resolver = {
  Query: {
    search: (parent, { input }) => input,
    searchComplete: (parent, { property, query = {}, limit }, { searchModel }) => searchModel.resolveSearchComplete({ property, filters: _lodash2.default.get(query, 'filters', []) }, limit),
    searchSchema: (parent, args, { searchModel }) => searchModel.searchSchema()
  },
  SearchResult: {
    count: (parent, args, { searchModel }) => searchModel.resolveSearchCount(parent),
    items: (parent, args, { searchModel }) => searchModel.resolveSearch(parent),
    related: (parent, args, { searchModel }, info) => {
      const selections = _lodash2.default.get(info, 'fieldNodes[0].selectionSet.selections', []).map(s => _lodash2.default.get(s, 'name.value', []));
      const countOnly = selections.includes('count') && !selections.includes('items');
      if (selections.includes('count') && selections.includes('items')) {
        // eslint-disable-next-line max-len
        _logger2.default.warn('Client requested related items and count in the same query. When both are needed clients should get the count from items.length for better performance.');
      }
      return searchModel.resolveRelated(parent, countOnly);
    }
  }
};
//# sourceMappingURL=search.js.map