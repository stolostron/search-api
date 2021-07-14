/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import KubeConnector from './kube';

const asyncReturn = (value, waitTime = 500) => new Promise((res) => setTimeout(res, waitTime, value));

const mockManagedClusterView = {
  body: {
    metadata: {
      selfLink: '/apis/view.open-cluster-management.io/v1beta1/namespaces/cluster-test/managedclusterviews/spoke-test',
    },
  },
};

const mockManagedClusterViewPollIncomplete = {
  body: {
    items: [
      {
        status: {
          status: 'Not Finished',
        },
      },
    ],
  },
};

const mockManagedClusterViewPollComplete = {
  body: {
    items: [
      {
        status: {
          conditions: [
            { type: 'Processing', lastUpdateTime: '2018-08-15T18:44:41Z' },
          ],
        },
      },
    ],
  },
};

const mockManagedClusterViewResults = {
  body: {
    status: {
      conditions: [
        { type: 'Processing', lastUpdateTime: '2018-08-15T18:44:41Z' },
      ],
      result: {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
          creationTimestamp: '2020-05-13T20:24:01Z',
          generateName: 'search-prod-28a0e-search-api-66cf776db5-',
          labels: {
            app: 'search',
            chart: 'search-prod-3.5.0',
            component: 'search-api',
            heritage: 'Helm',
            'pod-template-hash': '66cf776db5',
            release: 'search-prod-28a0e',
          },
          name: 'search-prod-28a0e-search-api-66cf776db5-7bzfh',
          namespace: 'open-cluster-management',
          resourceVersion: '45078202',
          selfLink: '/api/v1/namespaces/open-cluster-management/pods/search-prod-28a0e-search-api-66cf776db5-7bzfh',
          uid: '7ecc7859-5ce4-4e34-8834-bd687c0fe43d',
        },
        status: {
          conditions: [
            {
              lastProbeTime: null,
              lastTransitionTime: '2020-05-13T20:24:02Z',
              status: 'True',
              type: 'Initialized',
            },
            {
              lastProbeTime: null,
              lastTransitionTime: '2020-05-13T20:24:33Z',
              status: 'True',
              type: 'Ready',
            },
            {
              lastProbeTime: null,
              lastTransitionTime: '2020-05-13T20:24:33Z',
              status: 'True',
              type: 'ContainersReady',
            },
            {
              lastProbeTime: null,
              lastTransitionTime: '2020-05-13T20:24:02Z',
              status: 'True',
              type: 'PodScheduled',
            },
          ],
          phase: 'Running',
          qosClass: 'Burstable',
          startTime: '2020-05-13T20:24:02Z',
        },
      },
    },
  },
};

describe('KubeConnector', () => {
  describe('Get', () => {
    test('calls default connector', async () => {
      const mockHttp = jest.fn(() => asyncReturn({ body: { test: 'value' } }, 200));

      const connector = new KubeConnector({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        httpLib: mockHttp,
      });

      await connector.get('/api/test');

      expect(mockHttp.mock.calls).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });

    test('calls httpLib with correct arguments', async () => {
      const mockHttp = jest.fn(() => asyncReturn({ body: { test: 'value' } }, 200));

      const connector = new KubeConnector({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        token: 'localdev',
        httpLib: mockHttp,
      });

      await connector.get('/api/test');

      expect(mockHttp.mock.calls).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });

    test('correctly merges additional arguments', async () => {
      const mockHttp = jest.fn(() => new Promise((res) => setTimeout(res, 200, { body: { test: 'value' } })));

      const connector = new KubeConnector({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        token: 'localdev',
        httpLib: mockHttp,
      });

      await connector.get('/api/test', { headers: { 'x-custom-header': 'test-value' } });

      expect(mockHttp.mock.calls[0]).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('Post', () => {
    test('calls httpLib with correct arguments', async () => {
      const mockHttp = jest.fn(() => asyncReturn({ body: { test: 'value' } }, 200));

      const connector = new KubeConnector({
        kubeApiEndpoint: 'https://testURL/kubernetes',
        token: 'localdev',
        httpLib: mockHttp,
      });

      await connector.post('/api/test', { body: 'test-value' });

      expect(mockHttp.mock.calls[0]).toHaveLength(1);
      expect(mockHttp.mock.calls[0]).toMatchSnapshot();
    });
  });

  describe('CreateManagedClusterView', () => {
    test('creates and polls ManagedClusterView api', async () => {
      const mockCache = { get: jest.fn().mockReturnValue(null), set: jest.fn() };
      const mockHttp = jest.fn()
        .mockImplementationOnce(() => asyncReturn(mockManagedClusterView))
        .mockImplementationOnce(() => asyncReturn(mockManagedClusterViewPollIncomplete))
        .mockImplementationOnce(() => asyncReturn(mockManagedClusterViewPollIncomplete))
        .mockImplementationOnce(() => asyncReturn(mockManagedClusterViewPollIncomplete))
        .mockImplementationOnce(() => asyncReturn(mockManagedClusterViewPollComplete))
        .mockImplementation(() => asyncReturn(mockManagedClusterViewResults));

      const connector = new KubeConnector({
        req: {
          user: {
            idToken: 'test-user-token-1234',
          },
        },
        cache: mockCache,
        kubeApiEndpoint: 'kubernetes',
        httpLib: mockHttp,
        uid: () => '1234',
        namespaces: ['open-cluster-management'],
      });

      const result = await connector.managedClusterViewQuery(
        'cluster-test',
        '',
        'Pod',
        'search-prod-28a0e-search-api-66cf776db5-7bzfh',
        'open-cluster-management',
        30,
        true,
      );

      expect(result).toMatchSnapshot();
    });
  });
});
