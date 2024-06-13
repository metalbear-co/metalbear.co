---
title: "mirrord for Teams – a Step Into the Remocal Future"
description: "Our biggest release yet is now available for download"
lead: "Our biggest release yet is now available for download"
tags:
  - metalbear
  - mirrord
  - ergonomics
  - cloud
  - devtools
  - mirrord-for-teams
date: 2024-06-13T06:00:00+00:00
lastmod: 2022-06-13T06:00:00+00:00
draft: false
weight: 50
images: []
contributors: ["The MetalBear Team"]
---

{{<figure src="mftlaunch.jpeg" height="100%" width="100%">}}

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Today we’re excited to announce that after two years of development on mirrord Open Source, our tool that enables Remocal development for Backend engineers, we’re releasing _mirrord for Teams_ to bring that awesome power to entire Engineering organizations. If you’re new to the term, Remocal development combines the best of both worlds of the dominant modern cloud software engineering paradigms – _Remote_ development, where you maintain no local environment and everything is cloud dependent, and _Local_ development, where you develop software on your computer, sync code to staging and production, and test. _Remocal_ development allows developers to work locally while their process _thinks_ it is running remotely on Staging – and it’s done via a bit of magic we call mirrord. If a tool for shortened software development lifecycles and better collaboration for Kubernetes developers, packaged as an enterprise-ready platform with security and governance features included could help you, read on – we think you’ll be very interested in _mirrord for Teams_. But first, a bit about how we got there.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Before the world of microservices and Kubernetes, software development was slower and clunkier, but it was also, in many ways, simpler. People didn’t just go ahead and make things more complicated for the sake of it, so why did things change? Because the challenges of global web scale applications, the likes of which had never been seen before the heyday of distributed computing, simply made developing entire applications using the old methodology too cumbersome and at times completely nonviable. The advent of microservice development, which changes the organizational dynamic and its relationship to software development, also created its own set of challenges and complexities. _Service interdependence, fragile local development maintenance, high-contention for access to Staging environments, more moving parts for everyone involved_ – these are just a few of the pain points of modern development. That’s where the _Remocal_ insight came to us – as we were experiencing the pains of the high complexity costs of microservice development with Kubernetes. We asked ourselves, what if we could just work on our local setup, and through some clever manipulation, have our process _think_ it was running on staging? After some experimentation that leveraged our cybersecurity and low level expertise, we figured out how to override a local process' syscalls without disrupting the process' operation in order to proxy them to the cloud – and it worked. _mirrord_ was born.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The biggest impact that access to a tool like _mirrord_ has on microservice development was immediately apparent – **we no longer had to to test our code on Staging**. This meant that our software development lifecycle was suddenly quicker, feedback was more immediate, and finally, for real, _confidence on our laptop meant confidence in staging_. We also realized that while we had considered using various plugins and contortions to get remote development working, or tried our hardest to make our local tools ‘feel’ like they were operating remotely, nothing yet had matched the _Remocal_ feeling. The best part of this was that **we could stay local, use our preferred IDE, and know that our process was acting just as it would in staging**. Once we felt solid about how this all worked, and started to get some more feedback from the community, we also realized that a service that had been configured to work with _mirrord_ was super simple to hack on for the next person – all they had to do was clone the repo and get to work. The small _mirrord_ community started to grow, giving us confidence in our solution as it started to spread to different organizations.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Soon, we started to get feedback from developers that wanted to spread the word about mirrord Open Source, and realized that there were some limitations that prevented it from being adopted organizationally, including limits on concurrency and security concerns regarding high cluster permissions privilege requirements. As we started to tackle these issues, we realized that we had a roadmap that could take us from a successful Open Source project to a commercially viable product that could change the way organizations develop software by making mirrord Open Source collaborative, secure, and governable enough for any team to adopt.  That brings us up to today, and the release of _mirrord for Teams_.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The core of _mirrord for Teams_ is a new component that we call The Operator. We’ll release some more technical information about how it works in the future, but essentially, it’s a Kubernetes operator that runs persistently in the cluster and manages the mirrord instances trying to access it. This adds the following capabilities on top of mirrord Open Source:
- **Same-Target Concurrency**: work concurrently with your coworkers on the same “target” (our name for the remote Pod or Deployment whose context you want to proxy to your local process)
- **Conflict Resolution**:  various tools for resolving conflicts with your coworkers’ sessions
- **Queue Filtering (coming soon)**: filter the messages your local process reads from a remote queue. Everything else will be read by the remote service running in staging.
- **mirrord Policies**: configure policies on a target, namespace, or the entire cluster to limit who can use mirrord and how
- **Copy Target**: Instead of proxying an existing target, create a replica of it and proxy that instead. This lets you use mirrord on transient things like Jobs, or Deployments that won’t start
- **mirrord Actions (coming soon)** - Automations to run before/after mirrord sessions (e.g. set up a local database and use that instead of the remote one)
All of which are massive improvements for teams of microservice developers deploying to Kubernetes and looking for a better developer experience where more features can be shipped in less time. Improving the experience for those developers has been a driving force for our company since we started, and we’re very excited to continue down this road, because we truly believe _The Future is Remocal_.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We’d like to thank everyone in the mirrord community for supporting us and helping us get to this amazing place. We’ll be publishing more details about the technical aspects of how this product came together, and steadily rolling out new features to help teams collaborate on their shared microservice architectures in ever more efficient, secure, and usable ways.  Until then, **CLICK HERE to learn more about mirrord for Teams and how you can get started right away**.