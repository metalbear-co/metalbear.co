---
title: "Copy Target"
description: "Making mirrord copy a target and use the copy instead of the original"
date: 2024-01-10T13:37:00+00:00
lastmod: 2024-01-10T13:37:00+00:00
draft: false
images: []
linktitle: "Copy Target"
menu:
docs:
teams:
weight: 170
toc: true
tags: ["team", "enterprise"]
---

When you set the [`copy_target`](/docs/reference/configuration/#feature-copy_target) configuration field, instead of
using the [target](/docs/reference/targets/) of the run directly, mirrord will create a new pod
using the pod spec of the original target, and use that new pod as a target.

This can be useful when you want to run your application with access to the resources and I/O of a target that isn't
reliable, for example because the target pod keeps crashing, or because it is managed by a
[Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) and might terminate before you are done debugging
your application with mirrord.

## Health Checks

The new, copied pod will not have any
[liveness, readiness or startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
even if the original pod spec does define them.
This means you can [steal](/docs/reference/configuration/#feature-network-incoming-mode) traffic without having to
also answer those probes. This might come in handy when debugging with breakpoints with stolen traffic. Without
`copy_target`, if you linger too long on a breakpoint, the application might miss some probes, which could cause a
target pod to restart.

## Replacing a Whole Workload Using `scale_down`

When the [`scale_down`](/docs/reference/configuration/#feature-copy_target-scale_down) option is set, mirrord will
[scale](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment) the target
workload down to zero, effectively replacing all existing pods of that workload by the one new copied pod, that
is then used as the target for the mirrord run. This feature is supported with Deployment, Argo Rollout, StatefulSet,
and ReplicaSet (owned by either a Deployment or an Argo Rollout) targets.

The scale down feature can be useful e.g. when a workload reads from a queue. By scaling it down to zero, the application you run
with mirrord does not have to compete with the workload's pods for queue items.

Only one mirrord session can scale down a workload at the same time. If you try to scale down a workload that is already
being scaled down in another mirrord session (by you or by a teammate), mirrord will display an error and exit.

You can see active copied targets by running `mirrord operator status`.
When there are no active copy targets, the relevant part of the output will say "_No active copy targets_".

When there are active copy targets, the relevant section of the output will look like this:

```
Active Copy Targets:
+-------------------------------+-----------+------------------------------+-------------+
| Original Target               | Namespace | Copy Pod Name                | Scale Down? |
+-------------------------------+-----------+------------------------------+-------------+
| deployment/py-serv-deployment | default   | mirrord-copy-job-wd8kj-2gvd4 | *           |
+-------------------------------+-----------+------------------------------+-------------+
```

With an asterisk marking copy targets that are also scaling down their original target.

Please note however that you don't necessarily have to check if a target is already being scaled down, as trying to
scale it down again will not interrupt the ongoing session, it will just result in your new run exiting with an error.
