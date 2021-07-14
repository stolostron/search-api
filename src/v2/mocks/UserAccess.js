// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

const mockResponse = {
  body: {
    status: {
      allowed: true,
      reason: 'RBAC: allowed by ClusterRoleBinding "oidc-admin-binding" of ClusterRole "cluster-admin" to User "admin"',
    },
    spec: {
      resourceAttributes: {
        verb: 'delete',
        resource: 'pods',
      },
    },
  },
};

export default mockResponse;
