/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import _ from 'lodash';
import fs from 'fs';
import redis from 'redis';
import dns from 'dns';
import { Graph } from 'redisgraph.js';
import moment from 'moment';
import config from '../../../config';
import logger from '../lib/logger';
import { isRequired } from '../lib/utils';
import pollRbacCache, { getUserRbacFilter } from '../lib/rbacCaching';

export function getPropertiesWithList() {
  return ['label', 'role', 'port', 'container'];
}

// Is there a more efficient way?
export function formatResult(results, removePrefix = true) {
  const startTime = Date.now();
  const resultList = [];
  while (results.hasNext()) {
    let resultItem = {};
    const record = results.next();
    record.keys().forEach((key) => {
      if (record.get(key) !== null) {
        if (removePrefix) {
          if (record.get(key).properties !== null && record.get(key).properties !== undefined) {
            resultItem = record.get(key).properties;
            // We need to check each value within the properties list, and then parse them correctly.
            getPropertiesWithList().forEach((val) => {
              if (_.get(resultItem, val) && Array.isArray(_.get(resultItem, val))) {
                resultItem[val] = resultItem[val].join('; ');
              }
            });
          } else {
            resultItem[key.substring(key.indexOf('.') + 1)] = record.get(key);
          }
        } else {
          resultItem[key] = record.get(key);
        }
      }
    });
    resultList.push(resultItem);
  }

  logger.perfLog(startTime, 100, 'formatResult()', `Result set size: ${resultList.length}`);
  if (removePrefix) {
    return _.uniqBy(resultList, (item) => item._uid);
  }
  return resultList;
}

const isNumber = (value) => !Number.isNaN(value * 1);
// TODO: Zack L - Need to come back to this once number values with units are normalized
// const isNumWithChars = (value) => {
//   if (!isNumber(value) && !Number.isNaN(parseInt(value, 10))) {
// eslint-disable-next-line
//     return ['Ei', 'Pi', 'Ti', 'Gi', 'Mi', 'Ki'].findIndex(unit => unit === value.substring(value.length - 2, value.length)) > -1;
//   }
//   return false;
// };
export const isDate = (value) => !isNumber(value) && moment(value, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid();
export const isDateFilter = (value) => ['hour', 'day', 'week', 'month', 'year'].indexOf(value) > -1;
// const isVersion = property.toLowerCase().includes('version');

export function getOperator(value) {
  const match = value.match(/^<=|^>=|^!=|^!|^<|^>|^=]/);
  let operator = (match && match[0]) || '=';
  if (operator === '!' || operator === '!=') {
    operator = '<>';
  }
  return operator;
}

export function getDateFilter(value) {
  const currentTime = Date.now();
  switch (true) {
    case value === 'hour':
      return `> '${new Date(currentTime - 3600000).toISOString()}'`;
    case value === 'day':
      return `> '${new Date(currentTime - 86400000).toISOString()}'`;
    case value === 'week':
      return `> '${new Date(currentTime - 604800000).toISOString()}'`;
    case value === 'month':
      return `> '${new Date(currentTime - 2629743000).toISOString()}'`;
    case value === 'year':
      return `> '${new Date(currentTime - 31556926000).toISOString()}'`;
    default:
      // default to month
      return `> '${new Date(currentTime - 2629743000).toISOString()}'`;
  }
}

export function getFilterString(filters) {
  const filterStrings = [];
  filters.forEach((filter) => {
    // Use OR for filters with multiple values.
    filterStrings.push(`(${filter.values.map((value) => {
      const operatorRemoved = value.replace(/^<=|^>=|^!=|^!|^<|^>|^=/, '');
      if (isNumber(operatorRemoved)) { //  || isNumWithChars(operatorRemoved)
        return `n.${filter.property} ${getOperator(value)} ${operatorRemoved}`;
      }
      if (isDateFilter(value)) {
        return `n.${filter.property} ${getDateFilter(value)}`;
      }
      if (getPropertiesWithList().includes(filter.property)) {
        return `('${operatorRemoved}' IN n.${filter.property})`;
      }
      return `n.${filter.property} ${getOperator(value)} '${operatorRemoved}'`;
    }).join(' OR ')})`);
  });
  const resultString = filterStrings.join(' AND ');
  return resultString;
}

export function getDataFromValueList(valuesList) {
  const data = [];
  valuesList.forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((val) => {
        if (data.indexOf(val) === -1) {
          data.push(val);
        }
      });
    } else {
      data.push(value);
    }
  });
  return data;
}

function getIPvFamily(redisHost) {
  return new Promise((resolve) => {
    dns.lookup(redisHost, (err, address, family) => {
      logger.info('RedisGraph address: %j family: IPv%s', address, family);
      if (family === 6) {
        resolve('IPv6');
      }
      resolve('IPv4');
    });
  });
}

let redisClient;
function getRedisClient() {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    if (redisClient) {
      resolve(redisClient);
      return;
    }

    logger.info('Initializing new Redis client.');

    if (config.get('redisPassword') === '') {
      logger.warn('Starting redis client without authentication. redisPassword was not provided in config.');
      redisClient = redis.createClient(config.get('redisEndpoint'));
    } else if (config.get('redisSSLEndpoint') === '') {
      logger.info('Starting Redis client using endpoint: ', config.get('redisEndpoint'));
      redisClient = redis.createClient(config.get('redisEndpoint'), { password: config.get('redisPassword') });
    } else {
      logger.info('Starting Redis client using SSL endpoint: ', config.get('redisSSLEndpoint'));
      const redisUrl = config.get('redisSSLEndpoint');
      const redisInfo = redisUrl.split(':');
      const redisHost = redisInfo[0];
      const redisPort = redisInfo[1];
      const redisCert = fs.readFileSync(process.env.redisCert || './rediscert/redis.crt', 'utf8');
      const ipFamily = await getIPvFamily(redisHost);
      redisClient = redis.createClient(
        redisPort,
        redisHost,
        {
          auth_pass: config.get('redisPassword'),
          tls: { servername: redisHost, ca: [redisCert] },
          family: ipFamily,
        },
      );
    }

    redisClient.ping((error, result) => {
      if (error) logger.error('Error with Redis SSL connection: ', error);
      else {
        logger.info('Redis SSL connection respone : ', result);
        if (result === 'PONG') {
          resolve(redisClient);
        }
      }
    });

    // Wait until the client connects and is ready to resolve with the connecction.
    redisClient.on('connect', () => {
      logger.info('Redis Client connected.');
    });
    redisClient.on('ready', () => {
      logger.info('Redis Client ready.');
    });

    // Log redis connection events.
    redisClient.on('error', (error) => {
      logger.info('Error with Redis connection: ', error);
    });
    redisClient.on('end', (msg) => {
      logger.info('The Redis connection has ended.', msg);
    });
  });
}

// Skip while running tests until we can mock Redis.
if (process.env.NODE_ENV !== 'test') {
  // Initializes the Redis client on startup.
  getRedisClient();
  // Check if user access has changed for any logged in user - if so remove them from the cache so the rbac string is regenerated
  pollRbacCache();
}

// Applications queries are only interested in resources on the local cluster, in the appropriate API group
const APPLICATION_MATCH = "(app:Application {cluster: 'local-cluster', apigroup: 'app.k8s.io'})";
const SUBSCRIPTION_MATCH = "(sub:Subscription {cluster: 'local-cluster', apigroup: 'apps.open-cluster-management.io'})";
const PLACEMENTRULE_MATCH = "(pr:PlacementRule {cluster: 'local-cluster', apigroup: 'apps.open-cluster-management.io'})";
const CHANNEL_MATCH = "(ch:Channel {cluster: 'local-cluster', apigroup: 'apps.open-cluster-management.io'})";

export default class RedisGraphConnector {
  constructor({
    rbac = isRequired('rbac'),
    req = isRequired('req'),
  } = {}) {
    this.rbac = rbac;
    this.req = req;
  }

  async isServiceAvailable() {
    await getRedisClient();
    if (this.g === undefined && redisClient) {
      this.g = new Graph('search-db', redisClient);
    }
    return redisClient.connected && redisClient.ready;
  }

  async getRbacValues() {
    const startTime = Date.now();
    const { allowedResources, allowedNS } = await getUserRbacFilter(this.req);
    logger.perfLog(startTime, 1000, 'getRbacValues()');
    return { allowedResources, allowedNS };
  }

  async createWhereClause(filters, aliases) {
    let whereClause = '';
    const { allowedResources, allowedNS } = await this.getRbacValues();
    let withClause = '';
    if (allowedNS.length > 0) {
      withClause = `WITH [${allowedResources}] AS allowedResources, [${allowedNS}] AS allowedNS`;
    } else {
      withClause = `WITH [${allowedResources}] AS allowedResources`;
    }
    const whereClauseRbac = aliases.map((alias) => {
      if (allowedNS.length > 0) {
        // When user is allowed to see all resources in a given namespace:
        //  - For hub resources, we use the `namespace` field.
        //  - For managed cluster resources, use the `_clusterNamespace`, which is the namespace where the cluster is mapped on the hub.
        return `${alias}._rbac IN allowedResources OR ((exists(${alias}._hubClusterResource) AND (${alias}.namespace IN allowedNS)) OR (exists(${alias}._clusterNamespace) AND ${alias}._clusterNamespace IN allowedNS))`;
      }
      return `${alias}._rbac IN allowedResources`;
    }).join(' AND ');
    const filterString = getFilterString(filters);
    if (filterString !== '') {
      whereClause = `WHERE ${filterString} AND (${whereClauseRbac})`;
    } else {
      whereClause = `WHERE (${whereClauseRbac})`;
    }
    return { withClause, whereClause };
  }

  /*
   * Execute a redis query and format the result as an array of Object.
   */
  async executeQuery({ query, removePrefix = true, queryName }) {
    await this.isServiceAvailable();
    const startTime = Date.now();
    const result = await this.g.query(query);
    logger.perfLog(startTime, 200, queryName);
    return formatResult(result, removePrefix);
  }

  /*
   * Get Applications.
   */
  async runApplicationsQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['app']);
    const matchClause = `MATCH ${APPLICATION_MATCH} ${whereClause}`;
    const returnClause = 'RETURN DISTINCT app._uid, app.name, app.namespace, app.created, app.dashboard, app.selfLink, app.label ORDER BY app.name, app.namespace ASC';
    const query = `${withClause} ${matchClause} ${returnClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runApplicationsQuery' });
  }

  /*
   * Get a list of applications that have related clusters.
   * NOTE: If an app doesn't have resources in any cluster it won't be in the result.
   *
   * Sample result:
   * [
   *    { 'app._uid': 'local-cluster/12345-67890', local: false, clusterCount: 1 },
   *    { 'app._uid': 'local-cluster/12345-67890', local: true, clusterCount: 1 }
   * ]
   */
  async runAppClustersQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['app', 'cluster']);
    const returnClause = "RETURN DISTINCT app._uid, cluster.name='local-cluster' as local, count(DISTINCT cluster._uid) as clusterCount";
    const query = `
      ${withClause} MATCH ${APPLICATION_MATCH}-[:contains]->(:Subscription)<--(:Subscription)--(cluster:Cluster) ${whereClause} ${returnClause}
      UNION ${withClause} MATCH ${APPLICATION_MATCH}-[:contains]->(:Subscription {cluster: 'local-cluster', localPlacement: 'true',
        apigroup: 'apps.open-cluster-management.io'})--(cluster:Cluster) ${whereClause} ${returnClause}
    `;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runAppClustersQuery' });
  }

  /*
   * Get Applications with their related Hub Subscriptions.
   */
  async runAppHubSubscriptionsQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['app', 'sub']);
    const matchClause = `MATCH ${APPLICATION_MATCH}-[:contains]->${SUBSCRIPTION_MATCH}`;
    const returnClause = 'RETURN app._uid, sub._uid, sub.timeWindow, sub.localPlacement, sub.status, sub.channel, sub.name, sub.namespace';
    const query = `${withClause} ${matchClause} ${whereClause} ${returnClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runAppHubSubscriptionsQuery' });
  }

  /*
   * Get Applications with their related Hub Channels.
   */
  async runAppHubChannelsQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['app', 'sub', 'ch']);
    const matchClause = `${withClause} MATCH ${APPLICATION_MATCH}-[:contains]->${SUBSCRIPTION_MATCH}-[*1]->(ch:Channel)`;
    const returnClause = 'RETURN app._uid, sub._uid, sub.name, sub.namespace, sub._gitbranch, sub._gitpath, sub._gitcommit, sub.package, sub.packageFilterVersion, ch._uid, ch.type, ch.pathname';
    const query = `${matchClause} ${whereClause} ${returnClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runAppHubChannelsQuery' });
  }

  /*
   * Get Subscriptions.
   */
  async runSubscriptionsQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['sub']);
    const matchClause = `MATCH ${SUBSCRIPTION_MATCH} ${whereClause}`;
    const returnClause = 'RETURN DISTINCT sub._uid, sub.name, sub.namespace, sub.created, sub.selfLink, sub.status, sub.channel, sub.timeWindow, sub.localPlacement';
    const orderClause = 'ORDER BY sub.name, sub.namespace ASC';
    const query = `${withClause} ${matchClause} ${returnClause} ${orderClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runSubscriptionsQuery' });
  }

  /*
   * Get a list of subscriptions that have related clusters.
   * NOTE: If a subsciption doesn't have resources in any cluster it won't be in the result.
   *
   * Sample result:
   * [
   *    { 'sub._uid': 'local-cluster/12345-67890', local: false, clusterCount: 1 },
   *    { 'sub._uid': 'local-cluster/12345-67890', local: true, clusterCount: 1 }
   * ]
   */
  async runSubClustersQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['sub', 'cluster']);
    const returnClause = "RETURN DISTINCT sub._uid, cluster.name='local-cluster' as local, count(DISTINCT cluster._uid) as clusterCount";
    const query = `
      ${withClause} MATCH ${SUBSCRIPTION_MATCH}<--(:Subscription)--(cluster:Cluster) ${whereClause} ${returnClause}
      UNION ${withClause} MATCH (sub:Subscription {cluster: 'local-cluster', localPlacement: 'true',
        apigroup: 'apps.open-cluster-management.io'})--(cluster:Cluster) ${whereClause} ${returnClause}
    `;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runSubClustersQuery' });
  }

  /*
   * Get a list of subscriptions that have related applications.
   * NOTE: If a subsciption doesn't have any related applications it won't be in the result.
   *
   * Sample result:
   * [
   *   {sub._uid: 'sub1', count: 3 },
   *   {sub._uid: 'sub2', count: 1 },
   * ]
   */
  async runSubAppsQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['sub', 'app']);
    const matchClause = `MATCH ${SUBSCRIPTION_MATCH}<-[:contains]-${APPLICATION_MATCH} ${whereClause}`;
    const returnClause = 'RETURN DISTINCT sub._uid, count(DISTINCT app._uid) as count';
    const query = `${withClause} ${matchClause} ${returnClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runSubAppsQuery' });
  }

  /*
   * Get PlacementRules.
   */
  async runPlacementRulesQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['pr']);
    const matchClause = `MATCH ${PLACEMENTRULE_MATCH} ${whereClause}`;
    const returnClause = 'RETURN DISTINCT pr._uid, pr.name, pr.namespace, pr.created, pr.selfLink, pr.replicas';
    const orderClause = 'ORDER BY pr.name, pr.namespace ASC';
    const query = `${withClause} ${matchClause} ${returnClause} ${orderClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runPlacementRulesQuery' });
  }

  /*
   * Get a list of placement rules that have related clusters.
   * NOTE: If a placement rule doesn't have any related clusters it won't be in the result.
   *
   * Sample result:
   * [
   *    { 'pr._uid': 'local-cluster/12345-67890', local: false, clusterCount: 1 },
   *    { 'pr._uid': 'local-cluster/12345-67890', local: true, clusterCount: 1 }
   * ]
   */
  async runPRClustersQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['pr', 'sub', 'cluster']);
    const returnClause = "RETURN DISTINCT pr._uid, cluster.name='local-cluster' as local, count(DISTINCT cluster._uid) as clusterCount";
    const query = `
      ${withClause}
      MATCH ${PLACEMENTRULE_MATCH}<-[*1]-${SUBSCRIPTION_MATCH}<--(:Subscription)--(cluster:Cluster)
      ${whereClause} AND NOT exists(sub._hostingSubscription) ${returnClause}
      UNION ${withClause}
      MATCH ${PLACEMENTRULE_MATCH}<-[*1]-(sub:Subscription {cluster: 'local-cluster', localPlacement: 'true', apigroup: 'apps.open-cluster-management.io'})--(cluster:Cluster)
      ${whereClause} AND NOT exists(sub._hostingSubscription) ${returnClause}
    `;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runPRClustersQuery' });
  }

  /*
   * Get Channels.
   */
  async runChannelsQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['ch']);
    const matchClause = `MATCH ${CHANNEL_MATCH} ${whereClause}`;
    const returnClause = 'RETURN DISTINCT ch._uid, ch.name, ch.namespace, ch.created, ch.selfLink, ch.type, ch.pathname';
    const orderClause = 'ORDER BY ch.name, ch.namespace ASC';
    const query = `${withClause} ${matchClause} ${returnClause} ${orderClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runChannelsQuery' });
  }

  /*
   * Get a list of channels that have related subscriptions.
   * NOTE: If a channel doesn't have any related subscriptions it won't be in the result.
   *
   * Sample result:
   * [
   *   {ch._uid: 'ch1', localPlacement: [], count: 2 },
   *   {ch._uid: 'ch2', localPlacement: [true, false], count: 1 },
   * ]
   */
  async runChannelSubsQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['ch', 'sub']);
    const matchClause = `MATCH ${CHANNEL_MATCH}<-[*1]-${SUBSCRIPTION_MATCH}`;
    const returnClause = 'RETURN DISTINCT ch._uid, collect(DISTINCT sub.localPlacement) as localPlacement, count(DISTINCT sub._uid) as count';
    const query = `${withClause} ${matchClause} ${whereClause} AND NOT exists(sub._hostingSubscription) ${returnClause}`;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runChannelSubsQuery' });
  }

  /*
   * Get a list of channels that have related clusters.
   * NOTE: If a channel doesn't have any related subscriptions and clusters, it won't be in the result.
   *
   * Sample result:
   * [
   *    { 'ch._uid': 'local-cluster/12345-67890', local: false, clusterCount: 1 },
   *    { 'ch._uid': 'local-cluster/12345-67890', local: true, clusterCount: 1 }
   * ]
   */
  async runChannelClustersQuery() {
    const { withClause, whereClause } = await this.createWhereClause([], ['ch', 'sub', 'cluster']);
    const returnClause = "RETURN DISTINCT ch._uid, cluster.name='local-cluster' as local, count(DISTINCT cluster._uid) as clusterCount";
    const query = `
      ${withClause}
      MATCH ${CHANNEL_MATCH}<-[*1]-${SUBSCRIPTION_MATCH}<--(:Subscription)--(cluster:Cluster)
      ${whereClause} AND NOT exists(sub._hostingSubscription) ${returnClause}
      UNION ${withClause}
      MATCH ${CHANNEL_MATCH}<-[*1]-(sub:Subscription {cluster: 'local-cluster', localPlacement: 'true', apigroup: 'apps.open-cluster-management.io'})--(cluster:Cluster)
      ${whereClause} AND NOT exists(sub._hostingSubscription) ${returnClause}
    `;
    return this.executeQuery({ query, removePrefix: false, queryName: 'runChannelClustersQuery' });
  }

  /**
   * TODO: For users less than clusterAdmin we we do not currently handle non-namespaced resources
   * For users with access to >0 namespaces we create an RBAC string for resources user has access
   * For users with access to 0 namespaces we return an empty object
   */

  async runSearchQuery(filters, limit = config.get('defaultQueryLimit'), querySkipIdx = 0) {
    // logger.info('runSearchQuery()', filters);
    const startTime = Date.now();
    if (this.rbac.length > 0) {
      // RedisGraph 2.0 does support an array as value. Therefore, we don't need to
      // encode labels in a single string
      let limitClause = '';
      if (limit > 0) {
        limitClause = querySkipIdx > -1
          ? `SKIP ${querySkipIdx * config.get('defaultQueryLoopLimit')} LIMIT ${config.get('defaultQueryLoopLimit')}`
          : `LIMIT ${limit}`;
      }
      const { withClause, whereClause } = await this.createWhereClause(filters, ['n']);
      const query = `${withClause} MATCH (n) ${whereClause} RETURN n ${limitClause}`;
      const result = await this.g.query(query);
      logger.perfLog(startTime, 150, 'SearchQuery');
      return formatResult(result);
    }
    return [];
  }

  async runSearchQueryCountOnly(filters) {
    // logger.info('runSearchQueryCountOnly()', filters);

    if (this.rbac.length > 0) {
      // RedisGraph 2.0 does support an array as value. Therefore, we don't need to
      // encode labels in a single string
      const { withClause, whereClause } = await this.createWhereClause(filters, ['n']);
      const startTime = Date.now();
      const result = await this.g.query(`${withClause} MATCH (n) ${whereClause} RETURN count(n)`);
      logger.perfLog(startTime, 150, 'runSearchQueryCountOnly()');
      if (result.hasNext() === true) {
        return result.next().get('count(n)');
      }
    }
    return 0;
  }

  async getAllProperties() {
    // logger.info('Getting all properties');

    // Adding these first to rank them higher when showin in UI.
    const values = ['cluster', 'kind', 'label', 'name', 'namespace', 'status'];

    if (this.rbac.length > 0) {
      const startTime = Date.now();
      const result = await this.g.query('CALL db.propertyKeys()');
      logger.perfLog(startTime, 150, 'getAllProperties()');

      result._results.forEach((record) => {
        if (record.values()[0].charAt(0) !== '_' && values.indexOf(record.values()[0]) < 0) {
          values.push(record.values()[0]);
        }
      });
    }
    return values;
  }

  async getAllValues(property, filters = [], limit = config.get('defaultQueryLimit')) {
    // logger.info('Getting all values for property:', property, filters);

    if (property === '') {
      logger.warn('getAllValues() called with empty value. Most likely this was an unecessary API call.');
      return Promise.resolve([]);
    }

    let valuesList = [];
    if (this.rbac.length > 0) {
      const startTime = Date.now();
      const limitClause = limit <= 0 || property === 'label'
        ? ''
        : `LIMIT ${limit}`;
      let f = filters.length > 0 ? filters : [];
      f = filters.filter((filter) => filter.property);
      const { withClause, whereClause } = await this.createWhereClause(f, ['n']);
      const result = await this.g.query(`${withClause} MATCH (n) ${whereClause} RETURN DISTINCT n.${property} ORDER BY n.${property} ASC ${limitClause}`);
      logger.perfLog(startTime, 500, 'getAllValues()');
      result._results.forEach((record) => {
        if (record.values()[0] !== 'NULL' && record.values()[0] !== null) {
          valuesList.push(record.values()[0]);
        }
      });

      if ((getPropertiesWithList()).includes(property)) {
        return getDataFromValueList(valuesList);
      }

      if (isDate(valuesList[0])) {
        return ['isDate'];
      } if (isNumber(valuesList[0])) { //  || isNumWithChars(valuesList[0]))
        valuesList = valuesList.filter((res) => (isNumber(res) || (!isNumber(res))) && res !== '');
        valuesList.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        if (valuesList.length > 1) {
          return ['isNumber', valuesList[0], valuesList[valuesList.length - 1]];
        } if (valuesList.length === 1) {
          return ['isNumber', valuesList[0]];
        }
      }
    }
    return valuesList;
  }

  // WORKAROUND: This function divides the query to prevent hitting the maximum query size. The tradeoff is
  // a slower execution time. Long term we need to replace with a more efficient query or rethink how we enforce
  // rbac. Technical debt being tracked with: https://github.com/stolostron/backlog/issues/6016
  async getRelationshipsWithSeparatedQueryWorkaround(withClause, returnClause) {
    const startTime = Date.now();
    let relatedQueries = [];
    relatedQueries = [
      `${withClause} MATCH (n)-[]-(r) ${returnClause}`,
      `${withClause} MATCH (n:Application)-->(:Subscription)<--(:Subscription)--(r) ${returnClause}`,
      `${withClause} MATCH (r:Application)-->(:Subscription)<--(:Subscription)--(n) ${returnClause}`,
      `${withClause} MATCH (n:Subscription)<--(:Subscription)--(r) ${returnClause}`,
      `${withClause} MATCH (r:Subscription)<--(:Subscription)--(n) ${returnClause}`,
      `${withClause} MATCH (n:Application)-->(:Subscription)--(r) ${returnClause}`,
      `${withClause} MATCH (r:Application)-->(:Subscription)--(n) ${returnClause}`,
    ];
    let results = await Promise.all(relatedQueries.map(async (q) => formatResult(await this.g.query(q))));
    // Compress to a single array (originally an array of arrays)
    results = _.flatten(results);
    // Need to ger rid of duplicate resources
    results = _.uniqBy(results, (item) => item._uid);
    logger.perfLog(startTime, 500, 'findRelationships() - Using separate query workaround');
    return results;
  }

  async findRelationships({ filters = [], countOnly = false, relatedKinds = [] } = {}) {
    const MAX_LENGTH_WITH_CLAUSE = 148500;
    if (this.rbac.length > 0) {
      const { withClause, whereClause } = await this.createWhereClause(filters, ['n', 'r']);
      const startTime = Date.now();
      let query = '';
      let returnClause = '';
      if (relatedKinds.length > 0) {
        const relatedClause = relatedKinds.map((kind) => `r.kind = '${kind}'`).join(' OR ');
        returnClause = `WHERE (${relatedClause}) AND ${whereClause.replace('WHERE ', '')} AND (r._uid <> n._uid) RETURN DISTINCT r`;
      } else {
        returnClause = `${whereClause} AND (r._uid <> n._uid) RETURN DISTINCT ${countOnly ? 'r._uid, r.kind' : 'r'}`;
      }
      // This is tech debt, tracking with: https://github.com/stolostron/backlog/issues/6016
      if (withClause.length > MAX_LENGTH_WITH_CLAUSE) {
        return this.getRelationshipsWithSeparatedQueryWorkaround(withClause, returnClause);
      }
      query = `${withClause} MATCH (n)-[]-(r) ${returnClause}
      UNION ${withClause} MATCH (n:Application)-->(:Subscription)<--(:Subscription)--(r) ${returnClause}
      UNION ${withClause} MATCH (r:Application)-->(:Subscription)<--(:Subscription)--(n) ${returnClause}
      UNION ${withClause} MATCH (n:Subscription)<--(:Subscription)--(r) ${returnClause}
      UNION ${withClause} MATCH (r:Subscription)<--(:Subscription)--(n) ${returnClause}
      UNION ${withClause} MATCH (n:Application)-->(:Subscription)--(r) ${returnClause}
      UNION ${withClause} MATCH (r:Application)-->(:Subscription)--(n) ${returnClause}`;
      const result = await this.g.query(query);
      logger.perfLog(startTime, 300, 'findRelationships()');
      return formatResult(result);
    }
    return [];
  }
}
