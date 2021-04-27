/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import _ from 'lodash';
import config from '../../../config';
import { isRequired } from '../lib/utils';
import logger from '../lib/logger';
import getOperatorStatus from './operatorStatus';

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
  relatedKinds = [],
}) {
  const sanitizedKeywords = keywords.map((k) => sanitizeString(k));
  const sanitizedFilters = filters.map((f) => ({
    property: sanitizeString(f.property),
    values: f.values.map((v) => sanitizeString(v)),
  }));

  return {
    keywords: sanitizedKeywords,
    filters: sanitizedFilters,
    property: sanitizeString(property),
    limit: limit || config.get('defaultQueryLimit'),
    relatedKinds: relatedKinds.map((k) => sanitizeString(k)),
  };
}

// TODO: Keyword filtering currently requires that we transfer a large number of records from
// RedisGraph to filter locally. We need to investigate alternatives to improve performance.
function filterByKeywords(resultSet, keywords) {
  /* Regular expression resolves to a string like:
   *     /(?=.*keyword1)(?=.*keyword2)(?=.*keyword3)/gi
   * which matches if the string contains all keywords and is case insensitive. */
  const regex = new RegExp(keywords.reduce((prev, curr) => `${prev}(?=.*${curr})`, ''), 'gi');

  return resultSet.filter((r) => Object.values(r).toString().match(regex));
}

export default class SearchModel {
  constructor({ searchConnector = isRequired('searchConnector'), kubeConnector = isRequired('kubeConnector') }) {
    this.kubeConnector = kubeConnector;
    this.searchConnector = searchConnector;
  }

  async checkSearchServiceAvailable() {
    const isServiceAvailable = await this.searchConnector.isServiceAvailable();
    if (!isServiceAvailable) {
      const deployRedisgraph = await getOperatorStatus(this.kubeConnector);
      if (!deployRedisgraph) {
        logger.warn('The search service is not enabled in the current configuration.');
        throw Error('The search service is not enabled in the current configuration.');
      } else {
        logger.error('Unable to resolve search request because RedisGraph is unavailable.');
        throw Error('Search service is unavailable.');
      }
    }
  }

  async searchQueryLimiter(keywords, filters, limit) {
    let exitLoop = false;
    let querySkipIdx = 0;
    let results = [];
    while (!exitLoop) {
      // eslint-disable-next-line
      const searchResults = await this.searchConnector.runSearchQuery(filters, limit, querySkipIdx);
      // Filter results if keyword search - otherwise its a label search
      const filteredResults = keywords.length > 0
        ? filterByKeywords(searchResults, keywords)
        : searchResults;
      // concatenate search results each iteration removing any duplicates
      results = _.unionBy(results, filteredResults, '_uid');
      querySkipIdx += 1;
      if (searchResults.length < config.get('defaultQueryLoopLimit') || results.length >= limit) exitLoop = true;
    }
    return results;
  }

  async resolveSearch(input) {
    const {
      keywords,
      filters,
      limit,
    } = sanitizeInputs(input);
    await this.checkSearchServiceAvailable();
    if (keywords && keywords.length > 0) {
      return this.searchQueryLimiter(keywords, filters, limit);
    }
    return this.searchConnector.runSearchQuery(filters, limit, -1);
  }

  async resolveSearchCount(input) {
    const {
      keywords,
      filters,
    } = sanitizeInputs(input);
    await this.checkSearchServiceAvailable();
    if (keywords && keywords.length > 0) {
      const results = await this.searchQueryLimiter(keywords, filters, -1);
      return results.length;
    }
    return this.searchConnector.runSearchQueryCountOnly(filters);
  }

  async resolveSearchComplete(input, limit) {
    const { property, filters } = sanitizeInputs(input);
    await this.checkSearchServiceAvailable();
    return this.searchConnector.getAllValues(property, filters, limit);
  }

  /** Resolve the related items for a given search query.
   *
   * @param {*} parent
   * returns { kind: String, count: Int, items: [] }
   */
  async resolveRelated(input, countOnly) {
    const { filters, relatedKinds } = sanitizeInputs(input);
    await this.checkSearchServiceAvailable();
    const relationships = await this.searchConnector.findRelationships({ filters, countOnly, relatedKinds });

    const result = {};
    relationships.forEach((r) => {
      if (!result[r.kind]) {
        result[r.kind] = [];
      }
      result[r.kind].push(r);
    });

    const resultKinds = Object.keys(result);

    // TODO: Need a better prioritization algorithm.
    const prioritizedRelationships = [
      'application',
      'cluster',
      'release',
      'node',
      'persistentvolume',
      'pod',
      'secret',
      'persistentvolumeclaim',
    ];
    resultKinds.sort((a, b) => prioritizedRelationships.indexOf(b));

    return resultKinds.map((r) => ({ kind: r, count: result[r].length, items: result[r] }));
  }

  async searchSchema() {
    await this.checkSearchServiceAvailable();
    return {
      allProperties: await this.searchConnector.getAllProperties(),
    };
  }
}
