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
  test('Correctly Resolves Application Query', () => new Promise((done) => {
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
            labels
            name
            namespace
            selfLink
            podStatusCount
            remoteSubscriptionStatusCount
            hubSubscriptions {
              _uid
              timeWindow
              localPlacement
              status
              channel
            }
            hubChannels
          }
        }
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Correctly Resolves Single Application', () => new Promise((done) => {
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
            labels
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
  }));

  test('Ignores filters when only name or namespace is passed.', () => new Promise((done) => {
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
  }));
});

describe('Placement Rule Resolver', () => {
  test('Correctly Resolves Placement Rules Query', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          placementRules {
            _uid
            name
            namespace
            created
            selfLink
            clusterCount
            replicas
          }
        }
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Correctly Resolves Single Placement Rule', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          placementRules(namespace: "applications", name: "pr01") {
            _uid
            name
            namespace
            created
            selfLink
            clusterCount
            replicas
          }
        }
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Ignores filters when only name or namespace is passed.', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          placementRules (name: "sub02") {
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
  }));
});

describe('Subscription Resolver', () => {
  test('Correctly Resolves Subscriptions Query', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          subscriptions {
            _uid
            name
            namespace
            created
            selfLink
            timeWindow
            localPlacement
            status
            channel
            appCount
            clusterCount
          }
        }
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Correctly Resolves Single Subscription', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
      {
        subscriptions(namespace: "test", name: "sub02") {
          _uid
          name
          namespace
          created
          selfLink
          timeWindow
          localPlacement
          status
          channel
          appCount
          clusterCount
        }
      }
    `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Ignores filters when only name or namespace is passed.', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
      {
        subscriptions (name: "sub02") {
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
  }));
});

describe('Global Application Resolver', () => {
  test('Correctly Resolves Global Application Data', () => new Promise((done) => {
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
  }));
});
