# search-api
[![Build Status](https://travis.ibm.com/IBMPrivateCloud/search-api.svg?token=FQtRyxd2oucrshZSEEqZ&branch=master)](https://travis.ibm.com/IBMPrivateCloud/search-api)

## Using the Search API
https://github.ibm.com/IBMPrivateCloud/search/wiki/Using-the-Search-API


## Setup for development
1. The folloing environment variables need to be set.
```
redisEndpoint - Endpoint of RedisGraph server ie. "//redis-host:6379"
redisPassword - Password to authenticate with the RedisGraph server.
API_SERVER_URL
SERVICEACCT_TOKEN - the token that you can get from the top right corner of console-ui page - configure client - the value of kubectl config set-credentials admin --token, it's a long string, starts with "ey...". Please note that this value is updated every 24 hrs.
```
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

| Name | Default | Description |
| ---  | ---     | ---         |
|defaultQueryLimit| 10000 | Limits the resources returned by a search query. |
|defaultQueryLoopLimit | 5000 | Chunk size used by the keyword search logic. |
|RBAC_POLL_INTERVAL | 60000 | Interval at which we revalidate the RBAC cache. |
|RBAC_INACTIVITY_TIMEOUT | 600000 | Stop revalidating RBAC cache after user is inactive for this period. |

## Developing with RedisGraph in a live cluster.

1. Create a route to expose the `search-search-redisgraph` service.

    - Log to the OpenShift console.
    - On the left navigation, go to Networking -> Routes.
    - Select project kube-system (You should see 2 other routes)
    - Create a new route with the following:
        - Name: redisgraph
        - Hostname: leave blank
        - Path: leave blank
        - Service: search-search-redisgraph
        - Target Port: 6380 -> 6380 (TCP)
        - Secure Route: enable
        - TLS Termination: Passthrough
        -  Insecure traffic: None
    - Your route should look like this: https://redisgraph-kube-system.apps.search-test-1.os.fyre.ibm.com

2. Set `redisSSLEndpoint` on your config.json. The format is `<redisgraph-route>:443`
3. Set `redisPassword` on your config.json. Use this command to get the redisPassword from your cluster.

    ```
    kubectl get secret search-redisgraph-user-secrets -o json | jq -r '.data.redispwd' | base64 -D | pbcopy
    ```
4. Allow unsecured TLS connection.
    ```
    export NODE_TLS_REJECT_UNAUTHORIZED=0
    -- OR --
    process.env.NODE_TLS_REJECT_UNAUTHORIZED= '0'
    ```