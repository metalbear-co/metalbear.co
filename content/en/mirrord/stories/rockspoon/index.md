---
title: "Rockspoon Accelerated Development with mirrord | mirrord User Stories"
card_title: "Leonard Melo"
description: "Rockspoon boosts development efficiency by debugging issues and testing local changes in their shared staging environment without impacting other developers."
date: 2023-07-31T06:00:00+00:00
lastmod: 2023-07-31T06:00:00+00:00
position: "Software Engineer | RockSpoon"
avatar: "leonard_melo.png"
logo: "rockspoon.png"
featured: true
draft: false
weight: 20
---

## About yourself

Leonardo Melo - Software Engineer

I'm a Backend Software Developer, currently working on building and maintaining Golang microservices that provide or consume REST and/or Event-Driven APIs.

## About your company

RockSpoon is a startup developing an end-to-end restaurant management platform, from Point of Sale to payment processing, delivery and more.

## What did you use before?

To run E2E tests for my local changes, I would deploy them to our shared staging environment, which could be quick or not, and could form a queue of people to deploy their changes to a certain service.
To debug issues, I relied mostly on reproducing the request with unit tests (which requires mocking integration calls), deploying to our shared staging environment then going through logs in order to gather information on what exactly was happening.

## Why did you choose mirrord instead?

Pod impersonation and VS Code debugger integration are the main reasons why I chose mirrord. Using both allowed me to test and debug local changes, in our cloud environment, in one go and without the hassles of a shared staging environment: just add breakpoints, impersonate the pod, make a request and debug it -- one breakpoint at a time. On top of that, mirrord is widely configurable and easy to use.


## How do you and others in your organization use mirrord?

Currently, we are using mirrord mostly in steal mode, with header filters, to intercept requests and debug issues and test local changes, in our shared staging environment, without impacting other developers. There are plenty more use-cases for mirrord at our company and I'm looking forward to extending our use of it 🙂
