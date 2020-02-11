/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import supertest from 'supertest';
import server, { GRAPHQL_PATH } from '../index';

describe('Application Resolver', () => {
  test('Correctly Resolves Application Query', (done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
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
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  });

  test('Correctly Resolves Single Application', (done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
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
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  });

  test('Ignores filters when only name or namespace is passed.', (done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          applications (name: "app02") {
            _uid
            name
          }
        }
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  });
});

describe('Global Application Resolver', () => {
  test('Correctly Resolves Global Application Data', (done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          globalAppData {
            channelsCount
            clusterCount
            hubSubscriptionCount
            remoteSubscriptionStatusCount
          }
        }
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  });
});
