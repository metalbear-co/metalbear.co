---
title: "Local Container"
description: "How to run mirrord on a local container instead of a local process"
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
menu:
  docs:
    parent: "using-mirrord"
weight: 133
toc: true
tags: ["open source", "team", "enterprise"]
---

The common way to use mirrord is on a locally running process. This way you can easily debug it in your IDE, as well as make quick changes and test them out without going through the additional layer of containerization.

However, sometimes you're just not able to run your microservice locally - usually due to complicated dependencies. For these cases, you can run mirrord on a local container instead. To do this, simply run the following command:

```bash
mirrord container --target <target-path> -- <command used to run the local container>
```

For example:
```bash
mirrord container -- docker run nginx
```

In addition to Docker, Podman and nerdctl are also supported.

Local container execution is currently only supported in the mirrord CLI tool. IDE extension support will be added in the future.

## What's next?
1. If you'd like to intercept traffic rather than mirror it so that your local process is the one answering the remote requests, check out [this guide](/docs/using-mirrord/steal/). Note that you can even filter which traffic you intercept!
2. If you don't want to impersonate a remote target - for example, if you want to run a tool in the context of your cluster - check out our [guide on the targetless mode](/docs/using-mirrord/targetless/).
3. If you just want to learn more about mirrord, why not check out our [architecture]({{< ref "/docs/reference/architecture" >}} "architecture") or [configuration]({{< ref "/docs/reference/configuration" >}} "configuration") sections?