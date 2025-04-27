---
title: "mirrord for Teams"
description: "Intro to mirrord for Teams"
date: 2022-05-26T08:48:57+00:00
lastmod: 2022-05-26T08:48:57+00:00
draft: false
images: []
weight: 110
menu:
  docs:
    parent: "overview"
toc: true
tags: ["team", "enterprise"]
---

> Ready to start using mirrord for Teams? Register [here](https://app.metalbear.co) to get started.

## Why mirrord for Teams?

So you've tried out mirrord on your cloud development environment and you liked it. You've even shown it to your teammates, and they tried it out on their own personal environments. Great! Now all of you might want to use mirrord together on the same environment (your shared staging environment, for example). This is where things might get tricky:
1. Your DevOps team might not be too happy about giving everyone privileged permissions to the shared environment.
2. Two or more developers might want to run mirrord simultaneously on the same pod or deployment without clashing.
3. You might be sharing the staging environment with other teams, who wouldn't want you to mess with their components.
4. Your shared environment is more likely to have multi-pod deployments, which you might want to mirror entirely, rather than just the first pod.

As you might have guessed, this is where **mirrord for Teams** comes in.

## How It Works

In the basic version of mirrord, mirrord injects itself into the local process, and creates a pod in the Kubernetes cluster. It's completely standalone, and is unaware of other instances of mirrord running on the same cluster. 

In mirrord for Teams, we introduce a new component - the mirrord Operator. The Operator is a Kubernetes operator that runs persistently in the cluster and manages the mirrord instances trying to access it. The Operator itself is the one creating mirrord agents, so individual users no longer need elevated Kubernetes permissions to use mirrord. Additionally, a centralized component makes possible things like concurrent use, or limiting access or specific actions to certain cluster components.

{{<figure src="operator-architecture.svg" alt="mirrord for Teams - Architecture" class="zoomable">}}

## Supported Features
The following functionality is currently available in mirrord for Teams that isn't available in the open-source version:
- **Concurrent use** - multiple users can use mirrord on the same pod at the same time.
- **Better security and RBAC** - with the mirrord Operator, users no longer need permissions to create privileged pods - only the Operator does. In addition, permissions can be managed within Kubernetes to allow or prevent users from impersonating specific targets.
- **Deployment-level mirroring/interception** - deployments with more than one pod can be mirrored/intercepted in their entirety.
