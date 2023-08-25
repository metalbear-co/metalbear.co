---
title: "The Traffic Police 🚨 - Controlling outgoing traffic with mirrord"
description: "Showcase of the outgoing traffic filter feature"
lead: "Introducing the new outgoing traffic filter feature for mirrord"
tags:
  - feature
  - mirrord
  - network
  - filter
  - traffic
date: 2023-08-24T0:00:00+00:00
lastmod: 2023-08-24T0:00:00+00:00
draft: false
weight: 50
images: []
contributors: ["Alexandre Cavalcante"]
---

So, you've been using mirrord to simplify your development process (if you haven’t, go [here!](https://mirrord.dev/)). Naturally, you want the traffic from the app you're debugging to go through the cluster environment, so your app can communicate with its _clustery_ pals. There is a problem though: your latest change adds some new columns to the database, and you don’t want to modify the database in the cluster and affect everyone else working on it. You do have a local instance of the database that you can modify, so your app can use that, but you still want it to talk to all the other components in the cluster.  So what now? The new **outgoing traffic filter** feature is here to solve exactly this type of problem!

With the new filter, you can specify whether your app’s outgoing traffic should be sent locally or remotely based on its destination. If we take the example above, with the database running in the cluster as a service `app-db`, and locally with the same hostname, you can select which database your app will be talking to. Here is a sample `config.json` for this use case:

```json
{ 
  feature": { 
    "network": { 
      "outgoing": { "filter": { "local": ["app-db"] } } 
    } 
  } 
}
```

In this case, when your app tries to resolve the `app-db` hostname it’ll do so locally locally (instead of in-cluster), meaning that traffic which would normally go to the cluster’s `app-db` will be sent to your local database, while all other traffic (that doesn’t match the filter) will keep flowing as you expect, in the cluster. Isn’t this neat? Your cluster’s database remains unmodified, and you can keep working with the other services in your cluster. The filter supports multiple options, listed [here](https://mirrord.dev/docs/overview/configuration/#feature.network.outgoing.filter). 

Let's look at a more detailed example.

## The Setup 📋

The recipe for our example is as follows:

- 🥺 The `uwu-service` running in the cluster, which takes normal text and performs _uwuification_
- 😏 The `uwu-app` in-cluster, that sends normal messages to `uwu-service`, then writes the returned _uwu’d_ versions to a database. This is our target pod and the app we’re working on locally
- 😀 A `messages-db` database in the cluster, which the `uwu-app` normally writes to, but in our debugging session, we’re going to be using a local version of this database
- 😼 The local `uwu-app` we are currently working on
- 😺 A local `messages-db`, so our schema changes won’t affect devs that rely on the cluster’s `message-db`

Diagram with the services and traffic flow

{{<figure src="outgoing-traffic-filter.jpg" alt="Outgoing traffic filter diagram" height="100%" width="100%" class="zoomable">}}

Our flow here is as follows: 

1. The `uwu-app` pod receives an HTTP request from the outside world;
2. mirrord steals this request, forwarding it to the local `uwu-app`;
3. Next, the local `uwu-app` makes a POST HTTP request to the `uwu-service` in our cluster;
4. This request goes through the agent pod, before reaching the `uwu-service`;
5. `uwu-service` sends back an HTTP response with the _uwu’d_ version of the message;
6. The response comes through the agent back to our local `uwu-app`;
7. And finally, we save the new _uwu_ message to our local `messages-db`.

Under normal circumstances, the response from `uwu-service` would be written to the cluster’s `message-db` database, but the cluster database doesn’t comply with our new schema, so the write operation would just fail.

## The Example 💾

Our main issue is that we want our local app’s outgoing traffic to be sent both locally and remotely, depending on its destination. Let's see how mirrord helps us solve this.

We start out by running this command, which starts the `uwu-app` with mirrord:

- starts the `uwu-app` with mirrord

```sh
mirrord exec -f config.json ./uwu-app
```

Where `config.json`[^1] is just:

```json
{
  "target": “pod/uwu-app”,
  "feature": { 
    "network": { 
      "incoming": "steal", 
      "outgoing": { "filter": { "local": [":8888"] } }
    }
  }
}
```

[^1]: We're setting `incoming` traffic to `steal`, but mirrord also supports traffic `mirror`ing, and traffic `steal`ing with a filter. You can see all the options [here](https://mirrord.dev/docs/overview/configuration/#feature-network-incoming).

This is enough to start mirrord and the `uwu-app` that we want to test. You should see something like this:

```sh
⠧ mirrord cli starting...
 ⠧ exec
   ✓ ready to launch process
   ✓ layer extracted
   ✓ no operator detected
   ✓ agent pod created
   ✓ pod is ready
```

Our app is ready, and so is mirrord. Now we can make a request to the `uwu-app` pod and have it stolen by mirrord (traffic will be stolen from the cluster app to our local app). First let's get the `uwu-app` service port:

```sh
$ kubectl describe service uwu-app

Name:                     uwu-app
Port:                     <unset>  9999/TCP
TargetPort:               9999/TCP
NodePort:                 <unset>  30032/TCP
Endpoints:                10.244.0.6:9999
```

Now we can make a request using `curl`:

```sh
$ curl -d \
"Hey, are you enjoying mirrord? Why not star us on github? It would be very cool of you." \
-X POST  http://192.168.49.2:30032/uwu

Added new message
hey, 🥺 awe you enjoying miwwowd? 
why n-nyot staw us on g-github? 
it wouwd b-be vewy coow o-of you.
with id 0
```

And here are the logs from the local `messages-db`:

```sh
[DEBUG messages_db] store; 
new_message="hey, 🥺 awe you enjoying miwwowd? 
             why n-nyot staw us on g-github? 
             it wouwd b-be vewy coow o-of you."
[DEBUG messages_db]
return="Added new message hey, 🥺 awe you enjoying miwwowd?
                          why n-nyot staw us on g-github? 
                          it wouwd b-be vewy coow o-of you. 
        with id 0"
[INFO  actix_web::middleware::logger] 127.0.0.1 "POST /store/0 HTTP/1.1" 200 129 "-" "-" 0.000243
```

The cluster’s `messages-db` doesn’t even know that any of this ever happened! The logs there are so clean you could see your own reflection, meaning that no traffic ever hits the remote `messages-db`. 
To recap what happened: 
We captured incoming traffic from the remote `uwu-app` and sent it to our local app instead 
Our local `uwu-app` sent a request to the cluster’s `uwu-service` and got back its uwufied version. 
Finally, our local app wrote the uwufied message to a local `messages-db`. 

Without mirrord, you would either need to run everything locally, including the `uwu-service` that turns normal messages into _uwu’d_ versions, or deploy your `uwu-app` changes to the cluster, and potentially mess it up for the other devs.

With mirrord you don’t have to choose. You can have youw cake and eat it t-too!!

## The Feature 🔃

With the new outgoing traffic filter feature (say it fast 3 times), you can pick and choose from where outgoing traffic is sent from. Paired with other mirrord features, such as the incoming HTTP traffic filter, you get unprecedented control over how your app communicates with your cluster.

The example we just saw was really small, but you can imagine if the app we’re working on had to talk with a bunch of services, how painful it would be to set up everything locally, or how messy it could get if everyone had to take turns using the shared environment, just because the code writes to the same database. The outgoing traffic filter makes it easy to test changes on your shared environment without impacting the rest of your team. No more going around asking your colleagues if anyone needs to use the database in the next couple of hours..

## Get mirrord 🪞

Ready to improve your workflow? Want to start using the outgoing traffic filter? Check out the [new configuration](https://mirrord.dev/docs/overview/configuration/#feature-network-outgoing) and start using it today!

What? You're not using mirrord?! You have to deploy every small change, just so you can test it in cloud conditions? Let me stop you right there! Just download and install mirrord, and test your code in the context of your Kubernetes environment, right from the comfort of your own local machine. You can get it from [here](https://mirrord.dev/), what are you waiting for?

Here is a [quick start guide](https://mirrord.dev/docs/overview/quick-start/) link. Want to talk to an actual human? Then hop in our [Discord](https://discord.gg/metalbear) (no chatbots here, I promise). Prefer more asynchronous communication? Open up an [issue](https://github.com/metalbear-co/mirrord/issues/new/choose) or a [discussion](https://github.com/metalbear-co/mirrord/discussions/new/choose) on [GitHub](https://github.com/metalbear-co/mirrord). We love feedback, don’t be shy!
