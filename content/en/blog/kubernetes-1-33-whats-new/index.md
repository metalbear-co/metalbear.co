---
title: "New Features in Kubernetes 1.33 Octarine: The Discworld-Inspired Release You Didn’t Know You Needed"
description: "Kubernetes 1.33, the “Octarine” release, introduces powerful improvements in networking, workload identity, storage, and autoscaling — including Service CIDR expansion, smarter traffic routing, volume populators, and in-place vertical scaling."
lead: "Kubernetes 1.33, the “Octarine” release, introduces powerful new features that improve Kubernetes networking, workload identity, storage, and resource management."
tags:
  - kubernetes-1-33
  - octarine release
  - service-cidr
  - traffic-distribution
  - volume-populator
  - vertical-pod-autoscaler
  - horizontal-pod-autoscaler
  - workload-identity
  - secretless-authentication
  - cloud-native
  - cncf
categories:
  - Kubernetes
  - Releases
  - Infrastructure
date: 2025-05-12T00:00:00+00:00
summary: "From smarter traffic routing to in-place vertical scaling, Kubernetes 1.33 delivers magical improvements for modern clusters — inspired by Discworld’s elusive eighth color."
canonicalURL: "https://metalbear.co/blog/new-features-in-kubernetes-1.33-octarine-the-discworld-inspired-release-you-didnt-know-you-needed"
draft: false
weight: 50
images: [thumbnail.png]
contributors: ["Nic Vermande"]
---
[Kubernetes 1.33](https://kubernetes.io/blog/2025/04/23/kubernetes-v1-33-release/), the "[Octarine](https://wiki.lspace.org/Octarine)" release, introduces powerful new features that improve Kubernetes networking, workload identity, storage, and resource management. Key highlights include dynamic Service CIDR expansion, smarter service traffic distribution, volume populators for pre-filled PersistentVolumes, and improvement to both vertical and horizontal scaling configurations. Whether you're running multi-tenant clusters or managing edge workloads, Kubernetes 1.33 brings subtle but meaningful improvements that are easy to miss, unless you know where to look.

For me, this release is a bit of a *madeleine de Proust*[^1], as we say in French. Just like the magical eighth color in Terry Pratchett's Discworld (visible only to wizards and cats), the best features hidden in the changelog might not be immediately apparent to everyone.

More importantly, the name triggered a rush of nostalgia: me playing the *Discworld* point-and-click adventure in the 90s (yes, on CD-ROM), alongside *Simon the Sorcerer*. Both games were charmingly illogical, oddly structured, and totally captivating. Honestly, not unlike navigating the modern cloud-native ecosystem 🤔.

So let's dig in. What's new? What's stable? What's cooking in alpha? Here are my cherry-picked highlights from the Octarine release.

## 🎓  Moving to Stable: Getting Production-Ready!

### Multiple Service CIDRs: Network Expansion Without Migration Pain

Coming from my Cisco networking days, IP exhaustion nightmares still haunt me (any IPv6 fans here? 🤗) . You're happily deploying services when suddenly you hit your Service IP ceiling, and traditionally this meant a disruptive migration.

Not anymore. [Multiple Service CIDRs](https://github.com/kubernetes/enhancements/blob/master/keps/sig-network/1880-multiple-service-cidrs/README.md) is now stable in 1.33, allowing you to dynamically expand your Service IP pools without cluster recreation. I've been eagerly watching this since its alpha days in 1.29, and it's glorious to see it graduate.

```yaml
apiVersion: networking.k8s.io/v1
kind: ServiceCIDR
metadata:
	name: additional-space
spec:
	cidrs:
	- 10.0.1.0/24
```

And just like that, new ClusterIPs will be pulled from that new range! This feature has already proven itself in production at GKE since 1.31, so you can deploy with confidence.

What excites me about this graduation is how elegantly it solves a problem that previously required extensive planning and potential downtime. It's like hot-adding disk space to a running system. Exactly the kind of operational capability that transforms crisis management into routine administration.

### Traffic Distribution for Services: Smarter Routing at Last

Another feature reaching full maturity is [Traffic Distribution for Services](https://github.com/kubernetes/enhancements/tree/master/keps/sig-network/4444-service-traffic-distribution), introducing the `trafficDistribution` field. As someone who's spent countless hours tweaking BGP preferences and reverse-engineering cloud networking quirks, I appreciate the ability to influence traffic patterns without writing a full dissertation in YAML.

```yaml
apiVersion: v1
kind: Service
metadata:
	name: latency-sensitive-api
spec:
	trafficDistribution: PreferClose
	selector:
		app: api-server
	ports:
	- port: 80
		targetPort: 8080
```

With `PreferClose`, your traffic stays in the same zone whenever possible, reducing latency and potentially cutting cloud provider network costs by 15-20%. Kubernetes now gives hints to the underlying routing layers to prefer endpoints in the same zone or topology as the client. All without custom controllers, endpoint slicing gymnastics, or a full-blown service mesh.

So why does this matter?

First, **latency**. Round-trip times are reduced when services stay in-zone. Whether you're running APIs, gRPC backends, or real-time systems, even a few milliseconds shaved off can improve responsiveness and user experience.

Then there's **cost**. Cloud providers love to charge for traffic that crosses zone boundaries. By preferring local endpoints, this feature can help reduce inter-zone traffic costs, especially in horizontally scaled apps spread across zones.

And finally, **simplicity**.. Topology-aware routing used to be a dark art involving manually curated `Endpoints`, `ExternalTrafficPolicy` tweaks, or full-blown service meshes like Istio. `trafficDistribution` removes the need for all of that complexity. No sidecars. No custom controllers. Just a single line in your Service spec.

But don't forget the **prerequisites**:

👉 `trafficDistribution` only works with **kube-proxy in IPVS mode** or **service implementations that support topology hints**, like the ones in managed cloud Kubernetes distributions. You'll also need to ensure **topology labels** (like `topology.kubernetes.io/zone`) are correctly set on your nodes. Without these, the preference logic has nothing to work with, and the feature will silently fall back to default behavior.

And yes, fallback is graceful. If no local endpoints are available, Kubernetes doesn't fail, it just routes traffic wherever it can, like it always has. The behavior is additive: you get smarter routing when possible, and reliable service when not.

### Volume Populators: Pre-filled Volumes Made Easy

This feature, now stable in 1.33, solves a persistent challenge: how to create volumes with pre-populated data without jumping through hoops. While perhaps less flashy than networking features, I've found it incredibly practical when building demo applications. [Volume Populators](https://github.com/kubernetes/enhancements/blob/master/keps/sig-storage/1495-volume-populators/README.md) enables the creation of PVCs from various data sources beyond the traditional PVC clones and snapshots. Want a volume pre-populated with a VM image? Or restored from a backup? Here's the standardized way to do it:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
	name: populated-pvc
spec:
	storageClassName: my-sc
	dataSourceRef:
		apiGroup: volsync.backup
		kind: ReplicationDestination
		name: rclone-replicationdestination
	resources:
		requests:
			storage: 10Gi
	accessModes:
	- ReadWriteOnce
```

What makes this feature special is how it enables an ecosystem of custom populators while maintaining the familiar Kubernetes workflow. Rather than reinventing the wheel, it extends the existing PVC system with new capabilities. To use custom volume populators, you must enable the `AnyVolumeDataSource` feature gate for the kube-apiserver and kube-controller-manager. Instead of leaving the heavy lifting to the CSI driver alone, you can use a populator to automatically fill a PVC with specific data before your pod even starts.

In the example above, `ReplicationDestination` is a CRD provided by VolSync that describes where and how to sync data from a remote source, allowing the VolSync populator to prefill the volume before the PVC becomes bound and ready for use. To be used as a volume populator source, the CRD must be handled by a volume populator controller that watches both the PVCs referencing the CRD via `dataSourceRef` and the CRs themselves. The controller must register the `Group`, `Kind`, and `Version` of the CRD it supports and implement logic that injects the requested data into the volume during provisioning. Kubernetes delegates control to the populator based on this dataSourceRef, rather than provisioning the volume directly through the CSI driver.

Here's the flow:

1.  Every populator supports one or more CRDs. Cluster admins install these CRDs and the populator controller. Once that's done, any PVC using a `dataSourceRef` that matches one of the supported CR types will be picked up by the populator, not the CSI driver directly.
2.  Behind the scenes, the CSI still creates the volume. The populator doesn't replace the CSI, it teams up with it. The CSI creates an empty volume as usual, and the populator fills it with whatever data you defined (could be a backup, a dataset, etc.).
3.  PVCs only bind when they're fully populated. That means you can safely deploy your full app (Pods + PVCs) in one go. Your pods will wait until the data is ready, just like when cloning from a PVC or using a VolumeSnapshot.

Powerful, yet simple 🦾

## 🚀 Moving to Beta: Promising Features Getting Stronger

### In-Place Pod Vertical Scaling: Resources on Demand

Vertical scaling in Kubernetes has long been powerful in theory but clunky in practice. The traditional Vertical Pod Autoscaler (VPA) could monitor a pod's resource usage and recommend better cpu/memory settings, but those changes only took effect after a pod restart. That meant interruption, scheduling churn, and for many workloads, it wasn't worth the trouble.

With [In-Place Pod Vertical Scaling](https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/1287-in-place-update-pod-resources), now in beta as of Kubernetes 1.33, that story changes. You can now scale a pod's resource requests and limits live, without restarting the container. This is a huge leap toward efficient and responsive resource management.

Before you jump in, a few caveats:

-   No native PDB enforcement: In-place updates bypass `PodDisruptionBudgets`, which may surprise teams relying on strict disruption controls.
-   `StatefulSets` need care: Resizing identity-bound workloads adds operational complexity.
-   GitOps drift risk: Tools like ArgoCD or Flux may revert autoscaled values unless explicitly configured to ignore or patch resource fields.

This feature helps solve a fundamental tension in Kubernetes resource planning. You either:

-   Over-provision to be safe, and pay for idle headroom
-   Under-provision and risk OOM kills, throttling, or degraded performance

Neither is ideal.

With in-place vertical scaling, you can optimize for bin packing, cost savings, and resilience. And all without downtime.

To use it, you must enable the `InPlaceOrRecreate` update mode in your VPA config:

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
	name: api-vpa
spec:
	targetRef:
		apiVersion: apps/v1
		kind: Deployment
		name: my-api
	updatePolicy:
	updateMode: InPlaceOrRecreate
```

The VPA Updater will attempt an in-place resize first. If that fails, and the pod can be evicted, it falls back to eviction. Otherwise, it does nothing and waits.

This works in tandem with the container's resizePolicy, which looks like this:

```yaml
resizePolicy:
- resourceName: cpu
	restartPolicy: NotRequired
- resourceName: memory
	restartPolicy: NotRequired
```

VPA doesn't interpret these policies itself, it simply issues the /resize request, and the kubelet + container runtime handle it according to the specified `resizePolicy`.

Looking ahead, it opens the doors to a synergy with [Karpenter](https://karpenter.sh/docs/) or custom autoscalers: imagine resizing pods before scaling nodes. That's real-time, cost-aware optimization at the pod level.

## 🧪 Alpha Features: The Promising Newcomers

### Service Account Token for Image Pulls: Goodbye, Credential Headaches

[This alpha feature](https://github.com/kubernetes/enhancements/blob/master/keps/sig-auth/4412-projected-service-account-tokens-for-kubelet-image-credential-providers/README.md) introduces the ability for pods to use their own Kubernetes Service Account (KSA) identity to authenticate and pull container images without relying on long-lived image pull secrets. It expands the kubelet credential provider configuration to support the use of service account tokens for image authentication. This is part of a broader Kubernetes initiative to eliminate static credentials from the API and adopt short-lived, workload-bound identities where possible. In practice, this mirrors the "secretless" patterns already seen in accessing cloud secrets, now applied to pulling images securely and dynamically, based on pod identity.

When configured, the kubelet requests a token with a specific audience tied to the pod, and passes it along with selected service account annotations to a credential provider plugin. The plugin exchanges the token with an external system (like a cloud IAM or registry) to retrieve short-lived credentials. These are used for the image pull and creates a dynamic auth flow tied to workload identity. To optimize performance, credentials are cached based on the image and service account identity, avoiding redundant lookups while preserving isolation between workloads.

**How to Configure**

To configure this feature in your cluster, you'll need to:

1.  First, enable the feature gate on the kubelet:

```
--feature-gates=ServiceAccountTokenForKubeletCredentialProviders=true

```

1.  Enable the corresponding feature gate on the Kubernetes API server:

```
--feature-gates=ServiceAccountNodeAudienceRestriction=true
--allowed-kubelet-audiences=my-registry-audience

```

1.  Configure the kubelet credential provider by creating or updating the configuration file (typically at `/etc/kubernetes/kubelet-credential-providers.yaml`):

```yaml
apiVersion: kubelet.config.k8s.io/v1
kind: CredentialProviderConfig
providers:
- name: ghcr-credential-provider
	matchImages:
	- "ghcr.io/"
	- "index.docker.io/"
	defaultCacheDuration: "10m"
	apiVersion: credentialprovider.kubelet.k8s.io/v1
	tokenAttributes:
		serviceAccountTokenAudience: ghcr.io
		requireServiceAccount: true
		requiredServiceAccountAnnotationKeys:
		- example.com/ghcr-token-endpoint
		optionalServiceAccountAnnotationKeys:
		- example.com/ghcr-username
```

Matching Service Account YAML

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
	name: ghcr-puller
	namespace: default
	annotations:
		ghcr.acmecorp.io/ghcr-token-endpoint: "https://my-auth-proxy.internal/token"
		ghcr.acmecorp.io/ghcr-username: "ghcr-user"
```

1.  Install the appropriate credential provider plugin binary in the kubelet's plugin directory (usually `/usr/libexec/kubernetes/kubelet-plugins/credential-provider/`). The plugin must be executable by the kubelet and implement the credential provider API.

At this time, there's no official plugin that supports service account token-based image pulls out of the box. To make this work, you'll need to implement or adapt a plugin that can read the projected token and annotations, exchange them with your registry or identity provider, and return short-lived credentials.

Once that's in place, everything becomes seamless for developers. Pods just need to reference the right service account, and image pulls are authenticated automatically behind the scenes.

### HPA Configurable Tolerance: Fine-Tune Your Autoscaling Precision

[This alpha feature](https://github.com/kubernetes/enhancements/tree/master/keps/sig-autoscaling/4951-configurable-hpa-tolerance) introduces per-HPA configurable tolerance for the Horizontal Pod Autoscaler, allowing you to adjust how aggressively or conservatively each workload scales based on observed metrics. Tolerance defines the acceptable deviation between desired and actual metrics before triggering a scaling action. Rather than relying on the cluster-wide default tolerance (typically 10%), you can now set custom tolerances on individual HPAs, with different values for scaling up versus scaling down.

The default 10% tolerance is often too coarse-grained for real-world scenarios. For large deployments, a 10% tolerance can mean hundreds of pods difference between desired and actual state before scaling occurs. This has been a longstanding issue raised in the Kubernetes community, where users need more responsive scaling for critical workloads or more conservative scaling for stable ones. The impact is especially significant for large-scale applications where resources are costly and for workloads with rapid traffic fluctuations where responsiveness is critical.

The feature adds a new `tolerance` field to the existing `HPAScalingRules` object. Since there are separate rules for scaleUp and scaleDown, you can specify different tolerance values for each direction:

-   If the current-to-desired metric ratio is within the tolerance, no scaling occurs
-   If the ratio exceeds (1.0 + upTolerance), the HPA scales up
-   If the ratio falls below (1.0 - downTolerance), the HPA scales down
-   If not specified, the system falls back to the global tolerance setting

For example, with a tolerance of 0.05 (5%), a workload with a target CPU utilization of 50% would:

-   Scale up when CPU exceeds 52.5% (50% × 1.05)
-   Scale down when CPU falls below 47.5% (50% × 0.95)
-   Make no changes when CPU is between 47.5% and 52.5%

The result is a more responsive scaling compared to the default 10% tolerance, where scaling would only occur outside the 45%-55% range.

**How to Configure**

To use this feature, ensure the `HPAConfigurableTolerance` feature gate is enabled on your kube-controller-manager and kube-apiserver. Then, define custom tolerances in your HPA definition:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
	name: responsive-web-app
spec:
	scaleTargetRef:
		apiVersion: apps/v1
		kind: Deployment
		name: web-app
	minReplicas: 5
	maxReplicas: 50
	metrics:
	- type: Resource
		resource:
			name: cpu
			target:
				type: Utilization
				averageUtilization: 50
	behavior:
		scaleUp:
			tolerance: 0.05  # Scale up when CPU exceeds 52.5%
			stabilizationWindowSeconds: 60
		scaleDown:
			tolerance: 0.15  # Scale down when CPU falls below 42.5%
			stabilizationWindowSeconds: 300
```

In this example, we've configured HPA to be more responsive to increased load (5% tolerance) while being more conservative about scaling down (15% tolerance). This asymmetric configuration is ideal for workloads where rapid response to traffic increases is critical, but it is usually preferred to maintain capacity and address potential traffic fluctuations, helping avoid premature capacity reduction.

For very large deployments or mission-critical services, you might set even tighter tolerances for scaling up (e.g., 0.02 or 2%) to ensure quick response to increasing load. The flexibility of per-HPA configuration lets you tailor scaling behavior to each workload's specific needs, rather than compromising with a one-size-fits-all approach.

## Bringing It All Together: The Magic of Modern Kubernetes

This release delights us with a broad collection of tools that elevate every layer of our favorite orchestration platform. From networking and security to resource management, Kubernetes 1.33 brings a refreshing spring vibe to our clusters, full of growth, color, and possibility.

If you're curious to try out these new capabilities without the friction of redeploying code, [mirrord](https://metalbear.co/mirrord/docs/overview/introduction/) can be a helpful tool too. It lets you run your local processes (This binary you've just compiled with fear 😱 and love 😍) in the context of a live Kubernetes environment, so you can quickly validate things like autoscaling thresholds, image pull flows, or service mesh behavior. All from your own machine. It's a great way to explore what Kubernetes 1.33 introduces, while keeping your feedback loop tight.

> 🔔 [Try mirrord today](https://app.metalbear.co/account/sign-up) to test Kubernetes 1.33 features directly in your live cluster and streamline your development workflow!

Like octarine, the magical eighth color visible only to wizards in [Discworld](https://en.wikipedia.org/wiki/Discworld), the true strength of Kubernetes 1.33 lies not in any single feature, but in how they come together, shifting us from static infrastructure to dynamic systems that respond to intent, not just configuration.

As Terry Pratchett might say: any sufficiently advanced container orchestration is indistinguishable from magic. And with Kubernetes 1.33, we're all becoming a little more wizardly!

[^1]: A *madeleine de Proust* is an expression used to describe smells, tastes, sounds or any sensations reminding you of your childhood or simply bringing back emotional memories from a long time ago.
