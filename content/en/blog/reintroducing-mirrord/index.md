---
title: "(Re)Introducing mirrord"
description: "The War on the Long Dev Loop"
lead: "The War on the Long Dev Loop"
date: 2022-05-30T15:00:00+00:00
lastmod: 2022-05-30T15:00:00+00:00
draft: false
weight: 50
images: []
contributors: ["Eyal Bukchin"]
---
{{<figure src="mirrord.png" class="center">}}

## The Dev Loop (or: know your enemy)
{{<figure src="loop.png" class="center">}}

Imagine you’re a backend developer at post series B SaaS soonicorn. You’ve spent half a sprint adding a new feature to your microservice. You’ve thoroughly researched possible inputs and database states and built an elaborate test suite. Your code was mercilessly reviewed by two of your teammates. Finally, the tests pass, the pull request is approved, and as a final verification, you deploy your new code to the staging environment…

Where it crashes almost immediately. Turns out you forgot to test some obscure configuration, or some complex database state that would only ever occur on a mature, complex environment - like staging, and unlike your local machine.
So you roll the service back on staging, fix the bug, write some more tests, get it reviewed again, build the code, deploy it to staging… and it crashes again. While you were fixing the bug, your teammate deployed a new version of some other microservice - except they're not as thorough a tester as you are, and the new version is broken, so you can’t test your own service. You wait for them to roll their service back to a working version, the sprint is long over, and you’ve started on your next feature during your downtime so now you’re dividing your focus between two things.

The worst part being that you know it’s going to happen again next sprint.


 
## mirrord (or: how you win)
I’ve encountered some variation of the dev loop at every startup I’ve ever worked in, and it’s this pain exactly that we’re trying to solve with mirrord. mirrord runs in two places - on your local development machine, and in your staging environment. By wrapping your local process and hooking system calls, it lets you plug your process non-invasively into that service’s instance on the staging environment. 
Simply put, mirrord lets you run a local process in the context of your cloud service. This means you can test your code on staging, without actually deploying it there. Not only does it save you the hassle of deployment every time you make a change, but it also keeps the staging environment free from untested versions, and constantly usable for everyone else in the organization.
{{<figure src="diagram.png" >}}

 
## Getting Started (and: other practical info)
Today we’re releasing [mirrord 2.0](https://mirrord.dev), which supports incoming traffic. That means whatever traffic reaches your service in staging is duplicated by mirrord and sent to your local process. We’ll soon be adding support for outgoing traffic, file access, and environment variables - everything needed for your local process to “think” it’s running on the staging environment.
All you need to run mirrord is kubectl access to your staging environment[^1]. You can use it as either a CLI tool, or an extension for VS Code (IntelliJ support is on the way). Try it out [here](https://mirrord.dev), and let us know what you think at [hi@metalbear.co](mailto:hi@metalbear.co), or in our repo!


[^1]: note that mirrord doesn’t install anything persistent in your Kubernetes cluster. It runs a job that self-deletes when mirrord terminates.
