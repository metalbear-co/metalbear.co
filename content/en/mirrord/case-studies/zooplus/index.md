---
title: "mirrord Case Study: zooplus"
description: "Engineers at zooplus save up to 20% of their time daily by using mirrord to test changes in seconds instead of deploying to remote clusters"
lead: "Engineers at zooplus save up to 20% of their time daily by using mirrord to test changes in seconds instead of deploying to remote clusters"
url:  mirrord/case-study/zooplus
date: 2025-08-22T06:00:00+00:00
draft: false
weight: 10
feed:
  title: "How zooplus engineers work up to 20% faster with mirrord"
  logo: "demo-zooplus.png"
  quote: >
      “Just imagine—you can immerse yourself in the cluster. You become the application. And everything around you just works.”
header:
  title: 'How zooplus engineers work up to <span class="text-primary">20% faster</span> with mirrord'

  description: "Engineers at zooplus save up to 20% of their time daily by using mirrord to test changes in seconds instead of deploying to remote clusters."

  company: zooplus is the leading European online retailer for pet supplies, selling a wide range of pet food, accessories, and other products for pets like cats, dogs, and small animals. 
  site: zooplus.com
  logo: page-demo-zooplus.png
  employees: 1200+
  using_since: June 2024
story:
  content: Just imagine—you can immerse yourself in the cluster. You become the application. And everything around you just works.
  image: thomas-schneider.png
  name: Thomas Schneider
  position: Director of Platform Engineering & Technology Support | zooplus
---

## TL;DR

- zooplus engineers now save up to 20% of their time. Testing went **from 5–10 minutes per change to just seconds**.
- Developers test changes in production-like conditions from step one, leading to **fewer bugs and more confidence when releasing**.
- mirrord **expanded from a single use case to a go-to tool used across teams** for debugging, data workflows, and working with remote environments from a local setup.


## The challenge: Production became too complex to simulate locally


zooplus operates a high-scale, microservices-based online shop across nearly 30 European markets. Over time, the architecture evolved into a distributed system with many components individually developed by product engineering teams and a shared digital foundation platform.

As the number of microservices increased and cross-cutting features like CDN, content assets and single sign-on moved to managed infrastructure, it became increasingly difficult to mock these components in a local development setup. This shift complicated local testing of a single microservice and slowed development workflows, highlighting the need for a different strategy and tool.


> “That was the key use case, but there are so many functionalities offloaded to the infrastructure... the boilerplate became more complex to maintain than the actual development.”

As a solution, zooplus’ CI would spin up a full-blown testing environment for every feature branch. To test a single microservice, developers would either use this environment, which led to slow roundtrips, or try to recreate the full infrastructure locally with partial mocks, which were unwieldy and a lot of effort to maintain.

Both options were expensive. Mocks were fragile and diverged from reality, and remote deploys broke developer flow and slowed feedback loops

As adoption of the new architecture increased, the friction became a real blocker.

> “We said if we can't solve this, it probably could be a showstopper. People simply wouldn’t adopt the new architecture because the developer experience wasn’t good enough.”


## The solution: Local development that mirrors a production-like environment

To solve this, zooplus’ architecture team started looking for a better approach. They needed a way for developers to run their services locally while interacting with real infrastructure components, like authentication, routing, and cloud-based systems, without having to recreate them.
That’s when they discovered mirrord.

mirrord let developers run local code in the context of their Kubernetes cluster, so they could connect to shared systems like Keycloak, validate access, and test end-to-end flows without mocks or deploy cycles.


> “mirrord was pretty fast the favorite candidate because it was super easy to handle and it fitted exactly for the purpose. It was just the right fit for the case we had and very simple to adopt.”



## The results: Faster feedback, higher-quality code, and more focused engineering time


### ~20% developers time saved every day

Before mirrord, developers had to deploy every code change to a remote dev cluster just to test it, a process that took 5–10 minutes each time and disrupted focus. With mirrord, they now test changes in seconds, directly from their local environment.

> “The alternative would have been: every single change you make has to be deployed, and then debugged. That takes five to ten minutes per action through CI/CD—and of course, it completely kills the flow of the developer.”

With mirrord, each developer got back 20% of their time every day. That’s time they now spend actually building, debugging, or shipping, instead of waiting.

### Higher confidence and fewer assumptions

Developers now test changes in realistic conditions. This helps them catch issues earlier and avoid bugs caused by mocked or incomplete setups.

> “If you have a local solution that’s so different from production, you make assumptions that don’t hold true when you deploy it.”

mirrord let developers work in a production-like environment from the very first step of the development cycle, leading to better and more frequent tests.


### One tool, many use cases

mirrord was first adopted to simplify local development in cases where developers relied on infrastructure that was difficult to replicate on their machines. But it quickly proved useful in many other scenarios, becoming a go-to tool for a wide range of development and debugging challenges. For example, zooplus’ data science team now uses mirrord for convenient local testing of new machine learning tasks connecting to a remote Apache Spark cluster. to work locally against a remote instance of Apache Spark.

> “We’ve found at least half a dozen additional use cases. It’s become this Swiss Army knife. Whenever a new problem comes up, the answer is often mirrord.”

Teams across engineering now use mirrord when they need to interact with remote environments during local development—without complex setup, incomplete mocks, or having to deploy code just to test it.
