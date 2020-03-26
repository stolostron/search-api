'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

describe.skip('UserSearch Resolver', () => {
  test('Correctly Resolves Saved Search Query', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
        {
          savedSearches {
            id
            name
            description
            searchText
          }
        }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });

  test('Correctly Resolves Saved Search Query Edit', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
        mutation {
          saveSearch(
            resource: {
              id: "1234567890",
              name: "All deployments",
              description: "Query for all deploys on hub cluster",
              searchText: "kind:deployment cluster:local-cluster"
            }
          )
        }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });

  test('Correctly Resolves Saved Search Query Deletion', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
        mutation {
          deleteSearch(
            resource: {
              id: "1234567890",
              name: "All deployments",
            }
          )
        }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
});
//# sourceMappingURL=user-search.test.js.map