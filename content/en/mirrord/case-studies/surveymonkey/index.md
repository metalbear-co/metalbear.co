---
title: "mirrord Case Study: SurveyMonkey"
description: "With mirrord, SurveyMonkey cut development cycles in half, shipped features faster, improved code quality, and reduced onboarding time from days to hours."
lead: "With mirrord, SurveyMonkey cut development cycles in half, shipped features faster, improved code quality, and reduced onboarding time from days to hours."
url:  mirrord/case-study/surveymonkey
date: 2025-08-08T06:00:00+00:00
draft: false
weight: 10
feed:
  title: "How SurveyMonkey Doubled Developer Velocity with mirrord"
  logo: "demo-surveymonkey.png"
  quote: >
      “We've reduced the time from when an engineer builds something to when it's deployed - because when they test locally, it is a true approximation of our production environment.”
header:
  title: 'How SurveyMonkey Doubled Developer Velocity with mirrord'
  description: "With mirrord, SurveyMonkey cut development cycles in half, shipped features faster, improved code quality, and reduced onboarding time from days to hours."
  company: SurveyMonkey is a leading global survey platform, trusted by millions of organizations and individuals to help them uncover insights about their customers, employees, and prospects.
  site: https://surveymonkey.com/
  logo: page-demo-surveymonkey.png
  employees: 1500+
  using_since: October 2024
story:
  content: We've reduced the time from when an engineer builds something to when it's deployed - because when they test locally, it is a true approximation of our production environment.
  image: craik-pyke.png
  name: Craig Pyke
  position: VP of Infrastructure and Security | SurveyMonkey
---

## TL;DR

- **Time-to-ship** by SurveyMonkey engineers was **reduced by 50%**, enabling faster delivery of new features.
- Their number of **defects reaching production dropped significantly**.
- **Reduced inter-team dependencies** led to more accurate task estimations.
- **Developer onboarding was cut** from several days down to just a few hours.


## The challenge: Restoring fast local workflows after going remote


SurveyMonkey’s developers relied on a remocal workflow - running containers locally while routing traffic to and from their staging Kubernetes cluster through physical VPNs. It gave them the best of both worlds: local tools and fast iteration with access to real cloud resources.

But when COVID forced a shift to hybrid work, that setup fell apart. The physical VPNs weren’t designed for a remote workforce. Engineers could no longer connect reliably to cloud services for local development and testing.

AWS-native VPNs seemed like an alternative, but they weren’t built for persistent development traffic. IPs changed constantly, connections dropped, and routing traffic back to local containers was fragile at best.

> “It works, but it’s very ephemeral. IP addresses change, connections don’t persist.”

Other options surfaced:
- **Ngrok** allowed routing traffic but introduced potential attack vectors.
- **Moving to fully cloud-based dev environments** meant abandoning the local tools developers loved.
- **Scrapping local development entirely** would force teams to push every change to the cloud just to test.


The infrastructure team even considered building their own solution. But the complexity - and the operational overhead of maintaining it - quickly became clear.

> “We’re engineers, so we thought we could solve it. But it’s a very complex problem, and not our core business.”

With plans to deprecate their old VPN by the end of 2024, they needed a **developer-friendly, secure solution** to bring back fast, reliable local workflows - without adding to the team’s operational burden.

This wasn’t just about developer preference. *Hours of lost productivity* each week were adding up to **missed deadlines and significant costs**.


## The solution: Full cloud context right from their laptops

When SurveyMonkey’s infrastructure team began exploring options, they initially tried Telepresence. Early in their proof-of-concept (POC), frequent connection disruptions became a deal-breaker, severely impacting developer productivity.

They quickly realized they needed a solution more **“native” to Kubernetes** - which led them to discover mirrord.
“mirrord was built specifically for Kubernetes, whereas Telepresence felt like it was trying to fit in.”

**Within 48 hours** of learning about mirrord, the team had it **set up and running in their cluster**. Its Kubernetes-native design required no changes to their existing AWS infrastructure, making integration seamless.

> “It took us less than a day to get it deployed, and it very much fit our operational model of how we treat Kubernetes, how we support it, and how we upgrade it. Everything worked just perfectly right from the start.”

mirrord’s Kubernetes operator enabled secure connectivity to remote clusters while preserving the **familiar local development experience** engineers preferred. Developers could now **iterate, debug, and test against production-like environments**, significantly **shortening feedback loops and boosting productivity**.

They also looked at personal ephemeral environments like Garden.io but quickly saw the limitations. These setups wouldn’t support shared data stores or caching infrastructure. On top of that, the **cost of spinning up and managing individual environments for every developer would have been far too high**.

> “Spinning up and then later tearing down a temporary environment to do local development sounds great on paper... But we have shared data stores, shared caching infrastructure - all of these things. And so you can't have these transient environments. And even if we could, it’d be thousands of dollars a day for engineers to spin up environments for testing and tear them down again.”


## The results: Faster shipping, cleaner code, and happier engineers


### 50% faster time to ship

> “We’ve increased our feature velocity overall. Teams can now focus on the features and capabilities of the product rather than the process.”

With mirrord, new code is tested against a production-like environment **as soon as it’s written**. Dev don’t waste time on mocks or simulations, bugs get caught earlier, and the time to release is cut in half.

### Higher code quality, fewer defects

> “There’s a lower defect rate. We are producing better code faster right now. And I really do think having mirrord and having the ability to bridge into the cluster network like that has facilitated it.”


Developers now constantly work in an **environment that accurately reflects production**, leading to more frequent and higher quality tests, which means less bugs make it to production.


### Fewer missed sprint goals

> “With mirrord we’ve increased what we call our ‘say-do ratio’ - what engineers say they’ll do and what they actually get done.”

Before adopting mirrord, local development was so complex and entangled with external dependencies that accurate estimation was difficult, often leading to a gap between planning and execution. With mirrord streamlining the development process, tasks became more predictable and self-contained, enabling developers to make **more accurate commitments** and consistently deliver on them.

### Reduced onboarding time from days to hours
> “Even the simplest local development setup for us previously was a multi-day effort, and now it's a couple of hours from a brand-new MacBook to getting things running.”

Because of the complexities of their local development environment setup process, whenever they onboarded a new developer to their team or a different project, it would take days for them to set up their environment. Adopting mirrord allowed them to ditch these cumbersome setups and **reduce onboarding time to just a couple of hours**, saving valuable developer time!


### A better developer experience

Fewer roadblocks and a faster feedback loop have made teams **more productive and happier**. Internal support tickets to the infrastructure team dropped, and developer satisfaction went way up.

> “The best feedback is that we don’t hear complaints.”

Even teams not yet on Kubernetes have asked when they’ll get mirrord support. It’s become the benchmark for great dev experience inside SurveyMonkey.
