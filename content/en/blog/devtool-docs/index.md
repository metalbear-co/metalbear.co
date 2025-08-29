---
title: "How We Chose a Documentation Platform for Our DevTool"
description: "Learn how MetalBear evaluated and chose GitBook over Hugo and Mintlify for mirrord's documentation, including the challenges with search, AI chatbot integration, and PostHog analytics support."
lead: "Our experience evaluating documentation platforms for mirrord and what we learned along the way."
slug: "devtool-docs"
tags:
  - Docs
  - DevTool
  - Lessons Learned
categories:
  - docs
  - learnings
date: 2025-08-13
summary: >
  Our experience evaluating documentation platforms for mirrord, from Hugo's limitations to Mintlify's integration issues, and why we ultimately chose GitBook for its AI-powered search, chatbot, and PostHog support.
canonicalurl: "https://metalbear.co/blog/devtool-docs"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
---

If you’re building a devtool, providing a good documentation experience to your users is really important. Developers don’t like booking demos, they prefer trying things out on their own. And a good docs experience goes a long way in making that possible.

That’s especially true for us at MetalBear, where we’re building [mirrord](https://metalbear.co/mirrord/). While mirrord is easy to get started with, it's a versatile and highly configurable tool. mirrord lets you run your code locally while making it behave like it’s running inside your Kubernetes cluster. It mirrors traffic and configuration from the cluster, so you can test locally in cloud conditions without going through CI pipelines or cloud environments for every single change. We’ve learned that a good documentation experience makes a huge difference in helping users understand how mirrord works and how to use it effectively for their own specific use case.

In this post, I’ll walk you through:

- What challenges we had with our existing docs,
- What we needed from a better platform,
- The two platforms we evaluated, and
- What we ended up choosing.

## Our starting point: Hugo

When we started developing mirrord in 2022, we went with Hugo for our documentation. It was fast, easy to set up, and worked well with Markdown so we went ahead with it. 

As the project grew, Hugo gave us the flexibility of using templating to add things to the docs as and when we needed. But as mirrord gained popularity, 4.5K+ stars and thousands of daily users, we started hearing more [feedback](https://www.youtube.com/watch?v=NLa0K5mybzo) from the community about the documentation experience. And honestly… they weren’t wrong. Some of those pains had been bugging us too.

Here are the main things we realized we wanted to improve:

- **Design:** The mirrord dev team is comprised of some very talented low-level engineers with a severe aversion to frontend development, so our docs weren’t exactly the best looking. Hugo gives you themes to use, but even with those, the design just didn’t feel modern enough.
- **Search:** For the longest time, search functionality just wasn’t available on the docs. This made it really hard for mirrord users to find things unless they knew exactly what they were looking for. We eventually added search, but it was pretty barebones and would break for weird reasons. We knew we needed something more robust.
- **AI Chatbot**: I wasn’t fully convinced at first, but when I looked into it, AI chatbots turned out to be genuinely helpful in docs. They make it easier for users to find the right pages and features based on natural language questions, and they’re great for things like writing config files or answering “how do I do X” types of queries.

So these were the main challenges we were looking to solve when we started exploring other documentation platforms.

## First Stop: Mintlify

I had heard of [Mintlify](https://mintlify.com/) from a LinkedIn post and it seemed like they had all the things we were looking for: a clean UI, AI-powered search, and an AI chatbot. So naturally, it was the first platform we tried.

Porting our existing Hugo docs to Mintlify was pretty straightforward. They use standard Markdown syntax, and we didn’t run into too many issues during the migration.

But the problems started after that.

### Our unique requirements

Before the switch, our docs were hosted at `metalbear.co/mirrord/docs`, and our first preference was to keep that same URL structure to avoid breaking links. Mintlify *technically* supported hosting docs at a [subdirectory](https://mintlify.com/docs/advanced/subpath/cloudflare), but only one level deep. That meant we could do `metalbear.co/docs`, but not `metalbear.co/mirrord/docs`.

This wasn’t ideal for us, but we liked the platform enough to consider hosting at `/docs` and adding redirects for the older URLs. Even getting that to work turned out to be tricky. Their *documentation* wasn’t fully up to date, so we had to try a bunch of things and figure it out ourselves before finally managing to host at `/docs`.

### The Dealbreaker: PostHog Support

Another important thing for us was PostHog support. We use [PostHog](https://posthog.com/) to track how users interact with our product—from landing on the website, to visiting a specific feature page, to signing up. Documentation is part of that journey, and we wanted to be able to map the full path users take, from docs to product and back.

Now, Mintlify did mention PostHog integration in their documentation, so I wasn’t too worried at first. But when we actually went to implement it, it just… didn’t work. We even reached out to their support, but they weren’t able to fix it either. 

So PostHog not working was the main reason we decided not to move forward with Mintlify.

## The Search Continues

At this point, we started looking for Mintlify alternatives, but honestly, there weren’t a lot of good ones, especially when it came to AI-powered documentation platforms.

We briefly considered switching to good old [Docusaurus](https://docusaurus.io/) and pairing it with a search tool like [Algolia](https://www.algolia.com/products/ai-search). But Docusaurus didn’t feel modern enough in terms of UI, and the AI integrations didn’t feel native - you could tell that they were third-party add-ons rather than being integrated into the platform.

Eventually, one search result popped up that caught our eye: GitBook.

## Trying GitBook

I looked through [GitBook’s](https://www.gitbook.com/) product page, and they seemed to have a lot of the things we were looking for. This time, we didn’t want to waste efforts without being sure, so I reached out to their support *before* setting anything up. I asked if they supported custom subdirectories like `metalbear.co/mirrord/docs`, and to my surprise, they did. That was already a plus point in their favour.

### Experience with GitBook as a Docs Platform

Now, setting up GitBook wasn’t as smooth as Mintlify. It felt like GitBook wanted me to do a lot of things through their web UI instead of being able to manage things via a GitHub repo. That was a bit frustrating during setup.

Their documentation also seemed focused on using the UI rather than configuring things via Markdown or JSON files, which is what I prefer. But once I figured out how to enable Git sync, I could at least manage the documentation content in GitHub which helped a lot. Configuration still had to be done through the UI, which wasn’t my favorite thing, but it wasn’t a dealbreaker either. 

On the upside, GitBook’s support team was much more responsive and helpful than Mintlify’s. That made a big difference. It was also so much simpler hosting the docs at `metalbear.co/mirrord/docs` than it was with Mintlify. 

They also have this concept of integrations, and there was one for [PostHog](https://www.gitbook.com/integrations/posthog). Setting it up was super straightforward and it just worked out of the box. Another huge win.

This solved all our needs for a docs platform. GitBook has a really cool AI search and assistant which even I find myself using many times. I recorded a video showing my favorite GitBook features if you want to check that out:

{{< youtube 5r7jyAM2Xds >}}


### Areas of Improvement

While GitBook today fulfills our needs better than anything else out there, it’s not perfect. There are still a few areas where we had to make compromises.

- **Deep linking to subheadings**: mirrord supports a lot of configuration options via the `mirrord.json` file. We list these on the [Configuration page](https://metalbear.co/mirrord/docs/config/options), and often we need to share a direct link to a specific option. GitBook only supports linking to headings up to level 3, so we can’t link directly to something like `feature.network.dns.filter`—only to `feature.network.dns`. Depending on how important that is to you, it might be a tradeoff worth considering. For us, it was.
- **UI-first approach:** GitBook has clearly made a product decision to be UI-first. While I can’t fault them for that, I personally would prefer being able to define everything via JSON configs. I’d also prefer if their docs included Markdown snippets for all the content blocks they support (like [Hints](https://gitbook.com/docs/creating-content/blocks/hint), [Cards](https://gitbook.com/docs/creating-content/blocks/cards), etc.) so I could add those via Markdown instead of the web editor.

## Final Thoughts

When we were looking for a new documentation platform, we couldn’t find a lot of first-hand experiences from other devtool teams. That was part of the motivation for writing this post and I hope it helps if you’re going through the same process.

Everyone talks about delivering the best user experience through the product itself, but docs are part of the product too. They often get ignored for way too long. Teams just stick with whatever platform they started with because it seems “good enough.”

But maybe it’s time to challenge that. Your documentation is how people experience your tool before they even install it, why not make it amazing? :)

[Check out the new mirrord docs here](https://metalbear.co/mirrord/docs) if you want some inspiration, and if you’ve got feedback, come chat with us on [Slack](https://metalbear.co/slack).
