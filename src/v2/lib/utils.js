/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
import fs from 'fs';
import logger from './logger';

export function isRequired(paramName) {
  throw new Error(`${paramName} is required`);
}

export function getServiceAccountToken() {
  try {
    return process.env.SERVICEACCT_TOKEN !== ''
      ? process.env.SERVICEACCT_TOKEN
      : fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
  } catch (err) {
    logger.error('Error reading service account token', err && err.message);
    return null;
  }
}

export default {};
