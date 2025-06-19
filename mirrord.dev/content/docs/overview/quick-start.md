---
title: "Quick Start"
description: "How to (very) quickly start using mirrord"
date: 2020-11-16T13:59:39+01:00
lastmod: 2025-06-19T10:59:39+01:00
draft: false
images: []
menu:
  docs:
    parent: "overview"
weight: 110
toc: true
tags: ["open source", "team", "enterprise"]
shallowToc: true
---

## Requirements

mirrord runs on your local machine and in your Kubernetes cluster.

### Local Requirements

- MacOS (Intel, Apple Silicon) and Linux (x86_64) are supported for the local machine. Windows users can use mirrord using WSL (IDE plugins supported as well).
- kubectl needs to be configured on the local machine.

### Remote Requirements

- Docker or containerd runtime (containerd is the most common). If you'd like support for other runtimes to be added, please let us know by [opening an issue on GitHub](https://github.com/metalbear-co/mirrord/issues/new?assignees=&labels=enhancement&template=feature_request.md).
- Linux Kernel version 4.20+

mirrord can be used in three ways:

1. [CLI Tool](#cli-tool)
2. [VS Code Extension](#vs-code-extension)
3. [IntelliJ Plugin](#intellij-plugin)

If you're planning to use [mirrord for Teams](https://app.metalbear.co), you'll also need to install the mirrord [Operator](#operator).

## CLI Tool

### Installation

To install the CLI, run:

```bash
brew install metalbear-co/mirrord/mirrord
```
or
```bash
curl -fsSL https://raw.githubusercontent.com/metalbear-co/mirrord/main/scripts/install.sh | bash
```

### Usage

To use mirrord to plug a local process into a pod/deployment in the cluster configured with kubectl, run:

```bash
mirrord exec --target <target-path> <command used to run the local process>
```

For example:

```bash
mirrord exec --target pod/app-pod-01 python main.py
```

Or, if you'd rather run a local container than a native process, run:
```bash
mirrord container --target <target-path> -- <command used to run the local container>
```

For example:

```bash
mirrord container -- docker run nginx
```

Use `mirrord exec --help` or `mirrord container --help` to get all possible commands + arguments.


## VS Code Extension

### Installation

You can install the extension directly in the IDE (Extensions -> search for 'mirrord'), or download it from the marketplace [here](https://marketplace.visualstudio.com/items?itemName=MetalBear.mirrord).

### Usage

To use extension, click the 'Enable mirrord' button in the status bar at the bottom of the window. When you next run a debug session, you'll be prompted with a dropdown listing pods in the namespace you've configured (or the 'default' namespace, if you haven't). Select the pod you want to impersonate, and the debugged process will be plugged into that pod by mirrord.

### Configuration

The VS Code extension reads its configuration from the following file: `<project-path>/.mirrord/mirrord.json`. You can also prepend a prefix, e.g. `my-config.mirrord.json`, or use .toml or .yaml format.
Configuration options are listed [here]({{< ref "/docs/reference/configuration" >}} "configuration"). The configuration file also supports autocomplete when edited in VS Code when the extension is installed.

## IntelliJ Plugin

### Installation

You can install the plugin directly in the IDE (Preferences -> Plugins, search for 'mirrord'), or download it from the marketplace [here](https://plugins.jetbrains.com/plugin/19772-mirrord).

### Usage

To use extension, click the mirrord icon in the Navigation Toolbar at the top right of the window. When you next run a debug session, you'll be prompted with a dropdown listing namespaces in your cluster, and then another with pods in the namespace you selected. Select the pod you want to impersonate, and the debugged process will be plugged into that pod by mirrord.

### Configuration

The IntelliJ plugin reads its configuration from the following file: `<project-path>/.mirrord/mirrord.json`. You can also prepend a prefix, e.g. `my-config.mirrord.json`, or use .toml or .yaml format.
Configuration options are listed [here]({{< ref "/docs/reference/configuration" >}} "configuration").

## Operator

To install and use the Operator, you'll need a mirrord for Teams license. You can get one [here](https://app.metalbear.co/).
The Operator can be installed using the [mirrord CLI](#mirrord-cli) or [Helm](#helm). This has to be performed by a user with elevated permissions to the cluster.

### mirrord CLI
1. Install the [mirrord CLI](#cli-tool).
2. Run the `mirrord operator setup` command. The base of the command is:
​
`mirrord operator setup [OPTIONS] | kubectl apply -f -`
​
Options:
- `--accept-tos` 
        You accept terms of service for mirrord-operator
- `--license-key` 
        The license key for the operator
- (Optional) `-f, --file` 
        Output Kubernetes definitions to file and not to stdout (instead of piping to `kubectl apply -f -`)
- (Optional) `--namespace` 
        Set namespace of mirrord operator (default: mirrord)
​
So the final command should look like
​
`mirrord operator setup --accept-tos --license-key <license-key> | kubectl apply -f -`

You should now be able to see the `mirrord-operator` deployment when running `kubectl get deployments -n mirrord`. Also, when you run mirrord, you'll see the `connected to operator` step in its progress reports.

### Helm

To install the mirrord Operator with Helm, first add the MetalBear Helm repository:

```bash
helm repo add metalbear https://metalbear-co.github.io/charts
```

Then download the accompanying `values.yaml`:
```bash
curl https://raw.githubusercontent.com/metalbear-co/charts/main/mirrord-operator/values.yaml --output values.yaml
```

Set `license.key` to your key.

Finally, install the chart:
```bash
helm install -f values.yaml mirrord-operator metalbear/mirrord-operator 
```

### Using Internal Registry (Optional)

The use of an internal registry for storing mirrord images is useful for:
1. Reducing startup time of agent and operator.
2. Reducing cost of ingress traffic needed to download the images.
3. Ensuring that even if our registry goes down (we use GitHub) your use of mirrord isn't interrupted.

#### Copying images

The first step would be to copy the needed images to your internal registry.
We recommend using [regctl](https://regclient.org/) because it has a built in copy command, that supports copying multi-arch images so you can use mirrord on a mixed arm/x64 fleet at ease.

Install `regctl`:
```sh
go install github.com/regclient/regclient/cmd/regctl@latest
```
or using script:
```sh
curl -L https://github.com/regclient/regclient/releases/latest/download/regctl-linux-amd64 >regctl
chmod 755 regctl
```

Note - you might need to login to the registry (it automatically uses docker login if available)

```
regctl registry login REGISTRY
```

Get the operator image relevant to the chart version you want to install:

```sh
helm show chart metalbear/mirrord-operator | grep 'appVersion:' | awk '{print $2}'
```

Copy the image to your registry

```sh
regctl image copy ghcr.io/metalbear-co/operator:IMAGE_VERSION your-registry/operator:IMAGE_VERSION
```

Extract agent version that is used with specific operator version:
```sh
regctl image config ghcr.io/metalbear-co/operator:IMAGE_VERSION | jq -r '.config.Labels."metalbear.mirrord.version"'
```

Copy agent image to your registry

```sh
regctl image copy ghcr.io/metalbear-co/mirrord:AGENT_IMAGE_VERSION your-registry/mirrord:AGENT_IMAGE_VERSION
```


#### Setting chart to use internal registry

In the operator chart, set the following values:
```yaml
operator:
  image: ghcr.io/metalbear-co/operator # REPLACE TO YOUR REGISTRY.
agent:
  image:
    registry: ghcr.io/metalbear-co/mirrord # REPLACE TO YOUR REGISTRY.
```

In the license server chart (if used), set the following values:

```yaml
server:
  image: ghcr.io/metalbear-co/operator # REPLACE TO YOUR REGISTRY
```

Note: License server uses same image as operator for simplicity in deployment.

### OpenShift

In order to make the operator work with OpenShift, you need to apply the following scc:

```yaml
kind: SecurityContextConstraints
apiVersion: security.openshift.io/v1
metadata:
  name: scc-mirrord
allowHostPID: true
allowPrivilegedContainer: false
allowHostDirVolumePlugin: true
allowedCapabilities: ["SYS_ADMIN", "SYS_PTRACE", "NET_RAW", "NET_ADMIN"]
runAsUser:
  type: RunAsAny
seLinuxContext:
  type: MustRunAs
users:
- system:serviceaccount:mirrord:mirrord-operator
- system:serviceaccount:mirrord:default
```

### Verifying the Installation
After installing the Operator, you can verify it works by running `mirrord operator status`. All mirrord clients will now use the Operator instead of doing actions on their own when running against the cluster.


## Test it out!
Now that you've installed the CLI tool or one of the extensions, lets see mirrord at work. By default, mirrord will mirror incoming traffic to the remote target (this can be changed in the [configuration](/docs/reference/configuration/#feature-network-incoming-mode)), sending a duplicate to the same port on your local process. So if your remote target receives traffic on port 80, your local process will receive a copy of that traffic on that same port (this can also be [configured](/docs/reference/configuration/#feature-network-incoming-port_mapping)). 

To test this out, enable mirrord in your IDE plugin and start debugging your process (or execute your process with the mirrord CLI). Send a request to your remote target, and you should see that request arriving at your local process as well!

Note that, by default, the following features are also enabled: 
1. Environment variables from the remote target will be imported into your local process
2. When reading files, your local process will read them from the remote target
3. DNS resolution for your local process will happen on the remote target
4. Outgoing traffic sent by your local process will be sent out from the remote target instead, and the response will be sent back to your local process

We find that this configuration works for a lot of use cases, but if you'd like to change it, please read about available options in the [configuration](/docs/reference/configuration/).

## What's next?
Now that you've tried out mirrord, it's time to get acquainted with its different configuration options and tailor it to your needs:
1. If you'd like to intercept traffic rather than mirror it so that your local process is the one answering the remote requests, check out [this guide](/docs/using-mirrord/steal/). Note that you can even filter which traffic you intercept!
2. If your local process reads from a queue, you might want to test out the [copy target feature](/docs/using-mirrord/copy-target/), which temporarily creates a copy of the mirrord session target. With its `scaledown` flag it allows you to temporarily delete all replicas in your targeted rollout or deployment, so that none competes with your local process for queue messages.
3. If you don't want to impersonate a remote target - for example, if you want to run a tool in the context of your cluster - check out our [guide on the targetless mode](/docs/using-mirrord/targetless/).
4. If you just want to learn more about mirrord, why not check out our [architecture]({{< ref "/docs/reference/architecture" >}} "architecture") or [configuration]({{< ref "/docs/reference/configuration" >}} "configuration") sections?
