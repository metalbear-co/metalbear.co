---
title: "Writing a Kubernetes Operator/Controller"
description: "Basic introduction to Kubernetes Operators and Controllers, with a tutorial on creating an Operator in Rust"
lead: "Get up and running with Kubernetes operators in (hopefully) minutes!"
tags:
  - kubernetes
  - operator
  - APIService
date: 2023-03-01T0:00:00+00:00
lastmod: 2023-03-01T0:00:00+00:00
draft: false
weight: 50
contributors: ["Dmitry Dodzin"]
---
As part of mirrord For Teams, we wanted to build a persistent component that would run in our user’s cluster and synchronize independent uses of mirrord. It quickly became apparent that we needed a component that was both:

1. **Kubernetes-native** - meaning it leverages the Kubernetes APIs and ecosystem
2. **Cluster-synchronized** - Manage and synchronize the use of our open-source project, mirrord, from the cluster’s point of view.

Some research pointed us in the direction of the Kubernetes Operator/Controller pattern.
The operator pattern can be quite ambiguous, and we found the guides that currently exist for it to be quite dense and technical. In this post, I want to instead take a step-by-step approach and provide a quick start for newcomers looking to explore the operator pattern.

## Why would you need to write an operator/controller?
On many occasions, the Deployment or StatefulSet at the core of your product will not be self-sufficient but need to access other resources in the cluster. For example, it might need to share a persistent volume across deployments, read a certificate from a Secret, or rely on a headless service for discovery logic. These can be achieved through manual configurations or using a Helm chart or Kustomize template, but then your component is poorly abstracted, so prone to misconfiguration by your users and harder to update.

Using a Kubernetes operator/controller can make it easier for your users to setup and configure your product on their cluster. Let’s illustrate this with an example: [CockroachDB](https://www.cockroachlabs.com/) is a sharded database with a Postgres-compatible API. Unlike PostgreSQL, it has some safety features enabled by default like requiring SSL encrypted connections for writes, so to deploy CockroachDB you would theoretically need to create and maintain a certificate for each of its Deployments on your Kubernetes cluster. For this reason, they created cockroach-operator. Once installed, a new resource named CrdbCluster becomes available. Whenever the user wants to create a new CockroachDB cluster, they now only have to create a new CrdbCluster object, and the [cockroach-operator](https://github.com/cockroachdb/cockroach-operator) takes care of the rest. 

## Operator vs. Controller

A **controller** is a software component that tracks Kubernetes objects and interacts with them. The objects themselves are managed by Kubernetes itself. For example, Admission Controllers watch new objects being created and enforce policies on them. The objects the controller manages can be existing objects, or new ones you add by using CustomResourceDefinition. Note that the controller is a pattern. It doesn’t dictate how the controller should run - it can be from a desktop, server, cluster, or anywhere else where it can interact with the Kubernetes API. 

An **operator** is a controller that doesn’t only track objects but also manages them, meaning all requests to their corresponding resources through the Kubernetes API are routed to the operator.
But the operator must be exposed via an APIService, which expects its upstream Service to implement a CRUD API for the new resource.

## Possible languages and frameworks

The most common way to write Kubernetes-related software is with Golang, since most of the ecosystem uses it and you’d have many examples and resources on the topic.
However, any language that can make HTTP requests can be used, since Kubernetes uses OpenAPI (and even has bindings for most mainstream languages).

Notable frameworks and libraries for working with Kubernetes:

**API:**
- [client-go](https://github.com/kubernetes/client-go) (Golang)
- [kube-rs](https://github.com/kube-rs/kube) (Rust)
- [kubernetes-client](https://github.com/kubernetes-client/python) (Python)

**Frameworks:**
- [Operator Framework](https://sdk.operatorframework.io/) (Golang)
- [Kopf](https://kopf.readthedocs.io/en/stable/) (Python)

For the example in this post, we will use Rust + kube-rs. Here are a few reasons why we chose Rust:

1. Low footprint and great performance.
2. Safety, especially when doing concurrent operations.
3. kube-rs is great!
4. It’s the main language used by MetalBear’s team.

## This is where the tutorial starts

In the sections that follow, we’ll be creating an APIService. We’ll use Rust, but implementations in other languages can be extrapolated from it fairly easily. First, clone our [example repository](https://github.com/metalbear-co/farm-operator):

```bash
git clone https://github.com/metalbear-co/farm-operator.git
cd farm-operator
```

*Note that the example directory is divided into three steps, each with its [prebuilt image](https://github.com/metalbear-co/farm-operator/pkgs/container/farm-operator).*

To start us off, we have some boilerplate for a basic HTTP server. This server will eventually be our operator that returns a Llama 🦙 resource from its memory. It will also return the already existing Pod resource (retrieved from the Kubernetes cluster’s API), but with some modifications.

[*src/main.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-1/src/main.rs#L7-L35)
```rs
async fn get_api_resources() -> impl IntoResponse {
    Json(APIResourceList {
        group_version: "farm.example.com/v1alpha".to_string(),
        resources: vec![],
    })
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let app = Router::new().route("/apis/farm.example.com/v1alpha", get(get_api_resources));

    // We generate a self-signed certificate for example purposes in a proper service this should be
    // loaded from secret and CA for said cert should be defined in APIService uner `caBundle`
    let tls_cert = rcgen::generate_simple_self_signed(vec!["localhost".to_string()])?;
    let tls_config = RustlsConfig::from_der(
        vec![tls_cert.serialize_der()?],
        tls_cert.serialize_private_key_der(),
    )
    .await?;

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));

    println!("listening on {addr}");

    axum_server::bind_rustls(addr, tls_config)
        .serve(app.into_make_service())
        .await
        .map_err(anyhow::Error::from)
}
```

For now, the operator is pretty empty and contains only the necessary code to be considered a valid Kubernetes APIService.

To deploy the sample, run the following command, which makes use of a prebuilt image of the farm operator at `ghcr.io/metalbear-co/farm-operator`
```bash
kubectl apply -f app.yaml
```

Once the `farm-operator` is up, we can see it when we run 
```bash
kubectl get apiservice
```

{{<figure src="apiservice-result.png" alt="Return value from kubectl get apiservice. Cropped to only display relevant result." height="100%" width="100%">}}


Now let's dive into what is happening here. 

[*app.yaml:*](https://github.com/metalbear-co/farm-operator/blob/main/app.yaml#L41-L55)
```yaml
...
---
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1alpha.farm.example.com
spec:
  group: farm.example.com
  groupPriorityMinimum: 1000
  insecureSkipTLSVerify: true
  service:
    name: farm-operator
    namespace: default
    port: 3000
  version: v1alpha
  versionPriority: 15
```

Our `app.yaml` defines three resources: an `APIService` which points to a `Service` resource, which in turn points to a `Deployment`. Because we want to create our Llama resources under the `apiVersion: farm.example.com/v1alpha`, we defined our `APIService` with:

```yaml
spec:
  …
  group: farm.example.com
  …
  version: v1alpha
```

This means that when we create the APIService, Kubernetes will perform a lookup request to our operator at `/apis/farm.example.com/v1alpha` and expect it to return an APIResourceList. 

This way it knows which resource requests to route to the operator. The response from the farm-operator will look like this. 

```json
{
    "apiVersion": "v1",
    "kind": "APIResourceList",
    "groupVersion": "farm.example.com/v1alpha",
    "resources": [ ]
}
```

**NOTE**: *groupVersion is very important because if misconfigured, it can make Kubernetes have unexpected behavior with its built-in resources and potentially cause crashes for the entire cluster.*

## Coding our Operator

1. First, let’s talk about adding a new resource to be handled by the operator.

The first thing we do is create a LlamaSpec struct with a CustomResource derive we have available from kube-rs.

[*src/resources/llama.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-2/src/resources/llama.rs#L38-L48)
```rs
#[derive(CustomResource, Clone, Debug, Deserialize, Serialize, JsonSchema)]
#[kube(
    group = "farm.example.com",
    version = "v1alpha",
    kind = "Llama",
    namespaced
)]
pub struct LlamaSpec {
    pub weight: f32,
    pub height: f32,
}
```

2. Next, we need to add an APIResource to our APIResourceList.

Because we defined a CustomResource with `kind = “Llama”`, the type Llama is now available for us to use.

[*src/main.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-2/src/main.rs#L14-L26)
```rs
async fn get_api_resources() -> impl IntoResponse {
    Json(APIResourceList {
        group_version: "farm.example.com/v1alpha".to_string(),
        resources: vec![APIResource {
            group: Some(llama::Llama::group(&()).into()),
            kind: llama::Llama::kind(&()).into(),
            name: llama::Llama::plural(&()).into(),
            namespaced: true,
            verbs: vec!["list".to_string(), "get".to_string()],
            ..Default::default()
        }],
    })
}
```

**NOTE**: *We’ll only implement the list and get verbs in this example, but other verbs can be implemented similarly.*

3. Now, we implement the methods that will eventually handle list and get calls to our Llama resource:

In this sample implementation, STATIC_LLAMAS holds a nested hashmap, where the keys are the namespace name and the Llama’s name respectively. 
So `get_llama` will return the Llama by name and list_llamas will return a Kubernetes List object named LlamaList.

[*src/resources/llama.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-2/src/resources/llama.rs#L50-L72)
```rs
pub async fn list_llamas(Path(namespace): Path<String>) -> impl IntoResponse {
    println!("Listing Llamas in {namespace}");

    Json(serde_json::json!({
        "apiVersion": "farm.example.com/v1alpha",
        "kind": "LamaList",
        "items": &STATIC_LLAMAS.get(&namespace).map(|lamas| lamas.values().collect::<Vec<_>>()).unwrap_or_default(),
        "metadata": ListMeta::default()
    }))
}

pub async fn get_llama(Path((namespace, name)): Path<(String, String)>) -> Response {
    println!("Getting Llama {name} in {namespace}");

    if let Some(lama) = STATIC_LLAMAS
        .get(&namespace)
        .and_then(|lamas| lamas.get(&name))
    {
        Json(lama).into_response()
    } else {
        StatusCode::NOT_FOUND.into_response()
    }
}
```

4. Next, we add a list of routes for our operator to handle.

Note that since we specified `namespaced: true` in the APIResource, the routes need to reflect that:

[*src/main.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-2/src/main.rs#L30-L39)
```rs
let app = Router::new()
  .route("/apis/farm.example.com/v1alpha", get(get_api_resources))
  .route(
      "/apis/farm.example.com/v1alpha/namespaces/:namespace/llamas",
      get(llama::list_llamas),
  )
  .route(
      "/apis/farm.example.com/v1alpha/namespaces/:namespace/llamas/:name",
      get(llama::get_llama),
  );
```

The routes added:

* `/apis/farm.example.com/v1alpha/namespaces/:namespace/llamas` should return a list of all llamas in the specified namespace
* `/apis/farm.example.com/v1alpha/namespaces/:namespace/llamas/:name` a single llama with the specified name


## Developing operators with mirrord

Building and pushing the Docker image for every little change we want to test is a bit tedious, which gives us a perfect opportunity to plug mirrord. mirrord lets you plug your local process into the cluster, so you could test your locally running operator within the actual Kubernetes cluster. 

mirrord comes as a VS Code or IntelliJ extension, or as a CLI tool. We’ll use the CLI tool in this example.

To run our operator using mirrord, we can use this command:

```bash
cargo build -p farm-operator-2 && mirrord exec -t deploy/farm-operator --steal ./target/debug/farm-operator-2
```

The first part of the command builds the `farm-operator-2` binary from the code in the [step-2 directory](https://github.com/metalbear-co/farm-operator/tree/main/example/step-2). The second part runs the resulting binary with mirrord, with the `farm-operator` deployment as its target.
Our operator is now running locally, but stealing requests that are being sent to the `farm-operator` deployment in the cluster! 

{{<figure src="kubectl-get-llamas.png" alt="Return value from kubectl get llamas." height="100%" width="100%">}}
{{<figure src="kubectl-describe-llamas.png" alt="Return value from kubectl describe llamas." height="100%" width="100%">}}

*Note that when you first run the operator with mirrord, it might take 1-2 minutes until Kubernetes queries it for its resource list. Commands like `kubectl get llama` will return a NotFound error until that happens.*

## Using benefits of Operators

Implementing APIService lets us do is to provide access to existing resources but modify or enrich them before returning them to the user. All this without some complex synchronisation because you can rely on the Kubernetes as your source of truth and act accordingly. For example, we can implement a simple handler that lists Kubernetes Pods. We’ll name our new, enriched resource FarmPod, and add it to our `APIResourceList` and our router. 

[*src/resources/farmpod.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-3/src/resources/farmpod.rs#L7-L54)
```rs
#[derive(CustomResource, Clone, Debug, Deserialize, Serialize, JsonSchema)]
#[kube(
    group = "farm.example.com",
    version = "v1alpha",
    kind = "FarmPod",
    namespaced
)]
pub struct FarmPodSpec {
    pub containers: usize,
}

pub async fn list_farmpods(Path(namespace): Path<String>) -> impl IntoResponse {
    let client = Client::try_default().await.expect("Client Creation Error");

    let pods = Api::<Pod>::namespaced(client, &namespace)
        .list(&Default::default())
        .await
        .expect("Failed to fetch pods");

    let items = pods
        .items
        .into_iter()
        .map(|value| {
            let name = value
                .metadata
                .name
                .map(|name| format!("farm-{name}"))
                .unwrap_or_default();

            FarmPod::new(
                &name,
                FarmPodSpec {
                    containers: value
                        .spec
                        .map(|spec| spec.containers.len())
                        .unwrap_or_default(),
                },
            )
        })
        .collect::<Vec<_>>();

    Json(serde_json::json!({
        "apiVersion": "farm.example.com/v1alpha",
        "kind": "FarmPodList",
        "items": items,
        "metadata": pods.metadata
    }))
}
```


[*src/main.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-3/src/main.rs#L14-L36)
```rs
async fn get_api_resources() -> impl IntoResponse {
    Json(APIResourceList {
        group_version: "farm.example.com/v1alpha".to_string(),
        resources: vec![
            APIResource {
                group: Some(llama::Llama::group(&()).into()),
                kind: llama::Llama::kind(&()).into(),
                name: llama::Llama::plural(&()).into(),
                namespaced: true,
                verbs: vec!["list".to_string(), "get".to_string()],
                ..Default::default()
            },
            APIResource {
                group: Some(farmpod::FarmPod::group(&()).into()),
                kind: farmpod::FarmPod::kind(&()).into(),
                name: farmpod::FarmPod::plural(&()).into(),
                namespaced: true,
                verbs: vec!["list".to_string()],
                ..Default::default()
            },
        ],
    })
}
```

[*src/main.rs:*](https://github.com/metalbear-co/farm-operator/blob/main/example/step-3/src/main.rs#L40-L53)
```rs
let app = Router::new()
    .route("/apis/farm.example.com/v1alpha", get(get_api_resources))
    .route(
        "/apis/farm.example.com/v1alpha/namespaces/:namespace/llamas",
        get(llama::list_llamas),
    )
    .route(
        "/apis/farm.example.com/v1alpha/namespaces/:namespace/llamas/:name",
        get(llama::get_llama),
    )
    .route(
        "/apis/farm.example.com/v1alpha/namespaces/:namespace/farmpods",
        get(farmpod::list_farmpods),
    );
```
To test out the new `FarmPod` we can run our server again with mirrord.
```bash
cargo build -p farm-operator-3 && mirrord exec -t deploy/farm-operator --steal ./target/debug/farm-operator-3
```
Now lets run
```bash
kubectl get farmpods
```
And we should get a list of our pods in the default namespace but with `farm-` in front of their names.


## What’s next?
With this example, we are just touching the tip of the iceberg of what is possible when you integrate yourself into the Kubernetes API. Besides, we’ve overlooked some basic requirements, including:

* Support for OpenAPI v2 or v3 (via /openapi/v2 or /openapi/v3), which Kubernetes looks up for each new APIService
* Support for other verbs like “watch”, “create” and “delete”

The Kubernetes ecosystem can be overwhelming to start with, but hopefully, this guide has helped you grasp just a little bit more of it. If you’d like to discuss writing and building operators, talking about backend, Kubernetes, or mirrord, you’re more than welcome to join our Discord!
