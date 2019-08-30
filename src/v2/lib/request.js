/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import { HttpsAgent } from 'agentkeepalive';

const httpsAgent = new HttpsAgent({
  keepAlive: true,
  timeout: 1000 * 60 * 5,
  freeSocketTimeout: 1000 * 60 * 3, // Keep connections alive longer than the cache.
});

const request = require('requestretry').defaults({
  agent: httpsAgent,
  json: true,
  maxAttempts: 1,
  strictSSL: false,
});

export default request;
