---
title: "Sessions"
description: "Session management for the mirrord Operator"
date: 2024-03-04T00:00:00+00:00
lastmod: 2024-03-04T00:00:00+00:00
draft: false
images: []
menu:
  docs:
    parent: "using-mirrord"
weight: 170
toc: true
tags: ["team", "enterprise"]
---

## Overview

Whenever a user starts mirrord on a cluster where mirrord for Teams is installed, the Operator assigns a
session to this user, until they stop running mirrord, at which point the session is closed
in the Operator automatically.

### See active Operator sessions

Users can use the command `mirrord operator status` to see active sessions in the cluster.
For example, in the following output, we can see the session ID, the target used, 
the namespace of the target, the session duration, and the user running that session. 
We can also see that `Ports` is empty, meaning the user isn't stealing or mirroring any 
traffic at the moment.

```
+------------------+-----------------------------+-----------+---------------------------------------------------------------+-------+------------------+
| Session ID       | Target                      | Namespace | User                                                          | Ports | Session Duration |
+------------------+-----------------------------+-----------+---------------------------------------------------------------+-------+------------------+
| 487F4F2B6D2376AD | deployment/ip-visit-counter | default   | Aviram Hassan/aviram@metalbear.co@avirams-macbook-pro-2.local |       | 4s               |
+------------------+-----------------------------+-----------+---------------------------------------------------------------+-------+------------------+
```

The `User` field is generated in the following format - `whoami/k8s-user@hostname`. 
`whoami` and `hostname` are from the local machine, while `k8s-user` is the user we see 
from the operator side.


In this example, we can see that the session has an active steal on port 80,
filtering HTTP traffic with the following filter: `X-PG-Tenant: Avi.+`

```
+------------------+-----------------------------+-----------+---------------------------------------------------------------+----------------------------------------------------------+------------------+
| Session ID       | Target                      | Namespace | User                                                          | Ports                                                    | Session Duration |
+------------------+-----------------------------+-----------+---------------------------------------------------------------+----------------------------------------------------------+------------------+
| C527FE7D9C30979E | deployment/ip-visit-counter | default   | Aviram Hassan/aviram@metalbear.co@avirams-macbook-pro-2.local | Port: 80, Type: steal, Filter: header=X-PG-Tenant: Avi.+ | 13s              |
+------------------+-----------------------------+-----------+---------------------------------------------------------------+----------------------------------------------------------+------------------+
```

### Stop active Operator sessions

Users may also forcefully stop a session with the `mirrord operator session` CLI commands.
These allow users to manually close Operator sessions while they're still alive  (user is
still running mirrord).

The session management commands are:

- `mirrord operator session kill-all` which will forcefully stop **ALL** sessions!
- `mirrord operator session kill --id {id}` which will forcefully stop a session with `id`,
  where you may obtain the session id through `mirrord operator status`;

#### `sessions` RBAC

Every `mirrord-operator-user` has access to **all** session operations by **default**, as they come
with `deletecollection` and `delete` privileges for the `sessions` resource. You may limit
this by changing the RBAC configuration. Here is a sample `role.yaml` with the other Operator
rules omitted:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mirrord-operator-user
rules:
- apiGroups:
  - operator.metalbear.co
  resources:
  - sessions
  verbs:
  - deletecollection
  - delete
```

- `mirrord operator session kill-all` requires the `deletecollection` verb;
- `mirrord operator session kill --id {id}` requires the `delete` verb;
