---
title: "Targetless"
description: "How to run mirrord without a remote target"
date: 2020-11-16T13:59:39+01:00
lastmod: 2020-11-16T13:59:39+01:00
draft: false
menu:
  docs:
    parent: "using-mirrord"
weight: 130
toc: true
tags: ["open source", "team", "enterprise"]
---

The common use case for mirrord is testing out modifications to an existing application. In this case, the stable version of the service is running in the cloud, and the new code runs locally, using the stable cloud version as its remote target.
However, sometimes you want to test a brand new application that has never been deployed to the cloud. Or you might not want to run an application at all - maybe you just want to run a tool, like Postman or pgAdmin, in the context of your cluster.

This is where targetless mode comes in. When running in targetless mode, mirrord doesn't impersonate a remote target. There's no incoming traffic functionality in this mode, since there's no remote target receiving traffic, but everything else works exactly the same.

To run mirrord in targetless mode, just don't specify a target! For example:
```bash
mirrord exec /bin/my-tool
```

## IDE

If you want to run in targetless mode using the IntelliJ or VSCode plugin, you can select the `No Target ("targetless")` option from the target selection dialog, or you can add
```json
{
  "target": "targetless"
}
```

to your mirrord configuration file.

## What's next?
1. If you'd like to intercept traffic rather than mirror it so that your local process is the one answering the remote requests, check out [this guide](/docs/using-mirrord/steal/). Note that you can even filter which traffic you intercept!
2. Want to use Targetless mode to run a web browser in the context of your cluster? Check out this [guide]({{< ref "/docs/using-mirrord/web-browsing" >}} "web-browsing").
3. If you just want to learn more about mirrord, why not check out our [architecture]({{< ref "/docs/reference/architecture" >}} "architecture") or [configuration]({{< ref "/docs/reference/configuration" >}} "configuration") sections?