---
baseUrl: https://app-y3ku8d7npxle.frontegg.com
clientId: fc38df76-60a7-428b-8a51-6edd86031103
licenseUrl: http://localhost:3000
---

# mirrord operator

The mirrord operator is a component that runs in your Kubernetes cluster and manages the concurrent use of mirrord by multiple users in the organization. With the operator, users don't need Kubernetes API permissions (RBAC is managed through the operator); agents are reused so multiple agents don't impersonate the same pod; and deployments can be impersonated so that traffic from all their pods is stolen/mirrored.

## Getting started
## Installation
### Requirements
To install the operator, you need `kubectl` with permissions to create the relevant resources.

Base of the command is

`mirrord operator setup [OPTIONS] | kubectl apply -f -`

Options:
- `--accept-tos` 
        You accept terms of service for mirrord-operator
- `--license-key`
        The license key for the operator (contents of pem file)
- (Optional) `-f, --file` 
        Output kubernetes definitions to file and not to stdout (instead of piping to `kubectl apply -f -`)
- (Optional) `--namespace` 
        Set namespace of mirrord operator (default: mirrord)

So final command should look like

`mirrord operator setup --accept-tos --license-key <license-key> | kubectl apply -f -`

After installing the operator, all mirrord clients will use it automatically when impersonating targets on the cluster.
