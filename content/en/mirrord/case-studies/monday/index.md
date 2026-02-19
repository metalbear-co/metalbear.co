---
title: "mirrord Case Study: monday.com"
description: "How monday.com eliminated dev environment costs and cut onboarding from days to under an hour with mirrord."
lead: "How monday.com eliminated dev environment costs and cut onboarding from days to under an hour with mirrord."
url: mirrord/case-study/monday
date: 2026-01-27T06:00:00+00:00
draft: false
weight: 5
feed:
  title: "How monday.com eliminated dev environment costs and onboards engineers in under an hour with mirrord"
  logo: "demo-monday.png"
  quote: >
      "We are not pushing them to use mirrord. Everyone is asking for it."
header:
  title: 'How monday.com went from <span class="text-primary">hundreds of dev environments to one</span> with mirrord'
  description: "Growing 30–60% year over year, monday.com needed a dev environment model that could keep up. mirrord made it possible."
  company: monday.com is a leading work operating system (Work OS) that enables organizations to build and manage any workflow, project, or process.
  site: monday.com
  logo: page-demo-monday.png
  employees: 2,500+
  using_since: 2024
story:
  content: With mirrord, we shifted development onto a real environment with real data, without paying the cost of provisioning a separate environment for every developer.
  image: netanel-abergel.png
  name: Netanel Abergel
  position: R&D Director | monday.com
metrics:
  - number: "10sec"
    label: "Environment setup"
    detail: "Down from 30 minutes"
  - number: "~1hr"
    label: "New dev onboarding"
    detail: "Down from 3–5 days"
  - number: "$0"
    label: "Dev environment cloud cost"
    detail: "Eliminated entirely"
  - number: "245+"
    label: "Engineers on one cluster"
    detail: "And still growing"
cta:
  description: See how mirrord can eliminate dev environment costs, accelerate onboarding, and let your entire engineering org work on a single shared environment.
---

## TL;DR

- Every developer needed their own full cloud environment. The cost and complexity weren't scaling with monday.com's rapid growth
- With mirrord, developers work against the shared staging cluster from step one of the dev cycle, testing on a real environment with real data instead of maintaining their own personal cloud environments
- The result: eliminated dev environment costs, faster shipping, and higher confidence when deploying to production

<div style="margin-top:2rem;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe src="https://www.youtube.com/embed/aHqU17QeMhs" title="monday.com on mirrord - Netanel Abergel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>

## The challenge: Per-developer environments that couldn't keep up with hypergrowth

monday.com's engineering org grows **30–60% year over year**. A few years ago they had around 30 services. Today they have **hundreds**, and every developer needed their own copy of the full environment to work.

The team started with Docker Compose, but as the system grew, not everything could fit on personal machines. They moved to dedicated per-developer cloud environments, each developer getting their own full copy of the system in the cloud.

![Before mirrord: every developer needed their own full cloud environment](monday-before.png)

With hundreds of developers today and a roadmap to **1,000+ developers** and **400+ microservices**, the math was unsustainable. Every new hire meant another full environment to provision and maintain. Setup took **30 minutes to several hours**, new hires spent **3–5 days** just learning how to wrangle their environments, and the cloud bill for dev environments alone was massive.

The team called the defining pain point **"domains leaking."** Because each developer had to deploy services owned by every other team, any issue in someone else's code would break your environment. Developers spent their time chasing other teams instead of writing code, and DevOps was stuck playing intermediary.

After six months of optimization effort, the minimum number of services each developer needed had **doubled**. It wasn't going to scale.

## The solution: One shared environment for everyone

The DevEx team researched the request isolation pattern and evaluated several tools including Telepresence. mirrord offered what they needed: **a way for all developers to share the existing staging environment** without interfering with each other.

![After mirrord: all developers share one environment](monday-after.png)

The rollout was deliberate, starting with **40 alpha users**, then expanding team by team, tracking wake-up time, feedback loop latency, and PR throughput. Domain leaking **disappeared immediately**. The DevOps team stopped firefighting cross-team dependency issues and could focus on onboarding new services to the shared model.

> "Before mirrord, a lot of developers were afraid of setting up their local development setup. I think mirrord removed that fear."
>
> — Shahar Golan, DevOps Engineer, Distribution Infra

<div style="margin-top:2rem;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe src="https://www.youtube.com/embed/QAPTnJTjTAM" title="monday.com on mirrord - Shahar Golan" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>

For developers, the change was immediate. No more spending 30 minutes to four hours setting up a local environment. No more discovering that your environment drifted from production only after deploying. No more getting tagged the morning after a release because a bug slipped through that your local setup couldn't catch.

With mirrord, developers work against **a real staging environment with real data**: already configured, already running, already matching production. Features that previously took days or a week to ship now go out in **a day or two**. And because the environment is always ready, even short windows between meetings became productive coding time.

> "When I'm working with mirrord, I don't have to compromise between speed and confidence. I get both."
>
> — Giora Guttsait, Software Engineer, CRM Group

<div style="margin-top:2rem;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe src="https://www.youtube.com/embed/01Yek75HTTA" title="monday.com on mirrord - Giora Guttsait" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>

## The results: Lower cloud costs, faster shipping, and fewer bugs reaching production

What started as a careful rollout became organic adoption. Today, **245+ engineers** work concurrently on the same shared cluster.

> "We are not pushing them to use mirrord. Everyone is asking for it."
>
> — Netanel Abergel, R&D Director

### Dev environment cloud costs eliminated

monday.com's cloud spend for dev environments dropped to **zero**. Every developer used to need their own full copy of the staging environment provisioned in the cloud. As monday.com scales toward 1,000+ developers and 400+ microservices, that bill was only going to grow. With mirrord, everyone shares the staging cluster that already existed.

### Dev velocity increased

Features that previously took days or a week to ship now go out in a day or two. CI end-to-end test runtime dropped by **~50%**, and senior engineers reclaimed short windows between meetings that used to be dead time because environment setup alone would eat them.

### Higher confidence, fewer production bugs

Developers now test against a real staging environment with real data before merging. No more hoping that a local setup matches production. No more getting tagged the morning after a release.

### DevOps freed from firefighting

Cross-team dependency issues, the "domain leaking" problem, vanished entirely. The DevOps and DevEx teams no longer spend their time acting as intermediaries between developers and service owners. When issues arise, the person with domain expertise is already in the loop.
