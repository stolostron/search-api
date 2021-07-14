// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project
const mockResponse = {
  body: {
    apiVersion: 'v1',
    items: [
      {
        apiVersion: 'project.openshift.io/v1',
        kind: 'Project',
        metadata: {
          annotations: {
            'openshift.io/description': '',
            'openshift.io/display-name': '',
            'openshift.io/requester': 'kube:admin',
            'openshift.io/sa.scc.mcs': 's0:c25,c10',
            'openshift.io/sa.scc.supplemental-groups': '1000620000/10000',
            'openshift.io/sa.scc.uid-range': '1000620000/10000',
          },
          creationTimestamp: '2020-07-07T18:12:40Z',
          labels: {
            'cluster.open-cluster-management.io/managedCluster': 'fake-cluster',
          },
          name: 'fake-cluster',
          resourceVersion: '560202',
          selfLink: '/apis/project.openshift.io/v1/projects/fake-cluster',
          uid: 'b67f4bfa-59a3-425c-8930-79ca546d11c7',
        },
        spec: {
          finalizers: [
            'kubernetes',
          ],
        },
        status: {
          phase: 'Active',
        },
      },
    ],
  },
};

export default mockResponse;
