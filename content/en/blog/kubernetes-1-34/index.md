---
title: "New Features We Find Exciting in the Kubernetes 1.34 Release"
description: "Explore the key features in Kubernetes 1.34 'Of Wind & Will' release, including Dynamic Resource Allocation, improved security controls, and enhanced DNS support for legacy applications."
lead: "Learn about the new features in Kubernetes 1.34, including Dynamic Resource Allocation, improved security controls, and enhanced DNS support for legacy applications."
slug: "kubernetes-1-34"
tags:
  - kubernetes
  - open-source
categories:
  - kubernetes
  - open-source
date: 2025-08-29
summary: >
  Kubernetes 1.34 brings incremental but powerful improvements including Dynamic Resource Allocation for specialized hardware like GPUs, fine-grained anonymous authentication controls, relaxed DNS search validation for legacy workloads, and new traffic distribution policies for better performance.
canonicalurl: "https://metalbear.com/blog/kubernetes-1-34"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
  - "Charles Uneze"
---

The Kubernetes 1.34 release, “Of Wind & Will (O’ WaW)”, sets sail with a collection of features that may not grab headlines, but instead improve the day-to-day experience of running and managing clusters. Think of it as steady winds filling the sails, incremental but powerful improvements that help cluster administrators navigate smoother waters. And since combing through the full release notes can feel like charting a course through rough seas, we’ve pulled together some of the most useful highlights from this release to keep you on course.

{{<figure src="release-logo.png" title="Kubernetes 1.34 (Of Wind & Will) Release Logo" alt="Release logo for K8s 1.34" height="100%" width="100%">}}

# Features Moving to Stable: Anchored and Ready for the Voyage

## Dynamic Resource Allocation with Structured Parameters

Today where most companies are running (or trying to) run AI workloads on Kubernetes, we feel this feature is going to be the most important one from this release. 

Before this change, Kubernetes didn’t really “see” specialized hardware devices like GPUs. Instead, the device drivers running on each node were responsible for keeping track of hardware availability and assigning it to pods. Kubernetes itself had no awareness of what devices existed, how many were available, or where they were located.

This lack of visibility introduced a number of challenges. For example, if two pods requested a GPU on the same node, the driver had to resolve the conflict on its own, without the scheduler knowing what was going on. Sharing GPU resources across pods was equally messy, since Kubernetes couldn’t reason about device capacity or availability and only knew that a pod needed “a GPU,” not whether the hardware was free or oversubscribed.

With Kubernetes v1.34, this changes. The new [Dynamic Resource Allocation (DRA)](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/) framework, along with by structured parameters, lets Kubernetes manage specialized hardware devices directly. Structured parameters let hardware drivers describe the exact capabilities and constraints of a device in a standardized format that Kubernetes can understand. For example, instead of just saying “this node has 1 GPU,” the driver can specify details like GPU memory, supported features, or whether the device can be shared across multiple pods.

With this feature, instead of drivers silently handling everything, they now publish available devices as Kubernetes objects called `ResourceSlice`. These slices describe what hardware exists on each node and expose details that Kubernetes can use to make better scheduling decisions.

In other words, Kubernetes is no longer “blind” to hardware like GPUs, it can see what’s available, allocate it fairly, and even support sharing more reliably. Here’s a simple example:

```yaml
apiVersion: resource.k8s.io/v1
kind: ResourceSlice
metadata:
  name: resourceslice
spec:
  nodeName: worker-1
  pool:
    name: gpu-pool
    generation: 1
		resourceSliceCount: 1
  driver: dra.example.com
  sharedCounters:
    - name: gpu-memory
      counters:
        memory:
          value: 8Gi
  devices:
    - name: gpu-1
      consumesCounters:
        - counterSet: gpu-memory
          counters:
            memory:
              value: 8Gi
```

This example shows a single GPU on node `worker-1`, grouped into a pool called `gpu-pool`. The GPU has 8 GB of memory, published through `sharedCounters`. Because this information is now visible to Kubernetes, the scheduler knows exactly how much memory the device provides and can place pods accordingly, instead of relying on the driver to manage it behind the scenes.

## Allowing Only Anonymous Authentication for Configured Endpoints

With Kubernetes v1.34, you can now safely expose specific API server endpoints like `/healthz`, `/readyz`, and `/livez` without accidentally granting broader anonymous access.

By default, Kubernetes treats unauthenticated requests as anonymous, assigning them the identity `system:anonymous` and group `system:unauthenticated`. While this design supports useful cases such as health checks, it also comes with risks. If a `RoleBinding` or `ClusterRoleBinding` is accidentally applied to `system:anonymous`, even unauthenticated code running in a pod could gain access to the API server. 

The new update fixes scenarios like these by giving administrators fine-grained control over which paths are available to anonymous users. Instead of having to disable anonymous access entirely, which can break important functionality, you can now define a safe list of allowed endpoints using the new `AuthenticationConfiguration` object.

Here’s an example:

```yaml
apiVersion: apiserver.config.k8s.io/v1beta1
kind: AuthenticationConfiguration
anonymous:
  enabled: true
  conditions:
  - path: /livez
  - path: /readyz
  - path: /healthz
```

In this configuration, anonymous requests are permitted only to the health check endpoints, while all other anonymous requests are denied, even if misconfigured RoleBindings exist. 

## Relaxed DNS Search String Validation

The `dnsConfig.searches` field in a Pod manifest controls how short hostnames are resolved. If your pod looks up `myserver`, Kubernetes will automatically append each domain listed under `dnsConfig.searches` and try them in order. For example, `myserver.first-domain`, then `myserver.second-domain`, and so on until it finds a match. This mechanism is especially important when migrating legacy applications into Kubernetes since many older services rely on custom DNS search domains, sometimes with underscores (`_`) or leading dots (`.`). 

Until now, Kubernetes didn’t allow these in `dnsConfig.searches`, which meant some services simply couldn’t be deployed without changing their DNS assumptions which is a task that can be both risky and time-consuming.

With Kubernetes v1.34, these restrictions are lifted. You can now include underscores and dots in DNS search domains, which makes it much easier to bring legacy workloads into Kubernetes without rewriting configurations or service names.

Here’s what that looks like in practice:

```yaml

apiVersion: v1           
kind: Pod          
metadata:
  name: app-1
spec:
  containers:
    - name: app-1
      image: nginx
  dnsPolicy: "None"
  dnsConfig:
    nameservers:
      - 10.244.0.69
    searches:
      - abc_d.staging.com  # Now valid
---
apiVersion: v1           
kind: Pod          
metadata:
  name: app-2
spec:
  containers:
    - name: app-2
      image: nginx
  dnsPolicy: "None"
  dnsConfig:
    nameservers:
      - 10.244.0.69
    searches:
      - .   # Now valid
      - default.svc.cluster.local
      - svc.cluster.local
      - cluster.local
```

With this update:

- `app-1` can now resolve fully qualified names like `test.abc_d.staging.com` without issue.
- `app-2` can use the special `"."` search entry to resolve hostnames exactly as written **before Kubernetes appends cluster defaults like `svc.cluster.local`.

So to sum up, if you’re migrating older workloads or working with services that depend on unconventional DNS naming conventions, Kubernetes no longer forces you to rework your DNS setup. 

# Features Moving to Beta: Stronger Winds Filling the Sails

## PreferSameNode Traffic Distribution

Routing traffic efficiently in Kubernetes can be challenging, especially when services span multiple nodes or zones. By default, Kubernetes load-balances traffic across all healthy endpoints of a service, even if some are farther away. This can create unnecessary cross-node or cross-zone hops, which add latency and waste bandwidth. For many workloads, especially latency-sensitive applications like real-time inference, gaming backends, or high-throughput APIs, those extra hops can noticeably hurt performance.

Kubernetes v1.34 introduces new traffic distribution policies to address this:

- `PreferSameNode`: Services can now prefer pods on the same node when the traffic originates from that node. This reduces latency and avoids network overhead from cross-node traffic.
- `PreferSameZone`: The existing `PreferClose` policy has been renamed to `PreferSameZone` to make its behavior clearer. This helps workloads prioritize pods in the same zone for lower latency and reduced cross-zone costs.

Here’s an example of both in action:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: http-echo-service-1
spec:
  selector:
    app: http-echo-pod-1
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5678
  trafficDistribution: PreferSameNode
---
apiVersion: v1
kind: Service
metadata:
  name: http-echo-service-2
spec:
  selector:
    app: http-echo-pod-2
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5678
  trafficDistribution: PreferSameZone
```

With this configuration:

- `http-echo-service-1` routes traffic to a pod on the same node when possible. If none are available, it will fall back to another node.
- `http-echo-service-2` routes traffic to a pod in the same zone first, and only if necessary, sends it to a different zone.

## VolumeSource: OCI Artifact and/or Image

In some deployments, multiple pods need access to the same configuration or data files. Traditionally, this might mean baking files into a ConfigMap or copying them into each pod, which can get messy as files grow larger or more complex.

With Kubernetes v1.34, you now have a cleaner option: image volumes. This feature lets Kubernetes mount an OCI image as a read-only volume that can be shared across multiple pods. Instead of duplicating files or manually syncing them, you package the files once into an image and then mount them wherever they’re needed.

Here’s an example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
  - name: nginx-container
    image: nginx
    ports:
    - containerPort: 80
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          apiVersion: v1
          fieldPath: metadata.name
    volumeMounts:
    - name: oci-volume
      mountPath: /data
      subPath: hello.txt
    - name: oci-volume
      mountPath: /data/
      subPathExpr: $(POD_NAME).txt
  volumes:
  - name: oci-volume
    image:
      reference: <your-oci-image>
```

In this example, the `oci-volume` references an OCI image that contains files. The pod mounts specific files from that image, `hello.txt`, into its container. Since the volume is read-only, multiple pods can safely share the same source without conflicts. 

For developers using [mirrord](https://metalbear.co/mirrord/), this also means that you can now run your local code against a pod that already mounts an image volume in the cluster. Your local process will gain the same access to the shared files, so you can test how your code interacts with the data without deploying or modifying the cluster setup.

# Features Moving to Alpha: New Currents on the Horizon

## Allows Setting any FQDN as the Pod's Hostname

Prior to this feature, setting a pod’s fully qualified domain name (FQDN) wasn’t straightforward. You had to combine multiple fields: `hostname`, `subdomain`, and `setHostnameAsFQDN: true`, to build an FQDN. The result always followed Kubernetes’ enforced pattern:

```
<hostname>.<subdomain>.<namespace>.svc.<cluster-domain>
```

If any part of that was misconfigured, the final FQDN wouldn’t resolve as expected. This could cause serious issues for systems that rely on strict hostname matching, such as [Kerberos](https://www.ibm.com/docs/en/aix/7.1.0?topic=network-kerberos), where authentication breaks if hostnames don’t line up exactly.

This pain point is now addressed through a new field: `hostnameOverride`. This field allows you to explicitly set the pod’s internal kernel hostname to whatever value you need, bypassing Kubernetes’ enforced DNS naming convention.

Here’s an example:

```yaml
apiVersion: v1           
kind: Pod          
metadata:
  name: app
spec:
  hostnameOverride: app.nginx.example.domain
  containers:
    - name: app
      image: nginx
```

In this configuration, the pod’s internal hostname is set directly to `app.nginx.example.domain`. Unlike before, you don’t need to stitch together multiple fields or follow Kubernetes’ strict naming rules. 

# Takeaways From Of Wind & Will Kubernetes Release

The *Of Wind & Will* release is not about grand, sweeping changes, but it’s about steady progress. The kind of refinements that make Kubernetes a sturdier ship for the long journey ahead. One of the standout improvements is the graduation of Dynamic Resource Allocation (DRA), a huge step forward for teams running AI workloads. With DRA, Kubernetes finally gains proper visibility into GPUs and other specialized hardware, making scheduling and sharing these resources far more reliable. For anyone working on machine learning or high-performance computing, this is a game-changer.

Security also gets tighter with more fine-grained anonymous access controls, ensuring only the right endpoints are exposed without weakening cluster safety. And for those migrating legacy systems, features like `hostnameOverride` and expanded DNS search support smooth out long-standing pain points, making Kubernetes more welcoming to applications that weren’t originally built for it.
Together, these updates may feel like adjustments to the rigging rather than rebuilding the ship, but that’s what makes them powerful. They reduce friction, close gaps, and make Kubernetes more adaptable to the real-world seas we sail in. With 1.34, the community hands cluster administrators and developers not just new features, but stronger winds and steadier will to keep moving forward.