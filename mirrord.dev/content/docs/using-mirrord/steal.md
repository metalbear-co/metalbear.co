---
title: "Traffic Stealing"
description: "How to steal traffic using mirrord"
date: 2020-11-16T13:59:39+01:00
lastmod: 2025-02-24T00:00:00+00:00
draft: false
menu:
  docs:
    parent: "using-mirrord"
weight: 100
toc: true
tags: ["open source", "team", "enterprise"]
---

By default, mirrord mirrors all incoming traffic into the remote target, and sends a copy to your local process. This is useful when you want the remote target to answer requests, keeping the remote environment completely agnostic to your local code. However, sometimes you do want to test out how your local code responds to requests; or maybe your process writes to a database when receiving a request, and you want to avoid duplicate records (one from your local code, one from the remote target).
In these cases, you probably want to steal traffic instead of mirroring it. When you steal traffic, your local process is the one answering the requests, and not the remote target. This guide will show you how to do that.

## Stealing all of the remote target's traffic
If you want all traffic arriving at the remote target to be redirected to your local process, change the `feature.network.incoming` configuration to `steal`:

```json
{
  "feature": {
    "network": {
      "incoming": "steal"
    }
  }
}
```

Run your process with mirrord using the steal configuration, then send a request to the remote target. The response you receive will have been sent by the local process. If you're using one of our IDE extensions, set a breakpoint in the function handling the request - your request should hang when the breakpoint is hit and until you continue the process.

## Stealing only a subset of the remote target's traffic
For incoming HTTP traffic (including HTTP2 and gRPC), mirrord also supports stealing a subset of the remote target's traffic. You can do this by specifying a filter on either an HTTP header or path.
To specify a filter on a header, use the `feature.network.incoming.http_filter.header_filter` configuration:

```json
{
  "feature": {
    "network": {
      "incoming": {
        "mode": "steal",
        "http_filter": {
          "header_filter": "X-My-Header: my-header-value",
          "ports": [80, 8080]
        },
      }
    }
  }
}
```

The `feature.network.incoming.http_filter.ports` configuration lets mirrord know which ports are listening to HTTP traffic and should be filtered. It defaults to `[80, 8080]`.

To specify a filter on a path, use the `feature.network.incoming.http_filter.path_filter` configuration:

```json
{
  "feature": {
    "network": {
      "incoming": {
        "mode": "steal",
        "http_filter": {
          "path_filter": "my/path",
          "ports": [80, 8080]
        },
      }
    }
  }
}
```

Note that both `header_filter` and `path_filter` take regex value, so for example `"header_filter": "X-Header-.+: header-value-.+"` would work.

### Filtering out healthchecks using a negative look-ahead

The HTTP filters both take "fancy" regexes that support negative look-aheads.
This can be useful for avoiding the stealing of Kubernetes liveness, readiness and startup probes.

For filtering out any probes sent to the application by kubernetes, you can use this header filter,
to require a user-agent that does not start with "kube-probe":

```json
{
  "feature": {
    "network": {
      "incoming": {
        "mode": "steal",
        "http_filter": {
          "header_filter": "^User-Agent: (?!kube-probe)",
        }
      }
    }
  }
}
```

To avoid stealing requests sent to URIs starting with "/health/", you can set this filter:

```json
{
  "feature": {
    "network": {
      "incoming": {
        "mode": "steal",
        "http_filter": {
          "path_filter": "^(?!/health/)",
        }
      }
    }
  }
}
```

### Stealing HTTPS traffic with a filter

`feature.network.incoming.http_filter` allows you to steal a subset of HTTP requests. To apply the filter, the mirrord-agent needs to be able to parse the requests stolen from the target.
Most commonly, the incluster traffic is encrypted with TLS, but it is decrypted by a service mesh before it gets to the target service. In this case, mirrord is able to parse the requests out of the box.

However, in some cases the traffic is only decrypted by the target service itself. Using an HTTP filter in this case requires some additional setup. Check out the [HTTPS stealing guide](/docs/using-mirrord/steal-https/) for more information. Note that this HTTPS stealing requires mirrord Operator, which is part of mirrord for Teams. 

## What's next?
1. If your local process reads from a queue, you might want to test out the [copy target feature](/docs/using-mirrord/copy-target/), which temporarily creates a copy of the mirrord session target. With its `scaledown` flag it allows you to temporarily delete all replicas in your targeted rollout or deployment, so that none competes with your local process for queue messages.
2. If you don't want to impersonate a remote target - for example, if you want to run a tool in the context of your cluster - check out our [guide on the targetless mode](/docs/using-mirrord/targetless/).
3. If you just want to learn more about mirrord, why not check out our [architecture]({{< ref "/docs/reference/architecture" >}} "architecture") or [configuration]({{< ref "/docs/reference/configuration" >}} "configuration") sections?
