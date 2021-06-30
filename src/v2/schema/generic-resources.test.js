/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import supertest from 'supertest';
import server, { GRAPHQL_PATH } from '../index';

describe.skip('Generic Resources', () => {
  test('Correctly Resolves Get Resource Locally', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          getResource(selfLink:"/api/v1/namespaces/kube-system/pods/monitoring-prometheus-nodeexporter-n6h9b", namespace:null, kind:null, name:null, cluster:"local-cluster")
        }`,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Correctly Resolves Update Local Resource', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        mutation {
          updateResource(selfLink: "/api/v1/namespaces/klusterlet", namespace: "", kind: "namespace", name: "klusterlet", cluster: "local-cluster", body: {kind: "Namespace", apiVersion: "v1", metadata: {name: "klusterlet", selfLink: "/api/v1/namespaces/klusterlet", uid: "34ddc94d-70dc-11e9-865a-00000a15079c", resourceVersion: "2120711", creationTimestamp: "2019-05-07T15:24:29Z", labels: {icp: "system", test: "test"}}, spec: {finalizers: ["kubernetes"]}, status: {phase: "Active"}})
        }
        `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Correctly Resolves Update Remote Resource', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        mutation {
          updateResource(selfLink: "/api/v1/namespaces/kube-system/secrets/platform-auth-service", namespace: "kube-system", kind: "Secret", name: "platform-auto-service", cluster: "layne-remote", body: {apiVersion: "v1", kind: "Secret", metadata: {creationTimestamp: "2019-04-16T01:40:57Z", name: "platform-auth-service", namespace: "kube-system", resourceVersion: "6278503", selfLink: "/api/v1/namespaces/kube-system/secret/platform-auth-service", uid: "ae97cf94-5fe8-11e9-bfe4-00000a150993"}, })
        }
        `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));

  test('Correctly Resolves Pod log query', () => new Promise((done) => {
    supertest(server)
      .post(GRAPHQL_PATH)
      .send({
        query: `
        {
          logs(containerName: "search-api", podName:"search-prod-28a0e-search-api-66cf776db5-7bzfh", podNamespace:"open-cluster-management", clusterName:"cluster1")
        }
      `,
      })
      .end((err, res) => {
        expect(JSON.parse(res.text)).toMatchSnapshot();
        done();
      });
  }));
});
