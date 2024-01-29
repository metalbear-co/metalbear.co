---
title: "Carcinisation of mirrord (or: why we use Rust)"
description: "Why we chose to use Rust at MetalBear"
lead: "Why we chose to use Rust at MetalBear"
tags:
  - metalbear
  - rust
  - low-level
date: 2022-06-14T0:00:00+00:00
lastmod: 2022-06-14T0:00:00+00:00
draft: false
weight: 50
images: []
contributors: ["Aviram Hassan"]
---
{{<figure src="rustacean-flat-happy.svg" class="center">}}
**Carcinisation** (or **carcinization**) is an example of [convergent evolution](https://en.wikipedia.org/wiki/Convergent_evolution) in which a [crustacean](https://en.wikipedia.org/wiki/Crustacean) [evolves](https://en.wikipedia.org/wiki/Evolution) into a [crab](https://en.wikipedia.org/wiki/Crab)-like form from a non-crab-like form. (source: [Wikipedia](https://en.wikipedia.org/wiki/Carcinisation)).

A classic example of carcinisation is MetalBear's mirrord project, where several different components converged on Rust as their main language. In this post, we'll detail their different evolutionary paths and explain why they ended up being written in Rust.

# First of all, what is mirrord?

mirrord is an open-source tool that lets developers run local processes in the context of their cloud environment. It is meant to provide the benefits of running your service in a cloud environment (e.g. staging) without going through the hassle of actually deploying it there, and without disrupting the environment by deploying untested code.[^1]

{{<figure src="mirrord-illustration.svg" height="100%" width="100%">}}

mirrord has four main components:

- Agent - Runs in the cloud and acts as proxy for the users.
- Layer - Shared library that runs inside the local service, hooking IO operations (sockets, filesystem) and proxying those to the agent.
- CLI - Wrapper to inject/load the Layer into local processes.
- VS Code Extension - Same as CLI, but for VSCode.

# Why Rust?

## Agent

This component is shipped as a container image. The layer creates a job with this image, providing it with elevated permissions on the same node as the [impersonated pod](https://mirrord.dev/docs/reference/architecture/#mirrord-agent). The job then enters the impersonated pod's namespaces in order to be able to access its file system and network interfaces.

### Switching Namespaces

Ideally, we would like to switch namespaces only for the necessary code flows, so we can have **minimal** impact on the impersonated pod. Linux lets you control namespace based on threads, so you can have different functionalities running in different threads and on different namespaces. Controlling threads this way _can_ be hard in some frameworks/languages. For example, in Go, threads [are actually abstracted so you](https://www.weave.works/blog/linux-namespaces-golang-followup) need to do some tinkering to ensure correctness. On the other hand, Rust doesn't really abstract anything, and offers very fine tuned control over threads and namespaces.

### Performance

One of mirrord's goals is to let multiple developers work on the same environment without impacting each other. To achieve that, our agent has have a very small footprint. Rust lets us have a _fixed-size_ memory layout, without many allocations and without the [overhead of a garbage collector.](https://discord.com/blog/why-discord-is-switching-from-go-to-rust)

### Thread Safety

The Agent has many functionalities running at the same time, requiring the ability to move data between threads safely.

Rust provides great primitives and safety around concurrency and task management. It doesn't let us send data types that are thread-bound unknowingly thanks to [Send](https://doc.rust-lang.org/std/marker/trait.Send.html) and it warns us when we hold references to non-atomic data types across threads with [Sync](https://doc.rust-lang.org/std/marker/trait.Sync.html).

## Layer

This component is shipped as a dylib/so (shared library) and loaded into the local process that's being plugged into the cloud. Once loaded, it hooks many libc functions (and some other frameworks, such us libuv) to create a smart management layer that decides what operation happens locally and what is being relayed to run remotely.

### Low Level

It was obvious to us that the layer had to be written in a low level language. Yes, we could create a bridge layer[^2] (JS actually has one built in with Frida) but that would add complexity and security concerns. Whereas in other parts of the solution we run in a self-contained context (i.e. our own process), this time we're being loaded into a process that isn't aware of our existence and we can't introduce bugs into it. Rust + Frida let us hook low level functions such as `accept`, `bind`, `socket`, `open`, etc in a relatively safe manner leveraging great abstractions such as `Arc` to manage our internal data structures and sync primitives such as `mpsc` to build communication between different parts of our code (in the layer, it's mainly between the "main loop thread" and hooks).

### Performance

Like the Agent, the Layer also needs to have low overhead in order to provide great developer experience.

## CLI

The CLI is responsible for injecting the layer into the target process. Right now, our main (and only) load mechanism is using `DYLD_INSERT_LIBRARIES` (on macOS) and `LD_PRELOAD` on Linux.

Implementing this in another language could've been easy but we decided to go with Rust for several reasons.

### Future-proof

The load method is fairly simple, but if in the future we'd want to introduce a more sophisticated injection method like using "ptrace" or other methods. Rust would let us implement it and use those functions and layouts at more comfort than other languages.

### Standalone

Rust generates standalone binaries (apart from libc). On top of that, using Cargo's new `bindeps` feature we could embed [mirrord-](https://mirrord.dev/docs/reference/architecture/#mirrord-layer)[layer](https://mirrord.dev/docs/reference/architecture/#mirrord-layer) into the CLI, creating a smooth and transparent experience instead of having to ship two files or downloading dependencies at runtime.

## VS Code Extension

The extension can't really be written in Rust due to VS Code support for JS only. We did consider using WASM, but the bridging logic would "cost" too much to be worth any value Rust might provide (which, for the extension, would mostly be consistency with our other components)..

## Company

Bonus section! I had a feeling having our codebase be mainly in Rust would make hiring engineers a lot easier. As a Rust enthusiast, I would have loved to work somewhere where I'd get to work with Rust regularly, and I suspected that many others felt the same. I even posted a poll in[/r/rust](https://www.reddit.com/r/rust/comments/tjbr92/employeeemployer_market_state_for_rust/) to see how others feel. The results were encouraging - around 40% of the people who voted thought the market for hiring Rust engineer is employer driven. I suspect that in any other ecosystem, the results would have been much more one sided in favor of the market being employee driven. When we finally started hiring, we posted in the "Who's Hiring" mega thread in /r/rust, and received applications from some great candidates, making building the team both fun and fast.
{{<figure src="rustacean-meme.jpg" class="center">}}
## Afterword

Rust can be used for many use cases, software and applications. We believe that every task requires different tools, but in our case our project's whole ecosystem fit right into Rust. You always need to do your research before choosing a language and stack, but generally speaking Rust is powerful and versatile and can be an amazing choice for a lot of different solutions.

Do you have any questions/corrections? Our website is completely open-source, so feel free to submit it as an issue or PR to our [repo](https://github.com/metalbear-co/metalbear.co/).

Want to help mirrord? Have a look at our open issues in the [GitHub issue tracker](https://github.com/metalbear-co/mirrord/issues) and feel free to contribute.

[^1]: [https://mirrord.dev/docs/overview/introduction/](https://mirrord.dev/docs/overview/introduction/)

[^2]: A software layer that connects the low level C run time with the JS runtime (translating the hooks into JS function calls)