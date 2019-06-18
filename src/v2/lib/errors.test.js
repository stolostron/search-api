/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import { AuthenticationError, GenericError, NetworkError } from './errors';

describe('Errors', () => {
  test('Test Authentication Error', async () => {
    expect(AuthenticationError).toMatchSnapshot();
  });
  test('Test Generic Error', async () => {
    expect(GenericError).toMatchSnapshot();
  });
  test('Test Network Error', async () => {
    expect(NetworkError).toMatchSnapshot();
  });
});
