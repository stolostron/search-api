'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolver = exports.typeDef = undefined;

var _graphqlTypeJson = require('graphql-type-json');

var _graphqlTypeJson2 = _interopRequireDefault(_graphqlTypeJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const typeDef = exports.typeDef = `
scalar JSON
`; /** *****************************************************************************
    * Licensed Materials - Property of IBM
    * (c) Copyright IBM Corporation 2019. All Rights Reserved.
    *
    * Note to U.S. Government Users Restricted Rights:
    * Use, duplication or disclosure restricted by GSA ADP Schedule
    * Contract with IBM Corp.
    ****************************************************************************** */

const resolver = exports.resolver = {
  JSON: _graphqlTypeJson2.default
};
//# sourceMappingURL=json.js.map