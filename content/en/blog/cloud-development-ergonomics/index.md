---
title: "Approaches in Cloud Development Ergonomics"
description: "Where we discuss the ways modern devtool companies are trying to make life easier for cloud developers."
lead: "Where we discuss the ways modern devtool companies are trying to make life easier for cloud developers."
date: 2022-10-26T0:00:00+00:00
lastmod: 2022-10-26T0:00:00+00:00
draft: false
weight: 50
# images: ["mirrord-ephemeral-blog-thumbnail.png"]
contributors: ["Eyal Bukchin"]
---
The advent of microservice architectures and cloud-native has taken some pretty severe tolls on developer ergonomics. It feels as if the tools cloud developers have at their disposal haven’t evolved fast enough to keep up with the rapid progress in infrastructure, and this tool debt is readily apparent in the day-to-day of the modern developer. 

The clearest example of this is that it’s now **really hard to just run your application**. Not the one microservice you’re currently working on, but your actual entire application, which you ultimately deploy to the cloud and serves your customers. You used to be able to fire up your monolith right there on your laptop from within your IDE (crash, change some code, run it again), but architectures today have become resource-intensive, reliant on third-party services, and mostly just plain convoluted to the point where local execution is no longer a viable option.

{{<figure src="ergonomics.jpg" class="center large-width">}}

When we talk about something as elementary as running your application, it naturally applies to many aspects of the developer’s day-to-day: debugging, testing, even just writing new code to see if it works. Therefore, solutions that make your application even a little easier to run provide significant value, just by affecting so many routine activities.
In this article, we’re going to discuss today’s dominant approaches to making microservice applications easier for developers to run, and we’re also going to make the case for our [own thing](https://mirrord.dev) - namely, a single shared environment in the cloud that the organization maintains, and that developers can plug in and out of non-intrusively as they develop their microservices.

## Contemporary Cloud Development Workflows
In the frictionless microservice utopia, the development workflow goes something along these lines:
* Microservices are independent and new functionality can be developed one microservice at a time 
* Microservices talk to each other via well-defined contracts which can be tested in isolation
* Databases, queues, and third-party services consumed by a microservice also expose a consistent and well-defined contract, and as such can be mocked for testing purposes

In other words, a service can be tested on its own, and then deployed to the production environment where it would play nicely with all the other components.

However, let's assume you’re a microservice developer who doesn’t work in an organization where everyone designs perfect contracts and writes rigorous tests (or they do, but the third-party managed services you rely on don’t). When writing new code, you probably make as much progress as you can within the scope of the one or two microservices you’re working on at the moment, but then you do one or more of the following:
* Wrangle your entire application - microservices, databases and all - to run on your local machine
* Deploy your new code to a personal persistent/ephemeral development environment in the cloud 
* Deploy your new code to a shared staging environment and test it there

### Run Locally
This approach works great when it’s feasible, which is usually at a very early stage in the life of the application where it’s still small and tenable. There’s some tooling that lets you extend this honeymoon phase by letting you do it more easily, like [docker-compose](https://docs.docker.com/compose), [Skaffold](https://skaffold.dev), or [Tilt](https://tilt.dev). However, at a certain point, even if you’ve written whatever scriptage is needed to actually configure and run the latest stable version of all of your components together, you’re going to hit some sort of ceiling: if you’ve got a large database, or some CPU-heavy computations, or you’re relying on some managed service that can’t be containerized, this approach soon becomes untenable.

{{<figure src="local.png" alt="Run Locally" class="center large-width">}}

**Pros:**
* Convenient development on your local machine
* No reliance on network or external services

**Cons:**
* Difficult/impossible for large applications (ones with e.g. many microservices, a large database, high bandwidth usage)
* Doesn’t support hard-to-containerize components, like managed services


### Personal Cloud Environment
With Infrastructure as Code at its current state of maturity, it’s now easier than ever to replicate microservice environments in the cloud. This unlocked a new approach of having a personal production-like cloud environment for every developer, which they can use freely and in isolation. It comes in two flavors - persistent environments, or ephemeral environments created on demand with products like [Okteto](https://okteto.com) or [Bunnyshell](https://bunnyshell.com) (also sometimes called Environment as a Service)[^1]. This approach overcomes the resource limitations of the local environment but substitutes them for some new difficulties:
* For persistent environments, cost (determined by the size of the environment times the number of developers) becomes a factor. As the company grows, so do its architecture and the number of developers, leading to soaring cloud bills
* To generate state, database seed files are used. These need to be maintained so they don’t become stale
* You have to work against a cloud environment, which isn’t always fun (though some tools make it easier, like [GitHub Codespaces](https://github.com/features/codespaces) or [Gitpod](https://www.gitpod.io/))
* Same as with running your application locally, having hard-to-containerize components in your architecture like managed services can make this approach unfeasible.

{{<figure src="personal.png" alt="Personal Cloud Environment" class="center large-width">}}

**Pros:**
* Not capped by the hardware limitations of your development machine
* Better simulation of your production environment

**Cons:**
* No production-like database state
* Local changes have to be synced to the cloud
* Doesn’t support hard-to-containerize components, like managed services


### Shared Cloud Environment
A lot of organizations have already put in the effort of setting up a single, shared production-like environment for testing - the staging environment. It’s persistent and has already been set up manually to include all components, including third-party services, databases with full state (some companies even automatically stream data from production), and all the microservices. In terms of simulating production, it’s hard to do much better.

However, since this environment is shared by multiple developers, some measures are usually in place to keep it stable - for example, you can only actually deploy new code through the CI, often meaning you have to wait for a code review and your entire suite of automated tests to run (not to mention the deployment script itself) before it actually gets there. Even then, the tests aren’t perfect, and sometimes you end up deploying broken code and corrupting the environment, much to the chagrin of your fellow developers.

This is where shared environment tools like [Telepresence](https://telepresence.io/) and [CodeZero](https://www.codezero.io/) can help. They assume you're only working on one or two microservices anyway, and running them locally is not an issue. These tools let you connect your local service to the staging environment, replacing the service currently running in the cluster, without deployment. The code you're working on runs locally, and its dependencies run in the cloud. Not only can you keep working on your local environment, you can iterate on testing against your cloud environment without waiting for lengthy CI and deployment processes.

{{<figure src="shared.png" alt="Shared Cloud Environment" class="center large-width">}}

**Pros:**
* Leverage a single shared environment, making it feasible for you to manually set up database state and managed services (since you only have to do it once, for one environment)
* You can still work locally within your IDE
* Code changes happen locally, so iterations are fast (no need to deploy to the cloud)

**Cons:**
* One developer can break the environment for the others
* If the environment is corrupted, it’s hard to recover


## The Sell
So local setups are easy to use but don’t support large deployments; personal cloud environments support large deployments but don’t really reflect production, don’t support components that can’t be containerized, and cost a lot; and shared environments reflect production for cheap, but don’t really support concurrency without sacrificing stability.

[mirrord](https://mirrord.dev) lets you have all of these cakes and eat them too. We essentially took the shared environment approach and tacked on isolation. We do this by:
* Letting developers mirror incoming traffic rather than just intercept it. This lets multiple developers work on the same service in the cloud, while the service is still running and handling requests.
* Giving developers fine-grained control over what happens locally and what happens remotely. This way, for example, incoming traffic mirroring and file reads can happen remotely, but outgoing traffic and file writes can be local. Future versions of mirrord will include more advanced modes of configuration, letting users filter by e.g. hostname or protocol.
* In future versions, supporting advanced features like copy-on-write for databases.
* In our upcoming cloud solution, providing RBAC, letting the organization control which teams have access to which parts of the staging environment.

By using mirrord, developers can run the one service they’re working on locally, without juggling configurations or straining their development machine; they can run it against a full environment with mature database state and managed services; and they can do it quickly, easily and without risk. 

We’ve recently released our [first stable version](https://metalbear.co/blog/mirrord-3.0-is-out/), and would love to hear your thoughts (on [GitHub](https://github.com/metalbear-co/mirrord) or [Discord](https://discord.gg/pSKEdmNZcK)).

[^1]: It can also be supplemented with a cloud development environment, as provided by products like Gitpod or Codespaces. For a comprehensive survey of the non-localhost space see this excellent article.  


