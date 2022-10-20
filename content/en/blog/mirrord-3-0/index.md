---
title: "mirrord 3.0 is out!"
description: "Our biggest release yet is now available for download"
lead: "Our biggest release yet is now available for download"
date: 2022-10-20T06:00:00+00:00
lastmod: 2022-10-20T06:00:00+00:00
draft: false
weight: 50
images: []
contributors: ["Eyal Bukchin"]
---

Today we’re very excited to launch the first full, stable version of mirrord! Full because it’s the first version where mirrord completely wraps your process in the context of your Kubernetes cluster - it connects everything, from network traffic to file access to environment variables, so that you can keep running your process from the familiar comfort of your local environment, but with input, configuration, and state from the cloud.

Heard enough? Get started [here](https://mirrord.dev/docs/overview/quick-start/) (or on [GitHub](https://github.com/metalbear-co/mirrord)).

## What is mirrord?
mirrord is the cornerstone of a new development workflow, one with dramatically shorter feedback loops. In the old days you would code your microservice on your local machine, test it with unit tests, fixtures and mockups, and only then deploy it to your organization’s staging environment where it would run in the cloud for the first time; with mirrord the staging environment is always there at your fingertips, and your code can meet the cloud as soon as it’s written.

Here’s what it looks like in the CLI:

`mirrord exec -–target pod/app-pod-wwv47 node app.js`

Your local process (`node app.js`[^1] in this example) is now connected to the pod `app-pod-wwv47` in your Kubernetes cluster. Here’s what this means:
* Incoming traffic to the pod is mirrored to your local process
* Outgoing traffic from your local process is tunnelled through the pod, using the remote pod’s DNS
* Environment variables from the pod are imported to your local process
* File access from your local process is proxied to the pod

Or in other words: **your process still runs locally, but it thinks it’s running in the cloud**.

mirrord is **free and open-source** and takes about ten seconds to install. When you run your process with mirrord, it takes about five seconds to plug it into your cloud environment. It requires no prior configuration or installation in your cluster - all it needs is access to your Kubernetes cluster. And when it shuts down, it leaves absolutely no trace.

 [^1]: Read [here](https://mirrord.dev/docs/overview/faq/#what-frameworkslanguages-does-mirrord-support) about what languages are supported. Don’t see yours on the list? Let us know!
## What’s next?
You might have noticed that, when suggesting that every developer in the organization plug into the shared staging environment on a regular basis, we’ve conveniently ignored one important word: shared. Though using mirrord is already less disruptive than actually deploying your service to the staging environment, it can still mutate the cluster in unwanted ways. This is what we’re planning to tackle next:
* Highly granular configuration of what happens remotely and what happens locally. For example, you’ll be able to read from a database remotely but write locally, filter out certain host names from remote access, even block network requests based on rules.
* [Copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write) functionality for various databases
* Advanced access control through our upcoming cloud solution

## Try it out!
* Give mirrord a try [here](https://mirrord.dev/docs/overview/quick-start/) - it’s free and self-serve
* Tell us about your experience: you can open an issue on [GitHub](https://github.com/metalbear-co/mirrord/issues), reply to our [feedback thread](https://github.com/metalbear-co/mirrord/discussions/598), or talk to us on [Discord](https://discord.gg/pSKEdmNZcK)
* If you’d like to support mirrord, star it on [GitHub](https://github.com/metalbear-co/mirrord) or vote for it on [ProductHunt](https://www.producthunt.com/posts/mirrord)
