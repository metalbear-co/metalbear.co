---
title: "mirrord as an alternative to Telepresence"
description: "A short introduction to the new targetless mode of mirrord, explaining its main use-cases."
lead: "A comparison between mirrord and Telepresence"
tags:
  - Kubernetes
  - microservices
  - testing
  - debugging
date: 2023-07-06T0:00:00+00:00
lastmod: 2023-07-06T0:00:00+00:00
draft: false
weight: 50
images: ["mirrord-vs-telepresence.png", "cli-command.png", "vscode-usage.gif"]
contributors: ["Eyal Bukchin"]
---

A question that comes up often from those already familiar with local Kubernetes development is how mirrord compares to Telepresence. The idea at the base of both products is indeed similar: instead of deploying your new code to the cloud and testing it there, connect it to the cloud from your local machine. By shifting left on cloud testing this way you utilize your cloud environment much more effectively and speed up your development process. The people at Ambassador Labs [wrote about it at length](https://www.getambassador.io/docs/telepresence-oss/latest/concepts/devworkflow).

{{<figure src="mirrord-vs-telepresence.png" alt="The mandatory mirrord VS. Telepresence image"  class="center mid-width">}}

However, the technical approach at the base of mirrord is very different from that of Telepresence, which translates into significant differences in usability, compatibility, and performance. What Telepresence does is install an operator in your cluster, then connect you to the cluster via VPN (either your entire development machine or a containerized subset). On the other hand, this is what happens when you run a local process with mirrord:
1. mirrord starts a pod (called the mirrord agent) on the same network namespace as your target. This pod is cleaned up automatically at the end of execution.
2. mirrord then injects itself into your process, overrides low-level functions and relays them to the mirrord agent, who then executes them on the target in the cluster and sends back the results. For example, when your process tries to read a file, mirrord intercepts that function call and instead asks the agent to read that file from the remote target. mirrord does this for everything - traffic, file operations, environment variables - so your process behaves as if it was executed within the Kubernetes cluster, and with the entire context of your target.

It’s pretty heavy lifting compared to just starting a VPN - mirrord has to hook and reimplement a lot of functions for everything to work smoothly across different frameworks. But there’s a payoff:

1. By providing your local process with the **entire remote context of the pod** you chose to target, mirrord **natively supports complex flows**. For example, if when your process receives a request it queries a database - since mirrord provides it with the pod’s environment variables and files, it’s going to have the necessary credentials, and since mirrord intercepts the outgoing requests and sends it out from the remote pod instead, it won’t be interrupted by any network rules blocking access from outside of the cluster. 
2. mirrord **doesn’t need root access** on your machine. All it does is override the functions of a running process; the rest of your machine remains untouched
3. You **don’t have to install anything on your cluster** - mirrord uses the Kubernetes API, so all you need is a configured kubeconfig. mirrord does create a pod when it runs, but it cleans itself up at the end of execution.
4. As you might have guessed, mirrord **supports traffic mirroring**. It can still intercept traffic like Telepresence does, but if you want to leave the remote process completely untouched, mirrord can also just duplicate its traffic and send a copy to you. The original requests are handled by the remote service, so people accessing it are completely unaware that you’re using mirrord to debug it.
5. As opposed to Telepresence which works at the network level, mirrord works at the pod level. This means it also **supports pods that aren’t exposed through a service**, and gives your local code access to anything the pod can access, including **components outside the cluster**. It also natively supports environments with service mesh like Linkerd or Istio.
6. Because the mirrord client works at the process level, you can easily **configure exactly what’s executed remotely and what stays local**. For example, you could make all the components of the remote cluster accessible to your local process, but have it write to the database locally; or have it read files from the local file system, except a few specific files that you want to get from the remote pod. 
7. mirrord is a tool for developers, and as such, in addition to a CLI tool, it also comes as an **IDE plugin for both VS Code and the IntelliJ IDEs**. This is the most popular way to use mirrord, where it naturally fits into the existing development workflow.


Most importantly though, all of these things are supported out of the box and with no required changes to your system. You don’t have to set up mounts, manually ingest environment variables, or create headless services. Just run your process with mirrord, and everything works. It’s this lack of friction that really makes the vision of local Kubernetes development possible - a true shift left of the cloud, where running your code in Kubernetes isn’t the thing you’re saving for last after all the unit tests and local setups, but rather the first thing you do when you write new code. 

Usage is simple and intuitive. In the CLI:
{{<figure src="cli-command.png" alt="A very straightforward breakdown of the mirrord CLI command" class="center mid-width">}}

And in the IDE - enable mirrord, run or debug your code, and select a target. For example, in VSCode:

{{<figure src="vscode-usage.gif" alt="Quick demo of mirrord being used within VS Code" height="100%" width="100%">}}

## Try it out!

If you want to take mirrord for a spin, check out the [quick start guide](https://mirrord.dev/docs/overview/quick-start/). We’d love to hear about your experience or just general thoughts - chat us up on our [Discord](https://discord.gg/metalbear) or open an issue or discussion on [GitHub](https://github.com/metalbear-co/mirrord).