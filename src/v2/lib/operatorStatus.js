// Copyright Contributors to the Open Cluster Management project

import { getServiceAccountToken } from './utils';
import KubeConnector from '../connectors/kube';

const kubeConnector = new KubeConnector({ token: getServiceAccountToken() });

export default async function getOperatorStatus() {
  const so = await kubeConnector.get('/apis/search.open-cluster-management.io/v1alpha1/namespaces/open-cluster-management/searchoperators/searchoperator');
  const deployRedisgraph = so && so.status && so.status.deployredisgraph;

  return deployRedisgraph;
}
