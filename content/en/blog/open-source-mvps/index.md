---
title: "Validation at Scale with Open Source MVPs"
description: "On the advantages of using OSS MVPs in continuously validating your new product offerings."
lead: "On the advantages of using OSS MVPs in continuously validating your new product offerings."
tags:
  - open-source
  - devtools
  - startup
  - mirrord 
images: ["real-mvp.jpg"]
date: 2024-07-01T06:00:00+00:00
lastmod: 2024-07-01T06:00:00+00:00
draft: false
weight: 50
contributors: ["Eyal Bukchin"]
---
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Minimum Viable Products (MVPs) are generally accepted as the right way to kickstart a product startup. It’s easy - you whip up a quick prototype, get it in front of some users, and boom - you’ve got some feedback plus an initial user base. All that’s left to do is iterate for a few years until you reach Unicorn status. What’s often left unaddressed in this version of the story is - _how do you get users for your MVP, and in a large enough amount that their feedback isn’t skewed or overfitted_?

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;When we started MetalBear, we didn’t have a product in mind (MetalBear is actually a play-on-words on “bare metal”, a vestige of a previous idea that has nothing at all to do with what the company does now). So for a few months we would iterate through ideas - we would come up with something on Monday, try to set up meetings throughout the week with relevant people and get feedback, and decide go/no-go on Friday. The bottleneck here of course was finding these relevant people and actually fitting into their schedule.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;When we came up with the idea of [mirrord](https://mirrord.dev), and this was after several months of rejecting ideas and close to the point where we would decide to give up, we decided to try a different approach. We figured that it would take us about a week to build an MVP that would solve a very specific use case within the huge problem space that mirrord would later address, and that we could use to kickstart a conversation about the concept of what we had started to call Remocal development. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We’re both software engineers by trade, so it took us twice what we originally planned, but after two weeks we had a simple VS Code extension that would connect to your Kubernetes cluster and mirror incoming traffic from a Pod of your choice to whatever process  you’re currently running or debugging. We even had a logo designed, which we admit might have been a bit of an overcommitment.

{{<figure src="logo.png" class="center large-width">}}
{{<figure src="architecture.png" class="center large-width">}}


&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;So we had built something we wanted to try out as an MVP – but why did we decide to make it open-source? Our goal was to get as much feedback from as many people in as short a time as possible. Open-source would let us do that through:
* **Easier distribution**: we could post it anywhere - various subreddits, HackerNews, etc. all allow open source, plus there is the exposure provided by GitHub itself should a repo e.g. become trending
* **Good will**: people are less leery towards OSS projects and more willing to participate in conversations about them
* **Interest**: exposing what’s under the hood attracts a technical audience which, in our case, overlapped with our potential users
* **Speed**: we could release something that wasn’t fully functional, and since it’s open-source there’s more acceptance towards it

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We “launched” our MVP by posting it on our socials and whatever forum or subreddit we thought might be even slightly related. A lot of these posts quietly sank to the bottom of the feed, but some started interesting and valuable conversations, which helped us better differentiate mirrord from its alternatives, sharpen the messaging around what it actually does and why, and even drastically change the main use case (which, originally, was mirroring traffic directly from production - an idea aggressively shot down by multiple SREs and DevOps).

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;But there were two additional boons to this approach that we didn’t foresee. One is that it kickstarted the community around the product we would eventually base our company around. The other was that, among those who noticed our new repository were TQ Ventures, who then reached out and ultimately funded our pre-seed round.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Human interest aside, is this information useful to anyone who’s not currently working on a new startup? As a matter of fact, as we continued to build the mirrord OSS, we kept using the strategy of the OSS MVP to test out new features. Most recently, we used it for the pause feature: we thought of a way to support reading from queues by pausing the remote container, thus preventing it from competing with the local process for the same queue messages. This would have been mirrord’s most extreme manipulation of the user’s cluster, and we weren’t sure people would be okay with it. But with mirrord being open source, we could release it to a large audience, and do it quickly by releasing a, lets say, 80% done feature that we marked as unstable.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;It ended up being really popular, being regularly used by ~10% of OSS users. We were ultimately unable to completely stabilize it and had to deprecate it (which we discussed at length in a previous [blog post](/blog/on-pausing-containers-how-we-built-and-why-we-deprecated-our-container-pause-feature)), but our learnings from the pause feature led us to build the Copy/Scaledown feature as part of mirrord for Teams. Rather than pausing the remote pod, this feature shuts it down completely and creates an empty copy of it in the cluster in order to give the local process its network access. It was easier to stabilize because it didn’t rely on Kubernetes’ weird “freeze” API, but could only be technically achieved using the mirrord Operator.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The OSS MVP strategy is a great way to quickly and efficiently get feedback on a new product or feature from a large audience. The fact that it can be continuously used throughout the company’s lifetime makes it much more beneficial than might be expected, and is such a great asset that we believe it’s a significant point in favor of an OSS business model in general. 
