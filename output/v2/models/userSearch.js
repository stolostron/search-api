'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('../lib/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

class QueryModel {
  constructor({ kubeConnector = (0, _utils.isRequired)('kubeConnector') }) {
    this.kubeConnector = kubeConnector;
    this.userPreferenceApi = _config2.default.get('userPreferenceApi') || 'console.acm.io/v1beta1/userpreferences/';
  }

  getUserPreferences(args) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const { req: { user } } = args;
      const response = yield _this.kubeConnector.get(`/apis/${_this.userPreferenceApi}${user.name}`);
      if (response.status === 'Failure' && response.reason === 'NotFound') {
        return {};
      } else if (response.code || response.message) {
        throw new Error(`ERROR ${response.error.code} - ${response.error.message}`);
      }
      return response;
    })();
  }

  getSearches(args) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const response = yield _this2.getUserPreferences(args);
      return _lodash2.default.get(response, 'spec.savedSearches', []);
    })();
  }

  saveSearch(args) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const { req: { user }, resource } = args;
      const response = yield _this3.getUserPreferences(args);
      let json = {};
      let updatedSearches = null;
      const queries = _lodash2.default.get(response, 'spec.savedSearches', []);
      // check Id and Name for backwards compatibility
      const target = queries.find(function (query) {
        return query.id === resource.id;
      }) || queries.find(function (query) {
        return query.name === resource.name;
      });
      if (target) {
        // this is an edit
        target.name = resource.name;
        target.description = resource.description;
        target.id = resource.id || Date.now().toString(); // Queries before 3.2.1, didn't have IDs.
        if (resource.searchText !== '') {
          target.searchText = resource.searchText;
        }
        json = [{
          op: 'replace',
          path: '/spec/savedSearches',
          value: queries
        }];
        updatedSearches = yield _this3.kubeConnector.patch(`/apis/${_this3.userPreferenceApi}${user.name}`, json);
      } else if (_lodash2.default.get(response, 'metadata.resourceVersion', '') !== '') {
        // Adding new savedSearch
        json = [{
          op: 'add',
          path: '/spec/savedSearches/-',
          value: resource
        }];
        updatedSearches = yield _this3.kubeConnector.patch(`/apis/${_this3.userPreferenceApi}${user.name}`, json);
      } else {
        // Create the userpreference CR and add savedSearch
        json = {
          apiVersion: 'acm.openshift.io/v1',
          kind: 'UserPreference',
          metadata: {
            name: user.name
          },
          spec: {
            savedSearches: [...queries, resource]
          }
        };
        updatedSearches = yield _this3.kubeConnector.post(`/apis/${_this3.userPreferenceApi}${user.name}`, json);
      }
      if (updatedSearches.error && (updatedSearches.error.code || updatedSearches.error.statusCode || updatedSearches.error.message)) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR ${updatedSearches.error.code || updatedSearches.error.statusCode} - ${updatedSearches.error.message}`);
      }
      return updatedSearches;
    })();
  }

  deleteSearch(args) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const { req: { user }, resource } = args;
      const url = `/apis/${_this4.userPreferenceApi}${user.name}`;
      const response = yield _this4.getUserPreferences(args);
      const queries = _lodash2.default.get(response, 'spec.savedSearches', []);
      const removeIdx = queries.findIndex(function (object) {
        return object.name === resource.name;
      });
      const json = [{
        op: 'remove',
        path: `/spec/savedSearches/${removeIdx}`
      }];
      const updatedSearches = yield _this4.kubeConnector.patch(url, json);

      if (updatedSearches.error && (updatedSearches.error.code || updatedSearches.error.statusCode || updatedSearches.error.message)) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR ${updatedSearches.error.code || updatedSearches.error.statusCode} - ${updatedSearches.error.message}`);
      }
      return updatedSearches;
    })();
  }
}
exports.default = QueryModel;
//# sourceMappingURL=userSearch.js.map