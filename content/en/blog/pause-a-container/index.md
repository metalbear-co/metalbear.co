---
title: "On Pausing Containers - how we built, and why we deprecated, our container pause feature"
description: "How we implemented the container pause feature, and why we decided to deprecate it"
lead: "How we implemented the container pause feature, and why we decided to deprecate it"
tags:
  - cri
  - container
  - runtime
  - pause
  - mirrord
date: 2024-03-04T06:00:00+00:00
lastmod: 2024-03-04T06:00:00+00:00
draft: false
weight: 50
images: ["thumbnail.webp"]
contributors: ["Aviram Hassan"]
---

Did you know that you can ”freeze” running containers? We found out about this feature while developing a particularly handy capability for mirrord. 
mirrord lets developers run local code in the context of a remote Kubernetes pod. This lets them test their code in cloud conditions without going through CI and deployment. In most cases, stealing or mirroring incoming traffic from the remote pod to the local process is good enough. However, when you have applications that consume tasks and do more than react to incoming requests, the user might want to [pause the remote application completely](https://github.com/metalbear-co/mirrord/discussions/2016), so that it doesn’t compete with their local process for tasks.

## How Do We Pause? 

We found out that there is a Docker API [for pausing a container](https://docs.docker.com/engine/api/v1.44/#tag/Container/operation/ContainerPause), which can be used to suspend all processes in a container. Luckily, we already work with the CRI (Container Runtime Interface) API to collect information about the container, so using it for pausing is easy.
We found out that this also exists for the other main container runtimes as well: [cri-o](https://github.com/cri-o/cri-o/blob/9493a08a3a53e4cb788eb13f0b0965a81d00ef36/internal/oci/runtime_pod.go#L233) and [containerd](https://github.com/containerd/containerd/blob/1435b0552eab7dd0370f57e2c82e67c8d1afdaf1/core/runtime/task.go#L71).
So, that worked pretty well. We released [an initial version of the pause feature](https://github.com/metalbear-co/mirrord/pull/791) and marked it unstable.
Like any software, the naive idea works until you meet the edge cases as you try to stabilize it.

## Here Come the Roadblocks

The main use case for the pause feature was reading from queues - we wanted to pause the remote container so it doesn’t read messages from the remote queue, and our local process can read them instead. The first issue we encountered when working with queues is that it takes time for the pause to take effect. The container is frozen immediately, but it takes time for the queue to understand that a consumer is disconnected and then re-allocate its messages to other consumers (the user's local app). This results in a wait time of about five minutes just to get started, which isn’t fun.

The second issue we ran into was that if there were live incoming connections, those would also take time to drop, or sometimes never drop at all. We mostly saw this in gRPC services. The common case was users trying to use mirrord with pause on a service in their cluster that received gRPC connections from another microservice. The calling microservice would stay connected to the paused service rather than dropping the connection and connecting to our local process instead.

We tried finding ways to flush all connections when using pause.It seems that the Linux kernel really likes holding those connections, as even if we conntrack flush, it’d just bring back the entries on its own. The only solution we saw was a kernel module to kill these connections, but that would have been violent and ugly, plus we didn’t want to maintain a kernel module.

The last and biggest issue we encountered was when we tried to migrate mirrord to using [Ephemeral Containers](https://metalbear.co/blog/getting-started-with-ephemeral-containers/) for the mirrord agent. The mirrord agent is a component that runs in the cluster and helps mirrord proxy data back and forth between the local process and remote pod. By default we use a Job to run the agent, but Ephemeral Containers, when available, are a better functional fit. However, it means we lose access to the container runtime API, and so we couldn’t use it to pause the container.
We did not give up easily though, and we soon realized we could implement the pause functionality ourselves, without using the container API.

**What does the API do? Simple!** Containers are abstractions over Linux namespaces.There’s a namespace type called cgroup which is responsible for controlling the compute and memory of processes running in that namespace. In the same way each container usually belongs to a networking namespace, process namespace, file system namespace and other types,it also belongs to a cgroup namespace that is used by the container runtime to limit it (see the [Kubernetes limits feature](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) for example).
The cgroup namespace also enables a functionality called “freezing” which means you can limit the cpu to 0, essentially freezing the affected processes. That’s how the CRI freezes the container.
We implemented pause using that API, then realized there are two versions to cgroup, V1 and V2, and we’d need to support both.
In order to do it, the pod running the mirrord agent needed to be privileged as well - but okay, a small price to pay.

**cgroup V1 flow**:
1. Open the cgroup of our target pod (since we’re in ephemeral mode, it is `/proc/1/cgroup`)
2. Find the freezer cgroup entry (cgroup_type == freezer)
3. Return the freezer cgroup entry path (it’s a directory)
4. The path we found is something like `/kubepods/kubepods/besteffort/podb21003be-a5c1-424e-ab07-d6814f1464d0/e84d894e48a4191bc79bd27a172a3655e1b41c566be9527821639f1ad0e29f26` which isn’t available to us at this point
5. We mount the cgroup file system under `/mirrord_cgroup` (a directory we create)
```rs
           mount(
               Some("cgroup"),
               cgroup_path,
               Some("cgroup"),
               MsFlags::MS_NOSUID | MsFlags::MS_NOEXEC | MsFlags::MS_NODEV,
               Some("freezer"),
           )
```

6. Now we can access the freezer cgroup using the path from step 4
7. We write “FROZEN” to the cgroup entry path with `freezer.state` file.
8. When we unpause, we just write `THAWED` to the same file.


**cgroup V2 flow**:

1. The implementation initially was similar, but then we found out about a cgroup V2 flag called `nsdelegate` which means that in order to move a process between cgroups you have to have permission to move the process back - if you move from cgroup A to cgroup B, you need to have permission to move it back to cgroup A, which we didn’t because it wasn’t available to our context.
2. We mounted the current cgroup in a new directory, then we created a new sub-cgroup under it. This made our cgroup inherit from the original cgroup, apart from the changes we did (freezing).
3. We move all the pids under the original cgroup to the sub-cgroup we created by reading the cgroup.procs file.
4. Then, we can freeze the sub-cgroup.
5. When unpausing, we move the pids back to the original cgroup after unfreezing.

## systemd doesn’t like it
When running in cgroup V2 in some runtimes, we found out that systemd didn’t like us messing with cgroups. The reason is that systemd is actually the system component responsible for creating the cgroup namespaces and managing them. This also makes sense as it goes against both “Two Key Design Rules” mentioned [here](https://systemd.io/interfaces/CGROUP_DELEGATION.html). When we created the cgroup, systemd took over, and then we had some sort of race condition leading to flaky behavior.🙁

## Getting the Hint
After spending around two months investigating, researching, and chasing bugs to make it work in a stable manner, we finally decided that it  might be better to drop the pause API approach and find a better way to accomplish this use case. Not only was implementing the pause feature in an ephemeral container hard, but when it did work, it still didn’t provide a perfect user experience (see timeout and queue issues above).

## Going in a Different Direction
We had an issue in our backlog to implement the [“copy pod” feature](https://github.com/metalbear-co/mirrord/issues/1465) - which creates a new replica of an existing pod. On top of that, we added a feature called `scaledown`. When targeting a deployment with this feature, mirrord will create a new exclusive pod for the user and then scaledown the other pods of the same deployment.
The way it works:
The mirrord Operator creates a new pod that is part of the deployment, copying the configmap, mount, sidecars, and anything that can be useful.
The Operator scales down the deployment, shutting down the rest of pods for the duration of the mirrord session.
Given the delicate state it can leave the cluster in, we decided to have this feature as part of mirrord for Teams. The general mandate is that anything that is stateless and won’t break the cluster can be in the OSS, while anything that manages state should be done by the Operator.

## Pros and Cons of the New Solution

**Pros**:
1. Immediate effect both for queues and incoming traffic.
2. It uses a stable, high-level k8s API.

**Cons**:
1. We don’t use the original base image for the pod replica, so if there are files in the image base, those aren’t available to the local process
2. Following the previous point, we don’t run the original Docker entrypoint, which might be an issue if it contains meaningful logic (for example, we saw users that copy configuration files from configmap to other paths on start)
Note that both issues have workarounds, but they’re still a bit of a hassle.

## Final Notes

It’s no fun removing a feature you’ve worked hard on, but it’s even worse to leave broken functionality in your product, and so we’ll be deprecating the pause feature in the coming months. Hopefully, at least the lessons we learned while working on it and documented in this blog post would be useful or interesting for some of you. And if you want to try out copy/scaledown functionality, check out [mirrord for Teams](http://app.metalbear.co)!
