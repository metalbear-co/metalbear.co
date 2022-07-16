---
title: "mirrord 🤝 Ephemeral Containers"
description: "Using Ephemeral Containers(Kubernetes beta feature v1.23) to mirror traffic from remote pod."
lead: "Using Ephemeral Containers(Kubernetes beta feature v1.23) to mirror traffic from the remote pod."
date: 2022-07-15T0:00:00+00:00
lastmod: 2022-07-15T0:00:00+00:00
draft: false
weight: 50
images: []
contributors: ["Mehul Arora"]
---

Maybe you are hearing the name “Ephemeral Containers” for the first time or perhaps you have already played around with them. While the idea behind using Ephemeral Containers is to eliminate bundling your service with a Linux distribution or just ease troubleshooting your Pod, we were quick to find a new use case for this feature to make mirroring traffic just a bit easier!

## How does traffic reach mirrord-layer?

In our previous [blogpost](https://metalbear.co/blog/mirrord-internals-hooking-libc-functions-in-rust-and-fixing-bugs/), we discussed how network operations are handled by mirrord-layer, how subscription requests are sent to mirrord-agent when `Listen` is called and that mirrord-agent is responsible for sending back traffic to mirrord-layer and just to be a bit more verbose about mirrord-agent, it is shipped as a container image and runs elevated permissions on the same node as the impersonated pod.
Let’s take a moment to discuss the current model we follow to create mirrord-agent and what goes on inside it!

### Kubernetes Jobs

Kubernetes lets you create Jobs that run Pods to completion, in simple words, the Job watches your Pod. This Job mechanism comes with a [TTL Controller](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/), which clears all the resources created by the job on Completion. But there’s something a bit complicated with following this model, and that is we need to take care of container runtimes while creating the Job. mirrord-agent needs to enter the container’s network namespace of the pod being debugged and have access to its root file system. In order to be able to do so, mirrord-layer has to infer the container runtime and spawn the Job with the container runtime and the container ID as a part of the command line argument for the agent process. 

Example specification:

```rs
"metadata": {
                    "name": “mirrord_agent”,
                    "labels": {
                        "app": "mirrord"
                    }
                },
                "spec": {
                "ttlSecondsAfterFinished": 10,

                    "template": {
                "spec": {
                    "hostPID": true,
                    "nodeName": “node_name”,
                    "restartPolicy": "Never",
                    "volumes": [
                        {
                            "name": "sockpath",
                            "hostPath": {
                                "path": "/run/containerd/containerd.sock"
                            }
                        }
                    ],
                    "containers": [
                        {
                            "name": "mirrord-agent",
                            "image": agent_image,
                            "imagePullPolicy": “IfNotPresent”,
                            "securityContext": {
                                "privileged": true,
                            },
                            "volumeMounts": [
                                {
                                    "mountPath": "/run/containerd/containerd.sock",
                                    "name": "sockpath"
                                }
                            ],
                            "command": [
                                "./mirrord-agent",
                                "--container-id",
                                container_id,
                                "--container-runtime",
                                container_runtime,
                                "-t",
                                "30",
                            ],
                            "env": [{"name": "RUST_LOG", "value": “DEBUG”}],
                        }
                    ]
                }
            }
        }

```

mirrord-agent then uses the container runtime APIs to get the PID of the container and uses [setns](https://man7.org/linux/man-pages/man2/setns.2.html) to enter the network namespace. Once it has entered the namespace, it sniffs the network packets and mirrors the traffic to a local port. 

{{<figure src="mirrord-agent-traffic.png" alt="mirrord agent handling traffic and switching namespace" height="100%" width="100%">}}

mirrord-layer, on successful creation of the agent, forwards the port on the pod and analyzes the traffic stream for responses.

## Ephemeral Containers

Kubernetes [Ephemeral Containers](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/) is a v1.23 beta feature. While the most significant advantage of this feature is to enable troubleshooting/debugging the remote pod, we will use it as alternative to creating an external Job/Pod for mirroring traffic as ephemeral containers share common container namespaces and resource allocations.

To create an Ephemeral Container, we need to patch the `ephemeralcontainers` subresource of the impersonated pod. 

Example specification: 
```rs
{
        "name": mirrord_agent,
        "image": agent_image,
        "imagePullPolicy": "IfNotPresent",
        "target_container_name": config.impersonated_container_name,
        "env": [{"name": "RUST_LOG", "value": "DEBUG"}],
        "command": [
            "./mirrord-agent",
            "-t",
            "30",
        ],
    }
```
After patching the subresource, we have mirrord-agent up and running sending traffic to the port. We did not have to infer the container runtime or switch namespaces at the agent level to have access to network interface or the file system. 

## Conclusion

As useful and convenient Ephemeral Containers can be, they lack the ability to select which namespaces to override and the ability to auto clean on completion. Overall, we save the hassle of switching namespaces through ephemeral containers because at the end of the day if we want to support multiple container runtimes, we don’t have to worry about explicitly interacting with their APIs when using Ephemeral Conatiners.
It is also perhaps worth looking into and discussing how these lacking features could turn out to be very useful in debugging production software.