// Copyright Contributors to the Open Cluster Management project

import { checkSearchServiceStatus, getOperatorStatus } from './searchServiceStatus';
import MockKubeConnector from '../mocks/kube';

describe('Test searchServiceStatus', () => {
  const mockKubeConnector = new MockKubeConnector();
  const mockSearchConnector = { isServiceAvailable: async () => false };

  test('getOperatorStatus should return true', async () => {
    expect(await getOperatorStatus(mockKubeConnector)).toEqual(true);
  });

  test('checkSearchServiceStatus should throw', async () => {
    await expect(() => checkSearchServiceStatus(mockSearchConnector, mockKubeConnector)).rejects.toThrowError('Search service is unavailable.');
  });
});
