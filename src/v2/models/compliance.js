// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import _ from 'lodash';
import logger from '../lib/logger';

export default class ComplianceModel {
  constructor({ kubeConnector }) {
    if (!kubeConnector) {
      throw new Error('kubeConnector is a required parameter');
    }

    this.kubeConnector = kubeConnector;
  }

  async getCompliances(name, namespace) {
    let policies = [];

    if (!name) {
      // for getting policy list
      const policyResponse = await this.kubeConnector.getResources((ns) => `/apis/policy.open-cluster-management.io/v1/namespaces/${ns}/policies`).catch((err) => {
        logger.error(err);
        throw err;
      });
      if (policyResponse.code || policyResponse.message) {
        logger.error(`HCM ERROR ${policyResponse.code} - ${policyResponse.message}`);
      }
      policies = policyResponse || [];
    } else {
      // get single policy with a specific name - walkaround of no type field
      const policyResponse = await this.kubeConnector.get(`/apis/policy.open-cluster-management.io/v1/namespaces/${namespace}/policies/${name}`).catch((err) => {
        logger.error(err);
        throw err;
      });
      if (policyResponse.code || policyResponse.message) {
        logger.error(`HCM ERROR ${policyResponse.code} - ${policyResponse.message}`);
      } else {
        policies.push(policyResponse);
      }
    }
    return policies.map((entry) => ({
      ...entry,
      raw: entry,
      name: _.get(entry, 'metadata.name', ''),
      namespace: _.get(entry, 'metadata.namespace', ''),
      remediation: _.get(entry, 'spec.remediationAction', ''),
      selfLink: _.get(entry, 'metadata.selfLink', ''),
      apiVersion: _.get(entry, 'apiVersion', ''),
    }));
  }
}
