'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationError = exports.NetworkError = exports.GenericError = undefined;

var _apolloErrors = require('apollo-errors');

const GenericError = exports.GenericError = (0, _apolloErrors.createError)('GenericError', {
  message: 'A generic error has occurred' // TODO: NLS
}); /** *****************************************************************************
     * Licensed Materials - Property of IBM
     * (c) Copyright IBM Corporation 2019. All Rights Reserved.
     *
     * Note to U.S. Government Users Restricted Rights:
     * Use, duplication or disclosure restricted by GSA ADP Schedule
     * Contract with IBM Corp.
     ****************************************************************************** */

const NetworkError = exports.NetworkError = (0, _apolloErrors.createError)('NetworkError', {
  message: 'A network error has occurred' // TODO: NLS
});

const AuthenticationError = exports.AuthenticationError = (0, _apolloErrors.createError)('AuthenticationError', {
  message: 'An AuthenticationError error has occurred' // TODO: NLS
});
//# sourceMappingURL=errors.js.map