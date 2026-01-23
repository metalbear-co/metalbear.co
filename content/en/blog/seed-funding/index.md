---
title: "METALBEAR: CAPITALIZED"
description: "MetalBear raises $12.5m to make cloud software development 100x faster."
lead: "We raised $12.5m to fix everything that's broken in cloud software development."
slug: "seed-funding"
tags:
  - metalbear
date: 2025-09-16
summary: >
  MetalBear has raised $12.5m in funding led by TLV Partners to continue building mirrord, a tool that solves the biggest pain points in cloud development. mirrord lets developers test their code locally while connected to real cloud environments, reducing testing time from hours to seconds. The company is fully remote with 25 people across 15 countries, and their customers like SurveyMonkey are already seeing 50% faster time-to-ship and 20% developer time savings.
canonicalurl: "https://metalbear.com/blog/seed-funding"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Aviram Hassan"
  - "Eyal Bukchin"
---

**TL;DR:** We’ve raised $12.5m to continue building mirrord and fix everything that’s broken in the world… of cloud software development.

The round was led by TLV Partners with participation from TQ Ventures, Modern Technical Fund, Netz Capital, David Cramer (Sentry), Ben Sigelman (OpenTelemetry), Thomas Dullien (Optimyze), Guy Zipori and Or Hiltch (Skyline.ai), Nader Al-Naji (DeSo), Eric Hauser (Cadence), Tamar Bar-Ilan and Yotam Segev (Cyera), Yoni Broyde (Alooma), Eilon Lotem and Tal Zackon (Tres).

If you’re just looking to check out mirrord, go [here](https://metalbear.com/mirrord/).

{{<figure src="mirrord-loop.png" title="How mirrord helps shorten the dev loop" alt="image showing mirrord shortening the dev loop" height="100%" width="100%">}}

## The Product

Building enterprise cloud software is slow and frustrating. This is weird when you think about it, because software engineers are among the only professions who build their own tools, and if something works poorly, usually they just… fix it. And yet, in our combined 20-ish years of experience as developers, we have always encountered the same problems:

- Running your microservice locally requires a complex configuration of locally running dependencies that breaks all the time  
- Automated testing in CI is flaky, expensive, and you’re always trying to increase coverage while keeping the runtime low  
- Staging environments are fragile, it takes ages to get your new code deployed there, they usually uncover issues (that’s what they’re there for), and then you have to go through the whole cycle again

This creates a workflow that’s not only time-consuming but also filled with short periods of downtime that kill focus, and is dependent on so many external factors (looking at **you** DevOps team) that it makes task estimation impossible. 

We knew what we wanted the new workflow to look like: we open our code in the IDE, we click “debug”, it runs without us having to configure anything, and its context, state, and dependencies are those of the real cloud environment. That way when we finally do deploy it to staging for acceptance testing, it passes on the first try. Simple.

We set about building mirrord, and we soon found out why nobody’s succeeded at doing this before. When you tell an engineer about your development tool, 100% of the time they’ll tell you that it won’t work on their environment because it’s “weird”. And it’s true\! There are just so many frameworks, databases, service meshes, network components out there, with more being added every day, that almost by definition every company’s environment is “weird”. Now imagine trying to build a cookie-cutter solution that’ll dramatically improve the workflow on all of these environments. Imagine having to do it better than the engineers at those companies who built something specifically tailored to their weird environment. Imagine asking those engineers to pay you for it.

Well, we did it. We dug deep down into the layers of software until we reached a solid foundation that nobody touches anymore: the C standard library. That’s where we built mirrord. It was grueling low-level work (we’re [not kidding](https://github.com/metalbear-co/mirrord/blob/main/mirrord/layer/src/go/linux_x64.rs)). We had to specifically find developers with the sort of psychological hangups that’ll make them want to do it day in and day out (more on these devs in a second). But it paid off, and today thousands of engineers [all](https://x.com/potix2/status/1952304591707799881) [over](https://www.linkedin.com/posts/amirhossein-hajimohammadi_kubernetes-mirrord-devex-activity-7370134574401474560-TrTx?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAUPwswBg2teZODvBm8-V_Pn77jVHvd0Bdg) [the](https://x.com/kubernetes_days/status/1861992169386770856) [globe](https://www.youtube.com/watch?v=Y5SY-29odnM&pp=ygUHbWlycm9yZA%3D%3D) can just open their code in the IDE, click “debug”, and see if it’s going to work in production. In seconds, instead of hours.

{{<figure src="cloud-workflow.png" title="Cloud dev workflow with and without mirrord" alt="cloud dev workflow with and without mirrord" height="100%" width="100%">}}

P.S. If you’re looking for the AI angle, it’s [here](https://metalbear.com/blog/self-correcting-ai/).

## The Customers

The mirrord OSS is being used monthly at thousands of companies worldwide, including Apple, NVIDIA, AWS, and other such mammoths, to effortlessly test their code in cloud environments. But [mirrord for Teams](https://metalbear.com/mirrord/docs/overview/teams) is where companies start to see real business value. SurveyMonkey [reduced time-to-ship by 50%](https://metalbear.com/mirrord/case-study/surveymonkey/). zooplus are seeing [20% of their developers’ time saved](https://metalbear.com/mirrord/case-study/zooplus/). Developers at Imprint can **test and debug their code 10x faster** (we didn’t publish that one yet). And these are just the ones we’re allowed to mention.  
But the best part is, because we support our customers directly on Slack, we’re occasionally hit with quotes like this (this one’s from last week):  
“Just wanted to say this project is an amazing productivity boost\! It took me just a few minutes to test and troubleshoot the migration of my MS to elasticache against a real, staging instance on AWS \- all from my local machine 🤯 Before it would take HOURS ♥️”

## The Team

{{<figure src="team-photo.png" title="The MetalBear Team :)" alt="image showing MetalBear employees" height="100%" width="100%">}}

MetalBear tries to solve a very old problem that many have tried to solve in the past; it tries to do it using unconventional technology; and it tries to sell it to an audience that would often rather spend years building and maintaining their own thing than paying for a third-party product. And yet the decision that raises the most eyebrows from our peers, investors, and advisors was to build MetalBear as a fully remote and global company.

It was actually brought about by circumstance. Eyal was temporarily living in London while Aviram was in Tel Aviv. Aviram knew he’d prefer to keep the company remote, since the flexibility and focus it affords allowed him to do his best work, but Eyal was certain that once he went back to Israel, we’d find an office.

But then we started hiring. We had both had to hire software engineers in our previous roles, and we knew how hard it was to find someone who was a good fit, and then also convince them to join your company specifically and not one of the hundreds of others in the country. Add that to the specific technical background we were looking for \- Rust, OS-level programming, Kubernetes \- we figured we’re in for a hard time.

It took us about two weeks to hire each of our first five engineers, most of them through r/rust. By opening the role to a global candidate pool, we were able to reach hundreds of incredibly talented, skilled, and hungry engineers. That same method later helped us hire for our sales and marketing teams as well, and today MetalBear’s team includes 25 people from 15 countries. As you can imagine, the culture skews nerdy, as evidenced by our meme wall.

{{<figure src="memes.png" title="The MetalBear meme wall" alt="bunch of metalbear related memes" height="100%" width="100%">}}

## The Future

…is mirrord. For now. Teams already using mirrord are seeing massive value, and so our mission for the near future is to bring mirrord to as many teams as possible by:

1. Supporting even more use cases: unblocking [Agentic AI](https://metalbear.com/blog/self-correcting-ai/), CI acceleration, error injection, preview environments, the list goes on.  
2. Making it even easier to adopt. Turns out not everyone likes manually editing JSONs… one of those things you learn on the journey.

Want to try it out? Go [here](https://metalbear.com/mirrord/).

## Stay in touch

Want to follow along as we keep building? Here’s how you can stay connected:

- Star us on [GitHub](https://github.com/metalbear-co/mirrord) and join our community discussions on [Slack](https://metalbear.com/slack)  
- Follow us on [Twitter](https://twitter.com/metalbear) and [LinkedIn](https://www.linkedin.com/company/metalbear/)  
- Subscribe to our [newsletter](https://metalbear.com/newsletter/) for updates, technical deep-dives, and memes

We love hearing from developers—feedback, feature requests, weird edge cases—we want it all.

## And we’re hiring!

If mirrord sounds like something you’d like to work on, or the meme wall stirred something deep within yourself, then join our team\! Check out our [careers page](https://metalbear.com/careers) or reach out directly.