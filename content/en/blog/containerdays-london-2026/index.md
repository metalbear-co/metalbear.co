---
title: "ContainerDays London 2026: Our Thoughts"
description: "MetalBear had a booth and a talk at the first London edition of ContainerDays. Here is what stood out."
lead: "MetalBear had a booth and a talk at the first London edition of ContainerDays. Here is what stood out."
tags:
  - Kubernetes
  - DevOps
  - mirrord
  - containers
  - events
  - cloud-native
date: 2026-02-19T00:00:00+00:00
lastmod: 2026-02-19T00:00:00+00:00
draft: false
weight: 50
images:
  - thumbnail-cds.png
contributors:
  - "Jake Page"
---

We just got back from the first London edition of [ContainerDays](https://www.containerdays.io/containerdays-london-2026/), and we've had a few days to let it settle. MetalBear had a booth at the event, and I gave a talk, so we experienced the conference from multiple angles: as speakers, as exhibitors, and as attendees wandering between sessions. Here is what stood out.

{{<figure src="cds-1.jpeg" alt="ContainerDays London venue banners at the Truman Brewery" class="center large-width" width="100%">}}

## The Crowd

ContainerDays draws the kind of crowd where the hallway conversations were just as valuable as the keynotes. We met practitioners, DevOps engineers, platform teams, developers, and infrastructure leads who are actually dealing with the operational realities of running production Kubernetes workloads. A lot of the conversations went deep quickly. Several people stopped by the booth after noticing our *'Your slow dev loop is holding you back'* headline.

{{<figure src="cds-2.jpeg" alt="The MetalBear mirrord booth at ContainerDays London" class="center large-width" width="100%">}}

People weren't only asking *"what does this do?"* They were already describing specific pain points and asking whether mirrord could help with their particular cluster setup. That doesn't happen at every conference, and it was great to see. The problems people brought to the conversations were concrete and recognizable. One engineer described applications running in GCP that rely on service accounts granting access to dependencies only available in staging. Because no local equivalent exists, any realistic test has to go through the full deploy cycle, no matter how capable his AI assistant is.

Another engineer was working on an AI-powered medical imaging platform, running large proprietary models inside Kubernetes that simply can't be replicated locally. For their team, any meaningful test against those models requires cluster access, which brings its own friction: RBAC policies to navigate, shared environments where a single team member's integration testing can affect the cluster state for the rest of the team, and approval cycles that slow things down before a single line of code gets validated. These aren't niche problems, they came up again and again across very different organizations and roles.

## The Talks

Kelsey Hightower's keynote, titled *"Why Are We Still Talking About Containers?"*, packed out the main theater, with attendees spilling into the hallway. The keynote wasn't really about containers. Instead, Kelsey used them as a lens to look at what the industry tends to focus on versus what actually matters: he emphasized the enduring need to understand fundamentals while still being curious about where things are heading. It was the kind of talk that generates real conversations in the corridors afterward, which is the best thing a keynote can do.

{{<figure src="cds-3.jpeg" alt="Packed audience at the Kelsey Hightower keynote at ContainerDays London" class="center large-width" width="100%">}}

A few other talks stood out: 

- Nigel Douglas made the case in *"Fantastic Exploits and Where to Find Them"* that prioritizing CVEs by CVSS score alone leads to burnout while the genuinely dangerous vulnerabilities slip through. 
- Fabian Schulz and Lea Brühwiler's *"The Accidental Platform Team"* was a personal highlight for me, an account of how Swisscom's Kubernetes Operators quietly grew from a network automation tool into the backbone of their entire Kubernetes-as-a-Service offering. 
- Matt Baker and Kunal Kushwaha's *"The Identity-Defined Cloud"* argued that as workloads get more dynamic, identity has replaced the network as the true security perimeter.

When it came to my own talk, I got a bit creative and structured it as an RPG-style narrative, following a humble developer navigating increasingly AI-augmented workflows and hitting the feedback loop bottlenecks that code generation tools haven't solved.

{{<figure src="cds-4.jpeg" alt="Jake Page delivering his RPG-style talk at ContainerDays London" class="center large-width" width="100%">}}

No slides, just a story that resonated because it mapped directly to concerns the audience was already dealing with: OSS maintainership burnout and security, as well as stagnating developer loops, all circling back to the same underlying problem of how and when we validate code. Whether that's before a maintainer has to review a PR or before a new release hits staging. The presentation itself is an open-source interactive web app, and if you want to go through the journey yourself, the repo is [available here](https://github.com/jakepage91/validation-valley).

## AI Through a DevOps Lens

ContainerDays shared the Truman Brewery space with a co-located event, [MCPConference](https://www.containerdays.io/containerdays-london-2026/mcpconference-agenda/), each with their own booth area and speaker track running concurrently. The contrast in atmosphere was noticeable, MCPConference leaned optimistic and forward-looking, very much riding the AI wave, while Container Days felt more measured. That isn't a knock on either. It reflected where the respective audiences are.

One thing that stood out was the crowd MCPConference brought in. Alongside the usual ContainerDays mix of DevOps and platform engineers, you had ML engineers and AI specialists who don't typically show up at container-focused events. That crossover made for some genuinely interesting hallway conversations, people approaching the same problems from very different angles.

{{<figure src="cds-5.jpeg" alt="Attendees visiting the MetalBear booth at ContainerDays London" class="center large-width" width="100%">}}

But in the case of the DevOps and platform engineers that we spoke to, we saw that they are dealing with real operational constraints that AI tooling hasn't resolved yet, and in some cases, can't. The excitement about AI was genuinely there, but it was being weighed carefully against day-to-day reality. What came through clearly across both events is that the community isn't skeptical about AI so much as it is more precise about where it actually helps and where the hard problems persist.

## Want to go? ContainerDays Hamburg is next

Beyond the great conversations with old friends and new, there was a well attended after-party. For the first London Edition, the energy felt focused, and the right people were in the room.

If you missed the London edition, the much more widely known Hamburg edition is coming up in September and is well worth putting on your radar. And if you're still figuring out which conferences to prioritize this year, we put together a [guide to the top 5 cloud native conferences in 2026](/blog/top-cloud-conferences/) that might help.

Hope to see you at one of these [upcoming events](https://www.linkedin.com/posts/metalbearco_well-be-all-around-the-globe-in-2026-activity-7426959938398380032-OVXB) we'll be attending.
