/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import { isRequired } from '../lib/utils';
import logger from '../lib/logger';

// TODO: Keyword filtering currently requires that we transfer a large number of records from the
// gremlin-server to filter locally. We need to investigate alternatives to improve performance.
function filterByKeywords(resultSet, keywords) {
  /* Regular expression resolves to a string like:
   *     /(?=.*keyword1)(?=.*keyword2)(?=.*keyword3)/gi
   * which matches if the string contains all keywords and is case insensitive. */
  const regex = new RegExp(keywords.reduce((prev, curr) => `${prev}(?=.*${curr})`, ''), 'gi');

  return resultSet.filter(r => Object.values(r).toString().match(regex));
}
export default class SearchModel {
  constructor({ searchConnector = isRequired('searchConnector') }) {
    this.searchConnector = searchConnector;
  }

  checkSearchServiceAvailable() {
    if (!this.searchConnector.isServiceAvailable()) {
      logger.error('Unable to resolve search request because Redis is unavailable.');
      throw Error('Search service is unavailable');
    }
  }

  async resolveSearch({ keywords, filters }) {
    await this.checkSearchServiceAvailable();
    if (keywords && keywords.length > 0) {
      const results = await this.searchConnector.runSearchQuery(filters);
      return filterByKeywords(results, keywords);
    }
    return this.searchConnector.runSearchQuery(filters);
  }

  async resolveSearchCount({ keywords, filters }) {
    await this.checkSearchServiceAvailable();
    if (keywords && keywords.length > 0) {
      const results = await this.searchConnector.runSearchQuery(filters);
      return filterByKeywords(results, keywords).length;
    }
    return this.searchConnector.runSearchQueryCountOnly(filters);
  }

  async resolveSearchComplete({ property, filters }) {
    await this.checkSearchServiceAvailable();
    return this.searchConnector.getAllValues(property, filters);
  }

  /** Resolve the related items for a given search query.
   *
   * @param {*} parent
   * returns { kind: String, count: Int, items: [] }
   */
  async resolveRelated(parent) {
    await this.checkSearchServiceAvailable();
    const relationships = await this.searchConnector.findRelationships(parent);

    const result = {};
    relationships.forEach((r) => {
      if (!result[r.kind]) {
        result[r.kind] = [];
      }
      result[r.kind].push(r);
    });

    const resultKinds = Object.keys(result);

    // TODO: UI can't display more than 5 tiles, so for now I'm truncating the resuls,
    //       keeping the kinds listed below sorted at the top.
    const prioritizedRelationships = [
      'application',
      'cluster',
      'compliance',
      'node',
      'persistentvolume',
      'persistentvolumeclaim',
      'pod',
      'release',
      'secret',
    ];
    resultKinds.sort((a, b) => prioritizedRelationships.indexOf(b));
    resultKinds.length = Math.min(resultKinds.length, 5);

    return resultKinds.map(r => ({ kind: r, count: result[r].length, items: result[r] }));
  }

  async searchSchema() {
    await this.checkSearchServiceAvailable();
    return {
      allProperties: await this.searchConnector.getAllProperties(),
    };
  }
}
