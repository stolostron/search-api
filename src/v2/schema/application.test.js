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
    // TODO - Include policy in test query
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
          {
            applications {
              uid
              name
              namespace
              clusters {
                uid
                name
                namespace
              }
              managedSubscriptions {
                uid
                name
                namespace
              }
              policies {
                uid
                name
                namespace
              }
              created
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
