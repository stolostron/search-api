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
  if (err) {
    logger.warn(`Retrying kube-api request. Error was: ${err}`);
  } else if (response.statusCode === 429) {
    logger.warn(`Retrying kube-api request. Response code was: ${response.statusCode}`);
  }
  return retry;
}

const request = require('requestretry').defaults({
  agent: httpsAgent,
  httpsAgent,
  json: true,
  maxAttempts: 10,
  strictSSL: false,
  retryDelay: 500,
  retryStrategy,
});

console.log('Request >>>>', request.Request); // eslint-disable-line no-console
console.log('\nRequest.options >>>>', request.Request.options); // eslint-disable-line no-console
console.log('\nRequest.defaults >>>>', request.Request.defaults); // eslint-disable-line no-console
request.Request.options.HttpsAgent = httpsAgent;
request.Request.defaults.HttpsAgent = httpsAgent;
request.Request.options.agent = httpsAgent;
request.Request.defaults.agent = httpsAgent;

export default request;
