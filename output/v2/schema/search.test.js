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

describe('Search Resolver', () => {
  test('Correctly Resolves Search Query', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
          {
            searchResult: search(input: {
                keywords: [],
                filters: [ { property: "cluster", values: ["cluster1"]}],
                limit: 10000,
                relatedKinds: ["pod"]}){
              items
              related {
                kind
                count
                items
              }
              count
            }
          }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
  test('Correctly Resolves Search Keyword Query', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
          {
            searchResult: search(input: {
                keywords: ["testing"],
                filters: []}){
              items
              related {
                kind
                count
                items
              }
              count
            }
          }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
  test('Correctly Resolves Performant Search Query', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
          {
            searchResult: search(input: {
                keywords: [],
                filters: [ { property: "cluster", values: ["cluster1"]}]}){
              items
              related {
                kind
                items
              }
            }
          }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
  test('Correctly Resolves SearchSchema Query', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
          {
            searchSchema
          }
        `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
  test('Correctly Resolves SearchComplete Query', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
          {
            searchComplete(property:"kind", query: {keywords:[], filters:[]})
          }
        `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
  test('Correctly Resolves SearchComplete Query With Filters', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
          {
            searchComplete(property:"storage", query: {keywords:[], filters:[{property:"kind", values:"cluster"}]})
          }
        `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
  test('Correctly Resolves SearchComplete Query With No Params', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
          {
            searchComplete(property:"kind")
          }
        `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
});
//# sourceMappingURL=search.test.js.map