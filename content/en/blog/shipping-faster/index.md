---
title: "Enabling Developers To Ship Cloud-Native Applications Faster"
description: "For cloud-native applications, moving code from a developer’s local machine to a staging or testing environment is rarely straightforward. In this blog we'll learn about how mirrord changes that by shifting testing left."
lead: "For cloud-native applications, moving code from a developer’s local machine to a staging or testing environment is rarely straightforward. In this blog we'll learn about how mirrord changes that by shifting testing left."
tags:
  - development
  - kubernetes
  - testing
  - ci
  - ci/cd
  - pipelines
  - devops
date: 2025-05-13T00:00:00+00:00
draft: false
weight: 50
images: [thumbnail.png]
contributors: ["Arsh Sharma"]
slug: enabling-developers-to-ship-cloud-native-applications-faster
summary: "Learn how you can enable your developers to ship faster by avoiding slow CI loops with the help of mirrord."
canonicalURL: "https://metalbear.com/blog/enabling-developers-to-ship-cloud-native-applications-faster/"
---

For cloud-native applications, moving code from a developer’s local machine to a staging or testing environment is rarely straightforward. In a common setup, developers first commit their code to a version control system. Then, a CI system builds a container image with the latest changes. Finally, a CD system (like [Argo CD](https://argo-cd.readthedocs.io/en/stable/)) deploys that image to a [Kubernetes](https://kubernetes.io/) cluster. It is only after all of this that developers are able to test out their changes. This process, repeated multiple times per feature, can be really slow.

Of course, this isn’t the only workflow. Some teams use remote development environments where code is compiled directly in the cluster with file synchronization. Others spin up ephemeral environments in CI pipelines for automated end-to-end testing. From this variety of dev loops, it’s clear there’s no one-size-fits-all but in nearly every case, the friction from code-to-test remains a shared pain.

We built [mirrord](https://metalbear.com/mirrord/?utm_source=enabling-devs-blog&utm_medium=blog&utm_campaign=blogpost) to change that. mirrord *shifts testing left* by letting developers run their code in a real Kubernetes environment instantly, without needing to rebuild or redeploy. It allows developers to use a shared cluster for development, removing the need for isolated, costly personal environments. Instead of waiting for CI pipelines or clashing in shared dev or integration clusters, each developer can connect to the same Kubernetes environment and test their changes safely and independently. This avoids the usual environment collisions while reducing the iteration time from 15–30 minutes per change down to just a few seconds.

In this blog I’ll walk you through how this works!

## Problems With Shifting Application Testing Left

Shifting left in software development means moving processes (like testing) earlier in the development lifecycle. This approach helps catch issues early rather than later in the cycle. The earlier you identify issues, the easier they are to fix, and the faster you can ship. This is why more and more organizations today are recognizing the importance of enabling developers to test their code as early in the development cycle as possible. However, this is currently challenging for several reasons:

- Developers often lack the necessary Kubernetes expertise to deploy and test their code on a local cluster.
- Shared environments can cause delays. When staging is used for pre-release validation, it may be unavailable for testing other features. There’s also the risk of a developer’s code breaking something in the shared environment, leading to further delays.
- Setting up a separate environment for each developer to avoid these issues can be costly and create significant maintenance overhead.

## Shortening the Development Loop With mirrord

We built [mirrord](https://metalbear.com/mirrord/) to make developing modern applications significantly faster. It does so by allowing developers to test their code in a real Kubernetes environment without the need for repeated deployments, thus significantly shortening the development loop. Here’s how it works:

mirrord consists of two main components:

1. **mirrord-layer**: This is the local component that runs alongside your application process. It intercepts system calls made by the process locally and redirects them to the remote Kubernetes cluster.
2. **mirrord-agent**: This is the remote component that runs as a pod in your Kubernetes cluster. It handles the actual interaction with the cluster’s resources and communicates with the mirrord-layer.

When you start your application with mirrord, your local process is seamlessly connected to the Kubernetes environment. mirrord acts as a proxy between your machine and the cluster, intercepting and redirecting your application’s inputs and outputs so that it behaves as if it's running *inside* the cluster, even though it's still running locally. This gives your code access to real traffic, services, files, and configurations from the cluster without requiring any deployment.

Here’s how it works in detail:

- Incoming traffic to the target pod in the cluster is mirrored to your local process. This means you can test your changes with real traffic without affecting the actual pod or the staging environment.
- Outgoing traffic from your local process is routed through the mirrord-agent, making it appear as if it’s originating from the cluster. This also allows your local process to interact seamlessly with other services in the cluster without you having to run them locally.
- mirrord also allows your local process to [*steal*](https://metalbear.com/mirrord/docs/using-mirrord/steal/) some (or all) of the traffic coming to service you’re developing from the cluster. This means that you can have your locally written code answer requests coming to the staging endpoint and see how it behaves. We’ll soon see this in action in the next section.
- mirrord also redirects file reads and writes to the remote pod’s file system, ensuring that your local process interacts with the same files as the deployed application.
- It also merges the environment variables of the remote pod with those of your local process, ensuring that your application has access to the same configuration and secrets as it would in the cluster.

{{<figure src="mirrord-explain-pic.png" alt="mirrord explained" height="100%" width="100%">}}

All of this means that developers can test their code in a real world environment without the overhead of repeated deployments. Let’s walk through a step-by-step tutorial to see this in action!

## Preparing our Kubernetes cluster

The first thing you need to enable your developers to start using mirrord for development is to have a Kubernetes cluster ready. This cluster should already have the application your developers will be working on deployed. If you’re using a shared development, testing, or staging cluster, you're likely already set up for this. In addition to the application itself, the cluster also needs to have the [mirrord operator](https://metalbear.com/mirrord/docs/overview/teams/?utm_source=enabling-devs-blog&utm_medium=blog&utm_campaign=blogpost) installed.

For this blog, we’ll use a classic todo list application as our example. It includes a React frontend, a Node.js backend, and a PostgreSQL database. You can find the code, along with the Kubernetes manifests needed to deploy it, in [this GitHub repository](https://github.com/RinkiyaKeDad/todolist).

> Make sure to deploy an ingress controller on the cluster before deploying the app. I used the [nginx-ingress-controller](https://artifacthub.io/packages/helm/bitnami/nginx-ingress-controller), but you can use any alternative that you prefer.

### Installing the mirrord Operator

To install the mirrord operator, you’ll first need a license key. You can generate one from your [MetalBear account](https://app.metalbear.com/account/login?utm_source=enabling-devs-blog&utm_medium=blog&utm_campaign=blogpost). Once you have your key, follow these steps to install the operator on your cluster:

> Don’t forget to update the `license.key` field in `values.yaml` with your actual license key before installation.

```bash
$ helm repo add metalbear https://metalbear-co.github.io/charts
$ curl https://raw.githubusercontent.com/metalbear-co/charts/main/mirrord-operator/values.yaml --output values.yaml
$ helm install -f values.yaml mirrord-operator metalbear/mirrord-operator 
```

The mirrord operator is what enables multiple developers in your organization to connect to the same cluster at the same time and use it for development while avoiding any clashes. Each developer gets an isolated path to develop and test their changes. This eliminates the need to duplicate infrastructure or spin up costly, time-consuming ephemeral environments.

## Developing a Microservice With mirrord

Once your cluster has both the application and the mirrord operator installed, your developers are ready to start developing against it. Here’s what our deployed todo list application looks like:

{{<figure src="todolist-without-del.png" alt="todo list app without delete button" height="100%" width="100%">}}

Right now, if you’ll see, there’s no way for users to delete their added todos. Imagine you’re a frontend developer tasked with adding a “delete” button next to each todo item. You’ve written the code for this feature and are ready to test it. 

But here’s the catch: the frontend depends on a backend API, the database, and other shared environment configuration. All of this isn’t available locally. So traditionally, you’d have to commit your code, wait for the CI process to complete, and then deploy it to the staging environment. You’d then be able to test the feature, possibly run some end-to-end (e2e) tests, and if you find bugs, you’d repeat the entire process. This cycle can be time-consuming and frustrating. We built mirrord so you can avoid all of that!

### Installing the mirrord CLI

The first thing you need to do is install the mirrord CLI on your local machine. mirrord also offers [extensions](https://metalbear.com/mirrord/docs/overview/quick-start/#vs-code-extension) for various code editors, but for this tutorial, we’ll focus on the CLI. 

You can install the CLI on macOS by running:

```bash
brew install metalbear-co/mirrord/mirrord
```

For other platforms, detailed instructions can be found in our [documentation](https://metalbear.com/mirrord/docs/overview/quick-start/). We’ve made the setup experience with mirrord as frictionless as possible. You should be able to get started in under 5 minutes.

Once installed, you’ll need the name of the target deployment in the Kubernetes cluster running the frontend service.

> The [GitHub repo](https://github.com/RinkiyaKeDad/todolist) for the todo list app has [Helm charts](https://helm.sh/) along with instructions on how to deploy the application to a cluster!

{{<figure src="deployment-list.png" alt="list of deployments" height="100%" width="100%">}}

For us, that’s `client`.

### Running Your Application With mirrord

Once we know which pod is running the service we want to connect to, we can simply run the following command to launch the `mirrord-agent` pod on our staging cluster and start testing our changes:

> Before you do this make sure to navigate to the `client` folder locally and run `npm install` to install dependencies.

```bash
(todolist/client) $ mirrord exec --target deployment/client npm start
```

Running the above command starts the client (frontend) service locally while mirroring traffic from the target deployment in the Kubernetes cluster. This allows you to test your changes in a real environment without actually deploying them.

When you interact with this service (currently running on `localhost`), you might notice that adding a todo item or the delete functionality doesn’t work. That’s because the application is designed to be accessed via an ingress URL, specifically, the staging [FQDN](https://www.f5.com/glossary/fqdn) configured in the ingress resource. On top of that the code for the delete functionality is also currently commented out. 

To test the app as intended, we’ll access it through its staging URL, where both services are deployed behind the ingress. However, by default, mirrord only mirrors traffic to your local machine while the original pod continues serving requests. If we want to test our newly written changes on the staging URL, we need our locally running code to handle incoming requests instead of the pod. This can be done by enabling [steal mode](https://metalbear.com/mirrord/docs/using-mirrord/steal/).

### Enabling Steal Mode

As a frontend developer, you shouldn’t have to run the backend or database services locally to test your changes. Instead, you can leverage the ones running in the staging environment.

To do this, enable the `steal` mode in mirrord. This mode allows your local code to serve requests reaching the pod running in the staging cluster. 

To enable steal mode, create the following mirrord configuration file at the root of the repo:

```json
# mirrordconfig.json
{
  "target": "deployment/client",
  "feature": {
    "network": {
      "incoming": "steal"
    }
  }
}
```

Now, run the following command to test your local code in the staging environment:

> If you're following this tutorial step by step, make sure to add the code responsible for the delete functionality. You'll find it commented out in [these lines here](https://github.com/RinkiyaKeDad/todolist/blob/main/client/src/components/ListTodos.js#L45-L65).

```bash
(todolist/client) $ mirrord exec -f=../mirrordconfig.json npm start
```

And voila! Now, when you visit the URL where the application has been deployed on the staging cluster (for me, that’s `staging.arshsharma.com` in the screenshot), you’ll notice that the code that’s actually serving those requests is the one on our local machine which has the delete functionality!

{{<figure src="todolist-with-del.png" alt="list of deployments" height="100%" width="100%">}}

You can now test this feature, play around with it, or even run e2e tests against the staging URL like you would normally. All of this without having to commit or deploy your code!

## Faster Development Loop With mirrord

I think you can now start to see how mirrord significantly speeds up the traditional development loop by reducing the time it takes for developers to test their code. Being able to connect your local code to a staging environment instantly allows developers to catch and fix bugs much faster. Here’s what a developer’s workflow can look like with mirrord:

- Write code – Make changes to your application locally.
- Start mirrord – Run `mirrord exec` to connect your local process to the staging environment.
- Test instantly – See your changes live, interacting with real services and traffic without redeploying.
- Debug and iterate – Identify and fix issues faster by testing in a real environment.
- Commit and deploy – Once everything works as expected, push your changes and move forward with the confidence that things won’t break :)

So if you’re ready to enable your team to ship faster [try mirrord for free](https://metalbear.com/mirrord/docs/overview/teams/) or [reach out to us](https://metalbear.com/mirrord/demo/)—we’d love to help you level up your dev workflow!
