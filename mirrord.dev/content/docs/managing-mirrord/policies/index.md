---
title: "Policies"
description: "Limiting available features for selected targets with mirrord for Teams"
date: 2024-01-03T13:37:00+00:00
lastmod: 2024-01-03T13:37:00+00:00
draft: false
images: []
linktitle: "Policies"
menu:
docs:
teams:
weight: 520
toc: true
tags: ["team", "enterprise"]
---

## Policies

The installation of the mirrord operator defines two [custom resources](
https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) in your cluster:
the namespaced `MirrordPolicy` and the clusterwide `MirrordClusterPolicy`. With these policies you can limit
the use of some features of mirrord for selected targets.

- `MirrordPolicy` and `MirrordClusterPolicy` have the exact same specification (`spec` field);
- `MirrordPolicy` applies only to targets living in the same namespace;
- `MirrordClusterPolicy` applies to all targets in the cluster.

### Blockable features

Currently the set of blockable features contains:
* `steal` - prevents stealing traffic from the targeted pods;
* `steal-without-filter` - prevents stealing traffic from the targeted pods, unless HTTP filter is used;
* `mirror` - prevents mirroring traffic from the targeted pods.

If you are not using the latest operator version, the set of supported blockable features might be different.
In order to see the exact set of features you can block, use the following `kubectl` command:

```shell
kubectl get crd mirrordpolicies.policies.mirrord.metalbear.co -o jsonpath='{.spec.versions[-1].schema.openAPIV3Schema.properties.spec.properties.block.items.enum}'
```

### Controllable features

Some policies are not for outright blocking features, instead they change behaviour,
overriding what the user has set in their mirrord config file.

You may use these features to change which files may be accessed in the target, or which
environment variables may be retrieved. These policies should not be relied upon for security,
and should instead be considered convenience policies.

#### env policy

_Added in mirrord Operator version 3.103.0_

Changes how environment variables may be retrieved from the target, overriding what the
user has set in their `mirrord.json` config file.

* `exclude` - the environment variables in this list **WON'T** be retrieved from the target,
  instead mirrord will either use the locally available env vars (if they exist in the user's
  machine), or these env vars will be missing completely;

The policy takes priority over a user's mirrord config, which means that if the user has
a config:

```json
{ "feature": { "env": { "include": "*_URL" } } }
```

If the policy is set with `exclude: ["*_URL"]`, then mirror will **NOT** retrieve env vars
that match `*_URL`, even though the user explicitly wanted that in their config.

If you are not using the latest operator version, the env policy options might be different.
In order to see the latest options, use the following `kubectl` command:

```shell
kubectl get crd mirrordpolicies.policies.mirrord.metalbear.co -o jsonpath='{.spec.versions[-1].schema.openAPIV3Schema.properties.spec.properties.env}'
```

#### fs policy

_Added in mirrord Operator version 3.103.0_

Changes file operations behaviour, giving the operator control over which files may be
accessed from the target, and in which modes. Overrides what the user has set in their
`mirrord.json` config file.

* `readOnly` - files that match any of the patterns specified here must be opened as
  **read-only**, otherwise the operation will fail;
* `local` - matching files will be forced to be opened locally, on the user's machine,
  instead of in the target;
* `notFound` - any matching files will return a _not found_ error as if the file is not
  present in the target, even if it exists there;

The policy takes priority over a user's mirrord config, which means that if the user has
a config:

```json
{ "feature": { "fs": { "read_write": ".+\\.json" } } }
```

If the policy is set with `readOnly: [".+\\.json"]`, and the user tries to open a file
that matches this regex in _write_ mode, then mirrord will return an error to the user app,
as if the file could not be found, even though the user wanted it to be `read_write`.

```shell
kubectl get crd mirrordpolicies.policies.mirrord.metalbear.co -o jsonpath='{.spec.versions[-1].schema.openAPIV3Schema.properties.spec.properties.fs}'
```


#### network policy

_Added in mirrord Operator version 3.105.0_

Allows the operator to control which patterns may be used as [HTTP header filters](/docs/using-mirrord/steal/#stealing-only-a-subset-of-the-remote-targets-traffic).
Header filters specified by the user must match the regex specified in the network policy.

```yaml
apiVersion: policies.mirrord.metalbear.co/v1alpha
kind: MirrordPolicy
metadata: { ... }
spec:
  ...
  network:
    incoming:
      httpFilter:
        headerFilter: "^username: .+"
```

If the policy is set with `headerFilter: "^username: .+"` at least one header filter must match the `^username: .+` regex when user is using the steal mode for incoming traffic.

```json
{ "feature": { "network": { "incoming": { "http_filter": { "header_filter": "username: foobar" } } } } }
```

this also works *any of* or *all of* patterns

```json
{ "feature": { "network": { "incoming": { "http_filter": { "all_of": [
  { "header": "username: foobar" },
  { "path": "/api.*" }
] } } } } }
```
```json
{ "feature": { "network": { "incoming": { "http_filter": { "any_of": [
  { "header": "username: foobar" },
  { "header": "username: baz2000" }
] } } } } }
```

**Important:** `steal-without-filter` will be automatically enabled once any http filter is specified.

#### profile policy

_Added in mirrord Operator version 3.108.0_

Allows the operator to enforce using a [mirrord profile](/docs/managing-mirrord/profiles) and to specify a set of allowed profiles.

```yaml
apiVersion: policies.mirrord.metalbear.co/v1alpha
kind: MirrordPolicy
metadata: { ... }
spec:
  ...
  # If this is set, the user must select a mirrord profile for their session.
  #
  # If multiple policies apply to the given session,
  # a profile is required if at least one of them require it.
  #
  # Optional, defaults to false.
  requireProfile: true
  # A list of allowed mirrord profiles.
  #
  # If multiple policies apply to the given session,
  # user's selected profile must be present in all allowlists.
  #
  # Optional. If not present, this policy will not enforce any allowlist.
  profileAllowlist:
  - my-profile-1
  - my-profile-2
```

The example above will enforce that the user selects either `my-profile-1` or `my-profile-2` for their session.

**Important:** mirrord profiles are applied to the session on the user machine, and should not be used as security features.

### Restricting targets affected by mirrord policies

By default, mirrord policies apply to all targets in the namespace or cluster.
You can use a target path pattern (`.spec.targetPath`) and/or a [label selector](
https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#resources-that-support-set-based-requirements)
(`.spec.selector`) in order to limit the targets to which a policy applies.

The target path of a mirrord run is either `targetless` or has the form `<TARGET_TYPE>/<NAME>` followed by an optional
`/container/<CONTAINER_NAME>`, where `<TARGET_TYPE>` is one of `deploy`, `pod`, `rollout` and `statefulset`.

Examples for possible target paths:
- `deploy/boats`
- `pod/boats-5fffb9767c-w92qh`
- `pod/boats-5fffb9767c-w92qh/container/appcontainer`
- `targetless`

By specifying a `targetPath` pattern in the policy, you limit the policy to only apply to runs that have
a target path that matches the specified pattern.

The target path pattern can contain `?`, which will match a single character, and `*`, which will match arbitrarily many
characters.
For example, `"deploy/*"` will make a policy apply for any run with a deployment target. `"*boats*"` will make a
policy apply to any target with `boats` in its name, e.g. `pod/boats-2kljw9`,
`pod/whatever-23oije2/container/boats-container`, etc.

> __Note__: when mirrord user specifies a container for the mirrord run, the target path ends with `/container/<CONTAINER_NAME>`.
>
> This means the pattern `deploy/my-deployment` will not match when a container is specified. That pattern can be
> changed to `deploy/my-deployment*` to also match on runs with a specified container (but will then also match
> `deploy/my-deployment-1` etc.)


Please note that the policy is applied according to the target given to mirrord. It is possible for a policy to apply
to a deployment target, but not to apply to the deployment's pods when targeted directly. For example, the following
policy:

```yaml
apiVersion: policies.mirrord.metalbear.co/v1alpha
kind: MirrordPolicy
metadata:
  name: block-stealing-from-boats-deployment
  namespace: default
spec:
  targetPath: "deploy/boats*"
  block:
    - steal
```

prevents mirrord users from stealing traffic when using the whole `boats` deployment as a target. However, a user could
still use a specific pod out of that deployment as a target for mirrord and steal its traffic. In order to prevent that,
the `targetPath` pattern or the label selector needs to be changed to match the pods of that deployment.

If a workload is used as a target, this workload's labels will be used to match against policies' `selector`, if
set. If a pod is used as a target, the pod's labels will be used.

Another example of a policy:

```yaml
apiVersion: policies.mirrord.metalbear.co/v1alpha
kind: MirrordPolicy
metadata:
  name: block-unfiltered-stealing-from-webserver-deployments
  namespace: books
spec:
  targetPath: "deploy/*"
  selector:
    matchLabels:
      component: webserver
  block:
    - steal-without-filter
    - mirror
```

This policy blocks mirroring and unfiltered stealing of traffic coming to all deployments in the namespace `books`
which are marked with label `component: webserver`.
