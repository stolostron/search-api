// Copyright Contributors to the Open Cluster Management project

import { getOperatorStatus } from './searchServiceStatus';
import MockKubeConnector from '../mocks/kube';

describe('Test searchServiceStatus', () => {
  const mockKubeConnector = new MockKubeConnector();

  test('getOperatorStatus should return true', async () => {
    expect(await getOperatorStatus(mockKubeConnector)).toEqual(true);
  });
});
