---
title: "Supercharging Development With Dapr and mirrord"
description: "Learn how Dapr makes cloud application development easier and how to simplify local development after adopting Dapr with Kubernetes using mirrord, improving your developer experience."
lead: "Combining Dapr and mirrord makes developing cloud-native applications simpler and greatly improves your developer experience."
slug: "dapr-mirrord"
tags:
  - DevEx
  - Developer Experience
  - dapr
  - Cloud-Native
  - mirrord
categories:
  - kubernetes
  - developer-tools
  - debugging
  - networking
date: 2025-07-10
summary: >
    Dapr makes developing cloud-native apps easier, but local Kubernetes development can still be challenging. mirrord lets you quickly test your local Dapr code against the real Kubernetes environment, keeping your workflow simple and productive.
canonicalurl: "https://metalbear.co/blog/dapr-mirrord"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
---

[Dapr](https://dapr.io/) (Distributed Application Runtime) is a framework designed to simplify building cloud-native applications. By abstracting tasks like service invocation, pub/sub, state management, and telemetry, Dapr significantly speeds up development. In this blog, we’ll look at what problems Dapr solves (and why you should be using it), what the local development experience (DevEx) looks like when you start using Dapr with Kubernetes, and then a demo on how you can improve that DevEx using [mirrord](https://metalbear.co/mirrord/)!

## The Problems Dapr Solves

Building modern cloud-native applications often requires developers to tackle complex problems that have little to do with their actual business logic. These tasks end up taking away a huge chunk of their time, time which could’ve been spent working on the actual product itself.

For example, let's say your application has multiple microservices that need to communicate using publish/subscribe messaging (pub/sub). Without Dapr, your developers would need to handle all the details directly, things like setting up connections to a messaging system (like Kafka or RabbitMQ), managing retries, dealing with message formatting, and handling failures. Doing this across multiple services leads to duplicated and harder to maintain code.

Dapr simplifies this by providing a straightforward pub/sub API. Instead of directly handling messaging system details, developers simply tell Dapr to publish a message or subscribe to messages. Dapr takes care of message delivery, retries, and error handling behind the scenes.

{{<figure src="pubsub-overview.png" title="An overview of how pub/sub works with Dapr (taken from the Dapr docs)" alt="An overview of how pub/sub works with Dapr" height="100%" width="100%">}}

This approach not only saves your developers from writing the same boilerplate code over and over again, but it also has an added bonus: flexibility. If your team later decides to switch from one messaging system (like Kafka) to another (like RabbitMQ) your developers don't need to rewrite any code. They just update a configuration file, and Dapr takes care of the rest.

Pub/sub messaging is just one example we discussed here. Dapr also [provides APIs](https://docs.dapr.io/developing-applications/building-blocks/) for managing state, invoking other services reliably, handling secrets securely, adding observability, and more. In short, Dapr helps you avoid infrastructure headaches, keeps your code simple, and allows your developers to focus on building your product.

## Problems When Developing Using Dapr and Kubernetes

So your team has recognized the value Dapr provides, and you decide to adopt Dapr to help decouple your services from specific infrastructure dependencies.

When deploying with Kubernetes in production, adopting Dapr is straightforward. Kubernetes automatically injects a dedicated Dapr sidecar alongside each application pod. These sidecars manage communication with the infrastructure components.

{{<figure src="dapr-injection.png" title="How sidecar injection works when using Dapr with K8s" alt="An overview of how sidecar injection works when using Dapr with K8s" height="100%" width="100%">}}

But as soon as your team starts developing and testing locally, complexities emerge. Unlike the automatic sidecar injection that Kubernetes provides, local setups require manual effort. Developers typically use Docker Compose or manually bootstrap the Dapr runtime (using their CLI) to mimic the Kubernetes environment. These approaches, while functional, never fully replicate the production setup. Differences in networking, configuration, security policies, and environment variables often slip in unnoticed.

The result? Developers end up solely depending on CI pipelines and staging environments to get assurance that the code they’ve written will work. Pipelines and deployments to staging take anywhere from a few minutes to half an hour. This breaks developer flow, reduces iteration speed, and ultimately delays your team’s ability to ship things.

mirrord is built precisely to resolve this friction.

## Introduction to mirrord

mirrord allows you to run your local code in the context of a Kubernetes cluster. It does so by letting you mirror incoming and outgoing traffic between the cluster and your local machine. It also allows your locally running code to access environment variables and other configuration from the cluster. By doing all this, mirrord makes your local process "think" it’s running in the cloud, allowing you to test it under production-like conditions. If you’d like to learn more about how mirrord works, check out [our docs](https://metalbear.co/mirrord/docs/overview/introduction/#how-it-works).

Using mirrord enables the code you write locally to interact directly with the Kubernetes deployed Dapr sidecars and other services running in the cluster. With mirrord, you can:

* Run your services locally but interact with real Dapr sidecars and other cluster services without deploying your code each time.  
* Steal traffic from a running Kubernetes pod in your staging environment to simulate production-like interactions.  
* Leverage actual Kubernetes configurations, including secrets, environment variables, and service mesh setups.

This means:

* You iterate rapidly on your Dapr-enabled service without going through CI pipelines and deployments multiple times.  
* You debug and test locally but using actual cluster behavior, data, and interactions.  
* You don’t have to rely on tools like Docker Compose to run and manage containers locally during development, avoiding the need to rebuild images, restart containers, and wait.

### Why Is This Better Than Using Something Like Tilt?

Tilt is another tool that people use to simplify local development of cloud applications. Tilt works by building and deploying container images as you make code changes. However, even though Tilt automates these steps, it still requires repeatedly building and deploying containers for every iteration, which slows down your feedback loop.

In contrast, mirrord completely removes this repetitive overhead by directly integrating your local environment with your Kubernetes cluster. With mirrord, your code behaves as if it were running in the cluster (using cluster services and configurations) which provides immediate feedback without the constant need to rebuild and redeploy.

## Using Dapr with mirrord

### Prerequisites

In order to follow along with this step-by-step tutorial, make sure you have the following set up:

* A Kubernetes cluster (I’ll be using [k3d](https://k3d.io/stable/))  
* [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)  
* [mirrord Operator](https://metalbear.co/mirrord/docs/overview/quick-start/#operator) installed in the cluster  
* [mirrord VS Code](https://metalbear.co/mirrord/docs/using-mirrord/vscode-extension/) extension installed  
* Clone the sample application we’ll be working with

Note that while I’ll be using mirrord with VS Code it supports other code editors like Cursor, Windsurf, and the JetBrains IDEs as well. You can also always using the [mirrord CLI](https://metalbear.co/mirrord/docs/overview/quick-start/#cli-tool) instead of the code editor extensions.

### Create a Kubernetes Cluster

We'll use k3d to create a local Kubernetes cluster:

```
k3d cluster create dapr-mirrord
```

This will spin up a lightweight, local K8s cluster with Docker containers. Feel free to use a cluster with any of the cloud providers or other local tools like minikube, kind, etc. mirrord just requires a Kubernetes cluster; it doesn’t matter where it is running :)

Note that we’re only using a local cluster in this demo so that it’s easy to follow along. Ideally, you’ll want to use mirrord with a cluster that looks like your production environment, for example, a staging or testing cluster.

### Initialize Dapr in the Cluster

Once your cluster is up, initialize Dapr in Kubernetes mode using the dev option:

```
dapr init -k --dev
```

This installs the Dapr control plane and necessary components in the cluster. The `--dev` flag deploys the Redis and Zipkin components that Dapr needs in the Kubernetes cluster itself. You can learn more about different ways to configure Dapr in a Kubernetes cluster [here](https://docs.dapr.io/operations/hosting/kubernetes/cluster/).

### Deploy Sample Services

In this guide, we’ll be working with the Hello Kubernetes starter app from the Dapr community. Clone the version of the sample application we have here. The app consists of two microservices: a Node.js app and a Python app that work together using Dapr. The Python app generates messages and the Node app consumes and persists them. The following architecture diagram illustrates the components that make up this app:

Apply the Kubernetes manifests:

```shell
kubectl apply -f ./deploy/node.yaml
kubectl apply -f ./deploy/python.yaml
```

These YAML files define deployments and Dapr sidecars for each service.

### Observe the Live Cluster Logs

Let’s take a look at what the `node` service is currently logging. This will help you understand how things work before we insert mirrord into the picture.

```shell
kubectl logs --selector=app=node -c node --tail=-1
```

Sample output:

```
Got a new order! Order ID: 155266
Successfully persisted state for Order ID: 155266
Got a new order! Order ID: 155267
Successfully persisted state for Order ID: 155267
...
```

These logs show that the service is receiving and processing orders inside the cluster as expected.

### Changing Code to Add Debug Info to the Node App

Let’s modify the Node app to log the pod name handling the request. This will let us confirm whether the request is handled locally (by mirrord) or in the cluster.

In `./node/app.js`, change this line:

```javascript
console.log("Got a new order! Order ID: " + orderId);
```

To this:

```javascript
console.log("Got a new order! Order ID: " + orderId + ", pod Name: " + process.env.HOSTNAME ?? "unknown");
```

This will print the pod name in each log entry.

### Create a mirrord.json Config File

By default, mirrord will “mirror” the traffic coming to the targeted microservice, and the original microservice running in the cluster will continue replying to requests. Since we want to test the response of our code as well (that is, see the pod name in the logs), we need to enable the [steal mode](https://metalbear.co/mirrord/docs/using-mirrord/steal/) in mirrord. We can do this by creating a simple configuration file `./.mirrord/mirrord.json`:

```json
{
  "feature": {
    "network": {
      "incoming": "steal"
    }
  }
}
```

The `incoming: "steal"` setting tells mirrord to intercept (or “steal”) incoming traffic meant for the remote pod and forward it to your local process. The local process will then be the one replying to any requests meant for the remote pod. This is key to letting you test local code as if it were inside the cluster.

### Activate mirrord in VS Code

Now let’s run the Node app locally using mirrord:

* Click the mirrord icon in the VS Code bottom menu.  
* Select “Select Active Config” and choose the location of your `mirrord.json`.  
* Go to the “Run and Debug” section in VS Code.  
* Make sure to run `npm install` inside the node directory so the app can start.  
* Start the Node app in debug mode from VS Code.

### Watch Traffic Getting Stolen

Once your local app is running, you'll start seeing logs like:

```
Got a new order! Order ID: 154876, pod Name: nodeapp-569c55fffc-wc7kr
Successfully persisted state for Order ID: 154876
Got a new order! Order ID: 154877, pod Name: nodeapp-569c55fffc-wc7kr
Successfully persisted state for Order ID: 154877
...
```

The pod name now appears in the logs, but the really cool part you need to pay attention to is that the code for logging the pod name is only present in the locally running app, not the actual pod in the cluster. That means:

* You're intercepting requests meant for the remote pod.  
* Your local process is inheriting configuration (like the pod name) from the cluster.  
* You're able to test local code changes immediately without any image rebuilds or redeploys.

## Make Cloud Development Easier With Dapr and mirrord

To sum up, building cloud-native applications is hard for many different reasons, and tools like Dapr can help fix some of those frustrations. Letting Dapr abstract away the infrastructure-related configuration allows you to focus on your application. But when adopting tools like Dapr, your dev environment slowly starts drifting away from production, and you find yourself relying on CI pipelines and staging environments much more, which kills developer productivity. mirrord fixes that. Using Dapr and mirrord together allows you to focus solely on your application code while letting the two tools handle infrastructure and dev environment setup complexities. Together, they create a development experience that allows your team to ship code significantly faster than before! If you’d like to learn more about mirrord, check out our [documentation](https://metalbear.co/mirrord/docs/overview/introduction/).