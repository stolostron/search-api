'use strict';

var _errors = require('./errors');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

describe('Errors', () => {
  test('Test Authentication Error', _asyncToGenerator(function* () {
    expect(_errors.AuthenticationError).toMatchSnapshot();
  }));
  test('Test Generic Error', _asyncToGenerator(function* () {
    expect(_errors.GenericError).toMatchSnapshot();
  }));
  test('Test Network Error', _asyncToGenerator(function* () {
    expect(_errors.NetworkError).toMatchSnapshot();
  }));
});
//# sourceMappingURL=errors.test.js.map