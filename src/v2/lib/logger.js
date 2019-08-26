/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import log4js from 'log4js';

const logger = log4js.getLogger('server');

const log4jsConfig = process.env.LOG4JS_CONFIG ? JSON.parse(process.env.LOG4JS_CONFIG) : undefined;
log4js.configure(log4jsConfig || 'config/log4js.json');

logger.perfLog = (startTime, timeLimit, functionName, suppMessage) => {
  const stopTime = Date.now();
  if (stopTime - startTime > timeLimit) {
    logger.warn(`Search ${functionName} took ${stopTime - startTime} ms.${(suppMessage) ? ` ${suppMessage}` : ''}`);
  }
};

export default logger;
