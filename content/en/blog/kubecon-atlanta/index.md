---
title: "5 Talks at KubeCon Atlanta I'm Looking Forward To"
description: "Discover some exciting talks at KubeCon Atlanta 2025 that you won’t want to miss, from Salesforce’s AI-powered self-healing clusters to TikTok’s IPv6 journey with Cilium, plus insights from the MetalBear team’s own sessions."
lead: "Discover some exciting talks at KubeCon Atlanta 2025 that you won’t want to miss, featuring AI-powered infrastructure, large-scale Kubernetes deployments, and insights from the MetalBear team."
slug: "kubecon-atlanta"
tags:
  - KubeCon
  - Kubernetes
  - Community
  - Cloud-Native
categories:
  - kubernetes
  - events
  - cloud-native
date: 2025-10-23
summary: >
  A curated list of talks at KubeCon Atlanta 2025 that you won’t want to miss, featuring Salesforce's AI-powered self-healing clusters, Netflix's container runtime customization, TikTok's IPv6 migration to Cilium, Google's in-place pod resizing, and special sessions from the MetalBear team.
canonicalurl: "https://metalbear.com/blog/kubecon-atlanta"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
---

KubeCon season is here again, this time landing in Atlanta. Every year, the cloud native community somehow finds new ways to surprise me: new projects, new ideas, and the kind of hallway conversations that make you rethink how you build software.

I’ve been going through [the schedule](https://kccncna2025.sched.com/?iframe=no) (while trying not to open 40 tabs at once), and there are some seriously interesting talks lined up. Here are a few talks I’m really excited about including a couple of talks from the MetalBear team.

And if you’ll be around Atlanta, come find us at the MetalBear booth (booth number 1560). We’ll have mirrord demos, stickers, some really special swag (🤫) and probably way too many opinions about staging environments.

### 1000 Clusters, 1 Brain: Salesforce’s Approach to Self-Healing Using AIOps

**Speakers**: Vikram Venkataraman (AWS) & Srikanth Rajan (Salesforce)

[Session Link](https://kccncna2025.sched.com/event/27FVk/1000-clusters-1-brain-salesforces-approach-to-self-healing-using-aiops-vikram-venkataraman-aws-srikanth-rajan-salesforce?iframe=no)

If there’s one talk that screams “the future of platform engineering,” it’s this one. Salesforce is sharing how they’re managing over 1,000 Kubernetes clusters using a self-healing system powered by generative AI and multi-agent collaboration. I was already sold at this premise, but what also caught my attention is the promise of this not being just another fancy “AI + K8s” demo. 

They plan to show an actual real-world setup where intelligent agents monitor, diagnose, and fix cluster issues automatically. I’m picturing their solution as an “autopilot for platform ops,” reducing the maintenance burden on DevOps engineers dramatically by letting AI take care of the repetitive stuff. I’m also curious about how they’ve combined AI introspection with GitOps workflows to keep things safe. 

Anyone who’s ever spent hours chasing down a node issue or debugging a flaky pod knows how painful that can be. So if Salesforce really pulled off a scalable, AI-driven remediation system, this is going to be a must watch session.

### Container Runtime Customization at Netflix: A Case Study With NRI and OCI Hooks

**Speaker**: Erikson Tung (Netflix)

[Session Link](https://kccncna2025.sched.com/event/27Fbb/container-runtime-customization-at-netflix-a-case-study-with-nri-and-oci-hooks-erikson-tung-netflix?iframe=no&w=100%&sidebar=yes&bg=no)

Netflix always has some of the most interesting deep-dive talks at KubeCon, and this one feels like no exception. Titus (their Kubernetes-based container platform) runs hundreds of thousands of containers globally, which is mind-blowing on its own. This session dives into how they’re customizing container runtimes at that scale using ContainerD’s Node Resource Interface (NRI) and OCI hooks.

Why I added this one to the list is because this talk isn’t about experimenting with something new but rather evolving an already massive system, something which comes with a very different set of challenges. Migrating a custom compute platform like Titus toward a more standard Kubernetes setup without losing the specialized runtime features that make it work for Netflix sounds like a huge engineering challenge that I personally think would be really cool to learn about.

If you’re into platform internals or just like hearing how big companies keep things running smoothly at massive scale, this talk should be high on your list.

### **Rust Is the Language of AGI**

**Speaker**: Michael Yuan (Second State)

[Session Link](https://kccncna2025.sched.com/event/27FV4/rust-is-the-language-of-agi-michael-yuan-second-state?iframe=no)

Okay, so I’ll admit I have a slight bias toward this one since [mirrord](https://metalbear.com/mirrord/), our open source Kubernetes dev tool, is written in Rust. And as someone who’s been learning Rust since joining MetalBear, this talk immediately stood out for me. It’s not every day you see a session connecting Rust and AI, and the title alone (“Rust Is the Language of AGI”) definitely makes a statement.

Michael Yuan’s going to talk about RustCoder, an open-source project that helps LLMs actually generate, compile, and fix Rust projects in real time. I love this idea because it hits two of my current obsessions: Rust and AI-assisted development. The premise is that while Rust’s strict compiler makes it tough for humans, it’s actually great for AI, since compiler feedback can guide models toward writing correct code.

I’m curious to see how far this project has come and how well it integrates with existing IDEs. Also, it’s pretty cool that it’s supported by the Linux Foundation **and** the Rust Foundation. Definitely one of the more unique talks on the agenda, and it’ll be interesting to see how it pushes the conversation around AI and programming languages forward.

### In-Place Pod Resize in Kubernetes: Dynamic Resource Management Without Restarts

**Speakers**: Tim Allclair & Mofi Rahman (Google)

[Session Link](https://kccncna2025.sched.com/event/27FdF/in-place-pod-resize-in-kubernetes-dynamic-resource-management-without-restarts-tim-allclair-mofi-rahman-google?iframe=no)

In-place pod resizing is one of those K8s features that makes you wonder, “Wait, how did we live without this for so long?” For as long as I’ve used Kubernetes, changing a Pod’s resources has always meant one thing: a restart. And if you’re dealing with stateful apps or long-running jobs, that can be painful.

That’s why I’m really excited about this feature finally getting the attention it deserves. In-place pod resizing introduces a way to adjust CPU and memory for running Pods without restarting them. This is a game-changer for workloads where uptime is critical. I’m also looking forward to learning about more real-world scenarios for this feature and what limitations still exist.

### TikTok’s IPv6 Journey to Cilium: Pitfalls and Lessons Learned

**Speakers**: Giri Kuncoro & Joseph Pallamidessi (TikTok)

[Session Link](https://kccncna2025.sched.com/event/27FbS/tiktoks-ipv6-journey-to-cilium-pitfalls-and-lessons-learned-giri-kuncoro-joseph-pallamidessi-tiktok?iframe=no)

TikTok running Kubernetes at massive scale is already impressive, but what makes this talk stand out is the twist: they’re doing it in IPv6-only environments. While most of us are still living comfortably in dual-stack or IPv4 worlds, TikTok went all-in on IPv6 and decided to migrate their clusters to Cilium for its networking, security, and observability capabilities.

That alone sounds ambitious, but the real value here is in the battle scars. This session promises to dive into all the weird edge cases and bugs they hit: Cilium dropping NDP traffic, DNS policies not handling IPv6 servers correctly, and even BPF maps not being found when IPv4 assumptions failed. Basically, all the gritty details you never see in official docs but desperately need if you ever attempt something similar.

I’m particularly interested in hearing how they worked around these issues to make Cilium production-ready in an IPv6-only environment. It’s rare to get this kind of transparency from large-scale operators, and talks like this are exactly why I love KubeCon, they show what really happens when theory meets production!

## Bonus Picks: The MetalBear Specials 🐻

Alright, time for a bit of shameless self-promotion. Two of the talks I’m most excited about this year just happen to be from the MetalBear crew, including one from yours truly. 

### Security Theater or Real Defense? Navigating Open Source Security in a Cloud Native World

**Speakers**: Rotem Refael (ARMO), Constanze Roedig (TU Vienna), Megan Wolf (Defense Unicorns), Stefana Muller (Salesforce), Oshrat Nir (MetalBear)

[Session Link](https://kccncna2025.sched.com/event/27Fc5/security-theater-or-real-defense-navigating-open-source-security-in-a-cloud-native-world-rotem-refael-armo-constanze-roedig-technical-university-of-vienna-megan-wolf-defense-unicorns-stefana-muller-salesforce-oshrat-nir-independent?iframe=no)

Our very own Oshrat Nir is joining an incredible, all-women panel to tackle one of the spiciest topics in cloud native right now: is what we call “security” actually secure… or just theater?

Between YAML fatigue, compliance chaos, and the endless calls to “shift left,” Kubernetes security has become a bit of a circus and this panel promises to cut through the noise. One reason you should definitely consider attending is that the speakers come from all corners of the industry: open source maintainers, DevSecOps leads, and practitioners who’ve seen what actually breaks in production. Oshrat told me to expect real talk, a few unpopular opinions, and zero vendor fluff, so make sure to add this one to your agenda!

### Lightning Talk: How We Used Data Structures When Contributing to the Kubernetes Project

**Speaker**: Arsh Sharma (MetalBear)

[Session Link](https://kccncna2025.sched.com/event/27Fbz/cl-lightning-talk-how-we-used-data-structures-when-contributing-to-the-kubernetes-project-arsh-sharma-metalbear?iframe=no)

I’m *especially excited* about this one because I’ll actually be the one on stage for it! If you’ve ever rolled your eyes at the idea of data structures and algorithms being “useful in real life,” this one’s for you.

In this lightning talk, I’ll share the story behind depstat, a Kubernetes project I helped build and maintain. It’s used to analyze dependencies across the Kubernetes codebase, and the fun part is how much of it relies on core computer science concepts like graphs and graph traversal algorithms.

When I first started learning data structures, I didn’t exactly picture them showing up in my open source work, let alone in Kubernetes. So this talk is a bit of a love letter to those fundamentals and a quick look at how theory actually powers the tools we use every day.

## Come Say Hi at KubeCon if You’re Attending!

That’s my shortlist for KubeCon + CloudNativeCon North America 2025. I tried to keep it a mix of deep technical dives, new projects and features, and a little bit of MetalBear pride :) What I love about KubeCon talks is how they always leave you inspired (and slightly humbled) by how much is happening across the ecosystem. There’s always some new project, tool, or idea that makes you want to go back home and start building.

If you’re heading to Atlanta, come find us at the MetalBear booth. We’d love to chat about mirrord, developer experience, or just geek out about Kubernetes. Safe travels, and see you at KubeCon! 🚀