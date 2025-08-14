---
title: Pmirrord Pricing | Open Source Available | MetalBearricing
description: mirrord pricing for teams and enterprises. Start for free and scale up to advanced features like concurrent usage in the same cluster.
slug: pricing
questions:
  - title: "How are seats calculated?"
    content: >
      Seats are calculated by monthly activity. Any user that used mirrord in a calendar month is counted towards your seat count.mirrord identifies users with a unique file it creates on the machine it runs on. If this does not represent distinct users in your organization, or if you use mirrord on cloud workers (e.g. for CI, or cloud development environments), please <a href="/mirrord/contact/">contact us</a>
  - title: "Is there a free version of mirrord?"
    content: >
      Yes! Check out the mirrord OSS <a target="_blank" href="https://github.com/metalbear-co/mirrord">here</a>. You can read more about the differences between the mirrord OSS and mirrord for Teams <a href="/mirrord/docs/overview/teams/">here</a>.
  - title: "Which plan is right for me?"
    content: >
      Roughly speaking, the Team plan is usually a better choice for teams of under 30 developers, at which point the Enterprise plan becomes a better fit. However, things like support for air-gapped clusters, custom contracts, or higher SLAs can also be deciding factors. If you're not sure, check out the detailed feature list above, or feel free to <a href="/mirrord/contact/">contact us</a> and we'll help you figure it out.
  - title: "Do you offer an enterprise support plan?"
    content: >
      Enteprise support is included in the mirrord for Teams Enterprise plan. As part of our enterprise support, you’ll get our usual support channels as well as a dedicated Microsoft Teams/Slack/Discord channel.
layout: pricing
sections:
- template: pricing-plan
  title: "Choose your plan"
  plans:
  - name: "Team"
    pricing: "$40"
    pricing_note: "Seat / Month"
    billing_note: "no credit card required"
    description: "Advanced functionalities for teams sharing a staging cluster"
    best_for:
      - "Best for small teams"
      - "No dedicated/custom support"
    feature_title: "Team feature highlights:"
    features:
      - "Unlimited concurrent work on the same target"
      - "Queue splitting"
      - "Support for deployments with multiple pods"
      - "Support for targeting Jobs, StatefulSets and more"
    admin_support:
      - "Role based access control"
      - "Usage Monitoring & Auditing"
    cta: "Try it now for free"
    cta_link: "https://app.metalbear.co/account/sign-up"

  - name: "Enterprise"
    pricing: "Custom"
    description: "Built for bigger teams and enterprises that need secure, scalable solutions for complex, cloud-based development environments"
    best_for:
      - "Best for larger organizations (15+ engineers)"
      - "White glove support"
      - "Airgapped clusters"
    feature_title: "Enterprise feature highlights:"
    features:
      - "<strong>Everything in Teams</strong>"
      - "Support for airgapped clusters"
      - "mirrord support in CI pipelines"
      - "Annual billing via Invoice, custom contracts"
    admin_support:
      - "Support tickets, email, private Discord, Slack, or Teams"
    cta: "Talk to us"
    cta_link: "https://metalbear.co/mirrord/demo/"
  teams:
    - logo: "/pricing/sentinel-one.png"
      class: "w-[162px] lg:w-[235px]"
    - logo: "/pricing/survey-monkey.png"
      class: "w-[204px] lg:w-[297px]"
      url: "/mirrord/case-study/surveymonkey/"
    - logo: "/pricing/colab.png"
      class: "w-[124px] lg:w-[180px]"
      url: "/mirrord/case-study/colab/"
    - logo: "/pricing/zooplus.png"
      class: "w-[100px] lg:w-[146px]"
    - logo: "/pricing/cadence.png"
      class: "w-[121px] lg:w-[177px]"
      url: "/mirrord/case-study/cadence/"
    - logo: "/pricing/augury.png"
      class: "w-[80px] lg:w-[118px]"
    - logo: "/pricing/daylight.png"
      class: "w-[121px] lg:w-[177px]"
      url: "/mirrord/case-study/daylight/"
    - logo: "/pricing/imprint.png"
      class: "w-[123px] lg:w-[181px]"

- template: pricing-compare
  compare_features:
    - category: "Collaboration"
      features:
        - name: "Unlimited concurrent work on the same target"
          team: true
          enterprise: true
        - name: "Conflict resolution"
          team: true
          enterprise: true
        - name: "mirrord Profiles"
          team: true
          enterprise: true
        - name: "Queue Splitting – SQS, Kafka, Redis (Coming soon)"
          team: true
          enterprise: true

    - category: "Observability and Control"
      features:
        - name: "Usage monitoring"
          team: true
          enterprise: true
        - name: "Logging/Auditing"
          team: true
          enterprise: true
        - name: "Session management"
          team: true
          enterprise: true

    - category: "Security and Compliance"
      features:
        - name: "mirrord Policies"
          team: true
          enterprise: true
        - name: "RBAC"
          team: true
          enterprise: true
        - name: "Support for airgapped clusters"
          team: false
          enterprise: true

    - category: "Advanced Kubernetes Support"
      features:
        - name: "mirrord support in CI pipelines"
          team: false
          enterprise: true
        - name: "Support for live scaling"
          team: true
          enterprise: true
        - name: "Support for deployment with multiple pods"
          team: true
          enterprise: true
        - name: "Support for targeting Jobs and CronJobs"
          team: true
          enterprise: true
        - name: "Support for targeting StatefulSets"
          team: true
          enterprise: true

    - category: "Support and Billing"
      features:
        - name: "Service Level Agreement"
          team: "48h"
          enterprise: "Custom (+ 24h)"
        - name: "Support tickets, email, public Slack"
          team: true
        - name: "Support tickets, email, private Discord, Slack, or Teams"
          team: false
          enterprise: true
        - name: "Customer success team and Professional services"
          team: false
          enterprise: true
        - name: "Monthly or Annual with Credit Card"
          team: true
        - name: "Annual billing via invoice, custom contracts"
          team: false
          enterprise: true

- template: pricing-faq
  title: "Choose your plan"
  questions:
    - title: "Is there a free version of mirrord?"
      content: >
        Yes! <a href="https://github.com/metalbear-co/mirrord" target="_blank">Check out the mirrord OSS here</a>. You can read more about the differences between the mirrord OSS and mirrord for Teams <a href="https://metalbear.co/mirrord/docs/overview/teams/" target="_blank">here</a>.

    - title: "Do I need a credit card to start a trial?"
      content: >
        No, you can <a href="https://app.metalbear.co/account/sign-up" target="_blank">try out mirrord for Teams without a credit card</a>—just sign up and start using it. No commitments, no automatic charges.
    
    - title: "How are seats calculated?"
      content: >
        Seats are calculated by monthly activity. Any user that used mirrord in a calendar month is counted towards your seat count. mirrord identifies users with a unique file it creates on the machine it runs on. If this does not represent distinct users in your organization, or if you use mirrord on cloud workers (e.g. for CI, or cloud development environments), please contact us

    - title: "Can I use the OSS for a team?"
      content: >
        The OSS version is best suited for solo developers. It doesn’t support shared access or coordination between users. It isn’t aware of other mirrord sessions in the same cluster. If you’re working in a team, mirrord for Teams includes the mirrord Operator, which manages concurrent access, permissions, and provides better safety and control in shared environments.

    - title: "What frameworks/languages does mirrord support?"
      content: >
        mirrord works by <a href="https://github.com/metalbear-co/mirrord/blob/main/libmirrord/src/hooks/libc.rs" target="_blank">hooking libc</a>, so it supports any languages and frameworks that use libc—like Rust, Node.js, Python, Java, Kotlin, Ruby, and more. We also support Go, even though it doesn’t use libc.

    - title: "How does mirrord enable concurrent staging access?"
      content: >
        With mirrord for Teams, multiple developers can safely use the same staging cluster without stepping on each other’s toes. The mirrord Operator manages all active sessions in the cluster, allowing users to mirror traffic, apply filters, and enforce usage policies—so everyone can test their code without getting in each other’s way. Features like HTTP filters, queue splitting, and outgoing traffic routing help isolate each session and avoid conflicts during development.

    - title: "Does mirrord install anything on the cluster?"
      content: >
        No, mirrord doesn’t install anything or leave persistent state in your cluster. It only creates a temporary pod to run its proxy, which is automatically removed when mirrord stops. It interacts with the cluster through the Kubernetes API, so the only requirement is having <code>kubectl</code> configured.

    - title: "Do you offer an enterprise support plan?"
      content: >
        Enterprise support is included in the mirrord for Teams Enterprise plan. As part of our enterprise support, you’ll get our usual support channels as well as a dedicated Microsoft Teams/Slack/Discord channel.
- template: pricing-cta
---
