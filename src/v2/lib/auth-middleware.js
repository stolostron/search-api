/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import _ from 'lodash';
import lru from 'lru-cache';
import jws from 'jws';
import config from '../../../config';
import IDConnector from '../connectors/idmgmt';
import createMockIAMHTTP from '../mocks/iam-http';
import request from './request';

// Async middleware error handler
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

async function getKubeToken({
  authorization,
  cache,
  httpLib,
  shouldLocalAuth,
}) {
  let idToken;
  if ((_.isEmpty(authorization) && shouldLocalAuth) || process.env.MOCK === 'true') {
    // special case for graphiql to work locally
    // do not exchange for idtoken since authorization header is empty
    idToken = config.get('localKubeToken') || 'localdev';
  } else {
    const accessToken = authorization.substring(7);
    idToken = cache.get(accessToken);
    if (!idToken) {
      const options = {
        url: `${config.get('PLATFORM_IDENTITY_PROVIDER_URL')}/v1/auth/exchangetoken`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        json: true,
        form: {
          access_token: accessToken,
        },
      };

      const response = await httpLib(options);
      idToken = _.get(response, 'body.id_token');
      if (idToken) {
        cache.set(accessToken, idToken);
      } else {
        throw new Error(`Authentication error: ${response.body}`);
      }
    }
  }

  return idToken;
}

async function getNamespaces({ iamToken, user }) {
  const options = { iamToken };
  if (process.env.NODE_ENV === 'test') {
    options.httpLib = createMockIAMHTTP();
  }

  const idConnector = new IDConnector(options);

  return idConnector.get(`/identity/api/v1/users/${user}/getTeamResources?resourceType=namespace`);
}

export default function createAuthMiddleWare({
  cache = lru({
    max: 1000,
    maxAge: 60 * 60 * 1000, // 1hr
  }),
  httpLib = request,
  shouldLocalAuth,
} = {}) {
  return asyncMiddleware(async (req, res, next) => {
    const idToken = await getKubeToken({
      authorization: req.headers.authorization || req.headers.Authorization,
      cache,
      httpLib,
      shouldLocalAuth,
    });

    req.kubeToken = `Bearer ${idToken}`;

    const iamToken = _.get(req, "cookies['cfc-access-token-cookie']") || config.get('cfc-access-token-cookie');
    let userName = _.get(jws.decode(idToken), 'payload.uniqueSecurityName');
    if (process.env.NODE_ENV === 'test' || process.env.MOCK === 'true') {
      userName = 'admin_test';
    }
    // special case for redhat openshift, can't get user from idtoken
    if (!userName) {
      const options = {
        url: `${config.get('PLATFORM_IDENTITY_PROVIDER_URL')}/v1/auth/userinfo`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        json: true,
        form: {
          access_token: iamToken,
        },
      };

      const response = await httpLib(options);
      userName = _.get(response, 'body.name');
      if (!userName) {
        throw new Error(`Authentication error: ${response.body}`);
      }
    }

    req.user = {
      name: userName,
      namespaces: await getNamespaces({
        // cookies field doesn't exist on test case requests
        iamToken,
        user: userName,
      }),
    };

    next();
  });
}
