'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('../lib/utils');

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

// Remove single and double quotes because these can be used to inject malicious
// code in the RedisGraph query. (SQL injection).
function sanitizeString(s) {
  return s.replace(/['"]/g, '');
}

// Sanitize all inputs to prevent "sql injection" attacks.
function sanitizeInputs({
  keywords = [],
  filters = [],
  property = '',
  limit,
  relatedKinds = []
}) {
  const sanitizedKeywords = keywords.map(k => sanitizeString(k));
  const sanitizedFilters = filters.map(f => ({
    property: sanitizeString(f.property),
    values: f.values.map(v => sanitizeString(v))
  }));

  return {
    keywords: sanitizedKeywords,
    filters: sanitizedFilters,
    property: sanitizeString(property),
    limit: limit || _config2.default.get('defaultQueryLimit'),
    relatedKinds: relatedKinds.map(k => sanitizeString(k))
  };
}

// TODO: Keyword filtering currently requires that we transfer a large number of records from
// RedisGraph to filter locally. We need to investigate alternatives to improve performance.
function filterByKeywords(resultSet, keywords) {
  /* Regular expression resolves to a string like:
   *     /(?=.*keyword1)(?=.*keyword2)(?=.*keyword3)/gi
   * which matches if the string contains all keywords and is case insensitive. */
  const regex = new RegExp(keywords.reduce((prev, curr) => `${prev}(?=.*${curr})`, ''), 'gi');

  return resultSet.filter(r => Object.values(r).toString().match(regex));
}

class SearchModel {
  constructor({ searchConnector = (0, _utils.isRequired)('searchConnector') }) {
    this.searchConnector = searchConnector;
  }

  checkSearchServiceAvailable() {
    if (!this.searchConnector.isServiceAvailable()) {
      _logger2.default.error('Unable to resolve search request because Redis is unavailable.');
      throw Error('Search service is unavailable');
    }
  }

  searchQueryLimiter(keywords, filters, limit) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let exitLoop = false;
      let querySkipIdx = 0;
      let results = [];
      while (!exitLoop) {
        // eslint-disable-next-line
        const searchResults = yield _this.searchConnector.runSearchQuery(filters, limit, querySkipIdx);
        // Filter results if keyword search - otherwise its a label search
        const filteredResults = keywords.length > 0 ? filterByKeywords(searchResults, keywords) : searchResults;
        // concatenate search results each iteration removing any duplicates
        results = _lodash2.default.unionBy(results, filteredResults, '_uid');
        querySkipIdx += 1;
        if (searchResults.length < _config2.default.get('defaultQueryLoopLimit') || results.length >= limit) exitLoop = true;
      }
      return results;
    })();
  }

  resolveSearch(input) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const {
        keywords,
        filters,
        limit
      } = sanitizeInputs(input);
      yield _this2.checkSearchServiceAvailable();
      if (keywords && keywords.length > 0) {
        return _this2.searchQueryLimiter(keywords, filters, limit);
      }
      return _this2.searchConnector.runSearchQuery(filters, limit, -1);
    })();
  }

  resolveSearchCount(input) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const {
        keywords,
        filters
      } = sanitizeInputs(input);
      yield _this3.checkSearchServiceAvailable();
      if (keywords && keywords.length > 0) {
        const results = yield _this3.searchQueryLimiter(keywords, filters, -1);
        return results.length;
      }
      return _this3.searchConnector.runSearchQueryCountOnly(filters);
    })();
  }

  resolveSearchComplete(input, limit) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const { property, filters } = sanitizeInputs(input);
      yield _this4.checkSearchServiceAvailable();
      return _this4.searchConnector.getAllValues(property, filters, limit);
    })();
  }

  /** Resolve the related items for a given search query.
   *
   * @param {*} parent
   * returns { kind: String, count: Int, items: [] }
   */
  resolveRelated(input, countOnly) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const { filters, relatedKinds } = sanitizeInputs(input);
      yield _this5.checkSearchServiceAvailable();
      const relationships = yield _this5.searchConnector.findRelationships({ filters, countOnly, relatedKinds });

      const result = {};
      relationships.forEach(function (r) {
        if (!result[r.kind]) {
          result[r.kind] = [];
        }
        result[r.kind].push(r);
      });

      const resultKinds = Object.keys(result);

      // TODO: Need a better prioritization algorithm.
      const prioritizedRelationships = ['application', 'cluster', 'release', 'node', 'persistentvolume', 'pod', 'secret', 'persistentvolumeclaim'];
      resultKinds.sort(function (a, b) {
        return prioritizedRelationships.indexOf(b);
      });

      return resultKinds.map(function (r) {
        return { kind: r, count: result[r].length, items: result[r] };
      });
    })();
  }

  searchSchema() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6.checkSearchServiceAvailable();
      return {
        allProperties: yield _this6.searchConnector.getAllProperties()
      };
    })();
  }
}
exports.default = SearchModel;
//# sourceMappingURL=search.js.map