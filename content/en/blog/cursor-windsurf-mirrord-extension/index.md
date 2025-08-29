---
title: "Accelerating AI-Assisted Development With mirrord"
description: "Learn how to accelerate AI-assisted development by testing AI-generated code instantly in production-like environments using the mirrord extension for Cursor and Windsurf."
lead: "The mirrord extension for Cursor and Windsurf lets you test AI-generated code in realistic Kubernetes environments without deployments or CI pipelines, dramatically speeding up developer velocity."
slug: "cursor-windsurf-mirrord-extension"
tags:
  - AI
  - Developer Experience
  - Kubernetes
  - Cursor
  - Windsurf
categories:
  - kubernetes
  - developer-tools
  - ai
date: 2025-07-24
summary: >
  The mirrord extension for Cursor and Windsurf eliminates the bottleneck in AI-assisted development by letting you test AI-generated code instantly in production-like Kubernetes environments. Instead of waiting for CI pipelines and deployments, you can run your local code directly in the cluster context, accessing real environment variables, files, and services. This dramatically speeds up iteration cycles and increases confidence in AI-generated code before shipping it.
canonicalurl: "https://metalbear.co/blog/cursor-windsurf-mirrord-extension"
draft: false
weight: 50
images:
  - thumbnail.png
contributors:
  - "Arsh Sharma"
---

AI code editors like Cursor and Windsurf are rapidly gaining popularity. Having used them personally, I can confidently say how big of an impact they have in helping developers ship faster and be more productive. But  working with them is an iterative process— most of the time they don’t get things right on the first try, and you have to do some back and forth until your code is production-ready. Sometimes it's a lot of back and forth.

This means the effectiveness of AI-generated code depends heavily on the quality of feedback you give it. And the closer your testing environment is to the real thing, the better feedback you can provide, and the more confident you can be that the code actually works.

This is where the mirrord extension for Cursor and Windsurf can be really helpful!

## The Problem with Today’s AI Dev Workflows

Here’s what the development loop looks like today when using AI code editors:

- Developers use code editors like Cursor or Windsurf to generate code.
- They run basic tests locally (checking if the code compiles, self-contained tests like unit tests, etc.)
- They then push their code to CI or directly to staging in order to test it in a realistic production-like environment
    - This usually takes between 5-20 minutes to complete (sometimes more!)
- If the tests fail, they have to give the AI agent new feedback and repeat this entire process again.

The bottleneck in this dev loop is having to commit code and wait for pipelines and deployments in order to test your code in a realistic environment. This makes iterating on AI-generated code slow and frustrating, especially since for complex applications AI-generated code rarely works perfectly the first time.

But if you could test your code in a production-like environment the moment it gets generated, you’d eliminate this bottleneck and iterate much faster!

## Introduction to mirrord

mirrord is a tool designed to simplify testing by running your local code directly in the context of your Kubernetes cluster. It achieves this by seamlessly mirroring incoming and outgoing traffic between the cluster and your local environment. With mirrord, your local process can also access environment variables, files, and other resources directly from the cluster. As a result, your locally running code "believes" it's running in the actual cloud environment, enabling you to realistically test it under production-like conditions without the long wait times associated with CI pipelines and repeated deployments.

{{<figure src="mirrord.png" title="How mirrord works" alt="How mirrord works" height="100%" width="100%">}}

mirrord provides code editor extensions for popular AI code editors like Cursor and Windsurf. These extensions allow you to instantly run your AI-generated code in a realistic environment without deploying or waiting for CI.

Let's see how to set this up with Cursor (Windsurf follows similar steps).

## Testing AI-Generated Code With mirrord

For this example, we'll use a sample application called the `ip-visit-counter`. This app has an endpoint which, when you send a request to it, shows how many times it has received a request from your IP address along with a message. 

Most organizations have apps deployed on a production cluster and a staging (or integration or pre-prod) cluster. The staging cluster is where you usually deploy to before releasing to production to verify that everything is working as expected. mirrord lets you connect to this staging cluster (or any other Kubernetes cluster you use for testing) and safely test your local code there without any deployments or fear of breaking the environment for others.

I’ve already deployed the `ip-visit-counter` app to a Kubernetes cluster, and it's accessible at the `playground.metalbear.dev` endpoint. If you want to follow along, the Kubernetes manifests to deploy this app are available in the [GitHub repository](https://github.com/metalbear-co/playground). You can also use any other application you have deployed in a local or remote cluster.

### Get the mirrord extension

Once you've cloned the IP visit counter application and opened it in Cursor, go to the Extensions marketplace and search for “mirrord.”

{{<figure src="mirrord-extension.png" title="mirrord Extension for Cursor" alt="mirrord Extension for Cursor" height="100%" width="100%">}}

Install the extension, and you'll see the mirrord icon appear at the bottom of your editor window.

{{<figure src="mirrord-ext-icon.png" title="mirrord Extension's icon in Cursor" alt="mirrord Extension's icon in Cursor" height="100%" width="100%">}}

You can enable mirrord by clicking this icon.

### Making a code change

Before we make a code change, I want to give you some context about our application. This is what the architecture of the app looks like:

{{<figure src="app-architecture.png" title="Architecture of the IP Visit Counter app" alt="Architecture of the IP Visit Counter app" height="100%" width="100%">}}

We’ll be working with the `ip-visit-counter` service which does the following:

- Reads configuration from environment variables and loads custom response text from a file specified in the `responsefile` environment variable.
    ```go
    func loadConfig() Config {
        viper.BindEnv("port")
        viper.BindEnv("redisaddress")
        viper.BindEnv("responsefile")
        // omitted some code

        config := Config{}
        config.Port = int16(viper.GetInt("port"))
        config.RedisAddress = viper.GetString("redisaddress")
        config.ResponseFile = viper.GetString("responsefile")
        // omitted some code

        return config
    }
    ```
- When a client makes a request to the `/count` endpoint, the service extracts the client's IP address, increments a counter stored in Redis, and calls the `ip-info` service via HTTP to get some extra information about the IP.
- It responds with JSON containing the request count and a message (which is read from a file located at the path stored in `responsefile`).

This is what the response currently looks like:

```bash
$ curl playground.metalbear.dev/count 
{
  "count": 2,
  "info": {
    "ip": "45.41.300.115",
    "name": "Unknown"
  },
  "info2": {
    "ip": "45.41.300.115",
    "name": "Unknown"
  },
  "text": "REMOTE is fun!hi"
}
```

Now let’s ask Cursor to change this response to include some more info which might be useful for the user. Here’s the prompt I entered: “Change the response of this service to include more info which might be relevant for the user.”

Instead of showing you all the updated code, I asked Cursor to give me a summary of all the changes it made so you have an idea of what the new features look like:

- Enhanced response structure – Added a comprehensive `EnhancedResponse` struct with detailed sections for request metadata, system information, performance metrics, service health, and IP analysis
- Performance monitoring – Implemented timing measurements for all external service calls (Redis, Kafka, SQS, gRPC, HTTP) to track latency and response times
- System information collection – Added memory usage statistics, uptime tracking, Go version info, environment detection, and hostname retrieval
- Service health checks – Created helper functions to monitor the health status of Redis, Kafka, SQS, and IP info services with proper error handling
- IP address analysis – Implemented functions to classify IP addresses (private, loopback, localhost), detect IP version (IPv4/IPv6), and extract geolocation/ISP data
- Request metadata capture – Enhanced request tracking with user agent, headers, tenant info, request ID, and client port information

TLDR: a bunch of new stuff has been added by Cursor, and the problem that now arises is that I have no way to test this code out locally. Since this service depends on a bunch of other things—environment variables from the cluster, files in the cluster, Redis, other microservices running—there is no way for me to easily test out this code, because I can’t run it locally. Traditionally, I would have to commit this and wait for the deployment to staging to finish before being able to test out the response by sending a request to the staging endpoint.

But with mirrord, we can avoid all that :)

### Using mirrord to Test AI-Generated Code

By default, mirrord mirrors traffic from the cluster to your local code, but the original service in the cluster continues responding to requests. Since we want to directly test our local service's response as well, we need to enable [steal mode](https://metalbear.co/mirrord/docs/using-mirrord/steal).

Edit the configuration file at `./ip-visit-counter/mirrord.json` to look like this:

```json
{
    "feature": {
        "network": {
            "incoming": {
                "mode": "steal"
            },
            "outgoing": true
        },
        "fs": {
            "mode": "read"
        }
    }
}
```

- Setting `"incoming": "steal"` tells mirrord to intercept incoming traffic to the remote pod and forward it directly to your local process. Your local process will then respond directly, as if it were running within the cluster.
- `"outgoing": true` allows your local code to make outgoing network requests as if it were inside the cluster (e.g., to services like Redis or other microservices in the cluster).
- `"fs": { "mode": "read" }` lets your local process read files from the remote pod’s file system (useful for loading config files, like the `responsefile` we discussed earlier, which is needed by this application).

After creating this config file, running mirrord is pretty simple:

- Click the mirrord icon at the bottom of Cursor.
- Go to Run and Debug in Cursor and start the IP visit counter service.
- Select the target deployment/pod whose traffic you want to steal when prompted by mirrord.

Now, when you make a request to your staging endpoint, it will reach your locally running service. Because of mirrord, the local service will have access to the remote Redis and `ip-info` service, and will be able to execute the full flow and finally send back the response with the AI-made changes:

```json
$ curl playground.metalbear.dev/count 
{
  "count": 2,
  "text": "REMOTE is fun!hi",
  "info": {
    "ip": "45.41.300.115",
    "name": "Unknown"
  },
  "info2": {
    "ip": "45.41.300.115",
    "name": "Unknown"
  },
  "request_metadata": {
    "ip": "45.41.300.115",
    "user_agent": "curl/8.7.1",
    "request_method": "GET",
    "request_path": "/count",
    "timestamp": "2025-07-22T17:21:30.275991+05:30",
    "headers": {
      "Accept": "*/*",
      "Connection": "Keep-Alive",
      "User-Agent": "curl/8.7.1",
      "Via": "1.1 google",
      "X-Cloud-Trace-Context": "89631882d9d5711036729925fbf76c91/9510015082428973964",
      "X-Forwarded-For": "45.41.300.115, 31.140.55.141",
      "X-Forwarded-Proto": "http"
    }
  },
  "system_info": {
    "service_name": "ip-visit-counter",
    "version": "1.0.0",
    "uptime": 65970225041,
    "go_version": "go1.24.3",
    "memory_usage": {
      "alloc": 3181520,
      "total_alloc": 3880376,
      "sys": 12274704,
      "num_gc": 1
    },
    "redis_ttl": 120000000000,
    "environment": "development",
    "hostname": "Arshs-MacBook-Air.local"
  },
  "performance": {
    "response_time": 9622739000,
    "redis_latency": 532891459,
    "kafka_latency": 1001398583,
    "sqs_latency": 413500375,
    "grpc_latency": 6720680292,
    "http_latency": 675085292
  },
  "service_health": {
    "redis": "healthy",
    "kafka": "healthy",
    "sqs": "healthy",
    "ip_info": "healthy",
    "ip_info_grpc": "healthy"
  },
  "ip_analysis": {
    "is_private": false,
    "is_loopback": false,
    "is_localhost": false,
    "ip_version": "IPv4",
    "geolocation": "Unknown",
    "isp": "Unknown"
  }
}
```

This lets you quickly test AI-generated code changes against your production-like environment. Once you’re satisfied, you can confidently commit your changes and let them go through your normal CI process - but since you've already tested against staging, you'll probably go through it just once.

I think you can now see how much faster you can iterate when using mirrord with AI code editors like Cursor and Windsurf. Being able to test your AI-generated code in a realistic environment as soon as it gets generated is a game changer for dev productivity. You skip the 10–15 minutes you would traditionally waste per iteration and also avoid the repeated context switching.

## Ship AI-Generated Code Without Bottlenecks

To sum up what we discussed in this blog, today’s AI-assisted dev workflows face significant bottlenecks due to slow CI pipelines and limited access to realistic testing environments. mirrord fixes these problems by letting you test AI-generated code instantly in real, production-like conditions. This dramatically speeds up development and increases your confidence in the code your AI generates.

So if you’re ready to embrace the full potential of AI-assisted development, try out the mirrord extension for Cursor and Windsurf, or [book a call](https://metalbear.co/mirrord/demo/) if you’d like to learn more!