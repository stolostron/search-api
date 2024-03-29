/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import { AuthenticationError, GenericError, NetworkError } from './errors';

describe('Errors', () => {
  test('Authentication Error', async () => {
    expect(AuthenticationError).toMatchSnapshot();
  });
  test('Generic Error', async () => {
    expect(GenericError).toMatchSnapshot();
  });
  test('Network Error', async () => {
    expect(NetworkError).toMatchSnapshot();
  });
});
