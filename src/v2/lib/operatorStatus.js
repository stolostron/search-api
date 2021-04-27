// Copyright Contributors to the Open Cluster Management project

import { getServiceAccountToken } from './utils';
import KubeConnector from '../connectors/kube';

const kubeConnector = new KubeConnector({ token: getServiceAccountToken() });

export default async function getOperatorStatus() {
  const namespace = process.env.POD_NAMESPACE || 'open-cluster-management';
  console.log('>>>> NAMESPACE: ', namespace);
  const operator = await kubeConnector.get(`/apis/search.open-cluster-management.io/v1alpha1/namespaces/${namespace}/searchoperators/searchoperator`);
  const deployRedisgraph = operator && operator.status && operator.status.deployredisgraph;

  return deployRedisgraph;
}
