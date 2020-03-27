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
import config from '../../../config';
import createMockIAMHTTP from '../mocks/iam-http';
import request from './request';
import { getServiceAccountToken } from '../lib/utils';

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
  shouldLocalAuth,
}) {
  if ((_.isEmpty(authorization) && shouldLocalAuth) || process.env.MOCK === 'true') {
    // special case for graphiql to work locally
    // do not exchange for idtoken since authorization header is empty
    return process.env.SERVICEACCT_TOKEN || 'localdev';
  }
  const idToken = authorization.replace('Bearer ', '');
  if (!idToken) {
    throw new Error('Authentication error: invalid token parsed from cookie');
  }

  return idToken;
}

// Get the namespaces authorized for the access_token.
// usertoken - could be from a user or service id.
async function getNamespaces(usertoken) {
  const options = {
    url: `${config.get('API_SERVER_URL')}/apis/project.openshift.io/v1/projects`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${usertoken}`,
    },
    json: true,
    fullResponse: false,
  };
  if (process.env.NODE_ENV === 'test') {
    const mockReq = createMockIAMHTTP();
    return mockReq(options);
  }
  const nsResponse = await request(options);
  return Array.isArray(nsResponse.items) ? nsResponse.items.map(ns => ns.metadata.name) : [];
}

async function getUsername(token) {
  const serviceaccountToken = getServiceAccountToken();
  const options = {
    url: `${config.get('API_SERVER_URL')}/apis/authentication.k8s.io/v1/tokenreviews`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${serviceaccountToken}`,
    },
    method: 'POST',
    json: true,
    body: {
      apiVersion: 'authentication.k8s.io/v1',
      kind: 'TokenReview',
      spec: {
        token,
      },
    },
  };

  if (process.env.NODE_ENV === 'test') {
    const mockReq = createMockIAMHTTP();
    return mockReq(options);
  }
  const userNameResponse = await request(options);
  return _.get(userNameResponse, 'body.status.user.username');
}

// Middleware to:
// - Set namespaces to filter this request.
// - Set user for the request
// - Set token for kubernetes requests.
export default function createAuthMiddleWare({
  cache = lru({
    max: 1000,
    maxAge: 2 * 60 * 1000, // 2 mins. Must keep low because user's permissions can change.
  }),
  shouldLocalAuth,
} = {}) {
  return asyncMiddleware(async (req, res, next) => {
    const idToken = await getKubeToken({
      authorization: req.headers.authorization || req.headers.Authorization,
      shouldLocalAuth,
    });
    req.kubeToken = idToken;
    // Get the namespaces for the user.
    // We cache the promise to prevent starting the same request multiple times.
    let nsPromise = cache.get(`namespaces_${idToken}`);
    if (!nsPromise) {
      nsPromise = getNamespaces(idToken);
      cache.set(`namespaces_${idToken}`, nsPromise);
    }

    let userNamePromise = cache.get(`userName_${idToken}`);
    if (!userNamePromise) {
      userNamePromise = getUsername(idToken);
      cache.set(`userName_${idToken}`, userNamePromise);
    }

    req.user = {
      name: await userNamePromise,
      namespaces: await nsPromise,
      idToken,
    };

    next();
  });
}
