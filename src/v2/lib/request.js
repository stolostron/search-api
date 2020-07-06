/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import { HttpsAgent } from 'agentkeepalive';
import logger from './logger';

const httpsAgent = new HttpsAgent({
  keepAlive: true,
  timeout: 1000 * 60 * 5,
  freeSocketTimeout: 1000 * 60 * 3, // Keep connections alive longer than the cache.
});

function retryStrategy(err, response /* body, options */) {
  // retry the request if we had an error or if the response was "429 - too many requests"
  const retry = !!err || response.statusCode === 429;
  if (retry) {
    logger.warn('Retrying kube-api request.');
  }
  return retry;
}

const request = require('requestretry').defaults({
  agent: httpsAgent,
  json: true,
  maxAttempts: 5,
  strictSSL: false,
  retryDelay: 1000,
  retryStrategy,
});

export default request;
