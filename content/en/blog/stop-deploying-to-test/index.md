---
title: "Stop Deploying Just To Test!"
description: "Learn why deploying to staging is not always necessary and how remocal testing can speed up feedback loops without sacrificing test accuracy."
lead: "Learn why deploying to staging is not always necessary and how remocal testing can speed up feedback loops without sacrificing test accuracy."
slug: "stop-deploying-to-test"
tags:
  - DevEx
  - Developer Experience
  - Cloud-Native
  - mirrord
categories:
  - kubernetes
  - developer-tools
date: 2025-07-01
summary: >
    Developers shouldn't have to deploy code just to test small changes. This blog explores how remocal workflows, like those enabled by mirrord, let you test against staging or production-like environments without the time-consuming deploy step. Cut feedback loops from hours to seconds, stay in flow, and validate more accurately without clogging your CI pipelines.
canonicalurl: "https://metalbear.co/blog/stop-deploying-to-test"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - ""
---

Staging environments are the default method for validating how an application would behave before it reaches production. They provide a safe environment to test changes under conditions that closely match your live infrastructure. This model still holds value, but only when used for its intended purposes: **final integration and pre-release validation**.

The problem we want to highlight in this blog isn’t about staging itself. It’s what companies are doing *before* they even get there. As part of modern CI/CD pipelines, every incremental change goes through pipelines that spin up test environments. This means developers end up waiting a long time even to test out small changes. And there’s no way for them to test their changes in a production-like environment without going through these pipelines.

This practice slows the feedback loop. Instead of testing in fast, isolated workflows during development, we push every change through a build-deploy cycle. Multiply that by the number of developers, branches, and daily commits, and you’ve created a bottleneck where **test environments are saturated**, pipelines are clogged, and staging validation gets delayed or rushed.

The result? We’re not moving faster. We’re just burning more time earlier.

In this piece, you’ll see how [remocal](https://thenewstack.io/remocal-development-the-future-of-efficient-kubernetes-workflows/) workflows (remote + local testing) reduce deployment overhead, tighten feedback loops, and help you stay focused without compromising test accuracy. This makes testing in a production-like environment a natural part of everyday development, rather than a disruptive step.

## Why staging environments became the default and where they slow you down

Staging environments were created to solve a real problem. Code that works on your machine does not always behave the same way once deployed. Differences in network conditions, environment variables, database configurations, and service dependencies can introduce bugs that do not appear locally. By replicating the production environment, staging provided a controlled space to identify and resolve these issues early and validate changes without exposing real users to risk.

For a long time, this approach made sense. You would push a branch, trigger a CI pipeline, build a container, and deploy it into a staging environment. It added overhead, but when releases were less frequent and changes were larger, the time investment was justified by the safety it provided.

As development practices shifted toward faster and smaller releases, however, the tradeoff became harder to accept. Developers found themselves deploying to staging just to run basic validation checks like:

- Checking whether an API response returned the correct data.
- Confirming that a database interaction behaved as expected.
- Investigating integration errors that only surfaced outside local setups.

These small checks still required running pipelines, building images, and waiting for full deployments to complete. What was meant to protect production ended up slowing development down. Feedback loops stretched from minutes into hours. These delays compounded into lost focus, slower iteration, and harder-to-maintain momentum.

But what if you could use staging for that validation without deploying anything while benefiting from its production-like context?

## What if you could test without deploying?

That is the question more teams are starting to ask, and starting to answer with remocal workflows.

Developers no longer need to deploy to verify small interactions across services. With remocal workflows, you can connect your local application directly to a staging environment without repeating the full deployment cycle.

This approach improves the feedback loop in several ways:

- You stay closer to your code, reducing lost time between writing and validation.
- You avoid the overhead of running pipelines and building containers for small changes.
- You maintain better focus by removing unnecessary context switches during development.

Remocal testing lets you surface integration issues early, reproduce environment-specific bugs quickly, and stay in flow without constant context switching.

For validating API integrations, troubleshooting service behavior, or testing application logic under live conditions, remocal testing offers a faster and lighter path than traditional deployment-driven workflows.

## How remocal testing works without deploying code

Several technical capabilities make remocal possible:

- **Redirecting network traffic** from a staging environment to your local machine.
- **Mirroring environment variables** and service configurations into your local process.
- **Intercepting requests** that the local app makes to the filesystem and then proxying them to the cluster

That’s the exact workflow you can use [mirrord](https://metalbear.co/mirrord/?utm_source=blog&utm_medium=social&utm_campaign=blog-stop-deploying-to-test) to achieve.

By connecting your local process to a remote Kubernetes environment, you can mirror the runtime behavior of your application without deploying it. mirrord does this by intercepting system-level operations and rerouting them through a remote pod in your cluster, as seen below:

{{<figure src="how-mirrord-works.svg" title="How mirrord works" alt="How mirrord works" height="100%" width="100%">}}

The setup has two main components:

- **mirrord-layer** is a dynamic library that runs inside your local process. It intercepts system calls related to networking, file access, and environment variables.
- **mirrord-agent** is a lightweight agent that runs in your Kubernetes cluster. It sits inside the same namespace as the pod you want to mirror and acts as a bridge between the cluster and your local machine.

When you start your application with mirrord, the mirrord-layer hooks into your process, and the agent connects to the target pod. Any inbound traffic meant for that pod can be routed to your machine. Your local app can make requests using the same DNS names, environment variables, and service routes that it would inside the cluster.

This means you can use mirrord to:

- Debug production-only issues by simulating pod behavior locally.
- Interact with services in your cluster without deploying containers.
- Validate API responses, database queries, or internal service calls with live infrastructure.

In the next section, you’ll install mirrord and use it in your development workflow. If that resonates with you, [give it a try](https://app.metalbear.co/account/sign-up/?utm_source=blog&utm_medium=social&utm_campaign=blog-stop-deploying-to-test) now and follow along.

## How to use mirrord in your development workflow

You only need access to the Kubernetes cluster where your target pod is running.

Before you begin, make sure you have the following:

- mirrord installed locally (via the CLI or your IDE plugin for VS Code or IntelliJ). Refer to the [mirrord documentation for installation instructions.](https://mirrord.dev/docs/overview/quick-start/?utm_source=blog&utm_medium=social&utm_campaign=blog-stop-deploying-to-test)
- [kubectl configured](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl) to connect to the cluster you want to test against.

Once your environment is ready, here’s how to get started.

Navigate to your project directory and run:

`mirrord exec --target deployment/<your_deployment_name> <your_start_command>`

Replace `<your_deployment_name>` with the name of the deployment that manages the service you want to connect to. Replace `<your_start_command>` with the command you typically use to run your application, such as:

```bash
npm run dev
python app.py
go run main.go
```

mirrord will start your application and automatically connect it to the cluster. You can now test your local changes in a live environment without needing to deploy them.

While mirrord is running, your application can:

- Receive live traffic meant initially for the pod.
- Access internal services and databases using cluster DNS.
- Use the same environment variables as the remote pod.
- Mirror file access from the remote pod if needed.

This provides the same testing context as staging, but without the deployment overhead. 

## What’s next?

You don't need to overhaul your entire workflow. Start small and pick a simple change (it could be something you’d normally deploy to verify) and run it locally with mirrord connected to your cluster. See how it behaves. Check if the integration holds. Watch how quickly the feedback comes in.

When you see it work for one small change, try something bigger - a full feature or bug fix.

The goal isn't to eliminate staging. It's to stop depending on it for every change so that you can test faster. As next steps, you can explore the [mirrord docs](https://metalbear.co/mirrord/docs/overview/introduction/?utm_source=blog&utm_medium=social&utm_campaign=blog-stop-deploying-to-test) or [try it out](https://app.metalbear.co/account/sign-up/?utm_source=blog&utm_medium=social&utm_campaign=blog-stop-deploying-to-test) in your next dev cycle.