---
title: "Vivint User Story | Brooke Weaver"
card_title: "Brooke Weaver"
description: "Then I tried mirrord and it was flawless. It does everything I liked about Telepresence but better."
date: 2023-12-15T06:00:00+00:00
lastmod: 2023-12-15T06:00:00+00:00
position: "Staff Software Engineer | Vivint"
avatar: "brooke_weaver.png"
logo: "vivint.png"
featured: true
draft: false
weight: 5
---

# About yourself
Brooke Weaver, Staff Software Engineer at Vivint

# About your company
Vivint offers home security and a smart home experience in one convenient package, with professional install and 24/7 monitoring.

# What did you use before?
Telepresence, kubefwd, Bridge to Kubernetes

# Why did you choose mirrord instead?
Telepresence v1 was great, but it was a tad finicky. If you didn't cleanly exit, you could leave orphaned pods in the cluster that continued to capture traffic until manual cleanup. At some point Telepresence v1 stopped working with some of our services, and Telepresence v2 was even more finicky for me (some combination of my local and k8s environments seemed to throw it for a loop), and eventually I couldn't get it to ever work.
I used kubefwd for a long time until I had a use case where I really needed to see the exact traffic coming into our cluster. I tried Telepresence again with no luck, then tried Bridge to Kubernetes. Bridge to Kubernetes is pretty great, but at the time I tried it, it didn't support pods with multiple containers (which mine had), and it's not available as a JetBrains plugin (I'm not familiar enough with Visual Studio Code to be effective in it and it wasn't worth the time investment for a plugin that worked on a small subset of our services).
Then I tried mirrord and it was flawless. It does everything I liked about Telepresence but better. I especially love how customizable it is; it works with almost no configuration, but it allows for a great deal of customization should you want it.

# How do you and others in your organization use mirrord?
We use mirrord to help us more efficiently build and debug Go and Python microservices. We use it with REST and gRPC services, and I've even used it on a queue reader.
We have between 100 and 200 microservices, so it can be challenging to follow the flow of traffic between them, but mirrord obviates that problem entirely: we can simply run any service locally and inspect real cluster traffic as it hits our breakpoints, with minimal configuration and effort. For our queue reader services, I'm not expecting incoming network traffic, but mirrord is still convenient because with the "pause" feature I can let mirrord handle the stopping and starting of the service in the cluster, so I don't have to scale down the pod and remember to scale it back up when I'm finished, plus mirrord forwards my in-cluster dependencies, so I don't have to first examine the service to identify its dependencies and then kubefwd those before starting my local process; I simply enable mirrord and start debugging. mirrord saves me so much time.