The Search API is implemented with GraphQL. This document explains how to access the service to send requests.

## Pre-requisite
- Red Hat Advanced Cluster Management installed on your OpenShift cluster.

## Locate the Search API endpoint
### From within the cluster
If your application is deployed in the cluster, and it has the correct permissions, it can send requests to https://search-search-api.open-cluster-management.svc:4010/searchapi/graphql

### From outside the cluster
By default, the Search API is not exposed. Follow [this topic](https://docs.openshift.com/container-platform/4.9/networking/routes/secured-routes.html) to create a secure route to the service `search-search-api` in the `open-cluster-management` namespace.

```
# NOTE: this sample requires an insecure connection from the client.
oc create route passthrough search-api --service=search-search-api -n open-cluster-management
```

The route should look like this:  `https://search-api-open-cluster-management.apps.[your-ocp-hostname]/searchapi/graphql`

## Authenticating the requests

The Search API needs to impersonate a user (or ServiceAccount) to ensure that results only contain resources for the authorized user.

- A user can obtain their token with `oc whoami -t`
- For a service account the token is in a secret. [This article](https://www.ibm.com/docs/en/cloud-paks/cp-management/2.0.0?topic=kubectl-using-service-account-tokens-connect-api-server) explains how to get the token.

Use the token your requests `Authorization` header as `Bearer ${TOKEN}`.


## Sending the request (GraphQL)

Use curl, postman, or your favorite client to send the POST request to the GraphQL server.
The GraphQL schema is defined [here.](https://github.com/stolostron/search-api/blob/main/src/v2/schema/search.js) At the moment, the schema is the only API documentation.

Here are some sample requests.

#### Search for pod resources `kind:pod`
```bash
URL="https://$(oc get route search-api -n open-cluster-management | awk 'NR==2' |awk '{print $2;}')/searchapi/graphql" && \
TOKEN=$(oc whoami -t) && \
curl --insecure --location \
--request POST $URL \
--header "Authorization: Bearer $TOKEN" \
--header 'Content-Type: application/json' \
--data-raw '{"query":"query searchResultItems($input: [SearchInput]) {\n    searchResult: search(input: $input) {\n        items\n        }\n    }\n","variables":{"input":[{"keywords":[],"filters":[{"property":"kind","values":["pod"]}],"limit":100}]}}'
```

#### Get pods related to the deployment named search-ui
```bash
URL="https://$(oc get route search-api -n open-cluster-management | awk 'NR==2' |awk '{print $2;}')/searchapi/graphql" && \
TOKEN=$(oc whoami -t) && \
curl --insecure --location \
--request POST $URL \
--header "Authorization: Bearer $TOKEN" \
--header 'Content-Type: application/json' \
--data-raw '{"query":"query searchResultItems($input: [SearchInput]) {\n    searchResult: search(input: $input) {\n        related {\n            kind\n            items\n        }\n    }\n}\n","variables":{"input":[{"keywords":[],"filters":[{"property":"kind","values":["deployment"]},{"property":"name","values":["search-ui"]}],"relatedKinds":["pod"],"limit":100}]}}'
```

## Performance Notes
- Throttle your requests to prevent addding a high load.
- The first request from each user will take longer because the service needs to build the RBAC filters. These are cached for 10 minutes or (RBAC_INACTIVITY_TIMEOUT)
- Add the more specific filters first. For example searching for `name:abc cluster:xyz` is more efficient than `cluster:xyz name:abc`