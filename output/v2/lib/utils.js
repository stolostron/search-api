"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRequired = isRequired;
/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

function isRequired(paramName) {
  throw new Error(`${paramName} is required`);
}

exports.default = {};
//# sourceMappingURL=utils.js.map