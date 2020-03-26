'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperator = getOperator;
exports.getDateFilter = getDateFilter;
exports.getFilterString = getFilterString;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _redisgraph = require('redisgraph.js');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _utils = require('../lib/utils');

var _rbacCaching = require('../lib/rbacCaching');

var _rbacCaching2 = _interopRequireDefault(_rbacCaching);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */


// FIXME: Is there a more efficient way?
function formatResult(results, removePrefix = true) {
  const startTime = Date.now();
  const resultList = [];
  while (results.hasNext()) {
    const resultItem = {};
    const record = results.next();
    record.keys().forEach(key => {
      if (record.get(key) !== null) {
        if (removePrefix) {
          resultItem[key.substr(key.indexOf('.') + 1)] = record.get(key);
        } else {
          resultItem[key] = record.get(key);
        }
      }
    });
    resultList.push(resultItem);
  }
  _logger2.default.perfLog(startTime, 100, 'formatResult()', `Result set size: ${resultList.length}`);
  return resultList;
}

const isNumber = value => !Number.isNaN(value * 1);
// TODO: Zack L - Need to come back to this once number values with units are normalized
// const isNumWithChars = (value) => {
//   if (!isNumber(value) && !Number.isNaN(parseInt(value, 10))) {
// eslint-disable-next-line
//     return ['Ei', 'Pi', 'Ti', 'Gi', 'Mi', 'Ki'].findIndex(unit => unit === value.substring(value.length - 2, value.length)) > -1;
//   }
//   return false;
// };
const isDate = value => !isNumber(value) && (0, _moment2.default)(value, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid();
const isDateFilter = value => ['hour', 'day', 'week', 'month', 'year'].indexOf(value) > -1;
// const isVersion = property.toLowerCase().includes('version');

function getOperator(value) {
  const match = value.match(/^<=|^>=|^!=|^!|^<|^>|^=]/);
  let operator = match && match[0] || '=';
  if (operator === '!') {
    operator = '!=';
  }
  return operator;
}

function getDateFilter(value) {
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

function getFilterString(filters) {
  const filterStrings = [];
  filters.forEach(filter => {
    // Use OR for filters with multiple values.
    filterStrings.push(`(${filter.values.map(value => {
      const operatorRemoved = value.replace(/^<=|^>=|^!=|^!|^<|^>|^=/, '');
      if (isNumber(operatorRemoved)) {
        //  || isNumWithChars(operatorRemoved)
        return `n.${filter.property} ${getOperator(value)} ${operatorRemoved}`;
      } else if (isDateFilter(value)) {
        return `n.${filter.property} ${getDateFilter(value)}`;
      }
      return `n.${filter.property} ${getOperator(value)} '${operatorRemoved}'`;
    }).join(' OR ')})`);
  });
  const resultString = filterStrings.join(' AND ');
  return resultString;
}

let redisClient;
function getRedisClient() {
  return new Promise(resolve => {
    if (redisClient) {
      resolve(redisClient);
      return;
    }

    _logger2.default.info('Initializing new Redis client.');

    if (_config2.default.get('redisPassword') === '') {
      _logger2.default.warn('Starting redis client without authentication. redisPassword was not provided in config.');
      redisClient = _redis2.default.createClient(_config2.default.get('redisEndpoint'));
    } else if (_config2.default.get('redisSSLEndpoint') === '') {
      _logger2.default.info('Starting Redis client using endpoint: ', _config2.default.get('redisEndpoint'));
      redisClient = _redis2.default.createClient(_config2.default.get('redisEndpoint'), { password: _config2.default.get('redisPassword') });
    } else {
      _logger2.default.info('Starting Redis client using SSL endpoint: ', _config2.default.get('redisSSLEndpoint'));
      const redisUrl = _config2.default.get('redisSSLEndpoint');
      const redisInfo = redisUrl.split(':');
      const redisHost = redisInfo[0];
      const redisPort = redisInfo[1];
      const redisCert = _fs2.default.readFileSync(process.env.redisCert || './rediscert/redis.crt', 'utf8');
      redisClient = _redis2.default.createClient(redisPort, redisHost, { auth_pass: _config2.default.get('redisPassword'), tls: { servername: redisHost, ca: [redisCert] } });
      redisClient.ping((error, result) => {
        if (error) _logger2.default.error('Error with Redis SSL connection: ', error);else {
          _logger2.default.info('Redis SSL connection respone : ', result);
          if (result === 'PONG') {
            resolve(redisClient);
          }
        }
      });
    }

    // Wait until the client connects and is ready to resolve with the connecction.
    redisClient.on('connect', () => {
      _logger2.default.info('Redis Client connected.');
    });
    redisClient.on('ready', () => {
      _logger2.default.info('Redis Client ready.');
      resolve(redisClient);
    });

    // Log redis connection events.
    redisClient.on('error', error => {
      _logger2.default.info('Error with Redis connection: ', error);
    });
    redisClient.on('end', msg => {
      _logger2.default.info('The Redis connection has ended.', msg);
    });
  });
}

// Skip while running tests until we can mock Redis.
if (process.env.NODE_ENV !== 'test') {
  // Initializes the Redis client on startup.
  getRedisClient();
  // Check if user access has changed for any logged in user - if so remove them from the cache so the rbac string is regenerated
  (0, _rbacCaching2.default)();
}

class RedisGraphConnector {
  constructor({
    rbac = (0, _utils.isRequired)('rbac'),
    req = (0, _utils.isRequired)('req')
  } = {}) {
    this.rbac = rbac;
    this.req = req;
  }

  isServiceAvailable() {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield getRedisClient();
      if (_this.g === undefined && redisClient) {
        _this.g = new _redisgraph.RedisGraph('icp-search', redisClient);
      }
      return redisClient.connected && redisClient.ready;
    })();
  }

  getRbacString(objAliases = []) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const startTime = Date.now();
      const rbacFilter = yield (0, _rbacCaching.getUserRbacFilter)(_this2.req, objAliases);
      if (rbacFilter.includes(`${objAliases[0]}._rbac = *`)) {
        _logger2.default.perfLog(startTime, 1000, 'getRbacString()');
        return '';
      }
      _logger2.default.perfLog(startTime, 1000, 'getRbacString()');
      return rbacFilter;
    })();
  }

  createWhereClause(filters, aliases) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const rbac = yield _this3.getRbacString(aliases);
      const filterString = getFilterString(filters);
      if (rbac !== '') {
        if (filterString !== '') {
          return `WHERE ${filterString} AND ${rbac}`;
        }
        return `WHERE ${rbac}`;
      } else if (filterString !== '') {
        return `WHERE ${filterString}`;
      }
      return '';
    })();
  }

  /*
   * Execute a redis query and format the result as an array of Object.
   */
  executeQuery({ query, removePrefix = true }) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.isServiceAvailable();
      const startTime = Date.now();
      const result = yield _this4.g.query(query);
      _logger2.default.perfLog(startTime, 200, query);
      return formatResult(result, removePrefix);
    })();
  }

  /*
   * Get Applications.
   */
  runApplicationsQuery() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this5.createWhereClause([], ['app']);
      const query = `MATCH (app:Application) ${whereClause} RETURN DISTINCT app._uid, app.name, app.namespace, app.created, app.dashboard, app.selfLink ORDER BY app.name ASC`;
      return _this5.executeQuery({ query, removePrefix: false });
    })();
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
  runAppClustersQuery() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this6.createWhereClause([], ['app', 'cluster']);
      const query = `MATCH (app:Application)<-[{_interCluster:true}]-(cluster:Cluster) ${whereClause} RETURN DISTINCT app._uid, count(cluster._uid) as count`;
      return _this6.executeQuery({ query, removePrefix: false });
    })();
  }

  /*
   * Get Applications with their related Hub Subscriptions.
   */
  runAppHubSubscriptionsQuery() {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this7.createWhereClause([], ['app', 'sub']);
      const query = `MATCH (app:Application)-[]->(sub:Subscription) ${whereClause === '' ? 'WHERE' : `${whereClause} AND`} exists(sub._hubClusterResource)=true RETURN app._uid, sub._uid, sub.status, sub.channel`;
      return _this7.executeQuery({ query, removePrefix: false });
    })();
  }

  /*
   * Get Applications with the pods counter
   * return the number of pods for this app as a string, grouped by their status
  */
  runAppPodsCountQuery() {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this8.createWhereClause([], ['app', 'pod']);
      const query = `MATCH (app:Application)<-[{_interCluster:true}]-(pod:Pod) ${whereClause} RETURN app._uid, pod._uid, pod.status`;
      return _this8.executeQuery({ query, removePrefix: false });
    })();
  }

  /*
   * Get Applications with their related remote subscriptions.
   # Remote subscriptions are those with the '_hostingSubscription' property.
   */
  runAppRemoteSubscriptionsQuery() {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this9.createWhereClause([], ['app', 'sub']);
      const query = `MATCH (app:Application)<-[{_interCluster:true}]-(sub:Subscription) ${whereClause === '' ? 'WHERE' : `(${whereClause}) AND`} exists(sub._hostingSubscription)=true RETURN app._uid, sub._uid, sub.status`;
      return _this9.executeQuery({ query, removePrefix: false });
    })();
  }

  /*
   * Get clusters related to any application.
   */
  runGlobalAppClusterCountQuery() {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this10.createWhereClause([], ['app', 'cluster']);
      const query = `MATCH (app:Application)<-[{_interCluster:true}]-(cluster:Cluster) ${whereClause} RETURN DISTINCT cluster._uid`;
      return _this10.executeQuery({ query, removePrefix: false });
    })();
  }

  /*
   * Get channels related to any application.
   */
  runGlobalAppChannelsQuery() {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this11.createWhereClause([], ['app', 'ch']);
      const query = `MATCH (app:Application)<-[]-(ch:Channel) ${whereClause} RETURN DISTINCT ch`;
      return _this11.executeQuery({ query, removePrefix: false });
    })();
  }

  /*
   * Get hub subscriptions related to any application.
   */
  runGlobalAppHubSubscriptionsQuery() {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this12.createWhereClause([], ['app', 'sub']);
      const query = `MATCH (app:Application)-[]->(sub:Subscription) ${whereClause === '' ? 'WHERE' : `${whereClause} AND`} exists(sub._hubClusterResource)=true RETURN DISTINCT sub`;
      return _this12.executeQuery({ query, removePrefix: false });
    })();
  }

  /*
   * Get remote subscriptions related to any application.
   */
  runGlobalAppRemoteSubscriptionsQuery() {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      const whereClause = yield _this13.createWhereClause([], ['app', 'sub']);
      const query = `MATCH (app:Application)<-[{_interCluster:true}]-(sub:Subscription) ${whereClause === '' ? 'WHERE' : `(${whereClause}) AND`} exists(sub._hostingSubscription)=true RETURN DISTINCT sub`;
      return _this13.executeQuery({ query, removePrefix: false });
    })();
  }

  /**
   * TODO: For users less than clusterAdmin we we do not currently handle non-namespaced resources
   * For users with access to >0 namespaces we create an RBAC string for resources user has access
   * For users with access to 0 namespaces we return an empty object
   */

  runSearchQuery(filters, limit = _config2.default.get('defaultQueryLimit'), querySkipIdx = 0) {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      // logger.info('runSearchQuery()', filters);
      if (_this14.rbac.length > 0) {
        // RedisGraph 1.0.15 doesn't support an array as value. To work around this limitation we
        // encode labels in a single string. As a result we can't use an openCypher query to search
        // for labels so we need to filter here, which btw is inefficient.
        const labelFilter = filters.find(function (f) {
          return f.property === 'label';
        });
        if (labelFilter) {
          const whereClause = yield _this14.createWhereClause(filters.filter(function (f) {
            return f.property !== 'label';
          }), ['n']);
          const startTime = Date.now();
          const query = `MATCH (n) ${whereClause} RETURN n`;
          const result = yield _this14.g.query(query);
          _logger2.default.perfLog(startTime, 150, 'LabelSearchQuery');
          return formatResult(result).filter(function (item) {
            return item.label && labelFilter.values.find(function (value) {
              return item.label.indexOf(value) > -1;
            });
          });
        }
        let limitClause = '';
        if (limit > 0) {
          limitClause = querySkipIdx > -1 ? `SKIP ${querySkipIdx * _config2.default.get('defaultQueryLoopLimit')} LIMIT ${_config2.default.get('defaultQueryLoopLimit')}` : `LIMIT ${limit}`;
        }
        const whereClause = yield _this14.createWhereClause(filters, ['n']);
        const startTime = Date.now();
        const query = `MATCH (n) ${whereClause} RETURN n ${limitClause}`;
        const result = yield _this14.g.query(query);
        _logger2.default.perfLog(startTime, 150, 'SearchQuery');
        return formatResult(result);
      }
      return [];
    })();
  }

  runSearchQueryCountOnly(filters) {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      // logger.info('runSearchQueryCountOnly()', filters);

      if (_this15.rbac.length > 0) {
        // RedisGraph 1.0.15 doesn't support an array as value. To work around this limitation we
        // encode labels in a single string. As a result we can't use an openCypher query to search
        // for labels so we need to filter here, which btw is inefficient.
        const labelFilter = filters.find(function (f) {
          return f.property === 'label';
        });
        if (labelFilter) {
          return _this15.runSearchQuery(filters, -1, -1).then(function (r) {
            return r.length;
          });
        }
        const whereClause = yield _this15.createWhereClause(filters, ['n']);
        const startTime = Date.now();
        const result = yield _this15.g.query(`MATCH (n) ${whereClause} RETURN count(n)`);
        _logger2.default.perfLog(startTime, 150, 'runSearchQueryCountOnly()');
        if (result.hasNext() === true) {
          return result.next().get('count(n)');
        }
      }
      return 0;
    })();
  }

  getAllProperties() {
    var _this16 = this;

    return _asyncToGenerator(function* () {
      // logger.info('Getting all properties');

      // Adding these first to rank them higher when showin in UI.
      const values = ['cluster', 'kind', 'label', 'name', 'namespace', 'status'];

      if (_this16.rbac.length > 0) {
        const whereClause = yield _this16.createWhereClause([], ['n']);
        const startTime = Date.now();
        const result = yield _this16.g.query(`MATCH (n) ${whereClause} RETURN n LIMIT 1`);
        _logger2.default.perfLog(startTime, 150, 'getAllProperties()');
        result._header.forEach(function (property) {
          const label = property.substr(property.indexOf('.') + 1);
          if (label.charAt(0) !== '_' && values.indexOf(label) < 0) {
            values.push(label);
          }
        });
      }
      return values;
    })();
  }

  getAllValues(property, filters = [], limit = _config2.default.get('defaultQueryLimit')) {
    var _this17 = this;

    return _asyncToGenerator(function* () {
      // logger.info('Getting all values for property:', property, filters);

      if (property === '') {
        _logger2.default.warn('getAllValues() called with empty value. Most likely this was an unecessary API call.');
        return Promise.resolve([]);
      }

      let valuesList = [];
      if (_this17.rbac.length > 0) {
        const startTime = Date.now();
        const limitClause = limit <= 0 || property === 'label' ? '' : `LIMIT ${limit}`;
        const result = filters.length > 0 ? yield _this17.g.query(`MATCH (n) ${yield _this17.createWhereClause(filters, ['n'])} RETURN DISTINCT n.${property} ORDER BY n.${property} ASC ${limitClause}`) : yield _this17.g.query(`MATCH (n) ${yield _this17.createWhereClause([], ['n'])} RETURN DISTINCT n.${property} ORDER BY n.${property} ASC ${limitClause}`);
        _logger2.default.perfLog(startTime, 500, 'getAllValues()');
        result._results.forEach(function (record) {
          if (record.values()[0] !== 'NULL' && record.values()[0] !== null) {
            valuesList.push(record.values()[0]);
          }
        });

        // RedisGraph 1.0.15 doesn't support an array as value. To work around this limitation we
        // encode labels in a single string. Here we need to decode the string to get all labels.
        if (property === 'label') {
          const labels = [];
          valuesList.forEach(function (value) {
            value.split('; ').forEach(function (label) {
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
        } else if (isNumber(valuesList[0])) {
          //  || isNumWithChars(valuesList[0]))
          valuesList = valuesList.filter(function (res) {
            return (isNumber(res) || !isNumber(res)) && res !== '';
          }); //  && isNumWithChars(res)
          valuesList.sort(function (a, b) {
            return parseInt(a, 10) - parseInt(b, 10);
          });
          if (valuesList.length > 1) {
            return ['isNumber', valuesList[0], valuesList[valuesList.length - 1]];
          } else if (valuesList.length === 1) {
            return ['isNumber', valuesList[0]];
          }
        }
      }
      return valuesList;
    })();
  }

  findRelationships({ filters = [], countOnly = false, relatedKinds = [] } = {}) {
    var _this18 = this;

    return _asyncToGenerator(function* () {
      if (_this18.rbac.length > 0) {
        // A limitation in RedisGraph 1.0.15 is that we can't query relationships without direction.
        // To work around this limitation, we use 2 queries to get IN and OUT relationships.
        // Then we join both results.

        const whereClause = yield _this18.createWhereClause(filters, ['n', 'r']);
        const startTime = Date.now();

        let inQuery = '';
        let outQuery = '';
        if (relatedKinds.length > 0) {
          const relatedClause = relatedKinds.map(function (kind) {
            return `r.kind = '${kind}'`;
          }).join(' OR ');
          inQuery = `MATCH (n)<-[]-(r) WHERE (${relatedClause}) AND ${whereClause.replace('WHERE ', '')} RETURN DISTINCT r`;
          outQuery = `MATCH (n)-[]->(r) WHERE (${relatedClause}) AND ${whereClause.replace('WHERE ', '')} RETURN DISTINCT r`;
        } else {
          inQuery = `MATCH (n)<-[]-(r) ${whereClause} RETURN DISTINCT ${countOnly ? 'r._uid, r.kind' : 'r'}`;
          outQuery = `MATCH (n)-[]->(r) ${whereClause} RETURN DISTINCT ${countOnly ? 'r._uid, r.kind' : 'r'}`;
        }

        const [inFormatted, outFormatted] = yield Promise.all([formatResult((yield _this18.g.query(inQuery))), formatResult((yield _this18.g.query(outQuery)))]);

        _logger2.default.perfLog(startTime, 300, 'findRelationships()');

        // Join results for IN and OUT, removing duplicates.
        const result = inFormatted;
        outFormatted.forEach(function (outItem) {
          // Add only if the relationship doesn't already exist.
          if (!result.find(function (item) {
            return item._uid === outItem._uid;
          })) {
            result.push(outItem);
          }
        });

        return result;
      }
      return [];
    })();
  }
}
exports.default = RedisGraphConnector;
//# sourceMappingURL=redisGraph.js.map