---
title: "Web Browsing"
description: "Using mirrord & browser to set your IP address"
date: 2024-01-30T17:03:00+00:00
lastmod: 2024-01-30T17:03:00+00:00
draft: false
menu:
  docs:
    parent: "using-mirrord"
weight: 135
toc: true
tags: ["open source", "team", "enterprise"]
---

One way to use mirrord's [targetless mode]({{< ref "/docs/using-mirrord/targetless" >}} "targetless") is to set up your browser to use the IP address of the remote target. This way, you can browse the web as if you were in the same location as the remote target. Below is a guide on how to do this with Google Chrome.

#### Prerequisites

1. [Install microsocks](https://github.com/rofl0r/microsocks) (via brew or apt)
2. [Install "Socks5 Configurator" Chrome extension](https://chromewebstore.google.com/detail/socks5-configurator/hnpgnjkeaobghpjjhaiemlahikgmnghb) 


#### Steps

1. In a terminal session, trigger `microsocks` using `mirrord`.
   * If you want to use a specific target's network: `mirrord exec -t deployment/my_deployment microsocks`
   * If you just want a specific namespace networking: `mirrord exec -a namespace microsocks`
   * And you can just do: `mirrord exec microsocks` if you want to use your current namespace.
2. In a Chrome window:
   1. Open the Socks5 Configurator extension
   2. Make sure the "Socks5 Proxy" is enabled
   3. Type in its respective textbox `127.0.0.1:1080`
   4. Hit the save button
3. That's it! You can verify your IP address has changed via a quick "what is my ip address" search in Google 
  
## What's next?
1. If you'd like to intercept traffic rather than mirror it so that your local process is the one answering the remote requests, check out [this guide](/docs/using-mirrord/steal/). Note that you can even filter which traffic you intercept!
2. If your local process reads from a queue, you might want to test out the [copy target feature](/docs/using-mirrord/copy-target/), which temporarily creates a copy of the mirrord session target. With its `scaledown` flag it allows you to temporarily delete all replicas in your targeted rollout or deployment, so that none competes with your local process for queue messages.
3. If you just want to learn more about mirrord, why not check out our [architecture]({{< ref "/docs/reference/architecture" >}} "architecture") or [configuration]({{< ref "/docs/reference/configuration" >}} "configuration") sections?
