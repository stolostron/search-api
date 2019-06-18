/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import { mockServer } from 'graphql-tools';
import { typeDefs } from './index';

describe('Schema', () => {
  test('has valid type definitions', async () => {
    const MockServer = mockServer(typeDefs);
    const result = await MockServer.query('{ __schema { types { name } } }');
    expect(result.errors).not.toBeDefined();
    // eslint-disable-next-line no-underscore-dangle
    expect(result.data.__schema.types).toBeInstanceOf(Array);
  });
});

