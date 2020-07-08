# search-api
[![Build Status](https://travis-ci.com/open-cluster-management/search-api.svg?token=ft4iXTJ1omTSQEbPMykc&branch=master)](https://travis-ci.com/open-cluster-management/search-api)


## Using the Search API
https://github.com/open-cluster-management/search/wiki/Using-the-Search-API


## Setup for development

1. Configure the folloing environment variables.
    Name              | Default                        | Description
    ---               | ---                            | ---
    API_SERVER_URL    | https://kubernetes.default.svc | Kubernetes API server. `oc cluster-info`
    SERVICEACCT_TOKEN | ""                             | Get this token with `oc whoami -t`
    redisEndpoint     | //localhost:6379               | RedisGraph server. Use only whith RedisGraph on local machine.
    redisSSLEndpoint  | redisgraph-route:443           | RedisGraph server with SSL. 
    redisPassword     | ""                             | RedisGraph password. `oc get secret redisgraph-user-secret -o json | jq -r '.data.redispwd' | base64 -D`

2. Start the dev server
```
npm i
npm start
```
3. Start the production server
```
npm i
npm run build
npm run start:production
```

## Environment variables

Name                    | Default | Description
---                     | ---     | ---
defaultQueryLimit       | 10000   | Limits the resources returned by a search query.
defaultQueryLoopLimit   | 5000    | Chunk size used by the keyword search logic.
RBAC_POLL_INTERVAL      | 60000   | Interval at which we revalidate the RBAC cache.
RBAC_INACTIVITY_TIMEOUT | 600000  | Stop revalidating RBAC cache after user is inactive for this period.

## Developing with RedisGraph in a live cluster.

1. Create a route to expose the `search-redisgraph` service.

    ```bash
    RG_SERVICE_NAME=$(oc get service -n open-cluster-management |grep search-redisgraph | awk '{print $1;}')
    oc create route passthrough redisgraph --service=$RG_SERVICE_NAME --insecure-policy='Redirect' --port='redisgraph' -n open-cluster-management
    ```
    - Your route should look like this: https://redisgraph-open-cluster-management.apps.[your-ocp-hostname].com

2. Set `redisSSLEndpoint` on your config.json. The format is `<redisgraph-route>:443`
3. Set `redisPassword` on your config.json. Use this command to get the redisPassword from your cluster.

    ```
    oc get secret redisgraph-user-secret -o json | jq -r '.data.redispwd' | base64 -D | pbcopy
    ```
4. Allow unsecured TLS connection.
    ```
    export NODE_TLS_REJECT_UNAUTHORIZED=0
    -- OR --
    process.env.NODE_TLS_REJECT_UNAUTHORIZED= '0'
    ```
