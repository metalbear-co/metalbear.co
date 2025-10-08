---
title: "How I Learned to Stop Worrying and Trust AI Coding Agents"
description: "A story about how Claude, an AI coding agent, solved a complex Terraform schema bug in mirrord not by brute force, but by reasoning its way out with a helper script it wrote for itself."
lead: "A firsthand account of how Claude solved a complex bug that stumped human engineers by not just writing code, but by inventing its own debugging tools."
slug: "claude-experience"
tags:
  - claude
  - ai
date: 2025-10-08
summary: >
  This post is about how Claude helped debug a tricky Rust + Terraform issue in the mirrord Operator by writing its own debugging script — a moment that showed AI moving from code completion to real problem-solving. 
canonicalurl: "https://metalbear.com/blog/claude-experience"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Aviram Hassan"
---

I first joined the hype cycle around AI coding tools about four years ago with GitHub Copilot. Like everyone else back then, I was curious if AI could actually code. I found Copilot useful for autocomplete and little helpers, but when it came to actually solving an issue or adding a feature end to end, it was just… average. It kept going into loops and making silly mistakes, so I quickly went back to using it only for code completion.

Then Cursor launched, and everyone got excited (again). I tried it and gave it some tasks. It did fine for a few, but for others it suffered from the same problem of spiraling into loops without actually fixing the issue. Reviewing its code felt like reviewing the pull request of a junior developer who just doesn’t get the hint. Eventually, I dropped it too.

So when people started raving about Claude as a coding agent, I rolled my eyes. Another “next big thing” in AI coding? Sure.

## One of *Those* Bugs

Fast forward. We hit a nasty issue with the [mirrord](https://metalbear.com/mirrord/) Operator: installing it through Terraform would just halt. Terraform complained that our OpenAPI schema was broken.

We handed it to the engineer on our team who's the guy we call when we have a Problem we need solved. He spent days digging into the Rust proc macro that generates the schema, with no luck. I poked at it too, created a reproducible test case, hacked at the structs, and tried to see what broke. The schema was deep and messy with nested types, and every change I made seemed to make things worse.

We gave the customer a workaround and moved on. But then it happened again. And again. By the third report, I took it personally.

At this point, I had been playing with Claude for other mirrord-related work and was impressed with the UX and the output. My initial skepticism was gone. Claude was clean, fast, and didn’t make me click through endless menus. So when that third customer hit the same issue, I thought: fine. Let’s see what Claude can do.

I handed it the test case - a test that runs the Operator's schema generation code, then runs Terraform's schema validation on it - and explained the problem. Claude went to work. It found the first issue and “fixed” it. Tests still failed. It tried again and “fixed” something else, but tests were still failing. Normally, this is when AI agents spiral into just repeating the same loop, and I was ready to dismiss Claude too. But then it did something different.

## The Moment of Magic

Claude **wrote its own helper script**. The script analyzed the generated schema and specifically looked for the problematic pattern that was tripping up Terraform. Basically, it optimized its own feedback loop. Instead of relying on my test case (generate schema, validate the whole thing using Terraform), it wrote a faster, more targeted script to guide its debugging (generate schema, look for the specific erroneous pattern).

The script it wrote for itself is what helped it break out of the loop. Normally, it would make a small change, run the tests I had written, fail, and then try again, without ever learning anything new, because the tests didn’t provide enough information. By writing its own helper script, Claude gave itself better feedback. It wasn’t just fixing code anymore but was improving the way it understood the problem, and that’s what got it unstuck. And when the helper script finally stopped finding errors, Claude ran the original test case again. This time, it passed and everything worked.

The full PR can be seen here for [reference](https://github.com/metalbear-co/mirrord/pull/3541/files).

This is a huge shift. Most AI coding tools I’ve tried just bang their heads against the wall. Copilot, Cursor, even older Claude versions, when they hit a problem, they just keep looping: generate → test → fail → repeat. What Claude did here was on a whole new level. 

## AI Coding Agents Are the Future

Okay, I know that’s debatable. A year ago, if you’d asked me whether AI was going to change how we develop software, I probably would’ve shrugged it off and said it’s just a fancier autocomplete that impresses junior engineers without adding much value to the lives of senior engineers.

Today, I’m not so sure. Watching Claude tackle this problem, not just by patching code, but by inventing its own way to debug it, showed me something different. It wasn’t acting like a shortcut for writing functions, it was acting like an engineer who pauses, builds the right tool for the job, and then uses it to finish the work faster. That’s what feels meaningful: seeing AI move from code generation to problem-solving. 

I still don’t think coding agents are ready to run wild on a codebase unsupervised. They need direction, they make mistakes, and sometimes they fail in ways no human would. But after this experience, it’s clear to me that AI coding agents are starting to move beyond autocomplete. They’re beginning to reason about code. We’re crossing a line from AI that completes code to AI that understands it. I’ve heard similar stories from our customers as well, who are using [mirrord](https://metalbear.com/mirrord/) with AI agents. The agents are able to use mirrord to get feedback on their own code and then iterate on it. They’re reaching a point where they can deliver a feature end to end (but with supervision!). If you’re interested in learning how Claude and mirrord do that together, check out [the post](https://metalbear.com/blog/self-correcting-ai/) I wrote earlier about this.