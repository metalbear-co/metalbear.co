---
title: "SentinelOne uses mirrord to Speed Up Debugging | mirrord User Stories"
card_title: "Piotr Szczepański"
description: "Instead of asking every developer to create and fill a local environment, we have a single large remote one that is used by everyone."
date: 2023-07-31T06:00:00+00:00
lastmod: 2023-07-31T06:00:00+00:00
position: "Senior Software Engineer | SentinelOne"
avatar: "piotr_szczepanski.png"
logo: "sentinelone.png"
featured: true
draft: false
weight: 21
---

## About yourself

I'm Piotr Szczepański, a Senior Software Engineer at SentinelOne.

## About your company

SentinelOne is a cybersecurity company that provides its clients with a full endpoint protection solution. We allow our clients to secure their entire organisation against a wide range of cyber attacks as well as provide insight into the current state of their infrastructure from a single place called Singularity Platform. We offer real-time threat detection against malware, ransomware, and other types of malicious attacks. Additionally, we provide an autonomous response and forensic analysis to help our clients protect their businesses.

## What did you use before?

To debug issues in production we have mostly used static analysis with the help of Scalyr (a logging aggregator similar to Kibana) followed by debugging sessions of locally launched services connected to a remote K8s development cluster.

## Why did you choose mirrord instead?

mirrord provides a unique ability to mimic an existing K8s pod/service which we thought will be extremely useful not only when debugging existing issues, but also when developing new features for our services.

## How do you and others in your organization use mirrord?

We use mirrord mainly in two distinct ways. 
First and foremost, we use it to resolve bugs found in our environments. With it, a developer that already has the repository cloned can start debugging issues within minutes. There is no longer the need to set up the local configuration to be the same as the remote one. After connecting, the local process receives the same data as the remote one (for this purpose we often mirror the traffic rather than steal it), which effectively feels as if we have attached our debugger to a pod in a Kubernetes cluster.
The second biggest use case is the ability to develop new features or improvements for our services without interrupting the work of other developers. Instead of asking every developer to create and fill a local environment, we have a single large remote one that is used by everyone. This allows us to test our changes in a real environment without developers that work on the same service but with different features to overwrite their work constantly.

