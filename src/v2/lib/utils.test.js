/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright Contributors to the Open Cluster Management project

import { isRequired } from './utils';

describe('Utils', () => {
  test('Test Utils isRequired Returns Error', () => {
    expect(() => isRequired('testParam')).toThrow(Error);
  });
});
