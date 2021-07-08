#!/bin/bash
# Copyright (c) 2021 Red Hat, Inc.
# Copyright Contributors to the Open Cluster Management project

cd sslcert
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout searchapi.key -out searchapi.crt -config req.conf -extensions 'v3_req'
cd ..

RG_SERVICE_NAME=$(oc get service -n open-cluster-management |grep search-redisgraph | awk '{print $1;}')
oc create route passthrough redisgraph --service=$RG_SERVICE_NAME --insecure-policy='Redirect' --port='redisgraph' -n open-cluster-management

oc get secrets search-redisgraph-certs -n open-cluster-management -o json |jq -r '.data["tls.crt"]' | base64 -d > ./rediscert/redis.crt


echo ""
echo "export API_SERVER_URL=$(oc status | awk 'NR==1' | awk '{print $6;}')"
export API_SERVER_URL=$(oc status | awk 'NR==1' | awk '{print $6;}')
echo "export SERVICEACCT_TOKEN=$(oc whoami -t)"
export SERVICEACCT_TOKEN=$(oc whoami -t)
echo "export redisSSLEndpoint=$(oc get route redisgraph -n open-cluster-management | awk 'NR==2' | awk '{print $2;}'):443"
export redisSSLEndpoint=$(oc get route redisgraph -n open-cluster-management | awk 'NR==2' | awk '{print $2;}'):443
echo "export redisPassword=$(oc get secret redisgraph-user-secret -n open-cluster-management -o json | jq -r '.data.redispwd' | base64 -D)"
export redisPassword=$(oc get secret redisgraph-user-secret -n open-cluster-management -o json | jq -r '.data.redispwd' | base64 -D)
echo "export NODE_TLS_REJECT_UNAUTHORIZED=0"
export NODE_TLS_REJECT_UNAUTHORIZED=0