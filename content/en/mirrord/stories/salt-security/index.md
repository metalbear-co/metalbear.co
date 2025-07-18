---
title: "Salt Security User Story | Nitzan Braham"
card_title: "Nitzan Braham"
description: "With the use of mirrord and its extensions, we were able to [debug a complete workflow], significantly improving the development feedback cycle."
date: 2023-07-31T06:00:00+00:00
lastmod: 2023-07-31T06:00:00+00:00
position: "Software Engineer | Salt Security"
avatar: "nitzan_braham.png"
logo: "salt_security.png"
featured: true
draft: false
weight: 40
---

## About yourself

I’m Nitzan Braham, Software Engineer and part of the Platform team at Salt Security.

## About your company

Salt Security is a cybersecurity company based in Palo Alto, California. Founded in 2016, the company provides an API protection platform designed to prevent attacks by leveraging machine learning and AI. Its patented solution uses machine learning and AI to automatically and continuously identify and provide protection, learns the granular behavior and requires no configuration or customization to pinpoint and block attackers. Salt Security’s platform is designed to protect the APIs that form the core of every modern application.

## What did you use before?

Before using mirrord, the rest of Salt Security’s R&D team and I were using Telepresence.

## Why did you choose mirrord instead?

Telepresence provided us with local access to our Kubernetes cluster resources, but it did not fully meet all of our requirements.
mirrord offered an easy-to-configure solution for running local code on the cluster. With no additional configuration, the local application could access all connected services and databases, which is crucial when working with numerous microservices.
Running all microservices locally was nearly impossible, making it difficult to debug a complete workflow. However, with the use of mirrord and its extensions, we were able to achieve this capability, significantly improving the development feedback cycle.

## How do you and others in your organization use mirrord?

In our organization, we primarily use mirrord to debug issues that require a fully functional workflow during the development process.
Additionally, I utilize mirrord to run various tools as if they were available within the Kubernetes cluster. For instance, I can send a gRPC request to a service inside the cluster using Kreya.

