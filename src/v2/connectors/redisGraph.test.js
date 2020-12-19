/* eslint-disable no-underscore-dangle */
/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

// import mockRedis from 'redis-mock';
import { Record } from 'redisgraph.js';
import ResultSet from 'redisgraph.js/src/resultSet';
import { mockSearchResult } from '../mocks/search';
import RedisGraphConnector, {
  formatResult, getOperator, getDateFilter, getFilterString, isDate,
} from './redisGraph';

describe('redisGraph', () => {
  describe('Class Functions', () => {
    test('getOperator', async () => {
      expect(getOperator('<=')).toEqual('<=');
      expect(getOperator('>=')).toEqual('>=');
      expect(getOperator('<')).toEqual('<');
      expect(getOperator('>')).toEqual('>');
      expect(getOperator('!')).toEqual('<>');
      expect(getOperator('!=')).toEqual('<>');
    });
    test('getFilterString', async () => {
      Date.now = jest.fn(() => 1548076708000);
      expect(getFilterString([{ property: 'kind', values: ['cluster'] }])).toEqual('(n.kind = \'cluster\')');
      expect(getFilterString([{ property: 'role', values: ['master'] }])).toEqual('((\'master\' IN n.role))');
      expect(getFilterString([{ property: 'cpu', values: ['<16'] }])).toEqual('(n.cpu < 16)');
      expect(getFilterString([{ property: 'created', values: ['month'] }])).toEqual('(n.created > \'2018-12-22T02:49:25.000Z\')');
    });
    test('getDateFilter', async () => {
      Date.now = jest.fn(() => 1548076708000); // 21-01-2019T13:18:28Z
      expect(getDateFilter('hour')).toEqual('> \'2019-01-21T12:18:28.000Z\'');
      expect(getDateFilter('day')).toEqual('> \'2019-01-20T13:18:28.000Z\'');
      expect(getDateFilter('week')).toEqual('> \'2019-01-14T13:18:28.000Z\'');
      expect(getDateFilter('month')).toEqual('> \'2018-12-22T02:49:25.000Z\'');
      expect(getDateFilter('year')).toEqual('> \'2018-01-21T07:29:42.000Z\'');
      expect(getDateFilter('default')).toEqual('> \'2018-12-22T02:49:25.000Z\'');
    });
    test('isDate', async () => {
      expect(isDate('2016-06-23T09:07:21-07:00')).toEqual(true);
    });
    test('formatResult', async () => {
      const results = new ResultSet();

      results._results = [new Record([' n '], [mockSearchResult.mock({ node: 5 })])];
      results._resultsCount = results._results.length;

      results.next().get(' n ').properties = [{
        kind: 'node',
        role: ['master'],
        name: 'mock-1.1.1.0',
        cpus: 10,
      }];

      results._position = 0;
      expect(formatResult(results, true)).toMatchSnapshot();

      results._position = 0;
      expect(formatResult(results, false)).toMatchSnapshot();
    });
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

  // eslint-ignore jest/no-commented-out-tests
  describe('Testing Connector Functions', () => {
    const searchConnector = new RedisGraphConnector({ rbac: ['kube-system', 'default'], req: { user: { name: 'TestUserName' }, kubeToken: 'Bearer localdev' } });
    const _ = new Promise((resolve) => resolve({}));

    // test('isServiceAvailable', () => searchConnector.isServiceAvailable().then((res) => expect(res).toBe(true)));
    // test('getAllProperties', async () => {
     // const values = ['cluster', 'kind', 'label', 'name', 'namespace', 'status'];
     // const properties = await searchConnector.getAllProperties();

     // values.forEach((val) => {
       // expect(properties.includes(val)).toBe(true);
     // });
   // });

    test('getAllValues', async () => {
      expect(searchConnector.getAllValues('', [])).toEqual(_);
      // With mock data, we won't be able to test it without the proper (withclause and whereclause)
      expect(searchConnector.getAllValues('role', [{ property: 'role', values: ['master'] }])).toEqual(_);
    });

    // test('Check If Redis Is Available', async () => {
    //   expect(await searchConnector.isServiceAvailable()).toBe(true);
    // });

  //   test('Create the RBAC String for Redis Queries', async () => {
  //     const RBACString =
  //        await searchConnector.createWhereClause([{ property: 'pods', values: ['testPod'] }]);
  //     console.log(RBACString);
  //   });
  });
});
