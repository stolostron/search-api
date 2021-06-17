// Copyright Contributors to the Open Cluster Management project

import logger from '../lib/logger';

export async function getOperatorStatus(kubeConnector) {
  const namespace = process.env.POD_NAMESPACE || 'open-cluster-management';
  const so = await kubeConnector.get(`/apis/search.open-cluster-management.io/v1alpha1/namespaces/${namespace}/searchoperators/searchoperator`);
  const { status: { deployredisgraph = true } = {}} = so;
  return !!deployredisgraph;
}

export async function checkSearchServiceStatus(searchConnector, kubeConnector) {
  const isDBAvailable = await searchConnector.isServiceAvailable();
  if (!isDBAvailable) {
    const deployRedisgraph = await getOperatorStatus(kubeConnector);
    if (!deployRedisgraph) {
      logger.warn('The search service is not enabled in the current configuration.');
      throw new Error('The search service is not enabled in the current configuration.');
    } else {
      logger.error('Unable to resolve search request because RedisGraph is unavailable.');
      throw new Error('Search service is unavailable.');
    }
  }
}
