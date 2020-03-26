'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

describe('Application Resolver', () => {
  test('Correctly Resolves Application Query', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
        {
          applications {
            _uid
            clusterCount
            created
            dashboard
            name
            namespace
            selfLink
            podStatusCount
            remoteSubscriptionStatusCount
            hubSubscriptions {
              _uid
              status
              channel
            }
          }
        }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });

  test('Correctly Resolves Single Application', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
        {
          applications (namespace: "test", name: "app02") {
            _uid
            clusterCount
            created
            dashboard
            name
            namespace
            selfLink
            podStatusCount
            remoteSubscriptionStatusCount
            hubSubscriptions {
              _uid
              status
              channel
            }
          }
        }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });

  test('Ignores filters when only name or namespace is passed.', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
        {
          applications (name: "app02") {
            _uid
            name
          }
        }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
});

describe('Global Application Resolver', () => {
  test('Correctly Resolves Global Application Data', done => {
    (0, _supertest2.default)(_index2.default).post(_index.GRAPHQL_PATH).send({
      query: `
        {
          globalAppData {
            channelsCount
            clusterCount
            hubSubscriptionCount
            remoteSubscriptionStatusCount
          }
        }
      `
    }).end((err, res) => {
      expect(JSON.parse(res.text)).toMatchSnapshot();
      done();
    });
  });
});
//# sourceMappingURL=application.test.js.map