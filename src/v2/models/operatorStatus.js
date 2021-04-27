// Copyright Contributors to the Open Cluster Management project

export default async function getOperatorStatus(kubeConnector) {
  const namespace = process.env.POD_NAMESPACE || 'open-cluster-management';
  const operator = await kubeConnector.get(`/apis/search.open-cluster-management.io/v1alpha1/namespaces/${namespace}/searchoperators/searchoperator`);
  const deployRedisgraph = operator && operator.status && operator.status.deployredisgraph;

  return deployRedisgraph;
}
