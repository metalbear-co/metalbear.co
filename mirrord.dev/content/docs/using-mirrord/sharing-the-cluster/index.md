---
title: "Sharing the Cluster"
description: "How mirrord makes it possible for developers to use the same cluster concurrently."
date: 2024-01-10T13:37:00+00:00
lastmod: 2024-01-10T13:37:00+00:00
draft: false
images: []
menu:
docs:
teams:
weight: 170
toc: true
tags: ["team", "enterprise"]
---

The core value of mirrord is that it cuts iteration time by letting developers run their code against the cluster directly, instead of having to build, push and deploy images. This significantly cuts down iteration time by letting developers test their code in the cloud from the very first step of the development cycle. However, in order to properly test new code in the cloud, it needs to be able to not only read or receive traffic from the environment, but also to write or send traffic to it, potentially mutating it.

This raises the question, what if I want multiple users in my organization to use the same cluster (e.g. the organization's staging cluster) concurrently? Wouldn't they step on each other toes and affect each other's work?

1. If one developer steals traffic from a remote service, wouldn't that prevent other users from stealing or mirroring traffic from that same service?
2. If a service reads from a queue, wouldn't a developer targeting it with mirrord steal all the messages from the queue, preventing other developers from reading them?
3. If a developer writes to a database, wouldn't that affect the data that other developers see when they read from the same database?

These conflicts and more are resolved by the mirrord Operator, available in the mirrord Team and Enterprise plans. By having a persistent, centralized component in the cluster that can synchronize and orchestrate different instances of mirrord running in the cluster, we can allow developers to use mirrord against the same cluster without affecting each other.

## What capabilities does mirrord have to allow concurrent usage of the same cluster?

{{<figure src="images/shared-cluster.png" alt="Using clusters concurrently with mirrord" class="w-4/5 margin-auto zoomable">}}

### 1. Concurrently debug the same HTTP server with HTTP filters
mirrord's HTTP filters let users only steal a subset of the incoming traffic to the remote service. By adding personalized headers to incoming traffic and then configuring mirrord to only steal traffic with those headers, users can debug the same service concurrently without affecting each other. [Learn more about HTTP filters](/docs/using-mirrord/steal/#stealing-only-a-subset-of-the-remote-targets-traffic).
> **_NOTE:_**  While HTTP filters are supported in the OSS version of mirrord, concurrently debugging the same service using HTTP filters is only supported in the Team and Enterprise versions.


### 2. Concurrently debug the same queue-based service with queue splitting
mirrord's queue splitting feature lets users only steal a subset of the messages from a queue. By configuring mirrord to only steal messages with specific properties, users can debug the same queue-based service concurrently without affecting each other. [Learn more about queue splitting](/docs/using-mirrord/queue-splitting/).

### 3. Prevent unwanted behavior with mirrord Policies
mirrord Policies let you define rules that prevent users from doing certain actions. For example, you can prevent users from writing to a database, or from stealing traffic without using an HTTP filter. [Learn more about mirrord Policies](/docs/using-mirrord/policies/).

### 4. Communicate with local components using the outgoing traffic filter
Sometimes a database is just too sensitive to write to remotely. Or maybe you want to test a migration, and don't want it to affect your coworkers who are using the same cluster. In these cases, you can use the outgoing traffic filter to send traffic to a locally running component instead of the one that's running in the cluster. Your local process will still communicate with all of its other dependencies remotely in the cluster. [Learn more about the outgoing traffic filter](/docs/using-mirrord/outgoing-traffic-filter/).

### 5. View other sessions running in the cluster (and kill them if necessary)

Sometimes, all you need to avoid clashes is just to see what other users are doing in the cluster. The `mirrord operator status` command displays a list of all the currently running sessions in the cluster, along with the user who started them. If you see a session that's causing problems, you can kill it using the `mirrord operator kill` command (given you have the necessary permissions). [Learn more about managing mirrord sessions](/docs/using-mirrord/sessions/).

## Conclusion

Even though using mirrord with a shared cluster is already safer than actually deploying your code to it, we're constantly working to make it even safer and more seamless for multiple users to use mirrord concurrently on the same environment. If you have any questions or suggestions, please don't hesitate to reach out to us [here](/contact) or on our [Discord](discord.gg/metalbear). Happy mirroring!