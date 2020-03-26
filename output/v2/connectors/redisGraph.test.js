'use strict';

var _redisGraph = require('./redisGraph');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** *****************************************************************************
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed Materials - Property of IBM
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * (c) Copyright IBM Corporation 2019. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Note to U.S. Government Users Restricted Rights:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Use, duplication or disclosure restricted by GSA ADP Schedule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contract with IBM Corp.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ****************************************************************************** */

// import mockRedis from 'redis-mock';


describe('redisGraph', () => {
  describe('Class Functions', () => {
    test('getOperator', _asyncToGenerator(function* () {
      expect((0, _redisGraph.getOperator)('<=')).toEqual('<=');
      expect((0, _redisGraph.getOperator)('>=')).toEqual('>=');
      expect((0, _redisGraph.getOperator)('!=')).toEqual('!=');
      expect((0, _redisGraph.getOperator)('<')).toEqual('<');
      expect((0, _redisGraph.getOperator)('>')).toEqual('>');
    }));
    test('getFilterString', _asyncToGenerator(function* () {
      expect((0, _redisGraph.getFilterString)([{ property: 'kind', values: ['cluster'] }])).toEqual('(n.kind = \'cluster\')');
      expect((0, _redisGraph.getFilterString)([{ property: 'cpu', values: ['<16'] }])).toEqual('(n.cpu < 16)');
    }));
    test('getDateFilter', _asyncToGenerator(function* () {
      Date.now = jest.fn(function () {
        return 1548076708000;
      }); // 21-01-2019T13:18:28Z
      expect((0, _redisGraph.getDateFilter)('hour')).toEqual('> \'2019-01-21T12:18:28.000Z\'');
      expect((0, _redisGraph.getDateFilter)('day')).toEqual('> \'2019-01-20T13:18:28.000Z\'');
      expect((0, _redisGraph.getDateFilter)('week')).toEqual('> \'2019-01-14T13:18:28.000Z\'');
      expect((0, _redisGraph.getDateFilter)('month')).toEqual('> \'2018-12-22T02:49:25.000Z\'');
      expect((0, _redisGraph.getDateFilter)('year')).toEqual('> \'2018-01-21T07:29:42.000Z\'');
    }));
  });

  /**
   * createWhereClause
   *    - getRbacString
   *      - checkIfOpenShiftPlatform
   *      - getUserAccess
   *      - getNonNamespacedAccess
   *        - getNonNamespacedResources
   * runSearchQuery
   * runSearchQueryCountOnly
   * getAllProperties
   * getAllValues
   * findRelationships
   */

  // describe('Testing Connector Functions', () => {
  //   const searchConnector = new RedisGraphConnector({ rbac: ['kube-system', 'default'],
  //      req: { user: { name: 'TestUserName' }, kubeToken: 'Bearer localdev' } });
  //   searchConnector.getRedisClient = jest.fn(() => mockRedis.createClient());

  //   test('Check If Redis Is Available', async () => {
  //     expect(await searchConnector.isServiceAvailable()).toBe(true);
  //   });

  //   test('Create the RBAC String for Redis Queries', async () => {
  //     const RBACString =
  //        await searchConnector.createWhereClause([{ property: 'pods', values: ['testPod'] }]);
  //     console.log(RBACString);
  //   });
  // });
});
//# sourceMappingURL=redisGraph.test.js.map