---
title: "Security - mirrord for Teams"
description: "Security in mirrord for Teams"
date: 2022-07-10T08:48:57+00:00
lastmod: 2024-03-01T00:00:00+00:00
draft: false
images: []
linktitle: "Security"
menu:
  docs:
    teams:
weight: 510
toc: true
tags: ["team", "enterprise"]
---

## I'm a Security Engineer evaluating mirrord for Teams, what do I need to know?

- mirrord for Teams is completely on-prem. The only data sent to our cloud is analytics and license verification which can be customized or disabled upon request. The analytics don't contain PII or any sensitive information.
- mirrord for Teams uses Kubernetes RBAC, meaning it doesn't add a new attack vector to your cluster.
- The Kubernetes operator installed in the cluster as part of mirrord for Teams is licensed as Source Available (but not yet public) and we'll be happy to share the code if needed for review.
- mirrord for Teams defines a new CRD that can be used to limit access and use of mirrord, with plans of more fine-grained permissions in the future.
- The operator requires permissions to create a pod with the following capabilities in its Kubernetes namespace:
    - `CAP_NET_ADMIN` - for modifying routing tables
    - `CAP_SYS_PTRACE` - for reading the target pod's environment variables
    - `CAP_SYS_ADMIN` - for joining the target pod's network namespace
- The operator requires exclusions from the following gatekeeper policies:
    - `runAsNonRoot` - to access target pod's filesystem
    - `HostPath volume`/`Sharing the host namespace` - to access target pod's file system and networking
- mirrord doesn't copy remote files or secrets to the local filesystem. The local app only gets access to remote files and secrets in memory, and so they'll only be written to the local filesystem if done by the local app, or if mirrord was explicitly configured to log to files with a log level of debug/trace.
- Missing anything? Feel free to ask us on [Slack](https://metalbear.co/slack) or hi@metalbear.co

## Are you SOC2/GDPR compliant?

mirrord for Teams is completely on-prem and doesn't process your customer data, so SOC2 and GDPR don't apply to it.

## How do I configure Role Based Access Control for mirrord for Teams?

mirrord for Teams works on top of Kubernetes' built-in RBAC with the following resources, `mirrordoperators`, `mirrordoperators/certificate`, `targets`, and `targets/port-locks` under the `operator.metalbear.co` apiGroup. The first two resources are required at a cluster level, and the last two can be allowed at a namespace level.

You can limit a user's ability to use mirrord on specific targets by limiting their access to the `target` resource. The specific verbs for rules to our resources can be copied from the examples below.

For your convenience, mirrord for Teams includes a built-in ClusterRole called `mirrord-operator-user`, which controls access to the Operator API. To grant access to the Operator API, you can create a ClusterRoleBinding like this:

```yaml

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: mirrord-operator-rolebinding
subjects:
- kind: User
  name: jim
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: mirrord-operator-user
  apiGroup: rbac.authorization.k8s.io
```

In addition, the Operator impersonates any user that calls its API, and thus only operates on pods or deployments for which the user has `get` permissions.

To see the latest definition, we recommend checking our [Helm chart](https://github.com/metalbear-co/charts/blob/main/mirrord-operator/templates/cluster-role.yaml).

### How do I limit user access to a specific namespace?

Create a ClusterRoleBinding between the user and the `mirrord-operator-user-basic` role, then create a [namespaced role](https://github.com/metalbear-co/charts/blob/main/mirrord-operator/templates/namespaced-role.yaml) (easiest via Helm chart by specifying `roleNamespaces`) and bind create RoleBinding in the namespace.


### How do I limit user access to a specific target?

If the user doesn't have `get` access to the targets, then they won't be able to target them with mirrord. However, if you want to allow `get` access to targets but disallow using mirrord on them, we recommend creating a new role based on the `mirrord-operator-user` namespaced role above, and adding a `resourceNames` field to the `targets` resource. This will limit the user to only using the Operator on the specified targets. For example:

```yaml
- apiGroups:
  - operator.metalbear.co
  resources:
  - targets
  resourceNames:
  - "deployment.my-deployment"
  - "pod.my-pod"
  - "rollout.my-argo-rollout"
  verbs:
  - proxy
```

## How can I prevent users in my team from stealing or mirroring traffic from a target?

You can define [policies](/docs/managing-mirrord/policies/) that prevent stealing (or only prevent stealing without setting a
filter) and/or mirroring for selected targets. Let us know if there are more features you would like to be able to limit using policies.

## How can I prevent users from using mirrord without going through the Operator?

When the mirrord CLI starts, it checks if an Operator is installed in the cluster and uses it if it's available. However, if the user lacks access to the Operator or if the Operator doesn't exist, mirrord attempts to create an agent directly.

To prevent clients from attempting to create an agent without the Operator, you can add the [following key](/docs/reference/configuration/#root-operator) to the mirrord configuration file:

```json
{
  "operator": true
}
```

To prevent mirrord clients from directly creating agents at the cluster level, we recommend disallowing the creation of pods with extra capabilities by using [Pod Admission Policies](https://kubernetes.io/docs/tasks/configure-pod-container/enforce-standards-namespace-labels/). Apply a baseline or stricter policy to all namespaces while excluding the mirrord namespace.

Note: before adding a new Pod Admission Policy, you should make sure it doesn't limit any functionality required by your existing workloads.

By default the in-cluster traffic between the operator and its agents isn't encrypted nor authenticated. To ensure encryption and authentication you can enable TLS protocol for the operator–agent connections. You can do this in the operator [Helm chart](https://github.com/metalbear-co/charts/blob/main/mirrord-operator/values.yaml) by setting `agent.tls` to true or manually by setting `OPERATOR_AGENT_CONNECTION_TLS=true` in the operator container environment. TLS connections are supported from agent version 3.97.0.

## Security hardening with the mirrord operator

Here is a quick checklist you may wish to follow in order to improve the security posture of your cluster when using the operator:
### Enabling TLS

TLS can be enabled between the operator and mirrord agents to encrypt the traffic they send to each other. From the [section above](#how-can-i-prevent-users-from-using-mirrord-without-going-through-the-operator):

> By default the in-cluster traffic between the operator and its agents isn’t encrypted nor authenticated. To ensure encryption and authentication you can enable TLS protocol for the operator–agent connections. You can do this in the operator [Helm chart](https://github.com/metalbear-co/charts/blob/main/mirrord-operator/values.yaml) by setting `agent.tls` to true or manually by setting `OPERATOR_AGENT_CONNECTION_TLS=true` in the operator container environment. TLS connections are supported from agent version 3.97.0.

### Reducing access to the mirrord namespace

Users have no need to access to the namespace where mirrord resources are created. By default, this is the `mirrord` namespace.

### Using a certificate for mirrord APIService

By using either your own certificate or one provided by a certificate manager, you can secure access to mirrord's APIService - you will need to set `insecureSkipTLSVerify` to `false` in the mirrord-operator Helm chart.

*NB: If you are using a certificate manager, make sure you set up reminders for certificate renewal.*

### Set up network policies for communication

Access to the operator can be further restricted by setting up
[network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
in the cluster to limit the operator to communicate only with mirrord agents (this is not possible if running agents in [ephemeral mode](/mirrord/docs/reference/configuration/#agent-ephemeral)).