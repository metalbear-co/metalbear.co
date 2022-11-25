---
title: "Getting Started With Ephemeral Containers"
description: "Getting started with Ephemeral Containers, and a short case study on how we used them with mirrord"
lead: "Getting started with Ephemeral Containers, and a short case study on how we used them with mirrord"
tags:
  - metalbear
date: 2022-07-21T0:00:00+00:00
lastmod: 2022-07-27T0:00:00+00:00
draft: false
weight: 50
images: ["mirrord-ephemeral-blog-thumbnail.png"]
contributors: ["Mehul Arora"]
---

If you’re following the latest news on Kubernetes, you probably would have heard about Ephemeral Containers. Not sure? Fear not! In this blog post we will try to shed some light on this new feature soon to be stable[^1] in Kubernetes v1.25.

## What are Ephemeral Containers?

[Ephemeral containers](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/) let us run a container with a specific image in the context of an already running container in a Pod. This comes in handy when debugging/troubleshooting distroless images or images that lack certain utilities, where `kubectl exec` won’t be helpful.

```bash
bigbear@metalbear:~/mirrord$ kubectl exec -it py-serv-deployment-686578cbfb-9hfpw  -- sh
# tcpdump
sh: 1: tcpdump: not found
```

Let’s look at a few examples of how one might go about debugging with ephemeral containers -

I will create a new deployment using this file -

<details>
  <summary>app.yaml</summary>

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
          env:
            - name: MIRRORD_FAKE_VAR_FIRST
              value: mirrord.is.running
            - name: MIRRORD_FAKE_VAR_SECOND
              value: "7777"

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

</details>

```bash
kubectl apply -f app.yaml
```

List the deployments -

```bash
bigbear@metalbear:~/mirrord$ kubectl get pods
NAME                                  READY   STATUS        RESTARTS   AGE
nginx-deployment-66b6c48dd5-gmfc7     1/1     Running       0          7m7s
py-serv-deployment-686578cbfb-lb9g7   1/1     Running       0          5s

```

Attach an ephemeral container to the pod -

```bash
bigbear@metalbear:~/mirrord$ kubectl debug -it py-serv-deployment-686578cbfb-lb9g7 --image busybox
Defaulting debug container name to debugger-hthnc.
If you dont see a command prompt, try pressing enter.
/ #
```

### Sending Requests

Since we have access to a the network namespace of the Pod, we should be able to send a GET request using curl/wget utilities, which would not be available on a distroless image -

```bash
/ # wget localhost:80
Connecting to localhost:80 (127.0.0.1:80)
saving to 'index.html'
index.html           100% |*******************************************************************************************|    28  0:00:00 ETA
'index.html' saved
/ # ls
bin         dev         etc         home        index.html  proc        root        sys         tmp         usr         var
/ # cat index.html 
OK - GET: Request completed
/ # 
```

### Inspecting Network Traffic

Inspecting network traffic using `tcpdump` -

```bash
bigbear@metalbear:~/mirrord$ kubectl debug -it nginx-deployment-66b6c48dd5-jn5xg  –image=itsthenetwork/alpine-tcpdump -- sh
                                                               
Defaulting debug container name to debugger-mzrzj.
If you dont see a command prompt, try pressing enter.
/ # tcpdump -i any port 80
tcpdump: data link type LINUX_SLL2
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on any, link-type LINUX_SLL2 (Linux cooked v2), snapshot length 262144 bytes
17:05:43.439189 eth0  In  IP 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868 > nginx-deployment-66b6c48dd5-jn5xg.80: Flags [S], seq 875432214, win 64240, options [mss 1418,sackOK,TS val 4271915566 ecr 0,nop,wscale 7], length 0
17:05:43.439214 eth0  Out IP nginx-deployment-66b6c48dd5-jn5xg.80 > 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868: Flags [S.], seq 497388640, ack 875432215, win 65160, options [mss 1460,sackOK,TS val 946582667 ecr 4271915566,nop,wscale 7], length 0
17:05:43.440148 eth0  In  IP 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868 > nginx-deployment-66b6c48dd5-jn5xg.80: Flags [.], ack 1, win 502, options [nop,nop,TS val 4271915567 ecr 946582667], length 0
17:05:43.440151 eth0  In  IP 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868 > nginx-deployment-66b6c48dd5-jn5xg.80: Flags [P.], seq 1:304, ack 1, win 502, options [nop,nop,TS val 4271915567 ecr 946582667], length 303: HTTP: GET / HTTP/1.1
17:05:43.440466 eth0  Out IP nginx-deployment-66b6c48dd5-jn5xg.80 > 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868: Flags [.], ack 304, win 507, options [nop,nop,TS val 946582668 ecr 4271915567], length 0
17:05:43.440630 eth0  Out IP nginx-deployment-66b6c48dd5-jn5xg.80 > 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868: Flags [P.], seq 1:239, ack 304, win 507, options [nop,nop,TS val 946582669 ecr 4271915567], length 238: HTTP: HTTP/1.1 200 OK
17:05:43.440707 eth0  Out IP nginx-deployment-66b6c48dd5-jn5xg.80 > 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868: Flags [P.], seq 239:851, ack 304, win 507, options [nop,nop,TS val 946582669 ecr 4271915567], length 612: HTTP
17:05:43.441058 eth0  In  IP 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868 > nginx-deployment-66b6c48dd5-jn5xg.80: Flags [.], ack 239, win 501, options [nop,nop,TS val 4271915568 ecr 946582669], length 0
17:05:43.441119 eth0  In  IP 10-244-3-10.addon-http-application-routing-nginx-ingress.kube-system.svc.cluster.local.37868 > nginx-deployment-66b6c48dd5-jn5xg.80: Flags [.], ack 851, win 501, options [nop,nop,TS val 4271915568 ecr 946582669], length 0

```

### Network Latency

Checking network latency with `ping`

```bash
/ #  ping localhost
PING localhost(localhost (::1)) 56 data bytes
64 bytes from localhost (::1): icmp_seq=1 ttl=64 time=0.024 ms
64 bytes from localhost (::1): icmp_seq=2 ttl=64 time=0.043 ms
64 bytes from localhost (::1): icmp_seq=3 ttl=64 time=0.043 ms
64 bytes from localhost (::1): icmp_seq=4 ttl=64 time=0.038 ms
64 bytes from localhost (::1): icmp_seq=5 ttl=64 time=0.044 ms
64 bytes from localhost (::1): icmp_seq=6 ttl=64 time=0.041 ms
64 bytes from localhost (::1): icmp_seq=7 ttl=64 time=0.037 ms
64 bytes from localhost (::1): icmp_seq=8 ttl=64 time=0.041 ms
64 bytes from localhost (::1): icmp_seq=9 ttl=64 time=0.047 ms
64 bytes from localhost (::1): icmp_seq=10 ttl=64 time=0.030 ms
64 bytes from localhost (::1): icmp_seq=11 ttl=64 time=0.061 ms
64 bytes from localhost (::1): icmp_seq=12 ttl=64 time=0.040 ms
^C
--- localhost ping statistics ---
12 packets transmitted, 12 received, 0% packet loss, time 11266ms
rtt min/avg/max/mdev = 0.024/0.040/0.061/0.008 ms
```

## How does it work?

Kubernetes schedules the given image to be run in the same namespaces as that of the selected container. This is very similar to what we do in [mirrord](https://github.com/metalbear-co/mirrord) manually, which we will discuss later. But let’s take a closer look at what namespaces are available to ephemeral containers.

Exec into the pod being debugged, list all the namespaces, and compare them to the ones set in the ephemeral container -

`py-serv` container inside the Pod -

```bash
bigbear@metalbear:~/mirrord$ kubectl exec -it py-serv-deployment-686578cbfb-lb9g7 -- sh
Defaulted container "py-serv" out of: py-serv, debugger-hthnc (ephem)
# ls -l proc/self/ns 
total 0
lrwxrwxrwx 1 root root 0 Jul 19 06:17 cgroup -> 'cgroup:[4026531835]'
lrwxrwxrwx 1 root root 0 Jul 19 06:17 ipc -> 'ipc:[4026532529]'
lrwxrwxrwx 1 root root 0 Jul 19 06:17 mnt -> 'mnt:[4026532532]'
lrwxrwxrwx 1 root root 0 Jul 19 06:17 net -> 'net:[4026532444]'
lrwxrwxrwx 1 root root 0 Jul 19 06:17 pid -> 'pid:[4026532534]'
lrwxrwxrwx 1 root root 0 Jul 19 06:17 pid_for_children -> 'pid:[4026532534]'
lrwxrwxrwx 1 root root 0 Jul 19 06:17 user -> 'user:[4026531837]'
lrwxrwxrwx 1 root root 0 Jul 19 06:17 uts -> 'uts:[4026532524]'
```

Newly created `debugger-tmdxk` ephemeral container in the Pod -

```bash
bigbear@metalbear:~/mirrord$ kubectl debug -it py-serv-deployment-686578cbfb-9hfpw --share-processes --image busybox
Defaulting debug container name to debugger-tmdxk.
If you dont see a command prompt, try pressing enter.
/ # cd ..
/ # ls -l proc/self/ns
total 0
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 cgroup -> cgroup:[4026531835]
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 ipc -> ipc:[4026532529]
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 mnt -> mnt:[4026532193]
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 net -> net:[4026532444]
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 pid -> pid:[4026532194]
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 pid_for_children -> pid:[4026532194]
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 user -> user:[4026531837]
lrwxrwxrwx    1 root     root             0 Jul 19 06:11 uts -> uts:[4026532524]
```

It looks like the ephemeral container has the same `cgroup`, `ipc`, `net`, `user`, and `uts` namespaces. It would make sense for the `mnt` namespace to not be available, because filesystems for both the ephemeral and the debugged container are different. `pid` namespace can be accessed by creating a copy of the pod as discussed in the documentation [here](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#debugging-using-a-copy-of-the-pod).

However, if the target container is specified explicitly, the ephemeral container has access to the pid namespace. This means we can access the filesystem of the debugged pod by referring to the root path as `/proc/1/root`

```bash
bigbear@metalbear:~/mirrord$ kubectl debug -it --target py-serv py-serv-deployment-686578cbfb-bh58v --image busybox
Targeting container "py-serv". If you don't see processes from this container it may be because the container runtime doesn't support this feature.
Defaulting debug container name to debugger-zfd64.
If you dont see a command prompt, try pressing enter.
/ # ps
PID   USER     TIME  COMMAND
    1 root      1:49 python3 app.py
   26 root      0:00 sh
   32 root      0:00 ps
/ # cd proc/1/root
sh: getcwd
(unknown) # ls
app    boot   etc    lib    media  opt    root   sbin   sys    usr
bin    dev    home   lib64  mnt    proc   run    srv    tmp    var
```

Let’s take a look at how these shared namespaces turned out to be useful for the purpose of mirroring traffic with mirrord!

## Case Study - mirrord 🤝 Ephemeral Containers

In our last [blog post](https://metalbear.co/blog/mirrord-internals-hooking-libc-functions-in-rust-and-fixing-bugs/), we discussed how network operations are handled by mirrord-layer, how subscription requests are sent to mirrord-agent when `listen` is called and that mirrord-agent is responsible for sending back traffic to mirrord-layer. Verbosely, mirrord-agent is shipped as a container image and runs with elevated permissions on the same node as the impersonated pod.

This idea is similar to the one described in [KEP-277: Ephemeral Containers](https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/277-ephemeral-containers/README.md#standalone-pod-in-shared-namespace-debug-pod).

Let’s look into the method we currently use to send traffic back to mirrord-layer.

### Kubernetes Jobs

Kubernetes lets you create Jobs that run Pods until their execution is complete. mirrord-agent, run as a Kubernetes Job now, needs to enter the container’s network namespace of the pod being debugged and have access to its root file system. In order to be able to do so, mirrord-layer has to infer the container runtime and spawn the Job with the container runtime and the container ID as command line arguments for the agent process.

We will spawn mirrord-agent using the spec below:

```json
{
               "metadata": {
                    "name": mirrord_agent_job_name,
                    "labels": {
                        "app": "mirrord"
                    }
                },
                "spec": {
                "ttlSecondsAfterFinished": config.agent_ttl,

                    "template": {
                "spec": {
                    "hostPID": true,
                    "nodeName": runtime_data.node_name,
                    "restartPolicy": "Never",
                    "volumes": [
                        {
                            "name": "sockpath",
                            "hostPath": {
                                "path": runtime_data.socket_path
                            }
                        }
                    ],
                    "containers": [
                        {
                            "name": "mirrord-agent",
                            "image": agent_image,
                            "imagePullPolicy": config.image_pull_policy,
                            "securityContext": {
                                "privileged": true,
                            },
                            "volumeMounts": [
                                {
                                    "mountPath": runtime_data.socket_path,
                                    "name": "sockpath"
                                }
                            ],
                            "command": [
                                "./mirrord-agent",
                                "--container-id",
                                runtime_data.container_id,
                                "--container-runtime",
                                runtime_data.container_runtime,
                                "-t",
                                "30",
                            ],
                            "env": [{"name": "RUST_LOG", "value": config.agent_rust_log}],
                        }
                    ]
                }
            }
        }
    }
```

mirrord-agent then uses the container runtime API to get the PID of the container and calls setns to enter the network namespace. Once it has entered the namespace, it sniffs the network packets and mirrors the traffic to a local port.

mirrord-layer, on successful creation of the agent, forwards the port on the pod and analyzes the traffic stream for responses.

### Ephemeral Containers

While the main intended use case for this feature is to let users troubleshoot/debug remote pod, we will use it to run mirrord-agent instead of Kubernetes Jobs, as ephemeral containers share common namespaces, such as the net namespace, and resource allocations with the debugged pod.

We will use the mirrord-agent container image for the ephemeral container and send traffic back to mirrord-layer. Let’s start by patching the `ephemeralcontainers` subresource using the spec below -

```json
{
        "name": mirrord_agent_name,
        "image": agent_image,
        "imagePullPolicy": config.image_pull_policy,
        "target_container_name": config.impersonated_container_name,
        "env": [{"name": "RUST_LOG", "value": config.agent_rust_log}],
        "command": [
            "./mirrord-agent",
            "-t",
            "30",
        ],
    }
```

After patching the subresource, mirrord-agent is able to send traffic to the port. We did not have to infer the container runtime or switch namespaces at the agent level to have access to network interface!

{{<figure src="mirrord-agent-traffic.png" alt="mirrord ephemeral containers vs Jobs" height="100%" width="100%">}}

For more info on how we used ephemeral containers, refer to this [Pull Request](https://github.com/metalbear-co/mirrord/pull/203).

## Conclusion

Ephemeral containers really do turn out to be super useful as they save the hassle of switching namespaces and interacting with various container runtimes. While Kubernetes Jobs needs to be privileged, we can easily get rid of the privileged security context when using ephemeral containers because we don’t need to mount the container runtime sockets.

It should be noted that, Kubernetes Jobs come with a TTL controller which enables deletion of resources created by the Job on completion. A similar feature for ephemeral containers could prove to be useful (we have a KEP in the works).

**Note:** This blogpost is updated on `July 27, 2022`. I found out through a [Twitter discussion](https://twitter.com/Mehulwastaken/status/1550228831398727680) that it is possible to have access to the pid namespace by specifying the target container explicitly.

[^1]: https://github.com/kubernetes/enhancements/issues/277
[^2]: https://kubernetes.io/docs/concepts/workloads/controllers/job/#ttl-mechanism-for-finished-jobs
