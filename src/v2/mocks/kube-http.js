// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project
/* eslint-disable global-require */

import _ from 'lodash';

export default function createMockHttp() {
  const state = {
    apps: require('./AppList'),
    channels: require('./ChannelList'),
    clustersByName: require('./ManagedClusterByName').default,
    managedClusterInfosByName: require('./ManagedClusterInfosByName').default,
    clusters: require('./ManagedClusterList').default,
    userAccess: require('./UserAccess').default,
    apiList: {
      mockResponse: require('./APIList').mockResponse,
      apiPath: require('./APIList').apiPath,
      mcmApiPath: require('./APIList').mcmApiPath,
      complianceApiPath: require('./APIList').complianceApiPath,
      ocmClusterApiPath: require('./APIList').ocmClusterApiPath,
      ocmAgentApiPath: require('./APIList').ocmAgentApiPath,
    },
    managedClusterInfos: require('./ManagedClusterInfoList').default,
    policies: require('./PolicyList'),
    compliances: require('./ComplianceList'),
    logs: require('./Logs'),
    genericResourceList: require('./GenericResourceList'),
    project: require('./ProjectList').default,
    userSearches: require('./userSearch'),
  };

  return async function MockLib(params) {
    if (params.method === 'DELETE') {
      switch (true) {
        case params.url.includes('managedclusters/hub-cluster'):
          return { body: { kind: 'Status', code: '401' } };
        case params.url.includes('/test-delete-pod'):
          return state.genericResourceList.deleteLocalResource;
        default:
          return { body: '204' };
      }
    }
    if (params.json) {
      switch (true) {
        case _.includes(_.get(params.json, 'kind'), 'SelfSubjectAccessReview'):
          return state.userAccess;
        case params.url.includes('compliances'):
          return state.compliances.mockCreateCompliance;
        case params.url.includes('applications'):
          return state.apps.mockCreateAppResponse;
        case params.url.includes('layne-remote/managedclusteractions'):
          return state.genericResourceList.mockedUpdateWorkResponse;
        case params.url.includes('namespaces/remote-test-delete/managedclusteractions'):
          return state.genericResourceList.deleteRemoteResourceAction;
        case _.includes(_.get(params.json, '[0].op'), 'remove'):
          return state.userSearches.deleteSavedSearchResponse;
        case params.url.includes('userpreferences'):
          return state.userSearches.updateSavedSearchResponse;
        default:
          return [];
      }
    }
    switch (true) {
      case params.url.endsWith('/api/v1'):
        return state.apiList.apiPath;
      case params.url.endsWith('/apis/cluster.open-cluster-management.io/v1'):
        return state.apiList.ocmClusterApiPath;
      case params.url.endsWith('/apis/agent.open-cluster-management.io/v1'):
        return state.apiList.ocmAgentApiPath;
      case params.url.endsWith('/apis/mcm.ibm.com/v1alpha1'):
        return state.apiList.mcmApiPath;
      case params.url.endsWith('/apis/compliance.mcm.ibm.com/v1alpha1'):
        return state.apiList.complianceApiPath;
      case params.url.includes('applications/gbapp-gbapp'):
        return state.apps.mockSingleAppResponse;
      case params.url.includes('applications/testapp'):
        return state.apps.mockDeleteAppResponse;
      case params.url.includes('app.k8s.io/v1beta1/namespaces/default/applications'):
        return state.apps.mockAppsResponse;
      case params.url.includes('argoproj.io/v1alpha1/namespaces/default/applications'):
        return state.apps.mockArgoAppsResponse;
      case params.url.includes('default/channels'):
        return state.channels.mockChannelsResponse;
      case params.url.includes('kube-system/channels'):
        return { body: { items: [] } };
      case params.url.includes('ggithubcom-kevinfcormier-sample-repo-ns/secrets/ggithubcom-kevinfcormier-sample-repo-auth'):
        return state.channels.mockChannelSecretResponse;
      case params.url.includes('kube-system/application'):
        return { body: { items: [] } };
      case params.url.endsWith('/placementbindings/gbapp-gbapp'):
        return state.apps.gbappPB;
      case params.url.endsWith('/placementbindings/gbapp-gbapp-redismaster'):
        return state.apps.gbappRedisMasterPB;
      case params.url.includes('/placementbindings'):
        return state.apps.mockAppPlacementBindings;
      case params.url.includes('/applicationrelationships'):
        return state.apps.mockAppRelationships;
      case params.url.includes('kube-system/works?labelSelector=deployable+in+%28'):
        return { body: { items: [] } };
      case params.url.includes('works?labelSelector=deployable+in+%28'):
        return state.apps.mockApplicationWorks;
      case params.url.endsWith('default/clusters/cluster1'):
        return state.logs.mockClusterResponse;
      case params.url.endsWith('kube-system/clusters/cluster1'):
        return { body: { items: [] } };
      case params.url.endsWith('/apis/proxy.open-cluster-management.io/v1beta1/namespaces/cluster1/clusterstatuses/cluster1/log/open-cluster-management/search-prod-28a0e-search-api-66cf776db5-7bzfh/search-api?tailLines=1000'):
        return state.logs.mockLogsResponse;
      case params.url.includes('namespaces/hub-cluster/managedclusterinfos'):
        return { body: state.managedClusterInfosByName['hub-cluster'] };
      case params.url.includes('namespaces/new-cluster/managedclusterinfos'):
        return { body: state.managedClusterInfosByName['new-cluster'] };
      case params.url.includes('namespaces/managed-cluster/managedclusterinfos'):
        return { body: state.managedClusterInfosByName['managed-cluster'] };
      case params.url.includes('managedclusterinfos'):
        return state.managedClusterInfos;
      case params.url.includes('managedclusters/hub-cluster'):
        return { body: state.clustersByName['hub-cluster'] };
      case params.url.includes('managedclusters/new-cluster'):
        return { body: state.clustersByName['new-cluster'] };
      case params.url.includes('managedclusters/managed-cluster'):
        return { body: state.clustersByName['managed-cluster'] };
      case params.url.includes('kube-system/deployables'):
        return { body: { items: [] } };
      case params.url.includes('deployables'):
        return state.apps.mockDeployablesResponse;
      case params.url.includes('policies'):
        return state.policies.mockPolicyListResponse;
      case params.url.includes('compliances/compliance-xz'):
        return state.compliances.mockDeleteResponse;
      case params.url.includes('compliances'):
        return state.compliances.mockComplianceListResponse;
      case params.url.includes('clusters'):
        return state.clusters;
      case params.url.includes('/api/v1/namespaces/kube-system/pods/monitoring-prometheus-nodeexporter-n6h9b'):
        return state.genericResourceList.getResourceMock;
      case params.url.includes('/api/v1/namespaces/klusterlet'):
        return state.genericResourceList.updateResourceLocalMock;
      case params.url.includes('/apis/project.openshift.io/v1/projects'):
        return state.project;
      case params.url.includes('layne-remote/managedclusteractions'):
        return state.genericResourceList.mockedUpdatePollResponse;
      case params.url.includes('remote-test-delete/managedclusteractions/delete-resource-1234'):
        return state.genericResourceList.deleteRemoteResourceAction;
      case params.url.includes('fieldSelector=metadata.name=delete-resource-1234'):
        return state.genericResourceList.deleteRemoteResourceActionResult;
      case params.url.includes('userpreferences'):
        return state.userSearches.getSavedSearchesResponse;
      default:
        return state.apiList.mockResponse;
    }
  };
}
