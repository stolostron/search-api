/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import supertest from 'supertest';
import server, { GRAPHQL_PATH } from '../index';

describe.skip('Overview Resolver', () => {
  test('Correctly Resolves Overview Query', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
        overview {
          clusters {
            metadata {
              name
              namespace
              labels
              uid
            }
            capacity {
              cpu
              memory
            }
            allocatable {
              cpu
              memory
            }
            consoleURL
            status
          }
          applications {
            metadata {
              name
              namespace
            }
            raw
            selector
          }
          compliances {
            metadata {
              name
              namespace
            }
            raw
          }
          timestamp
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
