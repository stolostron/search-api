// Copyright Contributors to the Open Cluster Management project

import { checkSearchServiceStatus, getOperatorStatus } from './searchServiceStatus';

describe('Test searchServiceStatus', () => {
  const mockSearchConnector = { isServiceAvailable: async () => false };
  const mockRedisEnabled = { get: async () => ({ status: { deployredisgraph: true } }) };
  const mockRedisDisabled = { get: async () => ({ status: { deployredisgraph: false } }) };

  test('getOperatorStatus should return true', async () => {
    expect(await getOperatorStatus(mockRedisEnabled)).toEqual(true);
  });

  test('when deployRedisgraph = true should throw service unavailable', async () => {
    await expect(() => checkSearchServiceStatus(mockSearchConnector, mockRedisEnabled)).rejects.toThrowError('Search service is unavailable.');
  });

  test('when deployRedisgraph = false should throw service not enbled', async () => {
    await expect(() => checkSearchServiceStatus(mockSearchConnector, mockRedisDisabled)).rejects.toThrowError('The search service is not enabled in the current configuration.');
  });
});
