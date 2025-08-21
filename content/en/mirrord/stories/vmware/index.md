---
title: "VMware Accelerates Cloud Native Development with mirrord | mirrord User Stories"
card_title: "Shani Sahar Kaneti"
description: "VMware accelerates cloud native development and debugging by using mirrord to connect local code to Kubernetes cluster. Read the full story"
date: 2023-07-31T06:00:00+00:00
lastmod: 2023-07-31T06:00:00+00:00
position: "Backend Developer | VMware"
avatar: "shani_sahar_kaneti.png"
logo: "vmware.png"
featured: true
draft: false
weight: 10
---

## About yourself

Shani Sahar Kaneti, Backend developer

## About your company

VMware Carbon Black

## What did you use before?

Telepresence

## Why did you choose mirrord instead?

The Telepresence solution was limited.

In version 1, Telepresence only allows to debug deployments, so I couldn’t debug my other services (such as DaemonSets), and the technology did an ssh mount from the pod to my machine.

The mount solution had limitations too - when debugging from you local machine, you don’t have access that is configured in your system. 

For example, for accessing AWS resources, I had an AWS Role annotation on the pod, that I couldn’t use in my local machine (the AWS role on my machine that has access to the cluster, doesn’t have access to the aws resource that the pod has).

In addition, some packages that I used, searched for hardcoded paths on the file system when used. With the Telepresence solution, I couldn’t debug services with such packages, since they tried to access files on my filesystem, instead of on the mounted folder. For example - a package I used, tried to access file under /etc, while I wanted it to access the /mounted_folder/etc file.

In version 2, the solution requires exporting your code through Kubernetes Services, and intercepting them. That didn’t allow me to debug code that isn’t exposed by services - for example, a Kafka consumer, or a cronjob that doesn't expose a port.

Also, setting up my environment for debugging wasn’t that simple, and required a preparation script.

mirrord allows me to debug all of the above, plus it has a plugin for my IDE (JetBrains' GoLand), so debugging a service became much faster and easier

## How do you and others in your organization use mirrord?

We use it in our development lifecycle, when trying to debug and write code in a microservices architecture on top of Kubernetes. 
