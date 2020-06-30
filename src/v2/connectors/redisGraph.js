/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import fs from 'fs';
import redis from 'redis';
import dns from 'dns';
import { Graph } from 'redisgraph.js';
import moment from 'moment';
import config from '../../../config';
import logger from '../lib/logger';
import { isRequired } from '../lib/utils';
import pollRbacCache, { getUserRbacFilter } from '../lib/rbacCaching';

// FIXME: Is there a more efficient way?
function formatResult(results, removePrefix = true) {
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
const isDate = (value) => !isNumber(value) && moment(value, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid();
const isDateFilter = (value) => ['hour', 'day', 'week', 'month', 'year'].indexOf(value) > -1;
// const isVersion = property.toLowerCase().includes('version');

export function getOperator(value) {
  const match = value.match(/^<=|^>=|^!=|^!|^<|^>|^=]/);
  let operator = (match && match[0]) || '=';
  if (operator === '!') {
    operator = '!=';
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
      } if (isDateFilter(value)) {
        return `n.${filter.property} ${getDateFilter(value)}`;
      }
      return `n.${filter.property} ${getOperator(value)} '${operatorRemoved}'`;
    }).join(' OR ')})`);
  });
  const resultString = filterStrings.join(' AND ');
  return resultString;
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
      this.g = new Graph('icp-search', redisClient);
    }
    return redisClient.connected && redisClient.ready;
  }

  async getRbacString(objAliases = []) {
    const startTime = Date.now();
    const rbacFilter = await getUserRbacFilter(this.req, objAliases);
    logger.perfLog(startTime, 1000, 'getRbacString()');
    return rbacFilter;
  }

  async createWhereClause(filters, aliases) {
    const rbac = await this.getRbacString(aliases);
    const filterString = getFilterString(filters);
    if (rbac !== '') {
      if (filterString !== '') {
        return `WHERE ${filterString} AND ${rbac}`;
      }
      return `WHERE ${rbac}`;
    } if (filterString !== '') {
      return `WHERE ${filterString}`;
    }
    return '';
  }

  /*
   * Execute a redis query and format the result as an array of Object.
   */
  async executeQuery({ query, removePrefix = true }) {
    await this.isServiceAvailable();
    const startTime = Date.now();
    const result = await this.g.query(query);
    logger.perfLog(startTime, 200, query);
    return formatResult(result, removePrefix);
  }

  /*
   * Get Applications.
   */
  async runApplicationsQuery() {
    const whereClause = await this.createWhereClause([], ['app']);
    const query = `MATCH (app:Application) ${whereClause} RETURN DISTINCT app._uid, app.name, app.namespace, app.created, app.dashboard, app.selfLink, app.label ORDER BY app.name ASC`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get a list of applications that have related clusters.
   * NOTE: If an app doesn't have resources in any cluster it won't be in the result.
   *
   * Sample result:
   * [
   *   {app._uid: 'app1', count: 3 },
   *   {app._uid: 'app2', count: 1 },
   * ]
   */
  async runAppClustersQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'cluster']);
    const query = `MATCH (app:Application)<-[{_interCluster:true}]-(cluster:Cluster) ${whereClause} RETURN DISTINCT app._uid, count(cluster._uid) as count`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get Applications with their related Hub Subscriptions.
   */
  async runAppHubSubscriptionsQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'sub']);
    const query = `MATCH (app:Application)-[]->(sub:Subscription) ${whereClause === '' ? 'WHERE' : `${whereClause} AND`} exists(sub._hubClusterResource)=true RETURN app._uid, sub._uid, sub.status, sub.channel`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get Applications with the pods counter
   * return the number of pods for this app as a string, grouped by their status
  */
  async runAppPodsCountQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'pod']);
    const query = `MATCH (app:Application)<-[{_interCluster:true}]-(pod:Pod) ${whereClause} RETURN app._uid, pod._uid, pod.status`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get Applications with their related remote subscriptions.
   # Remote subscriptions are those with the '_hostingSubscription' property.
   */
  async runAppRemoteSubscriptionsQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'sub']);
    const query = `MATCH (app:Application)<-[{_interCluster:true}]-(sub:Subscription) ${whereClause === '' ? 'WHERE' : `${whereClause} AND`} exists(sub._hostingSubscription)=true RETURN app._uid, sub._uid, sub.status`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get clusters related to any application.
   */
  async runGlobalAppClusterCountQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'cluster']);
    const query = `MATCH (app:Application)<-[{_interCluster:true}]-(cluster:Cluster) ${whereClause} RETURN DISTINCT cluster._uid`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get channels related to any application.
   */
  async runGlobalAppChannelsQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'ch']);
    const query = `MATCH (app:Application)<-[]-(ch:Channel) ${whereClause} RETURN DISTINCT ch`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get hub subscriptions related to any application.
   */
  async runGlobalAppHubSubscriptionsQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'sub']);
    const query = `MATCH (app:Application)-[]->(sub:Subscription) ${whereClause === '' ? 'WHERE' : `${whereClause} AND`} exists(sub._hubClusterResource)=true RETURN DISTINCT sub`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /*
   * Get remote subscriptions related to any application.
   */
  async runGlobalAppRemoteSubscriptionsQuery() {
    const whereClause = await this.createWhereClause([], ['app', 'sub']);
    const query = `MATCH (app:Application)<-[{_interCluster:true}]-(sub:Subscription) ${whereClause === '' ? 'WHERE' : `${whereClause} AND`} exists(sub._hostingSubscription)=true RETURN DISTINCT sub`;
    return this.executeQuery({ query, removePrefix: false });
  }

  /**
   * TODO: For users less than clusterAdmin we we do not currently handle non-namespaced resources
   * For users with access to >0 namespaces we create an RBAC string for resources user has access
   * For users with access to 0 namespaces we return an empty object
   */

  async runSearchQuery(filters, limit = config.get('defaultQueryLimit'), querySkipIdx = 0) {
    // logger.info('runSearchQuery()', filters);
    if (this.rbac.length > 0) {
      // RedisGraph 1.0.15 doesn't support an array as value. To work around this limitation we
      // encode labels in a single string. As a result we can't use an openCypher query to search
      // for labels so we need to filter here, which btw is inefficient.
      const labelFilter = filters.find((f) => f.property === 'label');
      if (labelFilter) {
        const whereClause = await this.createWhereClause(filters.filter((f) => f.property !== 'label'), ['n']);
        const startTime = Date.now();
        const query = `MATCH (n) ${whereClause} RETURN n`;
        const result = await this.g.query(query);
        logger.perfLog(startTime, 150, 'LabelSearchQuery');
        return formatResult(result).filter((item) => (item.label && labelFilter.values.find((value) => item.label.indexOf(value) > -1)));
      }
      let limitClause = '';
      if (limit > 0) {
        limitClause = querySkipIdx > -1
          ? `SKIP ${querySkipIdx * config.get('defaultQueryLoopLimit')} LIMIT ${config.get('defaultQueryLoopLimit')}`
          : `LIMIT ${limit}`;
      }
      const whereClause = await this.createWhereClause(filters, ['n']);
      const startTime = Date.now();
      const query = `MATCH (n) ${whereClause} RETURN n ${limitClause}`;
      const result = await this.g.query(query);
      logger.perfLog(startTime, 150, 'SearchQuery');
      return formatResult(result);
    }
    return [];
  }

  async runSearchQueryCountOnly(filters) {
    // logger.info('runSearchQueryCountOnly()', filters);

    if (this.rbac.length > 0) {
      // RedisGraph 1.0.15 doesn't support an array as value. To work around this limitation we
      // encode labels in a single string. As a result we can't use an openCypher query to search
      // for labels so we need to filter here, which btw is inefficient.
      const labelFilter = filters.find((f) => f.property === 'label');
      if (labelFilter) {
        return this.runSearchQuery(filters, -1, -1).then((r) => r.length);
      }
      const whereClause = await this.createWhereClause(filters, ['n']);
      const startTime = Date.now();
      const result = await this.g.query(`MATCH (n) ${whereClause} RETURN count(n)`);
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
      const result = filters.length > 0
        ? await this.g.query(`MATCH (n) ${await this.createWhereClause(filters, ['n'])} RETURN DISTINCT n.${property} ORDER BY n.${property} ASC ${limitClause}`)
        : await this.g.query(`MATCH (n) ${await this.createWhereClause([], ['n'])} RETURN DISTINCT n.${property} ORDER BY n.${property} ASC ${limitClause}`);
      logger.perfLog(startTime, 500, 'getAllValues()');
      result._results.forEach((record) => {
        if (record.values()[0] !== 'NULL' && record.values()[0] !== null) {
          valuesList.push(record.values()[0]);
        }
      });

      // RedisGraph 1.0.15 doesn't support an array as value. To work around this limitation we
      // encode labels in a single string. Here we need to decode the string to get all labels.
      if (property === 'label') {
        const labels = [];
        valuesList.forEach((value) => {
          value.split('; ').forEach((label) => {
            // We don't want duplicates, so we check if it already exists.
            if (labels.indexOf(label) === -1) {
              labels.push(label);
            }
          });
        });
        return labels;
      }
      if (isDate(valuesList[0])) {
        return ['isDate'];
      } if (isNumber(valuesList[0])) { //  || isNumWithChars(valuesList[0]))
        valuesList = valuesList.filter((res) => (isNumber(res) || (!isNumber(res))) && res !== ''); //  && isNumWithChars(res)
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

  async findRelationships({ filters = [], countOnly = false, relatedKinds = [] } = {}) {
    if (this.rbac.length > 0) {
      const whereClause = await this.createWhereClause(filters, ['n', 'r']);
      const startTime = Date.now();

      let query = '';
      if (relatedKinds.length > 0) {
        const relatedClause = relatedKinds.map((kind) => `r.kind = '${kind}'`).join(' OR ');
        query = `MATCH (n)-[]-(r) WHERE (${relatedClause}) AND ${whereClause.replace('WHERE ', '')} RETURN DISTINCT r`;
      } else {
        query = `MATCH (n)-[]-(r) ${whereClause} RETURN DISTINCT ${countOnly ? 'r._uid, r.kind' : 'r'}`;
      }

      logger.perfLog(startTime, 300, 'findRelationships()');
      return formatResult(await this.g.query(query));
    }
    return [];
  }
}
