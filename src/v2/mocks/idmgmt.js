/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

/* eslint-disable class-methods-use-this */
export default class MockSearchConnector {
  async get() {
    return {
      userQueries: [
        {
          id: '1570469623824',
          name: 'All pods',
          description: 'Query for all pods',
          searchText: 'kind:pod',
        },
        {
          id: '1234567890',
          name: 'All deployments',
          description: 'Query for all deploys',
          searchText: 'kind:deployment',
        },
      ],
    };
  }
  async put(url, opts) {
    if (opts.json && opts.json.userQueries.length === 1) {
      // If we are testing delete query return only the pods search
      return {
        userQueries: [
          {
            id: '1570469623824',
            name: 'All pods',
            description: 'Query for all pods',
            searchText: 'kind:pod',
          },
        ],
      };
    }
    // If we are testing the edit return the deployment search that is updated with hub cluster
    return {
      userQueries: [
        {
          id: '1570469623824',
          name: 'All pods',
          description: 'Query for all pods',
          searchText: 'kind:pod',
        },
        {
          id: '1234567890',
          name: 'All deployments',
          description: 'Query for all deploys on hub cluster',
          searchText: 'kind:deployment cluster:local-cluster',
        },
      ],
    };
  }
}
