---
title: "Scalable Developer Environments Strategy | Metal Bear"
description: "Best practices for scaling dev environments using microservices, automation and environment parity. Make your developer workflow faster and reliable."
lead: "Using mirrord to close the gap between Dev & Prod"
tags:
  - metalbear
  - mirrord
  - kubernetes
  - devops
  - devenv
  - devx
  - devcontainers
  - vscode
  - cloudflared
  - tailscale
  - k3s
  - minikube
date: 2024-01-02T0:00:00+00:00
lastmod: 2023-12-21T0:00:00+00:00
draft: false
weight: 50
images: ["cover.webp"]
contributors: ["Tanjim Hossain"]
---

> Cross-posted from [https://audacioustux.com/Scaling-Out-Development-Environment-ceb823260a1f4a10b717a87e998480de](https://audacioustux.com/Scaling-Out-Development-Environment-ceb823260a1f4a10b717a87e998480de)

Once upon a time, there was LAMP Stack… **L**inux, **A**pache, **M**ysql, **P**hp/**P**ython/**P**erl - That’s what I’ve used to start my Software Engineering journey. Things were simple, in a sense that there were less “options” to choose from. But today, I have to deploy multiple types of databases, event store + processing pipeline, and other behemoths to work on my application locally.

Well, maybe I can use docker-compose to keep things clean and tidy, re-producible for the other team members, but what about the compute resources usage? I don’t know about the M2/M3 users out there, but my Linux laptop either halts or burns my lap.

So, how ‘bout I offload some of the compute intensive stuff to a remote machine, or maybe the cloud? Although, that introduces some other factors like cloud cost, internet connectivity… what if you have an old machine laying around in your house? That’s exactly what I did at some point.

But there’re still questions and issues…

1. **Reproducibility:** So, you have all the containers with their configurations specified in a docker-compose file, great! All the platform needs, including the other services you have as dependencies (if you’re into ~~micro~~-services) are now accessible to your application, and reproducible with a simple `docker compose up`. Boom, done! But what about the CLI tools, desktop apps, IDE extensions, and so on? Maybe you or your teammates each have multiple machines for their development work. It’s not only the platform, or the application you’re working on that should be containerized, but also the whole **Dev Environment!**
2. **Dev-Prod Parity:** Are you willing to sacrifice the [Twelve-Factor App Methodology](https://en.wikipedia.org/wiki/Twelve-Factor_App_methodology)

    because of the constraints you have in your local dev setup? Not so ideal, right? In this day & age, typically your app should be ready for multi-instance deployment, or even multi-region for HA. It’s hard to anticipate what would happen in that kind of production dynamic, if you only ever deployed a single instance of the app in a docker compose manifest. Also, if your target deployment platform is Kubernetes (EKS, K3s, AKE, GKE, OKE, CIVO etc.), why docker compose!? why docker!? why containers!? ahem… ok, I’ll explain the last one, I promise 🤞

3. **CNCF Landscape & Kubernetes:** Have you seen the [CNCF Landscape](https://landscape.cncf.io/)?

    Yah, it’s massive! But my point is, many of those tools are not very easy to configure in simple compose files. They may not have any detail of the required setup, other than just a Helm or Kubernetes manifests. That means you’ll face some issues if your application architecture is not too simple, or the tools you use are from a recent generation.

4. **Change-Build-Test (CBT) Performance:** How do you containerize your app for the dev environment? Maybe you don’t do that, and instead use port bindings to expose all the dependencies you have on other services, and access them from your app, running as a local process. So, there’re 4 options here:
    1. Build your app locally, copy the final artifact to a container image (using COPY in Dockerfile for example).<br> **Cons:** Increased container build context sync time - due to the nature of build artifacts (e.g., large in size, hard to sync only the delta of the change) <br>**Pros:** Potentially re-uses the local artifacts that your IDE may have already created, reducing redundant work!
    2. Sync codebase (mount) inside container. In this case, the hot-reload kind of stuff is intended to happen inside the container. This may not work in Windows machines though, due to some issues with filesystem event propagation to the container from the host (not sure if the issue is now fixed or not). <br>**Cons:** significant amount of redundant work by the IDE, and process (e.g., compiler, bundler, etc.) inside the container on each code change. <br>**Pros:** only the particular changed file can be synced, greatly improves the feedback loop in case the container runs on a remote host.
    3. Using Tilt, Skaffold, etc. Tilt for example [can be used to combine of both (a) and (b)](https://docs.tilt.dev/example_java.html) <br>**Cons:** debugging can be hard in certain languages and runtimes - due to the fact that the application process runs inside the container. <br>**Pros:** Fast enough feedback loop / CBT cycle, whether the deployment target resides on the same machine or remote (remote k8s cluster or docker context)
    4. No containerization. <br>**Cons:** hard to match production environment <br>**Pros:** bare-minimal overhead

I think we should talk / discuss more about the development environments of our software, it’s no less important than the production environment, and we should strive to improve it as much as possible. In the beginning, it may feel like waste of time… but in the end, it may still look the same 😅, because the way we take things for granted, and tend to not be seeing how past actions leads to the present. As I have to work in DevOps / Platform Engineering stuff, I had to solve some of dev environment issues not as “optional” but “mandatory” things. In the rest of this post, I’ll introduce or explain some of the tools and approaches that made my life much easier. Also, I think most of it can be applicable in a whole organization scale and save a lot of paid employee hours!

## Kubernetes for Dev

---

Kubernetes, without any doubts, has a steep learning curve. Not everyone involved in a project should be well-versed in 100s of CRDs and yaml manifests!

> Kubernetes is a platform for building platforms. It's a better place to start; not the endgame.
>
> \- Kelsey Hightower (@kelseyhightower) Nov 27, 2017

But after all these years, people still write Deployment, Service, Ingress manifests manually, under-utilizing projects like Kubevela(OAM)… anyway, that’s a different long discussion. This post is only about Dev Env & Dev Experience (DevX), and the first question someone may ask, WHY!? and the context of the question is I think obvious… if you’re working on a single application or ~~micro~~-service, what’s the point of bringing all the overhead that comes with Kubernetes? Yes, [K3s](https://k3s.io/), [minikube](https://minikube.sigs.k8s.io/docs/) (with docker driver) like lightweight Kubernetes distributions are there, but still, it sounds like an overkill.

Firstly, I don’t think the compute overhead is significantly higher than what you would have with docker-compose. a bare minimal k3s or minikube setup (without metrics collection) may have 3-4 extra containers, each having very reasonable purpose (e.g., DNS resolve, K8s Api server, etc.) and don’t use much CPU or Memory in idle state. Also, a single k8s cluster can be shared among multiple developer for multiple projects dev stage workloads - with namespace level isolation or using [vCluster](https://www.vcluster.com/) like tools. That opens up the possibility to share large resource intensive deployments among projects, and more closely reach dev-prod parity.

The other thing is the learning curve. That’s a very valid argument but, ideally you should have simple interface to deliver your software like OAM, Knative like manifests, or K8s CRD - instead of having to deal with platform specific details. More precisely, we should build and use Software Delivery Platform (SDP) and make it forbidden to access K8s cluster directly. So, the learning curve should not be there, ideally.

- **K3d vs Minikube vs etc.**

    Well, personally I use Minikube. I couldn’t see much difference to consider k3d, as both have similar features (e.g., multi-node support) and lightweight. Minikube is much mature, and I faced no significant issue so far. I’ve tried other distributions in past 5+ years (e.g., microk8s, kind, rke2, etc.) for local Kubernetes setup, but I’m quite happy with minikube so far till now.

- **It takes too much resource on my local machine!**

    If you’re on Windows or Mac - yes, there’re some extra overhead. Some people may not have enough compute power on their dev machine even if using Linux. That’s this post is about anyway! The “Scaling-Out” aspect of the Dev Environment. But that’s something I’ll talk about in more detail, connecting all the dots, a bit later down in this post, stay with me 🙂

## mirrord FTW

---

One of the first problem of switching to K8s would be, now the feedback loop of your application changes takes too long. With Tilt, that can be reduced in great extent, but not the same as building and running the application as a local process. That’s where mirrord comes into play! [mirrord](/mirrord/)

Tilt helps you to take your application closer to the platform, on the other hand, mirrord brings the platform closer to the application. As a result, it becomes much easier to debug application, integrate with IDEs, avoid redundant compute usage.

You may use the vscode extension for mirrord, or the CLI directly.

- **mirrord CLI example**

    Here, If I run `task cargo:dev` mirrord will steal all the traffic coming to the target deployment and forward them to the application (written in rust in this case). Any outgoing request from the application will be resolved in context of the deployment. That means cluster local IP addresses and DNS resolves will work as expected, and all the environment variables passed to the deployment is available to the process running locally!

    ```yaml
    # https://taskfile.dev/usage/
    version: "3"

    tasks:
      # cargo check for failing fast on build time errors
      cargo:check:
        cmds:
          - touch .trigger # add .trigger in .gitignore
          - cargo watch -x check -s 'touch .trigger'
        internal: true
      cargo:watch :
        cmd: >-
          mirrord exec -f .mirrord/mirrord.json -- cargo watch
          --no-vcs-ignores -w .trigger
          -x 'run'
        internal: true
      cargo:dev:
        deps:
          - cargo:check
          - cargo:watch
    ```

    ```json
    {
        "target": {
            "namespace": "billing",
            "path": {
                "deployment": "billing-api"
            }
        },
        "feature": {
            "network": {
                "incoming": "steal",
                "outgoing": true
            },
            "fs": "local",
            "env": true
        },
        "agent": {
            "startup_timeout": 300
        }
    }
    ```

    ```yaml
    kind: Deployment
    apiVersion: apps/v1
    metadata:
      name: billing-api
    spec:
      selector:
        matchLabels:
          app: billing-api
      strategy:
        type: RollingUpdate
        rollingUpdate:
          maxSurge: 0
      template:
        metadata:
          labels:
            app: billing-api
        spec:
          containers:
            - name: billing-api
              image: billing-api
              imagePullPolicy: Always
              ports:
                - name: http
                  containerPort: 8080
              env:
                - name: PROMETHEUS_SVC
                  value: "http://kube-prometheus-stack-prometheus.monitoring.svc.cluster.local:9090"
                - name: KNATIVE_SERVING_SVC
                  value: "http://knative-serving-eventsource-svc.argo-events.svc.cluster.local:2750"
                - name: DATABASE_URL
                  valueFrom:
                    secretKeyRef:
                      name: billing-db-app
                      key: uri
              startupProbe:
                httpGet:
                  path: /liveliness
                  port: http
                failureThreshold: 30
                periodSeconds: 10
              livenessProbe:
                httpGet:
                  path: /liveliness
                  port: http
                periodSeconds: 10
              readinessProbe:
                httpGet:
                  path: /readiness
                  port: http
                failureThreshold: 3
                periodSeconds: 20
              resources:
                requests:
                  memory: "500Mi"
                  cpu: "1"
                limits:
                  memory: "1Gi"
                  cpu: "2"
              securityContext:
                allowPrivilegeEscalation: false
                capabilities:
                  drop:
                    - ALL
    ```

## DevContainers and GH Codespaces

---

> A development container (or dev container for short) allows you to use a container as a full-featured development environment. It can be used to run an application, to separate tools, libraries, or runtimes needed for working with a codebase, and to aid in continuous integration and testing. Dev containers can be run locally or remotely, in a private or public cloud, in a variety of [supporting tools and editors](https://containers.dev/supporting).
>
>
> The Development Container Specification seeks to find ways to enrich existing formats with common development specific settings, tools, and configuration while still providing a simplified, un-orchestrated single container option – so that they can be used as coding environments or for continuous integration and testing. Beyond the specification's core metadata, the spec also enables developers to quickly share and reuse container setup steps through [Features](https://containers.dev/features) and [Templates](https://containers.dev/templates).
>

[Development containers](https://containers.dev/)

So, in other words - with devcontainer you can containerize the whole development environment, including the CLI tools, IDE extensions, and modularize settings to be re-usable in multiple projects! You can also run minikube or k3s inside devcontainer.

That basically means, you can move your dev environment from one machine to another, send it to a remote VM instance or machine, or use [GitHub Codespaces](https://github.com/codespaces). Also, you can now ship a pre-configured dev env for everyone who’re willing to contribute to the project, that may have already a k8s cluster setup (either using minikube, or KUBECONFIG to access a remote cluster).

As a result, on-boarding time should go significantly down!

I’ve already written a blog on devcontainers in the past, hope that helps someone completely new to this: [Getting Started with Devcontainer](https://audacioustux.com/Getting-Started-with-Devcontainer-c727dbf9d56f4d6b9b0ef87b3111693f)

## Tailscale & Cloudflare Tunnel

---

I’ve mentioned about remote machine access multiple times till now in this post. That can be some central server rack in a company, or some local machine. In either case, you may require some VPN solution. Tailscale is great (I’ve only used for my personal use). [ZeroTrust](http://zerotier.com) is another alternative you may want to check out. In simple words, with tailscale, you can access any machine, even if that isn’t accessible directly with an IP from the internet.

But tailscale kinds of things require you to setup a client on both side and connected with an account. If you want a locally running application to be accessible to everyone on the internet, Http tunneling tools like [Ngrok](https://ngrok.com/), [Cloudflared](https://github.com/cloudflare/cloudflared) is what you’re looking for.

- **Expose any service, pod with Cloudflared**

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      labels:
        app: cloudflared
      name: cloudflared-deployment
    spec:
      replicas: 2
      selector:
        matchLabels:
          pod: cloudflared
      template:
        metadata:
          creationTimestamp: null
          labels:
            pod: cloudflared
        spec:
          containers:
            - command:
                - cloudflared
                - tunnel
                - --metrics
                - 0.0.0.0:2000
                - run
              args:
                - --token
                - $(TUNNEL_TOKEN)
              image: cloudflare/cloudflared:latest
              name: cloudflared
              envFrom:
                - secretRef:
                    name: cloudflare-config
              # create cloudflare-config secret with token `kubectl create secret generic cloudflare-config --from-literal=TUNNEL_TOKEN=<token>`
              livenessProbe:
                httpGet:
                  path: /ready
                  port: 2000
                failureThreshold: 1
                initialDelaySeconds: 10
                periodSeconds: 10
    ```

## Epilogue

---

I know there’re scopes for a lot of misinterpretations. I’ve not mentioned managed services like lambda or other eco-systems / platforms / paradigms, maybe have put too much emphasize on Kubernetes. There’s this “conciseness” vs “preciseness” balance, that I face hard time to deal with. I encourage the readers (including you) to ask questions if there’s any doubts, queries, questions, and connect with me personally!
