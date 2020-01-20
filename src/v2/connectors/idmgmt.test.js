/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

import IdMgmtConnector from './idmgmt';

const asyncReturn = (value, waitTime = 500) =>
  new Promise(res => setTimeout(res, waitTime, value));

describe('IdMgmtConnector', () => {
  describe('Get', () => {
    test('calls default connector', async () => {
      const mockHttp = jest.fn(() => asyncReturn({ body: { test: 'value' } }, 200));

      const connector = new IdMgmtConnector({
        idmgmtApiEndpoint: 'https://testURL/idmgmt',
        httpLib: mockHttp,
      });

      await connector.get('/api/test');

      expect(mockHttp.mock.calls).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });

    test('calls httpLib with correct arguments', async () => {
      const mockHttp = jest.fn(() => asyncReturn({ body: { test: 'value' } }, 200));

      const connector = new IdMgmtConnector({
        idmgmtApiEndpoint: 'https://testURL/idmgmt',
        token: 'Bearer localdev',
        httpLib: mockHttp,
      });

      await connector.get('/api/test');

      expect(mockHttp.mock.calls).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });

    test('correctly merges additional arguments', async () => {
      const mockHttp = jest.fn(() =>
        new Promise(res =>
          setTimeout(res, 200, { body: { test: 'value' } })));

      const connector = new IdMgmtConnector({
        idmgmtApiEndpoint: 'https://testURL/idmgmt',
        token: 'Bearer localdev',
        httpLib: mockHttp,
      });

      await connector.get('/api/test', { headers: { 'x-custom-header': 'test-value' } });

      expect(mockHttp.mock.calls[0]).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('Put', () => {
    test('calls httpLib with correct arguments', async () => {
      const mockHttp = jest.fn(() => asyncReturn({ body: { test: 'value' } }, 200));

      const connector = new IdMgmtConnector({
        idmgmtApiEndpoint: 'https://testURL/idmgmt',
        token: 'Bearer localdev',
        httpLib: mockHttp,
      });

      await connector.put('/api/test', { body: 'test-value' });

      expect(mockHttp.mock.calls[0]).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });
  });
});
