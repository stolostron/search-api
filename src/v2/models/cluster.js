// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import _ from 'lodash';
import KubeModel from './kube';
import logger from '../lib/logger';

export const HIVE_DOMAIN = 'hive.openshift.io';
export const UNINSTALL_LABEL = `${HIVE_DOMAIN}/uninstall`;
export const INSTALL_LABEL = `${HIVE_DOMAIN}/install`;
export const CLUSTER_LABEL = `${HIVE_DOMAIN}/cluster-deployment-name`;
export const UNINSTALL_LABEL_SELECTOR = (cluster) => `labelSelector=${UNINSTALL_LABEL}%3Dtrue%2C${CLUSTER_LABEL}%3D${cluster}`;
export const INSTALL_LABEL_SELECTOR = (cluster) => `labelSelector=${INSTALL_LABEL}%3Dtrue%2C${CLUSTER_LABEL}%3D${cluster}`;
export const UNINSTALL_LABEL_SELECTOR_ALL = `labelSelector=${UNINSTALL_LABEL}%3Dtrue`;
export const INSTALL_LABEL_SELECTOR_ALL = `labelSelector=${INSTALL_LABEL}%3Dtrue`;

export const CLUSTER_DOMAIN = 'cluster.open-cluster-management.io';
export const CLUSTER_NAMESPACE_LABEL = `${CLUSTER_DOMAIN}/managedCluster`;

export const CSR_LABEL = 'open-cluster-management.io/cluster-name';
export const CSR_LABEL_SELECTOR = (cluster) => `labelSelector=${CSR_LABEL}%3D${cluster}`;
export const CSR_LABEL_SELECTOR_ALL = `labelSelector=${CSR_LABEL}`;

function getLatest(items, key) {
  if (items.length === 0) {
    return undefined;
  }
  if (items.length === 1) {
    return items[0];
  }

  return items.reduce((a, b) => {
    const [timeA, timeB] = [a, b].map((x) => new Date(_.get(x, key, '')));
    return timeA > timeB ? a : b;
  });
}

function getClusterDeploymentStatus(clusterDeployment, uninstall, install) {
  const latestJobActive = (jobs) => (jobs && _.get(getLatest(jobs, 'metadata.creationTimestamp'), 'status.active', 0) > 0);
  const latestJobFailed = (jobs) => (jobs && _.get(getLatest(jobs, 'metadata.creationTimestamp'), 'status.failed', 0) > 0);

  let status = 'pending';
  if (latestJobActive(uninstall)) {
    status = 'destroying';
  } else if (latestJobActive(install)) {
    status = 'creating';
  } else if (latestJobFailed(install) || latestJobFailed(uninstall)) {
    status = 'provisionfailed';
  } else if (_.get(clusterDeployment, 'spec.installed')) {
    status = 'detached';
  }
  return status;
}

export function getStatus(cluster, csrs, clusterDeployment, uninstall, install) {
  const clusterDeploymentStatus = clusterDeployment
    ? getClusterDeploymentStatus(clusterDeployment, uninstall, install)
    : '';

  if (cluster) {
    let status;
    const clusterConditions = _.get(cluster, 'status.conditions') || [];
    const checkForCondition = (condition) => _.get(
      clusterConditions.find((c) => c.type === condition),
      'status',
    ) === 'True';
    const clusterAccepted = checkForCondition('HubAcceptedManagedCluster');
    const clusterJoined = checkForCondition('ManagedClusterJoined');
    const clusterAvailable = checkForCondition('ManagedClusterConditionAvailable');
    if (_.get(cluster, 'metadata.deletionTimestamp')) {
      status = 'detaching';
    } else if (!clusterAccepted) {
      status = 'notaccepted';
    } else if (!clusterJoined) {
      status = 'pendingimport';
      if (csrs && csrs.length) {
        status = !_.get(getLatest(csrs, 'metadata.creationTimestamp'), 'status.certificate')
          ? 'needsapproval' : 'pending';
      }
    } else {
      status = clusterAvailable ? 'ok' : 'offline';
    }

    // if ManagedCluster has not joined or is detaching, show ClusterDeployment status
    // as long as it is not 'detached' (which is the ready state when there is no attached ManagedCluster,
    // so this is the case is the cluster is being detached but not destroyed)
    if ((status === 'detaching' || !clusterJoined) && (clusterDeploymentStatus && clusterDeploymentStatus !== 'detached')) {
      return clusterDeploymentStatus;
    }
    return status;
  }
  return clusterDeploymentStatus;
}

function mapResources(resources, kind) {
  const resultMap = new Map();
  if (resources) {
    resources.forEach((r) => {
      if (r.metadata && (!r.kind || r.kind === kind)) {
        const key = r.metadata.name;
        resultMap.set(key, { metadata: r.metadata, raw: r });
      }
    });
  }
  return resultMap;
}

function mapResourceListByLabel(resourceList, label) {
  return new Map(Object.entries(_.groupBy(resourceList, (i) => i.metadata.labels[label])));
}

function mapData({
  managedClusters,
  managedClusterInfos,
  clusterDeployments,
  certificateSigningRequestList,
  uninstallJobList,
  installJobList,
}) {
  const managedClusterMap = mapResources(managedClusters, 'ManagedCluster');
  const clusterDeploymentMap = mapResources(clusterDeployments, 'ClusterDeployment');
  const managedClusterInfoMap = mapResources(managedClusterInfos, 'ManagedClusterInfo');
  const certificateSigningRequestListMap = mapResourceListByLabel(certificateSigningRequestList, CSR_LABEL);
  const uninstallJobListMap = mapResourceListByLabel(uninstallJobList, CLUSTER_LABEL);
  const installJobListMap = mapResourceListByLabel(installJobList, CLUSTER_LABEL);

  const uniqueClusterNames = new Set([
    ...managedClusterMap.keys(),
    ...clusterDeploymentMap.keys(),
  ]);

  return {
    managedClusterMap,
    clusterDeploymentMap,
    managedClusterInfoMap,
    certificateSigningRequestListMap,
    uninstallJobListMap,
    installJobListMap,
    uniqueClusterNames,
  };
}

function getClusterResourcesFromMappedData({
  managedClusterMap,
  clusterDeploymentMap,
  managedClusterInfoMap,
  certificateSigningRequestListMap,
  uninstallJobListMap,
  installJobListMap,
}, cluster) {
  const managedCluster = managedClusterMap.get(cluster);
  const managedClusterInfo = managedClusterInfoMap.get(cluster);
  const clusterDeployment = clusterDeploymentMap.get(cluster);
  const certificateSigningRequestList = certificateSigningRequestListMap.get(cluster);
  const uninstallJobList = uninstallJobListMap.get(cluster);
  const installJobList = installJobListMap.get(cluster);
  return {
    managedCluster,
    managedClusterInfo,
    clusterDeployment,
    certificateSigningRequestList,
    uninstallJobList,
    installJobList,
  };
}

function getBaseCluster(mappedData, cluster) {
  const { managedCluster, managedClusterInfo, clusterDeployment } = getClusterResourcesFromMappedData(mappedData, cluster);

  const metadata = _.get(managedCluster, 'metadata')
  || _.pick(_.get(managedClusterInfo || clusterDeployment, 'metadata'), ['name', 'namespace']);
  if (!metadata.namespace) {
    metadata.namespace = _.get(managedClusterInfo || clusterDeployment, 'metadata.namespace') || metadata.name;
  }
  if (!metadata.labels) {
    metadata.labels = _.get(managedClusterInfo, 'metadata.labels', '');
  }

  const clusterip = _.get(managedClusterInfo, 'raw.spec.masterEndpoint');

  const consoleURL = _.get(managedClusterInfo, 'raw.status.consoleURL') || _.get(clusterDeployment, 'raw.status.webConsoleURL');

  const apiURL = _.get(clusterDeployment, 'raw.status.apiURL');
  const masterEndpoint = _.get(managedClusterInfo, 'raw.spec.masterEndpoint');
  const serverAddress = apiURL || masterEndpoint;

  return {
    metadata,
    clusterip,
    consoleURL,
    rawCluster: _.get(managedCluster, 'raw'),
    rawStatus: _.get(managedClusterInfo, 'raw'),
    serverAddress,
  };
}

function findMatchedStatusForOverview(data) {
  const mappedData = mapData(data);
  const { uniqueClusterNames } = mappedData;
  const resultMap = new Map();

  uniqueClusterNames.forEach((c) => {
    const cluster = getBaseCluster(mappedData, c);
    const { managedCluster } = getClusterResourcesFromMappedData(mappedData, c);

    const status = getStatus(_.get(managedCluster, 'raw'));
    const capacity = _.get(managedCluster, 'raw.status.capacity');
    const allocatable = _.get(managedCluster, 'raw.status.allocatable');

    _.merge(cluster, {
      status,
      capacity,
      allocatable,
    });
    resultMap.set(c, cluster);
  });
  return [...resultMap.values()];
}

export default class ClusterModel extends KubeModel {
  constructor(args) {
    super(args);
    const { clusterNamespaces } = args;
    this.clusterNamespaces = clusterNamespaces;
  }

  async getClusterResources() {
    // Try cluster scope queries, falling back to per-cluster-namespace
    const rbacFallbackQuery = (clusterQuery, namespaceQueryFunction) => (
      this.kubeConnector.get(clusterQuery).then((allItems) => (allItems.items
        ? allItems.items
        : this.kubeConnector.getResources(
          namespaceQueryFunction,
          { namespaces: this.clusterNamespaces },
        ))).catch((err) => {
        logger.error(err);
        throw err;
      })
    );

    const [
      managedClusters,
      managedClusterInfos,
      clusterDeployments,
      certificateSigningRequestList,
      uninstallJobList,
      installJobList,
    ] = await Promise.all([
      rbacFallbackQuery(
        '/apis/cluster.open-cluster-management.io/v1/managedclusters',
        (ns) => `/apis/cluster.open-cluster-management.io/v1/managedclusters/${ns}`,
      ),
      rbacFallbackQuery(
        '/apis/internal.open-cluster-management.io/v1beta1/managedclusterinfos',
        (ns) => `/apis/internal.open-cluster-management.io/v1beta1/namespaces/${ns}/managedclusterinfos`,
      ),
      rbacFallbackQuery(
        '/apis/hive.openshift.io/v1/clusterdeployments',
        (ns) => `/apis/hive.openshift.io/v1/namespaces/${ns}/clusterdeployments`,
      ),
      this.kubeConnector.get(`/apis/certificates.k8s.io/v1beta1/certificatesigningrequests?${CSR_LABEL_SELECTOR_ALL}`)
        .then((allItems) => (allItems.items
          ? allItems.items
          : [])).catch((err) => {
          logger.error(err);
          throw err;
        }),
      rbacFallbackQuery(
        `/apis/batch/v1/jobs?${UNINSTALL_LABEL_SELECTOR_ALL}`,
        (ns) => `/apis/batch/v1/namespaces/${ns}/jobs?${UNINSTALL_LABEL_SELECTOR(ns)}`,
      ),
      rbacFallbackQuery(
        `/apis/batch/v1/jobs?${INSTALL_LABEL_SELECTOR_ALL}`,
        (ns) => `/apis/batch/v1/namespaces/${ns}/jobs?${INSTALL_LABEL_SELECTOR(ns)}`,
      ),
    ]);

    return {
      managedClusters,
      managedClusterInfos,
      clusterDeployments,
      certificateSigningRequestList,
      uninstallJobList,
      installJobList,
    };
  }

  async getAllClusters(args = {}) {
    const resources = await this.getClusterResources();
    const results = findMatchedStatusForOverview(resources);
    if (args.name) {
      return results.filter((c) => c.metadata.name === args.name)[0];
    }
    return results;
  }
}
