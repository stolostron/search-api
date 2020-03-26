'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = exports.typeDefs = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _graphqlTools = require('graphql-tools');

var _application = require('./application');

var application = _interopRequireWildcard(_application);

var _json = require('./json');

var json = _interopRequireWildcard(_json);

var _query = require('./query');

var query = _interopRequireWildcard(_query);

var _search = require('./search');

var search = _interopRequireWildcard(_search);

var _userSearch = require('./user-search');

var userSearch = _interopRequireWildcard(_userSearch);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const modules = [application, json, query, search, userSearch]; /** *****************************************************************************
                                                                 * Licensed Materials - Property of IBM
                                                                 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                 *
                                                                 * Note to U.S. Government Users Restricted Rights:
                                                                 * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                 * Contract with IBM Corp.
                                                                 ****************************************************************************** */

const mainDefs = [`
schema {
  query: Query,
  mutation: Mutation,
}
`];

const typeDefs = exports.typeDefs = mainDefs.concat(modules.map(m => m.typeDef));
const resolvers = exports.resolvers = _lodash2.default.merge(...modules.map(m => m.resolver));

const schema = (0, _graphqlTools.makeExecutableSchema)({ typeDefs, resolvers });

exports.default = schema;
//# sourceMappingURL=index.js.map