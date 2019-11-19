# search-api
[![Build Status](https://travis.ibm.com/IBMPrivateCloud/search-api.svg?token=FQtRyxd2oucrshZSEEqZ&branch=master)](https://travis.ibm.com/IBMPrivateCloud/search-api)

## Using the Search API
https://github.ibm.com/IBMPrivateCloud/search/wiki/Using-the-Search-API


## Setup for development
1. The folloing environment variables need to be set.
```
cfcRouterUrl
redisEndpoint - Endpoint of RedisGraph server ie. "//redis-host:6379"
redisPassword - Password to authenticate with the RedisGraph server.
PLATFORM_IDENTITY_PROVIDER_URL
ARTIFACTORY_USER - mcmdev@us.ibm.com
ARTIFACTORY_PWD - Artifactory API KEY, base64 encoded. You can get this value for functional id mcmdev@us.ibm.com from: https://ibm.ent.box.com/notes/287638278960
localKubeToken - the token that you can get from the top right corner of mcm-ui page - configure client - the value of kubectl config set-credentials admin --token, it's a long string, starts with "ey...". Please note that this value is updated every 24 hrs.
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

1. Edit the `search-search-redisgraph` service and add a NodePort.

    ```
    kubectl edit service search-search-redisgraph
    ```

    ```
    ports:
    - name: redisgraph
      port: 6380
      protocol: TCP
      targetPort: 6380
      nodePort: 30100
    ```
2. Set `redisSSLEndpoint`, format is `\\<clusterIp>:<nodePort>` and `redisPassword` on your config.json. This command gets the redisPassword from your cluster.

    ```
    kubectl get secret search-redisgraph-user-secrets -o json | jq -r '.data.redispwd' | base64 -D | pbcopy
    ```
4. Set the certificate on `./rediscert/redis.crt` or `redisCert`.

    ```
    kubectl get secret search-search-secrets -o json | jq -r '.data["ca.crt"]' | base64 -D | pbcopy
    ```
