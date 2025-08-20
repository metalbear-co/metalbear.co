---
title: "MetalBear Reads Mean Comments"
description: "We address some recent criticism with gravity and poise."
lead: "Sometimes our blog posts about mirrord hit a nerve. Here's us responding to the mean comments on one such recent post."
slug: "mean-comments"
tags:
  - mirrord
  - developer-tools
  - testing
  - staging
  - productivity
categories:
  - developer-tools
date: 2025-08-19
summary: >
  We address the critical comments we've received about mirrord, explaining how it helps developers test using staging environments more efficiently without replacing the need for proper staging deployments.
canonicalurl: "https://metalbear.co/blog/mean-comments"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Eyal Bukchin"
---

Here at MetalBear we like to write, and one thing we like to write about in particular is mirrord. We think it’s a great tool that can bring lots of enterprise value, plus there’s an open-source version that’s totally free. Our blog posts are generally well received, but sometimes one of them trips some sort of karmic landmine and we wake up in the European AM to find the comment section awash with bitter criticism.

{{<figure src="thumbnail.png" alt="MetalBear mascot getting sad reading mean comments." height="100%" width="100%">}}

This usually falls into one or more of these categories:

- What mirrord does is unnecessary
- What mirrord does is necessary, but I can easily build it myself
- “[Remocal](https://thenewstack.io/remocal-development-the-future-of-efficient-kubernetes-workflows/)” is a stupid word

In this blog post we’re going to address some of the comments [we’ve received](https://app.daily.dev/posts/stop-deploying-just-to-test--ko7cwsqb7) lately. If you don't know what mirrord is, it lets you run a local process with access to all of its cloud dependencies, so you can test "in the cloud" without deploying. Here we go: 

**Comment**: “You never can tell how a piece of software will perform unless you actually deploy it.”

**Counterpoint:** Kind of. You *can* tell a lot about how software will perform by running it locally, even without mirrord. But with mirrord, you can tell a lot more, because now it’s running in *cloud-like conditions*.

The only meaningful differences between this and actually deploying your code to staging are:

- The network latency between your machine and the cluster
- The hardware your code is running on

So if you deploy your code to staging,  that’s even a better test of what the code will behave like in production than using mirrord.

BUT: running your code locally is quick. Running your code locally **with mirrord** is quick. Deploying to staging is slow and can mess up other developers in your organization who are also using the same environment.

So we’re not saying you should never deploy your code to staging - we’re saying test it with mirrord first, so when you finally do deploy to staging, you only have to do it once.

<br/>

**Comment:** “Testing in staging is an integral part of software development that you can’t simply replace with some service.”

**Counterpoint:**  100% agree, which is why the [stated purpose](https://metalbear.co/mirrord/docs/overview/introduction#why) of mirrord is to let you test in staging more, not less. Instead of going through 15 SDLC steps every time you want to test a little piece of code in staging, mirrord lets you do it as the first step, from your IDE, and it takes five seconds.

{{<br/>}}

**Comment**: “This just seems like an ad for the mirrord service.”

**Counterpoint**: It is! We think mirrord is great. 

**Comment**: “Why can’t I just spin up a Docker container with the staging ENV and use ngrok to tunnel the traffic? Your service feels the same.”

**Counterpoint**: This is indeed kind of similar to the free OSS version of mirrord. But it’s free, so why would you go through all that trouble instead of just using mirrord? Plus you get to run your code natively instead of messing around with Dockerization.

Of course there's also mirrord for Teams, which lets your entire organization develop continuously and concurrently against the same staging environment without stepping on each other's toes (read more [here](https://metalbear.co/mirrord/docs/overview/teams)). 

**Comment:** “Never use the word remocal again lmao.”

**Counterpoint:** ☹️

## Seriously Though, It's Good

We originally wanted people to use mirrord to debug using live traffic for production. Had we not been berated there and then by a helpful group of surly DevOps engineers, we might have wasted valuable time pursuing that fruitless path.

Still, to this day mirrord remains weirdly contentious. We think it's because people's knee-jerk reaction to the real remocal workflow (= shift staging all the way left) is that it just wouldn't work. But, shockingly, it does.

Still think we're wrong? Inconvenient, because we haven't added a comments section to our blog. But this is probably going to be posted on our socials, so let us know what you think over there, and if you're mean enough maybe we'll feature you on the next edition of... **MetalBear Reads Mean Comments**.