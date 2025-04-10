---
title: "Carousell User Story | Praveen Sanap"
card_title: "Praveen Sanap"
description: "The key improvement was that debugging a process locally, using familiar tools like IntelliJ, made it much easier to handle egress traffic."
date: 2025-1-20T06:00:00+00:00
lastmod: 2025-1-20T06:00:00+00:00
position: "Software Engineer | Carousell"
avatar: "praveen-sanap.png"
logo: "carousell.png"
featured: true
draft: false
weight: 10
---


# About yourself 
Praveen, Lead Software Engineer at Carousell

# About your company
Carousell is a leading multi-category classified and recommerce marketplace in SEA.

# What did you use before?
Telepresence

# Why did you choose mirrord instead? 
The major challenge we faced with previous solutions was its reliance on running processes inside a Docker container. Our server processes, which we were developing and debugging, needed to run locally. However, with previous solutions, these processes were executed inside a Docker container to send egress traffic to the target staging environment for testing.
This created a significant issue because we couldn’t use our standard debugging tools like IntelliJ or Visual Studio Code effectively. Debugging inside a Docker container required specific tools, and the process was often cumbersome and unreliable, with numerous failure modes. 

Another challenge arose when we transitioned to decentralized routing, where Istio handled network plane routing decisions. Previously, developers could debug processes locally while traffic was routed correctly. The local IPs were discoverable, enabling processes to run as though they were on a staging environment. However, after the introduction of decentralized routing, this functionality broke, leading to frustration among developers. Many felt their development velocity had decreased as a result.

We initially explored paid versions of alternative solutions to address these issues but eventually came across mirrord, and it provided the functionality we needed. After adopting mirrord, we found additional features like traffic stealing, which further enhanced our workflow and made debugging much smoother.

Running processes locally was significantly faster and more efficient. It allowed the process to behave as though it were running in a Kubernetes environment while still being local.
Once we implemented this local debugging approach, everything started working smoothly. Moreover, redirecting traffic became an added benefit we gained naturally after adopting this method. 

The key improvement was that debugging a process locally, using familiar tools like IntelliJ, made it much easier to handle egress traffic to remote env. We primarily utilized this solution in two modes: egress-only and traffic-stealing. 

# How do you and others in your organization use mirrord? 
On a day-to-day basis, we primarily use mirrord for debugging, especially when developing applications locally and testing them against an environment. We have a concept of feature environments, which provide isolated environments for developers to deploy their applications. This allows them to test without affecting the shared staging environment. However, with mirrord, this process becomes even more streamlined.
Using mirrord, developers can deploy to their isolated environment while running their processes locally. 
Traffic from their isolated environment is then routed to their local process, enabling debugging without disrupting anyone else. This significantly enhances our development iterations and improves productivity in our daily tasks.

One key benefit of mirrord is its seamless integration with developer tools like IntelliJ and VS Code. Another standout benefit is the excellent support we’ve received and its highly active [Discord channel](https://discord.gg/maywWfPg). Whenever we encountered issues, even while using the open-source version, the responses were incredibly quick and helpful. For instance, when we encountered an issue with mirrord’s auto-upgrade feature that affected our debugging, we reached out on their Discord channel. The team quickly responded with a temporary workaround, recommending a specific version until a fix was released. We reverted to the suggested version, and everything went back to normal. This level of support truly sets mirrord apart from other tools we’ve used and added significant value to our experience.
