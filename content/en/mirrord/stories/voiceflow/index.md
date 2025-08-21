---
title: "Voiceflow Simplifies Cloud Development with mirrord | mirrord User Stories"
card_title: "Greg O'Grady"
description: "We’ve seamlessly integrated mirrord with our internal tools, making it easy for devs to work on specific services without worrying about Kubernetes complexities."
date: 2024-11-07T06:00:00+00:00
lastmod: 2024-11-07T06:00:00+00:00
position: "Software Engineer | Voiceflow"
avatar: "greg-o-grady.png"
logo: "voiceflow.png"
featured: true
draft: false
weight: 10
---

# About yourself 
Greg O'Grady, Software Engineer IV at Voiceflow

# About your company
Voiceflow helps product teams build, manage, and deploy AI Agents to automate customer experiences.


# Why did you choose mirrord instead? 

A key issue we experienced with alternative solutions was connection splitting, causing requests to be routed to the wrong instances, leading to inconsistent behavior. Troubleshooting these networking issues became a major headache. We chose mirrord for its simplicity, aligning with the Unix philosophy of "do one thing and do it well". With just a CLI, we were ready to go. 

The biggest improvement has been the reduced need for support. We used to get pinged frequently about meshing issues (intercepting a single service for development in our remocal workflow), which we constantly had to troubleshoot. 
Since we started using mirrord, I honestly can’t recall the last time we had a real problem. One of the key advantages of mirrord is that it abstracts away the complexities for developers who may not have deep knowledge of Kubernetes or the networking stack.

Developers can simply focus on their service, while mirrord handles everything behind the scenes. This kind of abstraction is often overlooked in tech, but it’s essential for improving efficiency, especially for teams with developers who don’t need to understand the full technical depth of the system. Developers can work without worrying about Kubernetes port forwarding or other complicated processes, which makes development a lot smoother and faster for everyone involved.

# How do you and others in your organization use mirrord? 
We use Kubernetes and follow a heavily microservices-based architecture, with numerous repositories—some of them monorepos, while others aren’t. We have dozens of services, and running all of them locally would overwhelm our laptops’ resources. Developing locally with code duplication was a nightmare, so having a monorepo where we can develop just one service and connect to our remote Kubernetes cluster in the cloud has been a game changer. 

We've seamlessly integrated mirrord with our internal tools, making it easy for developers to work on specific services without worrying about Kubernetes or networking complexities. We use mirrord to intercept individual services, focus our development on it, and benefit from a quick feedback loop without having to rebuild or wait for long deployment times. It saves us from needing to run everything locally or rely on continuous deployment (CD) pipelines just to test something. This has worked well with the monorepo style too, letting us intercept and develop a single service smoothly within the larger codebase.
