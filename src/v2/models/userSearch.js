/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import _ from 'lodash';
import lru from 'lru-cache';
import { isRequired } from '../lib/utils';

const userQueryCache = lru({
  max: 1000,
  maxAge: 1000 * 60 * 30, // 30 min
});

export default class QueryModel {
  constructor({ idMgmtConnector = isRequired('idMgmtConnector') }) {
    this.idMgmtConnector = idMgmtConnector;
  }

  // We need to cache the entire userPreference obj - it is required when performing a PUT operation
  async getUserPreferences(args) {
    const { req: { user } } = args;
    const cacheKey = _.get(user, 'accessToken');
    const savedQueryCache = userQueryCache.get(`savedQueries-${cacheKey}`);
    if (savedQueryCache !== undefined) {
      return savedQueryCache;
    }

    const response = await this.idMgmtConnector.get(`/identity/api/v1/userpreferences/preferenceId_${user.name || ''}`);
    if (response.error && (response.error.code || response.error.message)) {
      throw new Error(`HCM ERROR ${response.error.code} - ${response.error.message}`);
    }
    if (cacheKey && response) {
      userQueryCache.set(`savedQueries-${cacheKey}`, response);
    }
    return response;
  }

  async getSearches(args) {
    const response = await this.getUserPreferences(args);
    return response.userQueries || [];
  }

  async saveSearch(args) {
    const { req: { user }, resource } = args;
    const cacheKey = _.get(user, 'accessToken');
    const response = await this.getUserPreferences(args);
    let json = {};
    const queries = response.userQueries || [];
    // check Id and Name for backwards compatibility
    const target = queries.find(query => query.id === resource.id) ||
      queries.find(query => query.name === resource.name);
    if (target) { // this is an edit
      target.name = resource.name;
      target.description = resource.description;
      target.id = resource.id || Date.now().toString(); // Queries before 3.2.1, didn't have IDs.
      if (resource.searchText !== '') target.searchText = resource.searchText;
      json = {
        ...response,
        userQueries: queries,
      };
    } else {
      json = {
        ...response,
        userQueries: [...queries, resource],
      };
    }
    const updatedSearches = await this.idMgmtConnector
      .put(`/identity/api/v1/userpreferences/preferenceId_${user.name || ''}`, { json });

    if (updatedSearches.error &&
      (updatedSearches.error.code || updatedSearches.error.statusCode || updatedSearches.error.message)) {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR ${updatedSearches.error.code || updatedSearches.error.statusCode} - ${updatedSearches.error.message}`);
    }
    // Update the cache to represent the edit/save/delete
    userQueryCache.set(`savedQueries-${cacheKey}`, json);
    return updatedSearches;
  }

  async deleteSearch(args) {
    const { req: { user }, resource } = args;
    const url = `/identity/api/v1/userpreferences/preferenceId_${user.name || ''}`;
    const cacheKey = _.get(user, 'accessToken');
    const response = await this.getUserPreferences(args);
    let json = {};
    const queries = response.userQueries || [];
    const filteredUserQueries = queries.filter(object => object.name !== resource.name);
    // Update the cache to represent the deletion
    userQueryCache.set(`savedQueries-${cacheKey}`, { ...response, userQueries: filteredUserQueries });
    json = {
      ...response,
      userQueries: filteredUserQueries,
    };
    const updatedSearches = await this.idMgmtConnector.put(url, { json });

    if (updatedSearches.error &&
      (updatedSearches.error.code || updatedSearches.error.statusCode || updatedSearches.error.message)) {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR ${updatedSearches.error.code || updatedSearches.error.statusCode} - ${updatedSearches.error.message}`);
    }
    return updatedSearches;
  }
}
