'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = _log4js2.default.getLogger('server'); /** *****************************************************************************
                                                      * Licensed Materials - Property of IBM
                                                      * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                      *
                                                      * Note to U.S. Government Users Restricted Rights:
                                                      * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                      * Contract with IBM Corp.
                                                      ****************************************************************************** */

const log4jsConfig = process.env.LOG4JS_CONFIG ? JSON.parse(process.env.LOG4JS_CONFIG) : undefined;
_log4js2.default.configure(log4jsConfig || 'config/log4js.json');

logger.perfLog = (startTime, timeLimit, functionName, suppMessage) => {
  const stopTime = Date.now();
  if (stopTime - startTime > timeLimit) {
    logger.warn(`Search ${functionName} took ${stopTime - startTime} ms.${suppMessage ? ` ${suppMessage}` : ''}`);
  }
};

exports.default = logger;
//# sourceMappingURL=logger.js.map