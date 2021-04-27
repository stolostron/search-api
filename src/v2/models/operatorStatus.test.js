// Copyright Contributors to the Open Cluster Management project

import getOperatorStatus from './operatorStatus';
import MockKubeConnector from '../mocks/kube';

describe('operatorStatus', () => {
  const mockKubeConnector = new MockKubeConnector();

  test('Test operatorStatus is true', async () => {
    expect(await getOperatorStatus(mockKubeConnector)).toEqual(true);
  });
});
