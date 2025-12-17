---
title: "New Features We Find Exciting in the Kubernetes 1.35 Release"
description: "Explore the key features in Kubernetes 1.35 'World Tree' release, a release focused on strengthening the platform’s foundations with stable OCI image volumes, modernized streaming via WebSockets, clearer traffic distribution, and deeper security and node capability improvements."
lead: "Kubernetes 1.35 is a release about reinforcing the roots of the platform: tightening security boundaries, clarifying node capabilities, modernizing legacy internals, and making Kubernetes more durable as it continues to grow."
slug: "kubernetes-1-35"
tags:
  - kubernetes
  - open-source
categories:
  - kubernetes
  - open-source
date: 2025-12-17
summary: >
  Kubernetes 1.35 emphasizes stability and long-term resilience over flashy new features. This release graduates OCI image volumes, WebSocket-based streaming for kubectl exec and port-forwarding, and explicit traffic distribution modes like PreferSameNode to Stable. It also advances major platform shifts such as the removal of cgroup v1 support and native Pod certificates to Beta, while introducing early groundwork for safer impersonation and explicit node-declared features. Together, these changes make Kubernetes more secure, predictable, and easier to operate as clusters evolve over time.
canonicalurl: "https://metalbear.com/blog/kubernetes-1-35"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
---

Kubernetes 1.35, “World Tree,” is a release about the things that hold everything else up. Like any system that’s grown over time, Kubernetes now supports many different workloads, environments, and upgrade paths. What keeps all of that working isn’t flashy new features, but strong roots. Many of the changes in 1.35 focus on reinforcing those roots. 

Nodes have now been made more explicit about what they can support. Security boundaries around impersonation and access have been tightened. Long standing dependencies on legacy infrastructure are finally being trimmed away. These updates won’t radically change how you use Kubernetes, but they will make the platform sturdier as it continues to grow. 

As is the case always, the full release notes are quite extensive. So instead of you having to climb every branch of the World Tree, we’ve highlighted the Kubernetes 1.35 features we think are worth paying attention to in this release!

{{<figure src="release-logo.png" title="Kubernetes 1.35 (World Tree) Release Logo" alt="Release logo for K8s 1.35" height="100%" width="100%">}}


## Features Moving to Stable: Roots You Can Rely On

### Mounting OCI Images as Volumes

Modern Kubernetes workloads, in addition to the application code, often depend on external files such as configuration bundles, binaries, or what is now becoming increasingly common for AI workloads: machine learning models. Until recently, Kubernetes didn’t offer a native, clean way to provide this kind of data to a Pod. You either had to bundle everything into the application’s container image, which made images large, slower to build, and harder to update safely, or use init containers whose sole job was to fetch and unpack files into a shared volume before the main container started.

Kubernetes started addressing this gap in v1.31 by introducing the `image` volume type, and in Kubernetes v1.35 this capability is moving to Stable. Image volumes allow Kubernetes to pull an OCI image from a registry and expose its contents directly as a read-only volume inside a Pod. This removes the need for any custom init containers, bootstrap scripts, or rebuilding the application image just to change data.

This also ties in with something we saw a lot during KubeCon Atlanta and even mentioned in our recap blog: [OCI is quietly taking over](https://metalbear.com/blog/kubecon-atlanta-takeaways/#oci-quietly-taking-over). With this feature, instead of thinking of OCI images as something that can only be executed to run application code, Kubernetes now treats them as a generic packaging and distribution format for files.

Here’s a simple example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-image-volume
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: data-volume
      mountPath: /data
  volumes:
  - name: data-volume
    image:
      reference: <your-oci-image>
```

In this example, Kubernetes pulls the OCI image and mounts its contents at `/data` before the application starts. The application image remains unchanged, and the data can be updated independently. With this feature, application images can stay small and focused. Teams can also reuse existing OCI registries and tooling to manage non-code artifacts with proper versioning and rollbacks. And a single application image can now be deployed in different contexts simply by mounting different image-based volumes, which is especially useful for AI/ML workloads.

For teams using [mirrord](https://metalbear.com/mirrord/), this works seamlessly with local development as well. If the target pod in the cluster mounts an OCI image volume, your locally running process will see the same files as if it were running inside the pod. This makes it possible to validate how your code reads or interacts with that data locally, without rebuilding images, adding init containers, or changing anything in the cluster.

### Transition from SPDY to WebSockets

A lot of common Kubernetes commands like `kubectl exec`, `attach`, and `port-forward` all depend on a streaming transport between the client and the API server. For years, that transport has been built on SPDY, a protocol that has been deprecated since 2015 and is increasingly unsupported by modern proxies and load balancers.

In Kubernetes v1.35, this long-standing technical debt is finally being addressed. Kubernetes is moving these streaming connections to WebSockets, the modern, widely supported standard for bidirectional communication. This improves reliability and compatibility across networking infrastructure, especially in environments where SPDY traffic was previously blocked or behaved inconsistently.

This change also introduces an important security hardening step that you need to be aware of. Historically, initiating a streaming connection to a pod was authorized using the `CONNECT` verb alone. With the move to WebSockets, connections begin as standard HTTP requests and are then upgraded. This introduces a risk: without additional checks, users with read-only permissions could potentially escalate their access and initiate interactive sessions like `exec`.

To address this, Kubernetes v1.35 is adding an extra authorization layer. When a user attempts to upgrade a connection for operations like `exec`, `attach`, or `port-forward`, the API server now also requires the `CREATE` permission on the relevant subresource. This ensures that only users explicitly allowed to create these interactive sessions can do so. Before upgrading to Kubernetes 1.35, you should review your RBAC policies and ensure that users who rely on interactive pod access have the appropriate `CREATE` permissions configured. If needed, this new check can be temporarily disabled using the `AuthorizePodWebsocketUpgradeCreatePermission` feature gate, though the long-term recommendation is to update RBAC rules to match the new, more secure model.

### PreferSameNode Traffic Distribution

Efficient service-to-service traffic routing has always been tricky in Kubernetes. By default, Services spread traffic evenly across all healthy endpoints, regardless of where those endpoints are running. While simple, this often results in unnecessary cross-node or cross-zone network hops, increasing latency and consuming extra bandwidth.

To address this, Kubernetes previously introduced the `PreferClose` traffic distribution option. However, over time people realized that the name and behavior of this setting were ambiguous since “close” could mean different things depending on cluster topology. Kubernetes v1.35 resolves this ambiguity by making traffic distribution policies explicit and predictable, with this feature now graduating to Stable. The two key changes are:

1. `PreferClose` is officially deprecated and replaced with `PreferSameZone`. This new name clearly reflects the actual behavior: traffic is routed to endpoints in the same zone when possible, falling back to other zones only when needed. For compatibility, `PreferClose` remains as an alias, but `PreferSameZone` is now the recommended option.
2. Kubernetes introduces `PreferSameNode`, a new traffic distribution mode that goes one step further. With this setting, traffic originating from a node will be routed to a pod on that same node whenever one is available. Only if no local endpoints exist will traffic be sent to pods on other nodes.

Here’s what this looks like in practice:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: service-1
spec:
  selector:
    app: pod-1
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5678
  trafficDistribution: PreferSameNode
---
apiVersion: v1
kind: Service
metadata:
  name: service-2
spec:
  selector:
    app: pod-2
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5678
  trafficDistribution: PreferSameZone
```

With this configuration:

- `service-1` sends traffic to a pod on the same node whenever possible, minimizing latency and avoiding cross-node network overhead.
- `service-2` prefers endpoints in the same zone, reducing cross-zone traffic while still allowing fallback when needed.

## Features Moving to Beta: Branches Under Construction

### **Removing cgroup v1 support**

Control groups (cgroups) are a core Linux kernel feature that Kubernetes relies on for container isolation and resource management. For a long time, Kubernetes supported both versions of this system: the original cgroup v1 and the newer cgroup v2. That flexibility is now coming to an end.

In Kubernetes v1.35, the removal of cgroup v1 support enters Beta. This means that, by default, the kubelet will no longer start on nodes that are still using cgroup v1, making cgroup v2 a requirement going forward. This was a long overdue change, since cgroup v2 has been available for nearly a decade and offers a unified hierarchy and better resource isolation. Most major cloud providers already default to cgroup v2, and upcoming Linux distributions are dropping cgroup v1 support altogether, including its removal from systemd.

From a practical standpoint, this change mainly affects cluster administrators running Kubernetes on older Linux distributions. If a node boots with cgroup v1 enabled, the kubelet in Kubernetes 1.35 will refuse to start. There is no automatic fallback. Before upgrading, it’s important to confirm which cgroup version your nodes are using. You can check this by running the following command on your nodes:

```bash
stat -fc %T /sys/fs/cgroup/
```

If the output states `cgroup2fs`, then cgroups v2 are used. If it shows `tmpfs`, that means you’re still using cgroups v1.

### **Pod certificates**

Workloads running in a Kubernetes cluster need a reliable way to prove who they are to other workloads. However, the tools Kubernetes provides today are not a great fit for this problem. ServiceAccount tokens are scoped for Kubernetes API access, not workload identity. The generic CertificateSigningRequest (CSR) API can issue X.509 certificates, but it offers no straightforward way to deliver those certificates into running Pods. As a result, teams have typically turned to external systems like cert-manager or SPIFFE/SPIRE, adding more components and operational overhead just to establish basic workload identity.

Kubernetes v1.34 introduced Pod Certificates as an alpha feature to close this gap, and in Kubernetes v1.35 the feature advances to Beta. The idea is simple: Kubernetes should be able to issue short-lived certificates to Pods automatically, using the control plane you already trust, without tokens, shared secrets, or manual human approval.

This capability is built around a new API called `PodCertificateRequest`. Unlike the general-purpose CSR API, this resource exists solely to represent a specific Pod requesting a certificate from a specific signer. The request includes a public key and proof of possession, while the private key is generated and kept on the node by the kubelet. Authorization and identity checks are enforced centrally by the API server, reducing the complexity required in certificate signers.

To make certificates usable by applications, Kubernetes also adds a `PodCertificate` projected volume. When a Pod declares this volume, the kubelet takes care of generating keys, requesting a certificate, and mounting the resulting certificate chain into the container’s filesystem. Rotation happens automatically, without application involvement.

Here’s an example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-certificates-example
  namespace: default
spec:
  automountServiceAccountToken: false
  containers:
    - name: main
      image: debian
      command: ["sleep", "infinity"]
      volumeMounts:
        - name: spiffe-credentials
          mountPath: /run/workload-spiffe-credentials
  volumes:
    - name: spiffe-credentials
      projected:
        sources:
          - podCertificate:
              signerName: "row-major.net/spiffe"
              keyType: ED25519
              credentialBundlePath: credentialbundle.pem
```

When this Pod starts, it finds a private key and a signed certificate bundle already available at `/run/workload-spiffe-credentials/credentialbundle.pem`, ready to be used for mTLS authentication, without any manual certificate management being required.

## **Features Moving to Alpha: Saplings and Experiments**

### **Node Declared Features**

Kubernetes scheduling decisions depend on what a node can and cannot do. Today, that information is mostly inferred through labels, taints, and tolerations. While flexible, this model starts to break down during cluster upgrades, when the control plane and nodes are running different Kubernetes versions. In those situations, Pods can be scheduled onto nodes that don’t actually support the features the Pod relies on, leading to failures that only show up at runtime.

Kubernetes 1.35 introduces Node Declared Features as an alpha feature to address this problem. Instead of relying on manual labeling or assumptions about node capabilities, nodes can now explicitly report which Kubernetes features they support.

With this feature enabled, the kubelet publishes a list of supported features to the control plane under a new field: `.status.declaredFeatures`. This information can then be consumed by the scheduler, admission controllers, and even third-party components to make more informed decisions. The goal is to ensure that Pods are only scheduled onto nodes that are actually capable of running them. Here’s an example of what this would look like in practice:

```yaml
status:
  declaredFeatures:
    - InPlacePodVerticalScaling
```

### Constrained Impersonation

The current impersonation system in Kubernetes allows one identity to act on behalf of another, which is useful for debugging, controllers, and automation workflows. However, this power has come with a serious drawback: impersonation is all-or-nothing. If a controller or service account was allowed to impersonate a user, it automatically gained all of that user’s permissions. For example, if a controller impersonated an admin user just to read pod information, it could also delete resources, modify workloads, or access sensitive data, simply because the impersonated user was allowed to do so.

Kubernetes 1.35 introduces Constrained Impersonation as an alpha feature to address this. With constrained impersonation enabled, impersonation is no longer a single, broad permission. Instead, Kubernetes checks two things independently: 

1. Whether the actor is allowed to impersonate the target identity at all
2. Whether it is allowed to perform the specific API action being requested while impersonating.

In practice, this allows much tighter control. A controller can be granted permission to impersonate a specific user only for the purpose of listing and watching Pods in a namespace. Any attempt to perform other actions, such as deleting Pods or modifying Deployments, will be rejected by the API server, even though the impersonated user might normally be allowed to do so.

Here’s an example showing what this looks like in practice. First, a ClusterRole allows a service account to impersonate a specific user, and nothing else:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: impersonate-john
rules:
- apiGroups: ["authentication.k8s.io"]
  resources: ["users"]
  resourceNames: ["john"]
  verbs:
    - impersonate:user-info
```

This permission alone does not allow any actions while impersonating. It only defines who can be impersonated. Next, a Role defines what actions are allowed during impersonation:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: impersonate-john-read-pods
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs:
    - impersonate-on:user-info:list
    - impersonate-on:user-info:watch
```

With these two roles combined, the service account can impersonate the user `john`, but only to list and watch Pods in the `default` namespace. Any attempt to delete a Pod, modify resources, or access other APIs will be denied by the API server, even if `john` normally has those permissions.

## Takeaways From the World Tree Release

The World Tree release is about durability. Features like Node Declared Features and constrained impersonation make Kubernetes more explicit and safer by default, especially in clusters that evolve gradually over time. The move toward removing legacy dependencies like cgroup v1 is another sign that Kubernetes is continuing to align itself with where the broader ecosystem already is rather than carrying tech debt forward.

Taken together, these changes won’t radically alter how you use Kubernetes, but they do make it more secure and resilient. Like a tree growing ring by ring, the 1.35 Kubernetes release reinforces the core so that future growth is less fragile.