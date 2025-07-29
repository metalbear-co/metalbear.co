---
title: "mirrord Case Study: Daylight Security"
description: "Daylight baked mirrord into their dev loop from the beginning, giving their engineers a way to test new code in realistic, production-like conditions immediately after writing it."
lead: "Daylight baked mirrord into their dev loop from the beginning, giving their engineers a way to test new code in realistic, production-like conditions immediately after writing it."
url:  mirrord/case-study/daylight
date: 2025-04-21T06:00:00+00:00
draft: false
weight: 30
feed:
  title: "Daylight Chose mirrord over Personal Cloud Environments"
  logo: "demo-daylight.jpg"
  quote: >
      “We’re testing against the real environment before merging. That level of fidelity gives us high confidence in every release.”
header:
  title: 'Why Daylight Chose mirrord over Personal Cloud Environments'
  description: "Daylight knew they couldn’t afford to waste time waiting on container builds just to test their code in staging. So they baked mirrord into their dev loop from the beginning, giving their engineers a way to test new code in realistic, production-like conditions immediately after writing it."
  company: Daylight Security provides Managed Agentic Security Services, offering tailored MDR solutions that are delivered by Agentic AI and backed by elite human experts.
  site: daylight.ai
  logo: page-demo-daylight.png
  employees: 15+
  using_since: March 2025
story:
  content: Without mirrord, testing a single change would take 5 to 8 minutes. Multiply that by 10+ times a day - that’s at least an hour lost, per developer. With mirrord, it takes 5 seconds.
  image: alon-gluzman.png
  name: Alon Gluzman
  position: Senior Platform Engineer | Daylight Security
---

## TL;DR

- Daylight use mirrord to **test new code in production-like environment** in 5 seconds instead of 5-8 minutes.
- They use the mirrord Cursor extension to test **AI-generated code** in quick iterations.
- Devs can focus on one task at a time, **without context switching or waiting on builds**.
- More frequent and higher fidelity testing means **fewer bugs in production** and more confident releases.

## The challenge: Finding an efficient way to test code in the cloud

Daylight’s staging environment (“pre-prod”) mirrors production: dozens of microservices, real AWS components like Kinesis, and integrations with things like Datadog and LaunchDarkly. Every code change needed to be tested against it. But doing that meant building a container, pushing it, deploying it - over and over for every change, no matter how small.
Each test cycle for a microservice would typically take 5–8 minutes with a traditional build-push-deploy flow. For a team shipping constantly, that would add up to over an hour per developer per day - if they hadn’t used mirrord from the start.

> "You’d start working on something else during a build, get pulled in, then spend another 10 minutes just trying to recall where you left off."

Daylight needed a way to quickly test code against pre-prod without breaking focus or killing momentum.

### Why not personal environments?

Before settling on mirrord and a shared staging setup, Daylight considered giving each developer their own personal dev environment in the cloud. But based on Alon’s past experience, he knew that while it could technically work, the infrastructure cost, flakiness, and ongoing operational burden would be substantial.

> "I’ve tried the personal environment route before. It looks good on paper - but in reality, it's fragile, complex to manage, and developers end up abandoning it."

Managing personal clusters or namespaces for every engineer would be a nightmare. Someone has to own the maintenance, updates, cleanup, and cost controls. Worse, these ephemeral environments rarely behave like production - missing integrations, misconfigured services, inconsistent performance and edge-case bugs that never show up in real production.
And when environments feel brittle or different from the real thing? Developers stop using them. They fall back to inefficient workflows like waiting on CI pipelines and staging deployments to get feedback.
What Daylight needed was a solution that just worked. One that felt invisible.

> “If the tool isn’t dead simple and totally reliable, developers will avoid it. With mirrord, they don’t even think about it. It just works.”

That’s why they chose a shared pre-prod environment - with mirrord letting every developer plug into it safely and test their code seamlessly, from their own machine.


## The solution: Instant staging testing, no rebuilds required

Daylight adopted mirrord from the get-go. Developers run their services locally, but test them directly in pre-prod with real traffic, real infra, and zero container builds.
No Docker. No CI. Just local code, in a production-like environment, in seconds.
And because mirrord connects to their actual staging environment, developers get the confidence of full integration testing without ever leaving their editor.

### Cursor for writing, mirrord for testing

Daylight makes it a point to use state-of-the-art tooling across the board. Every developer uses Cursor as their daily driver for writing code, reviewing changes, and pairing with AI. The productivity gains from Cursor are obvious.
But when it came to testing that AI-assisted code in their production-like environment? Cursor alone couldn’t help.
That’s where mirrord's Cursor extension came in. It closed the loop: code written in a modern, AI-powered IDE could now be tested instantly in a real, production-like environment.

> “Our team uses Cursor to write the code, and mirrord to test it in pre-prod - in seconds. Together, it’s a complete dev loop.”


## The results: Faster development, higher quality, and no context switching


### 1 hour saved per developer, every day

With mirrord, **each developer** gets back **over an hour per day**, or about 12% of their time. That’s time they can spend actually building, debugging, or shipping - instead of waiting.

### Production-like testing from the first commit

Every local test hits pre-prod, complete with third-party integrations and cloud components. That means fewer bugs downstream and more confident releases.

> “We’re testing against the real environment before merging. That level of fidelity gives us high confidence in every release.”

### No context-switch fatigue

Waiting 8 minutes per test doesn’t just waste time - it breaks focus. Developers start other tasks, get pulled into Slack, or drift away from the problem they were solving. mirrord eliminates that wait, keeping engineers in flow and helping them finish what they start without interruption.
