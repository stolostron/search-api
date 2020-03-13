/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import _ from 'lodash';
import config from '../../../config';
import { isRequired } from '../lib/utils';

export default class QueryModel {
  constructor({ kubeConnector = isRequired('kubeConnector') }) {
    this.kubeConnector = kubeConnector;
    this.userPreferenceApi = config.get('userPreferenceApi') || 'console.acm.io/v1/userpreferences/';
  }

  async getUserPreferences(args) {
    const { req: { user } } = args;
    const response = await this.kubeConnector.get(`/apis/${this.userPreferenceApi}${user.name}`);
    if (response.status === 'Failure' && response.reason === 'NotFound') {
      return {};
    } else if (response.code || response.message) {
      throw new Error(`ERROR ${response.error.code} - ${response.error.message}`);
    }
    return response;
  }

  async getSearches(args) {
    const response = await this.getUserPreferences(args);
    return _.get(response, 'spec.savedSearches', []);
  }

  async saveSearch(args) {
    const { req: { user }, resource } = args;
    const response = await this.getUserPreferences(args);
    let json = {};
    let updatedSearches = null;
    const queries = _.get(response, 'spec.savedSearches', []);
    // check Id and Name for backwards compatibility
    const target = queries.find(query => query.id === resource.id) ||
      queries.find(query => query.name === resource.name);
    if (target) { // this is an edit
      target.name = resource.name;
      target.description = resource.description;
      target.id = resource.id || Date.now().toString(); // Queries before 3.2.1, didn't have IDs.
      if (resource.searchText !== '') {
        target.searchText = resource.searchText;
      }
      json = [
        {
          op: 'replace',
          path: '/spec/savedSearches',
          value: queries,
        },
      ];
      updatedSearches = await this.kubeConnector.patch(`/apis/${this.userPreferenceApi}${user.name}`, json);
    } else if (_.get(response, 'metadata.resourceVersion', '') !== '') { // Adding new savedSearch
      json = [
        {
          op: 'add',
          path: '/spec/savedSearches/-',
          value: resource,
        },
      ];
      updatedSearches = await this.kubeConnector.patch(`/apis/${this.userPreferenceApi}${user.name}`, json);
    } else { // Create the userpreference CR and add savedSearch
      json = {
        apiVersion: 'console.acm.io/v1',
        kind: 'UserPreference',
        metadata: {
          name: user.name,
        },
        spec: {
          savedSearches: [...queries, resource],
        },
      };
      updatedSearches = await this.kubeConnector.post(`/apis/${this.userPreferenceApi}${user.name}`, json);
    }
    if (updatedSearches.error &&
      (updatedSearches.error.code || updatedSearches.error.statusCode || updatedSearches.error.message)) {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR ${updatedSearches.error.code || updatedSearches.error.statusCode} - ${updatedSearches.error.message}`);
    }
    return updatedSearches;
  }

  async deleteSearch(args) {
    const { req: { user }, resource } = args;
    const url = `/apis/${this.userPreferenceApi}${user.name}`;
    const response = await this.getUserPreferences(args);
    const queries = _.get(response, 'spec.savedSearches', []);
    const removeIdx = queries.findIndex(object => object.name === resource.name);
    const json = [
      {
        op: 'remove',
        path: `/spec/savedSearches/${removeIdx}`,
      },
    ];
    const updatedSearches = await this.kubeConnector.patch(url, json);

    if (updatedSearches.error &&
      (updatedSearches.error.code || updatedSearches.error.statusCode || updatedSearches.error.message)) {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR ${updatedSearches.error.code || updatedSearches.error.statusCode} - ${updatedSearches.error.message}`);
    }
    return updatedSearches;
  }
}
