---
title: "mirrord for CI"
description: "mirrord for CI"
slug: mirrord-for-ci
logo_repeat: 10
running_logo: 
  - title: "monday"
    image: "/mirrord-monday.png"
    class: "w-[122px] xl:w-[235px]"
  - title: "zooplus"
    image: "/mirrord-zooplus.png"
    class: "w-[75px] xl:w-[142px]"
  - title: "capital-ontap"
    image: "/capital-ontap.png"
    class: "w-[124px] xl:w-[239px]"
  - title: "imprint"
    image: "/mirrord-imprint.png"
    class: "w-[101px] xl:w-[160px]" 
  
faq:
  title: "Choose your plan"
  questions:
    - title: "How much does it cost?"
      content: >
        mirrord for CI is part of the mirrord <a href="https://metalbear.com/mirrord/pricing/" target="_blank">Enterprise plan</a>.

    - title: "Does this replace my existing CI provider?"
      content: >
        No. mirrord for CI augments your existing CI (like GitHub Actions) by providing runners with secure, isolated access to your Kubernetes cluster.
    
    - title: "Is it safe to run tests against a shared staging environment?"
      content: >
        Yes. mirrord ensures that test traffic doesn't interfere with other workloads.

    - title: "How long does it take to set up?"
      content: >
        With mirrord for CI, you're able to keep your staging environment working, while also running your batch of end-to-end and other automated tests. The local app runs in the context of the targeted app that's deployed in your staging cluster, so it gets access to traffic, files, and more, as if it's running in the cluster. This means there's no need to spin up a whole test environment for a CI run, then spin it down when it's done. <a href="https://metalbear.com/mirrord/docs/using-mirrord/mirrord-for-ci" target="_blank">Read more here</a> or **meet with us for free to get a quote**.

    - title: "Do I need to buy mirrord to try mirrord for CI?"
      content: >
        mirrord for CI is a feature of our Enterprise plan. However, you can experience the core mirroring technology via our open-source version, or schedule a demo to see the CI-specific isolation and automation features in action

    - title: "How does it handle databases?"
      content: >
        mirrord for CI can leverage mirrord’s <a href="https://metalbear.com/mirrord/docs/using-mirrord/db-branching" target="_blank">Database Branching</a> capability to spin up an isolated database for testing, while using all other resources on the shared cluster.

    - title: "What about security?"
      content: >
        We support RBAC and don't require root access on the local runner.

    - title: "How much time can it save me?"
      content: >
        We’re aware of teams that spent 40 hours a month maintaining mocks that still missed a production bug. mirrord changed that in an afternoon.

    - title: "How does it reduce my Cloud bill?"
      content: >
        Ephemeral clusters often take a significant cut of  devops budget. mirrord regularly brings that down. Even millions of dollars down.

    - title: "What is real-environment CI?"
      content: >
        mirrord for CI brings a new category to DevOps and Platform teams: real-environment CI. Teams validate code against an already-running Kubernetes environment, eliminating spin-up time, while safely testing in real production-like context. This fundamentally raises the bar for how cloud-native software is tested and shipped.



layout: builder
sections:
  - mirrord-for-ci-header
  - mirrord-for-ci-how-it-work
  - mirrord-for-ci-pipeline
  - mirrord-for-ci-environment
  - mirrord-for-ci-real-environment
  - mirrord-for-ci-faq
---