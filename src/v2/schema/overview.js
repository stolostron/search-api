/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import { gql } from 'apollo-server-express';
import _ from 'lodash';

export const typeDef = gql`
type Overview {
  clusters: [ClusterOverview]
  applications: [ApplicationOverview]
  compliances: [ComplianceOverview]
  timestamp: String
}

type ClusterOverview implements K8sObject {
  metadata: Metadata
  capacity: ClusterCapacity
  allocatable: ClusterAllocatable
  consoleURL: String
  status: String
}

type ClusterCapacity {
  cpu: String
  memory: String
}

type ClusterAllocatable {
  cpu: String
  memory: String
}

type ApplicationOverview implements K8sObject {
  metadata: Metadata
  raw: JSON
  selector: JSON
}

type ComplianceOverview implements K8sObject {
  metadata: Metadata
  raw: JSON
}
`;

export const resolver = {
  Query: {
    overview: async (root, args, {
      clusterModel, appModel, complianceModel,
    }) => {
      let clusters = await clusterModel.getAllClusters();
      clusters = clusters.map(({
        metadata, status, capacity, allocatable, consoleURL,
      }) => {
        const { name, namespace, labels = {} } = metadata;
        ['vendor', 'cloud', 'region', 'environment'].forEach((key) => {
          if (labels[key] === undefined) {
            labels[key] = 'Other';
          }
        });
        return {
          metadata: {
            name,
            namespace,
            labels,
          },
          consoleURL,
          status,
          capacity,
          allocatable,
        };
      });

      // number and what clusters
      let applications = await appModel.getApplicationOverview();
      applications = applications.map(({ metadata: { name } }) => ({
        metadata: {
          name,
        },
      }));

      // policy compliances
      let compliances = await complianceModel.getCompliances();
      compliances = compliances.filter((c) => _.has(c, 'raw.status')).map(({ raw: { status: { status } } }) => ({
        raw: {
          status: {
            status,
          },
        },
      }));

      // what time these values were fetched
      // also forces apollo query to continially update the component even if nothing else changed
      const timestamp = new Date().toString();

      return {
        clusters, applications, compliances, timestamp,
      };
    },
  },
};
