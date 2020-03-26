"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

const typeDef = exports.typeDef = `
type userSearch {
  id: String
  name: String
  description: String
  searchText: String
}
`;

const resolver = exports.resolver = {
  Query: {
    savedSearches: (parent, args, { queryModel, req }) => queryModel.getSearches(_extends({}, args, { req }))
  },
  Mutation: {
    saveSearch: (root, args, { queryModel, req }) => queryModel.saveSearch(_extends({}, args, { req })),
    deleteSearch: (root, args, { queryModel, req }) => queryModel.deleteSearch(_extends({}, args, { req }))
  }
};
//# sourceMappingURL=user-search.js.map