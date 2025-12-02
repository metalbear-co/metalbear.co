---
title: "If You Missed KubeCon Atlanta Here's the Quick Recap"
description: "A recap of KubeCon + CloudNativeCon Atlanta 2025 covering AI trends, observability, and MetalBear's experience at the conference"
lead: "The MetalBear team was at KubeCon + CloudNativeCon Atlanta, and we're sharing the trends we heard on repeat, what we saw on the floor, and a few fun moments along the way."
slug: "kubecon-atlanta-takeaways"
tags:
  - KubeCon
  - Kubernetes
  - Community
  - Cloud-Native
categories:
  - kubernetes
  - events
  - cloud-native
date: 2025-12-02
summary: >
  A recap of KubeCon + CloudNativeCon Atlanta 2025, covering the major trends that dominated the conference: AI's pervasive presence (including the new Certified Kubernetes AI Conformance Program), observability's continued importance with a focus on custom resources and controllers, and OCI's quiet takeover as the default distribution model.
canonicalurl: "https://metalbear.com/blog/kubecon-atlanta-takeaways"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
---

The MetalBear team was at KubeCon + CloudNativeCon Atlanta a few weeks ago, slightly sleep-deprived, very caffeinated, and fully humbled by the fact that “Hotlanta” was… really not that hot in November. We had our booth, presented two talks, and spent a lot of time in the vendor hall and hallway track eavesdropping to hear what the community’s really vibing with. If you weren’t there, or you want the highlights reel without sitting through 12 keynotes, this recap covers the trends we heard on repeat, what we saw on the floor, and a few fun moments along the way :)

Also, we just hosted a webinar with CNCF Ambassadors, maintainers, and attendees from KubeCon to recap what 2025 was like for the cloud native community. You can check out the recording for that [here](https://www.youtube.com/watch?v=V4Zo-NMajEo)!

## Where the cloud native community is headed

### AI AI AI

It felt like you couldn’t go five minutes without hearing someone talk about AI. Whether it was sessions about using AI together with different cloud native projects, vendors pitching AI-powered features, or hallway chats with other attendees: AI was everywhere. Depending on who you asked, that was either exciting or exhausting. 

Personally, while I love seeing the cloud native community explore new AI use cases and launch projects like [HolmesGPT](https://holmesgpt.dev/), some of the vendor pitches around AI felt a bit forced, especially when AI was being added in ways that didn’t really improve the product or user workflow. In a few cases, it came across as “AI for the sake of AI,” like offering a chatbot to query straightforward platform data that’s already easily visible in existing dashboards and isn’t complex enough to warrant an extra conversational layer.

The biggest AI related announcement was the CNCF revealing its new [Certified Kubernetes AI Conformance Program](https://www.cncf.io/announcements/2025/11/11/cncf-launches-certified-kubernetes-ai-conformance-program-to-standardize-ai-workloads-on-kubernetes/). It’s a community led effort aimed at defining and validating standards for running AI workloads reliably on Kubernetes. It’ll be interesting to see what comes out of this program in future KubeCons, and whether the community can align on a meaningful standard.

### Observability continues to remain a hot topic

We mentioned this in our [KubeCon London recap](https://metalbear.com/blog/couldnt-make-it-to-kubecon-eu-2025-heres-what-you-missed-and-why-it-matters/) blog as well: observability is a hot topic for the cloud native community this year. And we continued to see that in Atlanta too. Although it got less of a spotlight in the keynotes compared to London, the vendor area was packed with companies showcasing their observability platforms. A lot of whom have now started to leverage AI in their products (surprise surprise). One talk we liked especially on this topic was from folks at Apple, “[Talk To Your Dashboards: Using MCP and LLMs To Simplify Observability](https://www.youtube.com/watch?v=iS4-WC59a9s)”. I’d recommend checking it out if you’re interested in this intersection of AI and observability.

My take personally is that a lot of the excitement around “AI for observability” is valid, but the real value will come from solving the basics, that is, better instrumentation of your codebase. If those fundamentals aren’t strong, AI just becomes a fancier layer on top of messy data. The companies that get the foundation right will benefit the most from all the AI enhancements showing up in this space.

Beyond AI, a theme that came up a lot was observability for custom resources and controllers. I think the reason for this was that now more and more teams are building internal platforms on top of Kubernetes and having to deal with observability for custom control planes and resources. There was a [talk](https://www.youtube.com/watch?v=E1f87Z6mij0) which introduced a new observability toolkit called Kamera which lets developers diagnose issues in custom control planes. Might be worth looking into if you’re building a custom control plane too!

### OCI, quietly taking over

OCI (Open Container Initiative) was everywhere. Sometimes it was front and center (like in [GE HealthCare’s talk](https://www.youtube.com/watch?v=u4zinRUhtw8) or the session on [extension management in Kubernetes](https://www.youtube.com/watch?v=dGGWoFBBkgk)) and other times it showed up in more subtle ways. If you looked closely you could see almost every Helm chart in demos using an OCI reference. 

It felt that OCI has moved from being “a new way to package things” to simply the default way to distribute anything: Helm charts, WASM modules, you name it. The community seems to be converging on a single distribution model that works consistently across registries and tooling. 

## What was MetalBear up to

It’s self-promotion time. I’m not exaggerating when I say we had a steady stream of people telling us how much they loved our booth and messaging.

{{< youtube mBwTAgiVX-c >}}

This is what our booth looked like…

{{<figure src="metalbear-booth.png" title="The MetalBear booth at KubeCon Atlanta" alt="The MetalBear booth at KubeCon Atlanta" height="100%" width="100%">}}

…and from our KubeCon experience, it felt like a lot of people resonated with the frustrations of a “slow dev loop.” We had so many people stop by, read that line, and immediately ask how we help fix it. It was a great conversation starter to introduce people to the magic of [mirrord](https://metalbear.com/mirrord/).

Another thing attendees really loved this year was our raffle with a secret password to enter. We sponsored the KubeCon hotel keycards, and they had a password that unlocked entry into our raffle for two pairs of Ray-Ban Meta glasses.

{{<figure src="keycard.png" title="MetalBear sponsored keycards with the raffle password" alt="MetalBear sponsored keycards with the raffle password" height="100%" width="100%">}}

We also had two talks from the team this year: Oshrat moderated a [panel on security](https://www.youtube.com/watch?v=jETmMin6-_M), and I presented a [lightning talk](https://www.youtube.com/watch?v=e6z3ijBfPUU) on using data structures for open source contributions. Both sessions brought in engaged crowds, and it was awesome meeting people afterward who stopped by the booth to continue the discussion.

Outside the conference, another highlight for us was hosting our first-ever KubeCon happy hour with our friends at Diagrid (the team behind Dapr). It was a huge success with lots of people showing up, and us having great conversations about developer experience, the cloud native ecosystem, and life :)

{{<figure src="happy-hour.jpg" title="Photo from the MetalBear happy hour" alt="Photo from the MetalBear happy hour" height="100%" width="100%">}}

## Stay in Touch

KubeCons are always fun because we get to talk to people about mirrord and see them get excited about the problem we’re solving: fixing the cloud development experience. The cloud native community is advancing at a rapid pace, and AI adoption seems to be growing just as quickly. But despite all that, cloud development is still broken. That’s why we feel mirrord resonated strongly with so many people at KubeCon.

If you’re tired of waiting for CI or fighting for access to a shared staging environment just to be able to test, you might want to check out [mirrord](https://metalbear.com/mirrord/).