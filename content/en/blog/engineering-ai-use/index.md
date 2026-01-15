---
title: "How Our Engineering Team Uses AI"
description: "A look at how our engineering team uses AI coding tools while building mirrord, including what works, what doesn't, and real-world examples."
lead: "AI tools are everywhere right now, and our engineering team uses them daily. In this post, we're sharing how we actually use AI coding tools and agents while building mirrord, what's been useful and what hasn't."
slug: "engineering-ai-use"
tags:
  - AI
  - Engineering
date: 2026-01-15
summary: >
  Discover how MetalBear's engineering team leverages AI tools in real-world software development. Learn where AI helps most and where it struggles. Get practical examples and insights from a team building a low-level Kubernetes development tool in Rust.
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
---

AI tools are everywhere right now, and our engineering team uses them daily. In this post, we’re sharing how we actually use AI coding tools and agents while building mirrord, what’s been useful and what hasn’t. If you’re looking for ways to leverage AI in real-world software development, hopefully some of this would be useful for you.

## What do we do?

But first, some context about our team and the product we’re building. At MetalBear, we’re a completely remote company building [mirrord](https://metalbear.com/mirrord/), which is a Kubernetes development tool written in Rust. mirrord is not a typical SaaS CRUD microservice app. It's a local tool that communicates with your on-prem Kubernetes environment, including components like a layer that injects itself into your process, an ephemeral agent that runs in Kubernetes, a Kubernetes operator, and lots of glue.

We raised our [seed round](https://metalbear.com/blog/seed-funding/) a couple of months ago and are a team of 34 at the time of writing, out of which 15 make up the engineering team. We don’t mandate any AI tooling, but we do strongly encourage it, and engineers are free to pick whatever works for them and experiment. We have a Slack channel where people publicly share how they use AI, in the hopes their use case is relevant for others on the team. Here are a few of the examples that were shared recently, including use cases for Claude Code, ChatGPT, and Gemini. 


## Where AI helps the most

### Getting oriented in unfamiliar code

One of the most consistent and least controversial ways we have been using AI is as an entry point into unfamiliar code. This is especially useful when understanding a new area of the codebase, coming back to something that hasn’t been touched in a while, or trying to understand code in external libraries. Instead of starting by opening files and reading through the code manually, people often use tools like Claude Code or Cursor for a high-level explanation of how a certain part of the system is structured and how the pieces relate to each other. A prompt might look something like: 

```markdown
I’m looking at the TCP outgoing interception code in the mirrord layer. 
Can you explain which modules are involved and how a connection flows from the
local process to the agent?
```

It’s important to note here that engineers aren’t asking the AI to explain mirrord as a whole, or to be an authority on the architecture. That simply doesn’t work for a codebase as large as ours. They’re using it to form an initial mental model for a specific part of the system they’ll be working on. So even if that model is incomplete or slightly wrong, it still provides a useful starting point and makes the next step, reading the actual code, much easier. 

### Exploring ideas and alternatives

Another area where AI has been useful for us is early in the development process, during the planning stage before any approach has been chosen for solving a problem. Engineers often use it to explore ideas by describing the feature they want to implement or a bug they’re trying to fix, and seeing what kinds of approaches the model suggests. Having AI lay out a few different options can surface trade-offs earlier, or help rule out directions they don’t want to pursue, without paying the full cost of writing and rewriting code. A prompt in this case might look something like:

```markdown
I’m looking into adding support for filtering incoming requests by HTTP method in mirrord.
I don’t want implementation code yet. Can you help me think through where filtering could live,
what kinds of constraints or edge cases we should consider, and what
trade-offs different approaches might have?
```

That said, objections have also been raised internally about using AI this way. Once a model proposes a concrete solution, it can unintentionally narrow your thinking. Even a mediocre solution can anchor your brain and make it harder to explore better alternatives on your own. 

### Scripts

If there’s one area where everyone on the team agrees AI consistently delivers value, it’s scripts. For debugging scenarios or local workflows, being able to describe what you need and have a working script generated for you can save a huge amount of time. One of the engineers used these prompts to create a reusable PowerShell function which they needed:

````
# Prompt 1

I want to create a basic PowerShell function to add to my PowerShell profile.

The function should create a Kubernetes pod using `kubectl`, based on the `busybox` image.
- It should accept at least one argument for the pod name.
- The pod must run forever using `-- sleep infinity` (this is an absolute requirement).

The command it generates should look like this:
`kubectl run fun --image=busybox --restart=Never -- sleep infinity`

Additional requirements:
- Make the restart policy configurable via a function argument, so I don’t have to keep deleting the pod every time I restart the cluster.
- Run basic sanity checks to ensure there is a running Kubernetes cluster.
- After writing the script, suggest a few additional improvements.

Name the function `New-KubectlBusyBoxPod`.

# Prompt 2

Extend the function with the following behavior:

- Add an option to automatically attach to `/bin/sh` in the newly created pod.
- Before creating the pod, run `kubectl get pod $Name` to check if it already exists.

If the pod exists, the output will look like:

```
NAME   READY   STATUS    RESTARTS   AGE
fun    1/1     Running   0          5m39s
```

Parse the second line of stdout, split it by whitespace, and extract:
- the pod name
- the pod status

If the pod already exists, stop early and print a message like:
`pod of $name exists, status: {pod-status}`

Final adjustments:
1. Change the default restart policy to `"Always"`.
2. Wrap the existing pod status in single quotes in the output.
3. Display the “pod already exists” message in red, since this is an error case.
4. If the pod exists, prompt with a y/n question asking whether to delete it and proceed with creation.
   - If deleting, use `--force` and verify that the deletion succeeded.

````

But there's another benefit besides time-saving. These AI-generated scripts tend to be more structured and readable by default compared to what an engineer would write, because spending extra time on a throwaway script usually isn’t worth it for them. This makes them much easier to tweak, extend, and reuse later when similar needs come up. Over time, many of these scripts have stopped being one-offs and instead become part of a small personal toolkit that gets reused again and again across debugging sessions.

## Where AI struggles

### Complex architectures

mirrord has a complex and fairly unusual architecture, which general purpose LLMs struggle with. If you ask an AI tool to do anything that requires full context of how mirrord works, it will most likely fail. We’ve had [very few instances](https://metalbear.com/blog/claude-experience/) of someone on the team using AI to fix a bug successfully without much manual intervention. And we’re still very far from letting fully autonomous agents loose on our codebase, even with a human reviewing the output, because it often requires more work fixing that code than writing it yourself.

That said, some engineers have had better results by explicitly giving the model persistent architectural context. In practice, this means maintaining internal CLAUDE.md or AGENTS.md files that describe mirrord’s structure and its major components. These files aren’t static, and engineers use the models themselves to keep them updated for future use. In case you’re curious, this is what one of those files looks like currently:

````markdown
# CLAUDE.md

Context for Claude Code when working with the mirrord repository.

# Check packages (agent is Linux-only)
cargo check -p mirrord-layer --keep-going
cargo check -p mirrord-protocol --keep-going
cargo check -p mirrord-agent --target x86_64-unknown-linux-gnu --keep-going

# Integration tests
cargo test -p mirrord-layer
```

**Key paths:**
- Protocol messages: `mirrord/protocol/src/codec.rs`
- Agent main loop: `mirrord/agent/src/entrypoint.rs`
- Layer hooks: `mirrord/layer/src/file/hooks.rs`, `mirrord/layer/src/socket/hooks.rs`
- Intproxy routing: `mirrord/intproxy/src/lib.rs`
- Configuration: `mirrord/config/src/lib.rs`

## Architecture

mirrord lets developers run local processes in the context of a Kubernetes cluster. It intercepts syscalls locally and executes them remotely in a target pod's environment.

### Component Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LOCAL MACHINE                                                          │
│  ┌──────────────────────┐     ┌──────────────────────┐                  │
│  │   User Application   │     │      CLI (mirrord)   │                  │
│  │  ┌────────────────┐  │     │  - Starts intproxy   │                  │
│  │  │     Layer      │  │     │  - Resolves target   │                  │
│  │  │ (LD_PRELOAD)   │◄─┼─────┤  - Sets up env vars  │                  │
│  │  └───────┬────────┘  │     └──────────────────────┘                  │
│  └──────────┼───────────┘                                               │
│             │ Unix socket / TCP                                         │
│  ┌──────────▼───────────┐                                               │
│  │       Intproxy       │  Routes messages, manages connections         │
│  │  (or Operator proxy) │  Background tasks: files, incoming, outgoing  │
│  └──────────┬───────────┘                                               │
└─────────────┼───────────────────────────────────────────────────────────┘
              │ TCP (k8s port-forward or operator connection)
┌─────────────┼───────────────────────────────────────────────────────────┐
│  KUBERNETES │ CLUSTER                                                   │
│  ┌──────────▼───────────┐                                               │
│  │        Agent         │  Ephemeral pod, runs in target's namespace    │
│  │  - File operations   │  Has access to target's fs, network, env      │
│  │  - DNS resolution    │  Uses iptables for traffic stealing           │
│  │  - Traffic steal     │                                               │
│  │  - Outgoing conns    │                                               │
│  └──────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Three Tiers

**Layer** (`mirrord-layer`) - Injected into the user's process via `LD_PRELOAD` (Linux) or `DYLD_INSERT_LIBRARIES` (macOS). Uses Frida GUM to hook libc functions. When a hooked function is called, the layer either:
- Handles it locally (bypass)
- Sends a `ClientMessage` to the proxy and waits for a `DaemonMessage` response

**Proxy** - Routes messages between layer and agent. Two variants:
- **Intproxy** (`mirrord-intproxy`): Runs locally in open-source mode
- **Operator**: Runs in-cluster for paid version (separate repo at `../operator/`)

**Agent** (`mirrord-agent`) - Ephemeral pod that performs operations in the target's context. Network tasks run in the **target pod's network namespace** for correct DNS resolution and routing.

...
````

If you check out the [full file here](https://github.com/metalbear-co/mirrord/blob/main/CLAUDE.md) you’ll see, it’s a lot of context that we need to provide the model to get it to a state where it’s decent, but still not enough to be trusted entirely.

### Long-running reasoning

Another place where AI tools consistently struggle is when the scope becomes large or the context stretches over time. Models will often forget why they made an earlier decision in the same session. It’s common to see them fix a bug in one place and accidentally break something unrelated elsewhere, simply because they lost track of an earlier constraint. This makes them unreliable for iterative changes unless the engineer is carefully tracking the logic themselves. The output often looks plausible at first glance, which makes these failures easy to miss if you’re not paying close attention.

The performance of different models has also varied in this area for our engineering team.

- ChatGPT tends to be the best all-rounder: it usually understands prompts well, gives the most consistently reasonable answers, and is relatively good at iterating on its own mistakes, including identifying and fixing bugs it introduced.
- Gemini stands out for deep research, especially in its “Thinking” modes, and can go impressively far when you give it time, but it frequently loses track of earlier decisions and constraints, leading to fixes in one place that break unrelated parts elsewhere.
- Claude Code is somewhere in between, with some engineers finding it useful and others struggling to get value from it.

## So is AI changing how we build software at MetalBear?

AI hasn’t replaced engineers on our team, and it hasn’t removed the need to deeply understand the systems we’re building. It hasn’t magically solved complex architectural problems, and it certainly hasn’t made it safe to hand over large parts of the codebase to fully autonomous agents. What it has done is reduce friction and save time.

It helps engineers get oriented faster, explore ideas earlier, write handy scripts, and offload a lot of mechanical or repetitive work. The biggest difference we’ve seen isn’t which model people use, but how intentionally they use it. The engineers getting the most value are the ones who scope problems tightly and control the context they give the model.

So yes, AI is kind of changing how we build software, but not in the way most marketing would have you believe, at least for a low-level, deeply technical product like ours. Right now, for us, AI is best thought of as a powerful tool around the edges of software development. It’s very good at accelerating parts of the process that are tedious or exploratory, but bad in areas that require deeper understanding.