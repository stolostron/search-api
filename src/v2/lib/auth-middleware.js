/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import fs from 'fs';
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

// Get a Kubernetes token from the authorization token.
// - When the actor is a user we receive an access_token, and exchange it for an id_token.
// - When the actor is a service id, there isn't a Kubernetes token, so we use the
//   service account token. This is only possible if the service id role is ClusterAdmin.
async function getKubeToken({
  authorization,
  cache,
  httpLib,
  shouldLocalAuth,
}) {
  if ((_.isEmpty(authorization) && shouldLocalAuth) || process.env.MOCK === 'true') {
    // special case for graphiql to work locally
    // do not exchange for idtoken since authorization header is empty
    return config.get('localKubeToken') || 'localdev';
  }
  const authToken = authorization.substring(7);

  // If we have a kube token in the cache, then we use it.
  let kubeToken = cache.get(authToken);
  if (kubeToken) {
    return kubeToken;
  }

  // Check if the auth token is from a service ID.  We can find out by decoding the JWT token.
  const tokenPayload = _.get(jws.decode(authToken), 'payload');
  if (tokenPayload) {
    const tokenType = JSON.parse(tokenPayload).sub_type;

    if (tokenType === 'ServiceId') {
      // Service IDs don't have a Kubernetes token. Since we need a kubernetes token to continue,
      // we can use the service account token. This token has admin privileges, so we need to
      // check the service account highest role before continuing.
      const idmgmtConnector = new IDConnector({ iamToken: authToken });
      const highestRole = await idmgmtConnector.get('/identity/api/v1/teams/highestRole');

      if (highestRole === 'ClusterAdministrator') {
        // When running on a cluster we use the serviceaccount token is at this location.
        // For local development/testing we'll use the localKubeToken env.
        kubeToken = process.env.localKubeToken || fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
        cache.set(authToken, kubeToken);
        return kubeToken;
      }

      throw new Error(`When authenticating with a service id, the role must be a ClusterAdministrator. This service id role is ${highestRole}`);
    }
  }

  // When the actor of the request is a user we get an access_token from the UI, which needs
  // to be exchanged for an id_token to make kube requests.
  const options = {
    url: `${config.get('PLATFORM_IDENTITY_PROVIDER_URL')}/v1/auth/exchangetoken`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    json: true,
    form: {
      access_token: authToken,
    },
  };

  const response = await httpLib(options);
  kubeToken = _.get(response, 'body.id_token');
  if (kubeToken) {
    cache.set(authToken, kubeToken);
  } else {
    throw new Error(`Authentication error: ${JSON.stringify(response.body)}`);
  }

  return kubeToken;
}

// Get the namespaces authorized for the access_token.
// accessToken - could be from a user or service id.
// accountId - optional to filter namespaces by account id.
async function getNamespaces({ accessToken, accountId }) {
  const options = { iamToken: accessToken };
  if (process.env.NODE_ENV === 'test') {
    options.httpLib = createMockIAMHTTP();
  }

  const idmgmtConnector = new IDConnector(options);

  return idmgmtConnector.get(`/identity/api/v1/teams/resources?resourceType=namespace${accountId ? `&accountId=${accountId}` : ''}`);
}


// Middleware to:
// - Set namespaces to filter this request.
// - Set token for kubernetes requests.
export default function createAuthMiddleWare({
  cache = lru({
    max: 1000,
    maxAge: 2 * 60 * 1000, // 2 mins. Must keep low because user's permissions can change.
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

    const accessToken = _.get(req, "cookies['cfc-access-token-cookie']") || config.get('cfc-access-token-cookie') ||
      (req.headers.authorization && req.headers.authorization.substring(7));

    // Get the namespaces for the user.
    // We cache the promise to prevent starting the same request multiple times.
    let nsPromise = cache.get(`namespaces_${accessToken}`);
    if (!nsPromise) {
      nsPromise = getNamespaces({
        accessToken,
        accountId: req.headers && req.headers.accountid,
      });
      cache.set(`namespaces_${accessToken}`, nsPromise);
    }

    req.user = {
      namespaces: await nsPromise,
      accessToken,
    };

    next();
  });
}
