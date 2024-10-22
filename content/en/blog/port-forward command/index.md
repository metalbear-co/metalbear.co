---
title: "There and Back Again: Port Forwarding with mirrord"
description: "Understanding and using the mirrord port-forward command to redirect traffic."
lead: "Understanding and using the mirrord port-forward command to redirect traffic."
tags:
  - open-source
  - devtools
  - startup
  - mirrord 
  - port-forward
images: []
date: 2024-10-21T14:00:00+00:00
lastmod: 2024-10-21T14:00:00+00:00
draft: false
weight: 50
contributors: ["Gemma Tipper"]
---

### Port forwarding in the wild

Port forwarding via SSH, also called SSH tunneling, is a method for communicating securely over an insecure connection. In this way sensitive info can be transmitted over the internet, for example to access your company's testing environment data from home.

{{<figure src="ssh-port-forwarding.png" alt="diagram of SSH port forwarding" height="100%" width="100%">}}

More recently, port forwarding might also refer to `kubectl port-forward`, allowing the user to forward traffic into a Kubernetes cluster from a local port by going through the Kubernetes API. This is a faster way to access a pod without having to write special configuration to set up ingress or a service, but is generally considered “just good enough” for lightweight debugging.

### Port forwarding with mirrord

That's cool, but what if you want something more robust and flexible in terms of permissions? Maybe a way to piggyback on the existing permissions of a pod you already have, allowing you to access anything that the pod can (like a specific microservice only accessible by that pod, an external third-party API or a managed database)? The answer is that you can use mirrord's new port-forward command. Let's explore how it works and then dive into a practical example.

Port forwarding in mirrord leverages the existing mirrord client-agent architecture to forward data coming to local ports to a remote one - each TCP data stream gets translated into mirrord-protocol messages that get sent to the agent in your cluster and then onwards to the specified remote port. A similar process happens in reverse to return the response.

At the implementation level, you can see that this conversion happens by using individual [tokio](https://tokio.rs/) tasks for each stream and a control loop, referred to as PortForwarder's “main loop”, to handle interactions with the agent and ensure all of the components are healthy. These tasks communicate with the main loop using MPSC channels, bringing the total up to four separate conversions between stream/channel types. Of course, from the perspective of the local process and the remote peer, it simply appears as if there is a TCP stream to send and receive data on.

{{<figure src="mirrord-port-forwarding.png" alt="diagram of mirrord port forwarding" height="100%" width="100%">}}

### Back it up, bucko

You're not even limited by which direction you can forward traffic, because mirrord can do it both ways. When forwarding in reverse (backwarding?), mirrord establishes a connection with the agent and eagerly steals or mirrors traffic (according to your configuration file, if provided) at a specified target port, channels it through the agent, and sends to your preferred local destination.

There are a few differences between the two directions of forwarding - that the lazy connections of regular forwarding differ from the eager strategy in reverse, and that reverse port forwarding requires a target pod to be set explicitly, whereas regular port forwarding can run in [targetless mode](https://mirrord.dev/docs/using-mirrord/targetless/). It is also only possible to specify the network configuration when reverse forwarding, allowing you to choose between mirroring, stealing or filtered stealing mode. You can read more about this in [the docs](https://mirrord.dev/docs/using-mirrord/port-forwarding/).

Other than that, the only difference is in the internal mechanism - in the code, reverse forwarding leverages the IncomingProxy struct rather than custom tokio tasks to communicate with the local machine. The forward and reverse PortForwarder tasks run at the same time, meaning you can specify as many forward and/or backward routes as you want in the same command, and mirrord will handle it all without complaint.

### Comparing mirrord and kubectl

If kubectl port-forward already exists, what are the advantages of using mirrord instead?

|                                          | mirrord                                                           | kubectl                         |
| ---------------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| **forwarding direction**                 | local to remote and remote to local                               | local to remote only            |
| **permissions**                          | inherited from the target pod                                     | requires separate configuration |
| **possible number of forwarding routes** | as many as you need in either direction                           | one per command                 |

### Just tell me how to use it already

Enough theory, let's see how to actually forward some data. We're only going to try out regular port forwarding here rather than reverse port forwarding, but they're similar enough that using the reverse will be just as simple.

Requirements: 

- **mirrord CLI**, at least version 3.114.0 ([install here](https://mirrord.dev/docs/overview/quick-start/#cli-tool))
- a Kubernetes **cluster** in which you have sufficient permissions - this tutorial uses a minikube instance ([install here](https://minikube.sigs.k8s.io/docs/start/))

Firstly, we need to deploy a suitable app that can receive and respond to a message. You can do so with the following manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: py-serv-deployment
  labels:
    app: py-serv
spec:
  replicas: 1
  selector:
    matchLabels:
      app: py-serv
  template:
    metadata:
      labels:
        app: py-serv
    spec:
      containers:
        - name: py-serv
          image: ghcr.io/metalbear-co/mirrord-pytest:latest
          ports:
            - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: py-serv
  name: py-serv
spec:
  ports:
    - port: 80
      protocol: TCP
      targetPort: 80
      nodePort: 30000
  selector:
    app: py-serv
  sessionAffinity: None
  type: NodePort
```

Save this manifest to your machine and use `kubectl apply -f path/to/file.yaml`- if you run `kubectl get pods` you should see something like this:

{{<figure src="kubectl-get-pods.png" alt="terminal output for the command kubectl get pods" height="100%" width="100%">}}

You'll need the name of the pod later, so you can assign it to an env variable now with `export PODNAME='py-serv-deployment-xxxxx-xxxxx'` with your own pod's name.

You will also need the address to forward to, so have a look with `kubectl get pods -o wide`, under the IP column. Assign this address to a variable for later along with the port (port 80 was specified in the manifest earlier), in my case: `export REMOTE_ADDR='10.244.5.193:80'`.

Finally before we start running mirrord, you need a local port to send data to. Ports with higher port numbers are more likely to be available, so I'll use 9000: `export LOCAL_PORT='9000'`. If you pick a port that is in use, you'll get an error that says as much, so return to this step and choose something else.

At last, the magical step! Run the port-forward command:

`mirrord port-forward -t pod/$PODNAME -L $LOCAL_PORT:$REMOTE_ADDR`

In another window, you can now send a request to the local port and have it forwarded to the py serv instance; an empty cURL request is enough: `curl localhost:<local_port>`:

{{<figure src="curl-localhost.png" alt="terminal output for the command curl localhost:$LOCAL_PORT" height="100%" width="100%">}}

Hey! The request got an OK response! That means the server got our request and managed to send something back, all through mirrord. If you don't believe me, have another look at those logs with `kubectl logs $PODNAME`:

{{<figure src="get-logs-after.png" alt="terminal output for the command kubectl logs $PODNAME" height="100%" width="100%">}}

On that final line we can see the log that was emitted when processing the request. You can also forward multiple ports at once by using multiple `-L` arguments. So there we go, it's as easy as that to use mirrord's new port-forward command.

### In conclusion

And that's all there is to it: mirrord port-forward is an alternative to kubectl port-forward for accessing your cluster locally. It offers more options for what you can access and allows for multiple ports to be forwarded with the same command. You can read the official documentation for this feature [here](https://mirrord.dev/docs/using-mirrord/port-forwarding/). Happy forwarding!

### It's close, but I need something slightly different...

Maybe all of these features are sounding good but they don't quite fit your use case - if you like the look of hijacking pod permissions and combining your local and remote environments to speed up development, check out mirrord's other commands like [the standard mirrord exec command](https://mirrord.dev/docs/overview/introduction/) or [the mirrord container command](https://mirrord.dev/docs/using-mirrord/local-container/). If you're not sure, jump into our [Discord server](https://discord.gg/metalbear) and ask!
