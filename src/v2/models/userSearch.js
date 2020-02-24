/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import _ from 'lodash';
import { isRequired } from '../lib/utils';


// TODO - Need to use the user preference CRD here.
export default class QueryModel {
  constructor({ kubeConnector = isRequired('kubeConnector') }) {
    this.kubeConnector = kubeConnector;
  }

  async getUserPreferences(args) {
    const { req: { user } } = args;
    const userPreferenceURL = '/apis/acm.openshift.io/v1/userpreferences/';
    // TODO figure out best way to get userID
    const response = await this.kubeConnector.get(`${userPreferenceURL}${user.idToken}`);
    if (response.status === 'Failure' && response.reason === 'NotFound') {
      return [];
    } else if (response.code || response.message) {
      throw new Error(`HCM ERROR ${response.error.code} - ${response.error.message}`);
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
      updatedSearches = await this.kubeConnector.patch(`/apis/acm.openshift.io/v1/userpreferences/${user.idToken}`, json);
    } else if (_.get(response, 'metadata.resourceVersion', '') !== '') { // Adding new savedSearch
      json = [
        {
          op: 'add',
          path: '/spec/savedSearches/-',
          value: resource,
        },
      ];
      updatedSearches = await this.kubeConnector.patch(`/apis/acm.openshift.io/v1/userpreferences/${user.idToken}`, json);
    } else { // Create the userpreference CR and add savedSearch
      json = {
        apiVersion: 'acm.openshift.io/v1',
        kind: 'UserPreference',
        metadata: {
          name: user.idToken,
        },
        spec: {
          savedSearches: [...queries, resource],
        },
      };
      updatedSearches = await this.kubeConnector.post(`/apis/acm.openshift.io/v1/userpreferences/${user.idToken}`, json);
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
    const url = `/apis/acm.openshift.io/v1/userpreferences/${user.idToken}`;
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
