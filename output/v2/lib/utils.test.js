'use strict';

var _utils = require('./utils');

describe('Utils', () => {
  test('Test Utils isRequired Returns Error', () => {
    expect(() => (0, _utils.isRequired)('testParam')).toThrow(Error);
  });
}); /** *****************************************************************************
     * Licensed Materials - Property of IBM
     * (c) Copyright IBM Corporation 2019. All Rights Reserved.
     *
     * Note to U.S. Government Users Restricted Rights:
     * Use, duplication or disclosure restricted by GSA ADP Schedule
     * Contract with IBM Corp.
     ****************************************************************************** */
//# sourceMappingURL=utils.test.js.map