---
title: "General"
description: "General questions about mirrord."
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
images: []
menu:
  docs:
    parent: "faq"
weight: 110
toc: true
tags: ["open source", "team", "enterprise"]
---

### What does mirrord actually do?

First and most important, mirrord *doesn't just mirror traffic*. It does that, but also a lot more.

mirrord lets you connect a process on your development machine to your Kubernetes cluster. It does this by injecting itself into the local process (no code changes needed!), intercepting all of the input and output points of the process - network traffic, file access, and environment variables - and proxying them to the cluster. This mechanism is discussed in more detail [here](../../reference/architecture/#mirrord-layer).

When you run mirrord, you select a Target - this is the Kubernetes Pod or Deployment whose context you want your local code to run in. For example, if you have a staging cluster running the latest stable version of all of your microservices, and you're now coding the next version of one of these microservices, you'd select as your Target the Pod or Deployment running the stable version of that microservice in staging. The following things will then happen:
- The Target's environment variables will be made available to the local process.
- When the local process tries to read a file, it will be read from the Target's filesystem instead.
- Traffic reaching the remote Target will reach your locally running process (this incoming traffic can either be mirrored, intercepted entirely, or intercepted based on a filter you define).
- Traffic sent out from your local process will be sent out from the Target instead, letting it reach any endpoint that's accessible to the Target, and the response will be sent back to your local process.

By proxying all of your local process' input and output points in this way, mirrord makes it "think" it's running in the cloud, which lets you test it in cloud conditions:
1. Without having to run your entire architecture locally
2. Without going through lengthy CI and deployment processes
3. Without deploying untested code to the cloud environment - the stable version of the code is still running in the cluster and handling requests - letting multiple users test on the same cluster without queueing to use it or breaking the cluster for everyone else.

### Is mirrord free?

mirrord is free and open source (MIT License).
Our paid offering, mirrord for Teams, includes a Kubernetes operator that acts as a control plane for mirrord.
You can read more about it [here]({{< ref "/docs/overview/teams" >}} "mirrord for Teams").

### Can I intercept traffic instead of duplicating it?

Yes, you can use the `--steal` flag to intercept traffic instead of duplicating it.

### Does mirrord install anything on the cluster?

No, mirrord doesn't install anything on the cluster, nor does it have any persistent state. It does spawn a short-living pod/container to run the proxy, which is automatically removed when mirrord exits. mirrord works using the Kubernetes API, and so the only prerequisite to start using mirrord is to have kubectl configured for your cluster.

If you have any restrictions for pulling external images inside your cluster, you have to allow pulling of ghcr.io/metalbear-co/mirrord image.

### How does mirrord protect against disrupting my shared environment with my local code?

* By letting you mirror traffic rather than intercept it, the stable version of the code can still run in the cluster and handle requests.
* By letting you control which functionality runs locally and which runs in the cloud, you can configure mirrord in the way that's safest for your architecture. For example, you can configure mirrord to read files and receive incoming traffic from the cloud, but write files and send outgoing traffic locally.
Our main goal in future versions of mirrord is to reduce the risk of disruption of the shared environment when using mirrord. This will be achieved by providing more granular configuration options (for example, filtering traffic by hostname or protocol), and advanced functionality like copy-on-write for databases.

### Can I use mirrord to run a local container, rather than a local process, in the context of the remote Kubernetes cluster?

Yes! You can use the `mirrord container` command to run a local container in the context of the remote Kubernetes cluster. You can read more about it [here]({{< ref "/docs/using-mirrord/local-container" >}} "Local Container").

### What if I can't create containers with the capabilities mirrord requires in my cluster?

mirrord works by creating an agent on a privileged pod in the remote cluster that accesses another pod's namespaces (read more about it [here](https://metalbear.co/blog/getting-started-with-ephemeral-containers/)).
If you can't give your end users permissions to create pods with the capabilities mirrord needs, we suggest trying out [mirrord for Teams]({{< ref "/docs/overview/teams" >}} "mirrord for Teams"). It adds a Kubernetes operator that acts as a control plane for mirrord clients, and lets them work with mirrord without creating pods themselves.
If mirrord for Teams doesn't work for you either, [let us know](mailto:hello@metalbear.co) and we'll try to figure a solution that matches your security policies.

### What kinds of Kubernetes objects can I use as a remote target?
mirrord OSS supports the following Kubernetes objects as targets:
- Pods
- Deployments
- Argo Rollouts

In mirrord OSS, mirrord will always target a random pod when a workload with multiple pods is used as the remote target.

mirrord for Teams adds support for the following workloads:
- Jobs
- CronJobs
- StatefulSets

In mirrord for Teams, mirrord will always target all pods when a workload with multiple pods is used as the remote target.

Both in mirrord OSS and mirrord for Teams, if you don't name any specific container to be targeted, mirrord will pick the first container from the pod spec. Some containers, like service mesh proxies, will be automatically ignored.