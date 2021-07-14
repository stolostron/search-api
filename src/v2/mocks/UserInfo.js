// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

const unitResponse = {
  body: {
    Items: [{ userId: 'admin', activeAccountId: 'id-heroic-hound-icp-cluster-account', activeAccountName: 'heroic-hound-icp-cluster Account' }],
  },
};

const seleniumResponse = {
  body: {
    Items: [
      { userId: 'admin', activeAccountId: 'id-heroic-hound-icp-cluster-account', activeAccountName: 'heroic-hound-icp-cluster Account' },
    ],
  },
};

export { unitResponse, seleniumResponse };
