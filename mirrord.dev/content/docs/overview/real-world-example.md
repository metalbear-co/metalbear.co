---
title: "Example"
description: "Debugging an Application with mirrord .feat NextJS"
date: 2021-09-13T10:50:00+01:00
lastmod: 2021-09-13T10:50:00+01:00
draft: true
images: []
menu:
  docs:
    parent: "overview"
weight: 120
toc: true
---

## Debugging an Application with mirrord .feat NextJS

## Setup

### Prerequisites

* [mirrord]({{< ref "/" >}} "mirrord")
* Available Kubernetes Cluster
  * Note: at the moment, because it uses `kubectl port-forward`, the tutorial does not support clusters with a service mesh like Istio or linkerd.
* [NodeJS](https://nodejs.org/en/) + [Yarn](https://www.npmjs.com/package/yarn)
* (optional) [golang-migrate](https://github.com/golang-migrate/migrate)


### Clone Repo

First clone the example repo

```bash
git clone https://github.com/metalbear-co/nodejs-example.git && cd nodejs-example
```

### Setup Cluster

For this example you will need to create a few deployments and services

```bash
kubectl apply -f app.yaml
```

This command will create four deployments and relevant services

* example-pg - Postgres Database
* example-idp - [Dexidp](https://dexidp.io/) OIDC provider
* example-blog - NodeJS application located in ./blog
* example-auditor - NodeJS application located in ./auditor

After first initialization the example-idp and example-blog deployments will not work. To fix this we need to run some migrations.

### Migrations

First, establish a connection to the cluster's database in a separate shell

```
kubectl port-forward svc/example-pg 5432:5432
```

And then run the migration script

```bash
./run_migration.sh
```

> **Note:** if you don't have golang-migrate installed you need to verify that docker can mount the `./migrations`
> folder. If the script fails refer to docker docs for
> [linux](https://docs.docker.com/desktop/settings/linux/#file-sharing)/[macOS](https://docs.docker.com/desktop/settings/mac/#file-sharing).

## Traffic Mirroring

A key feature of mirrord is mirroring requests from a Kubernetes container to a local process for debugging purposes.

For this example, you will first need to build the local auditor service

```bash
yarn && yarn workspace auditor build
```

Next you'll need to get the pod name from your cluster

```bash
kubectl get po -l app=example-auditor
```

The result should be something like

```
NAME                            READY   STATUS    RESTARTS   AGE
example-auditor-<hash>-<hash>   1/1     Running   0          5m
```

Now lets debug the container in the cluster by executing

```bash
mirrord exec --target pod/example-auditor-<hash>-<hash> yarn -- workspace auditor start
```

In a separate terminal establish a connection to the remote blog container by running

```bash
kubectl port-forward svc/example-blog 8080:8080
```

Navigate to [http://localhost:8080](http://localhost:8080) and you should start seeing "audit" logs on your local process. The requests that the example-blog is sending to the example-auditor in the cluster are mirrored and sent to your local machine as well.

Command breakdown

| mirrord exec | --target pod/example-auditor-\<hash\>-\<hash\> | yarn | -- workspace auditor start |
|---|---|---|---|
||specify the running pod to mirror|executable|executable args|

## Outgoing Traffic

Another key feature is outgoing traffic tunneling and remote DNS resolution. For example, let's say you want to test a request your service makes to a database.

Let's make a small change to `./blog/pages/index.tsx` that should print the raw response from the database when accessing the root page of the blog

```diff
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const authorised = req.cookies['oauth-access-token'] ? !!await jwtVerify(req.cookies['oauth-access-token'], await getRemoteJWKSet()) : false;
 
-  const { rows } = await pg.query(listBlogPreviews.compile({ authorised }));
+  const result = await pg.query(listBlogPreviews.compile({ authorised }));
+
+  console.log(result);
 
   return {
     props: {
-      posts: rows
+      posts: result.rows
     },
   }
 }
```

Now lets see the output

First things first you need to get the pod name from your local cluster

```bash
kubectl get po -l app=example-blog
```

The result should be something like

```
NAME                            READY   STATUS    RESTARTS   AGE
example-blog-<hash>-<hash>      1/1     Running   0          5m
```

And now lets test it:

```bash
mirrord exec --fs-mode local -x NODE_ENV --target pod/example-blog-<hash>-<hash> yarn -- workspace blog dev
```

> **Note:** connection to the remote blog container via port-forward is still required for this step, please reference
> [Mirroring](#traffic-mirroring).

Your local service accesses the database from the internal network of the Kubernetes cluster. You should be able to navigate to [http://localhost:8080](http://localhost:8080), and though you receive the result from the server instance running on the cluster, you should still see the **following log in the local machine**:

```js
Result {
  command: 'SELECT',
  rowCount: 2,
  oid: null,
  rows: [
    { id: '100', title: 'Lorem ipsum' },
    { id: '101', title: 'de Finibus Bonorum et Malorum 1.10.32' }
  ],
  fields: [
    Field {
      name: 'id',
      tableID: 16407,
      columnID: 1,
      dataTypeID: 20,
      dataTypeSize: 8,
      dataTypeModifier: -1,
      format: 'text'
    },
    Field {
      name: 'title',
      tableID: 16407,
      columnID: 2,
      dataTypeID: 25,
      dataTypeSize: -1,
      dataTypeModifier: -1,
      format: 'text'
    }
  ],
  _parsers: [ [Function: parseBigInteger], [Function: noParse] ],
  _types: TypeOverrides {
    _types: {
      getTypeParser: [Function: getTypeParser],
      setTypeParser: [Function: setTypeParser],
      arrayParser: [Object],
      builtins: [Object]
    },
    text: {},
    binary: {}
  },
  RowCtor: null,
  rowAsArray: false
}
```

Lets break down the command

| mirrord exec | --fs-mode local | -x NODE_ENV | --target pod/example-blog-\<hash\>-\<hash\> | yarn | -- workspace blog dev |
|---|---|---|---|---|---|
||disable remote file access*|exclude the NODE_ENV environment variable**|specify the running pod to mirror|executable|executable args|

\* need to disable remote file access because of yarn caching</br>
\*\* NODE_ENV is used in webpack for compilation and it can cause conflicts when running the app with dev command

## Traffic Steal

Traffic Steal lets you handle and respond to incoming requests to the pod from your local machine. In contrast to Mirroring, with Steal the response to the incoming request is sent by the local process rather than the remote pod.

First, we need to establish a connection to the remote IDP. In a separate terminal, run the following command:

```bash
kubectl port-forward svc/example-idp 5556:5556
```

Now login into the blog by navigating to [http://localhost:8080/api/login](http://localhost:8080/api/login) with the following credentials

```
email: admin@example.com
pass: password
```

You should see a third blogpost return after the authentication is finished but if you click on it you will get a `Page Not Found` message. Lets fix it

Edit `./blog/pages/blogpost/[id].tsx`

```diff
@@ -1,3 +1,4 @@
+import { jwtVerify } from 'jose';
 import type { QueryResult } from 'iql';
 import type { NextPage, GetServerSideProps } from 'next'
 import Head from 'next/head'
@@ -6,6 +7,7 @@ import Link from 'next/link'
 
 import styles from '../../styles/Home.module.css'
 
+import { getRemoteJWKSet } from '../../lib/oidc';
 import pg from '../../lib/pg';
 
 import { findBlogPreviews } from '../../query/blog';
@@ -45,9 +47,11 @@ const Home: NextPage<{ post?: BlogPost }> = ({ post }) => {
 
 
 export const getServerSideProps: GetServerSideProps = async (context) => {
+  const authorised = context.req.cookies['oauth-access-token'] ? !!await jwtVerify(context.req.cookies['oauth-access-token'], await getRemoteJWKSet()) : false;
+
   let id = (Array.isArray(context.params?.id) ? context.params?.id[0] : context.params?.id) ?? '0';
 
-  const { rows } = await pg.query<QueryResult<typeof findBlogPreviews>>(findBlogPreviews.compile({ id }));
+  const { rows } = await pg.query<QueryResult<typeof findBlogPreviews>>(findBlogPreviews.compile({ authorised, id }));
 
   return {
     props: {
```

And lets see the results by simply adding `--steal` to the previous command

```bash
mirrord exec --fs-mode local -x NODE_ENV --target pod/example-blog-<hash>-<hash> --steal yarn -- workspace blog dev
```

Refresh the page, and you should now be able to see the result.

> **Note:** connection to the blog container is still required for this step, please reference
> [Mirroring](#traffic-mirroring).

## Summary

mirrord can be used to either mirror incoming traffic without influencing the return values or it can be used to "override" the container, both options with full access to other resources in the cluster, e.g. databases, other services, mounted filesystem/configmap/secrets.<br/>
This allows you to debug your process as if it was already deployed as part of the cluster.

### Teardown

After you're done with the example you can teardown the cluster with

```bash
kubectl delete -f app.yaml
```
