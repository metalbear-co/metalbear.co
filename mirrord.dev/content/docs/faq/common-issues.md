---
title: "Common Issues"
description: "Some common issues and workarounds."
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
images: []
menu:
  docs:
    parent: "faq"
weight: 140
toc: true
tags: ["open source", "team", "enterprise"]
---

### I've run my program with mirrord, but it seems to have no effect

There are currently two known cases where mirrord cannot load into the application's process:
1. Statically linked binaries. Since mirrord uses the dynamic linker to load into the application's process,
   it cannot load if the binary is statically linked. Support for statically linked
   binaries is planned for the long term, but for now you would have to make sure your binaries are dynamically
   linked in order to run them with mirrord.
   With Go programs, for example, it is as simple as adding `import "C"` to your program code.
   If you don't want to add an import to your Go program, you can alternatively build a dynamically linked binary using `go build -ldflags='-linkmode external'`. In VSCode, this can be done by adding `"buildFlags": "-ldflags='-linkmode external'"` to your `launch.json`.
   
   On Linux, append `-ldflags="-s=false"` to instruct `go run` not to omit the symbol table and debug information required by mirrord.
3. If you are running mirrord on MacOS and the executable you are running is protected by
   [SIP](https://en.wikipedia.org/wiki/System_Integrity_Protection) (the application you are developing wouldn't be,
   but the binary that is used to execute it, e.g. `bash` for a bash script, might be protected), mirrord might have trouble loading into it (mirrord can generally bypass SIP, but there are still some unhandled edge cases). If that is the case, you could try copying the binary you're trying to run to an unprotected directory (e.g. anywhere in your home directory), changing the IDE run configuration or the CLI
   to use the copy instead of the original binary, and trying again. If it still doesn't work, also remove the signature
   from the copy with:

   ```sudo codesign --remove-signature ./<your-binary>```

   Please let us know if you're having trouble with SIP by opening an issue on [GitHub](https://github.com/metalbear-co/mirrord) or talking to us on [Discord](https://discord.gg/metalbear).

Another reason that mirrord might seem not to work is if your remote pod has more than one container. mirrord works at the level of the container, not the whole pod. If your pod runs multiple containers, you need to make sure mirrord targets the correct one by by specifying it explicitly in the [target configuration](/docs/reference/configuration/#root-target). Note that we filter out the proxy containers added by popular service meshes automatically.

### I've run my [Turbo](https://turbo.build/) task with mirrord, but it seems to have no effect

When executing a task Turbo strips most of the existing process environment, including internal mirrord variables required during libc call interception setup. There are two alternative ways to solve this problem:

1. Explicitly tell Turbo to pass mirrord environment to the task. To do this, merge the snippet below into your `turbo.json`. You should be able to run the task like `mirrord exec turbo dev`.
```json
{
  "globalPassThroughEnv": ["MIRRORD_*", "LD_PRELOAD", "DYLD_INSERT_LIBRARIES"]
}
```

2. Invoke mirrord inside the Turbo task command line itself.

### Incoming traffic to the remote target doesn't reach my local process

This could happen because the local process is listening on a different port than the remote target. You can either change
 the local process to listen on the same port as the remote target (don't worry about the port
 being used locally by other processes), or use the [`port_mapping`  configuration
 ](/docs/reference/configuration/#feature-network-incoming-port_mapping) to map the local port to a
 remote port.

### The remote target stops receiving remote traffic, but it doesn't reach my local process either
This can happen in some clusters using a service mesh when stealing incoming traffic. You can use this configuration to fix it:
```json
{"agent": {"flush_connections": false}}
```

### My application is trying to read a file locally instead of from the cluster

mirrord has a list of path patterns that are read locally by default regardless of the configured fs mode. You can
override this behavior in the configuration.

Here you can find all the pre-defined exceptions:
1. Paths that match
   [the patterns defined here](https://github.com/metalbear-co/mirrord/tree/latest/mirrord/layer/src/file/filter/read_local_by_default.rs)
   are read locally by default.
2. Paths that match
   [the patterns defined here](https://github.com/metalbear-co/mirrord/tree/latest/mirrord/layer/src/file/filter/read_remote_by_default.rs)
   are read remotely by default when the mode is `localwithoverrides`.
3. Paths that match
   [the patterns defined here](https://github.com/metalbear-co/mirrord/tree/latest/mirrord/layer/src/file/filter/not_found_by_default.rs)
   under the running user's home directory will be failed to be found by default when the mode
   is not `local`.

In order to override that settings for a path or a pattern, add it to the appropriate set:
1. `feature.fs.read_only` if you want read operations to that path to happen remotely, but write operations to
   happen locally.
2. `feature.fs.read_write` if you want read and write operations to that path to happen remotely.
3. `feature.fs.local` if you want read and write operations to that path to happen locally.
4. `feature.fs.not_found` if you want the application to "think" that file does not exist.

### My local process fails to resolve the domain name of a Kubernetes service in the same cluster

If you've set `feature.fs.mode` to `local`, try changing it to `localwithoverrides`.

When the `local` mode is set, all files will be opened locally. This might prevent your process from resolving cluster-internal domain names correctly, because it can no longer read Kubelet-generated configuration files like `/etc/resolv.conf`. With `localwithoverrides`, such files are read from the remote pod instead.

### Old mirrord agent pods are not getting deleted after the mirrord run is completed

If an agent pod's status is `Running`, it means mirrord is probably still running locally as well. Once you
terminate the local process, the agent pod's status should change to `Completed`.

On clusters with Kubernetes version v1.23 or higher, agent pods are
[automatically cleaned up](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/)
immediately (or after a [configurable TTL](/docs/reference/configuration/#agent-ttl)).
If your cluster is v1.23 or higher and mirrord agent pods are not being cleaned up automatically,
[please open an issue on GitHub](
https://github.com/metalbear-co/mirrord/issues/new?assignees=&labels=bug&projects=&template=bug_report.yml&title=Agent%20pods%20lingering%20after%20completion
).
As a temporary solution for cleaning up completed agent pods manually, you can run:
```shell
kubectl delete jobs --selector=app=mirrord --field-selector=status.successful=1
```

### My local process gets permission (EACCESS) error on file access or DNS can't resolve

If your cluster is running on Bottlerocket or has SELinux enabled, please try enabling the `privileged` flag
in the agent configuration:
```json
{
  "agent": {
    "privileged": true
  }
}
```

### `mirrord operator status` fails with `503 Service Unavailable` on GKE

If private networking is enabled, it is likely due to firewall rules blocking the mirrord operator's API service from the API server. To fix this, add a firewall rule that allows your cluster's master nodes to access TCP port 443 in your cluster's pods. Please refer to the [GCP docs](https://cloud.google.com/kubernetes-engine/docs/how-to/private-clusters#add_firewall_rules) for information.

### My local process encounters unexpected certificate validation errors

When running processes locally versus in a container within Kubernetes, some languages handle certificate validation differently. For instance, a Go application on macOS will use the macOS Keychain for certificate validation, whereas the same application in a container will use different API calls. This discrepancy can lead to unexpected certificate validation errors when using tools like mirrord.

A specific issue with Go can be found [here](https://github.com/golang/go/issues/51991), where Go encounters certificate validation errors due to certain AWS services serving certificates that are deemed invalid by the macOS Keychain, but not by Go’s certificate validation in other environments.

To work around this issue (on macOS), you can use the following mirrord configuration:
```json
{
   "experimental": {"trust_any_certificate": true}
}
```
This configuration would make any certificate trusted for the process.

Other alternatives are to either disable certificate validation in your application or import the problematic certificate (or its root CA) into your macOS Keychain. For guidance on how to do this, refer to this [Apple support article](https://support.apple.com/guide/keychain-access/change-the-trust-settings-of-a-certificate-kyca11871/mac).
