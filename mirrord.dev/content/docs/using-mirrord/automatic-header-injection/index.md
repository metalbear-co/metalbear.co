---
title: "Browser Extension"
description: "How to use Browser extenstion for automatic header injection"
date: 2024-07-07T09:39:44+01:00
lastmod: 2024-07-07T09:39:44+01:00
draft: true
menu:
  docs:
    parent: "using-mirrord"
weight: 140
toc: true
tags: ["team", "enterprise"]
---
### mirrord Browser Extension

mirrord’s browser extension injects an HTTP header into all browser requests while a mirrord session is active.

### Prerequisites

Before you start, make sure you have:
1. Header propagation set up in your app.
2. Google Chrome is installed.
3. Installed [mirrord Browser Extension] (). // add link
4. Defined in `mirrord.json` a valid HTTP header filter in `feature.network.incoming.http_filter.header_filter` with steal mode in `feature.metwork.incoming.mode`.
5. Set in `mirrord.json`  the browser extension enabled. (feature is currenly experimental).

```json
{
  "feature": {
    "network": {
      "incoming": {
        "mode": "steal",
        "http_filter": {
          "header_filter": "X-My-Header: my-header-value",
        },
      }
    }
    "browser_extenstion": {
        "enabled": true // add / change name
    }
  }
}
```

### Using mirrord Browser Extension
1. Run `mirrord exec` with the configured `mirrord.json`, mirrord will then:
   - Prints the localhost URL to the screen.
   - Launch the extension.
   - Opens the link automatically in a Chrome tab.
2. The extension injects the active session’s header into all browser requests across tabs.
3. You can check the current header and status in the extension popup. The extension can be opened anytime from the Chrome extension icon // add image

### Header Filter
The mirrord Browser extenstion will automatically inject the `header_filter` defined in `mirrord.json`.
In case `header_filter` configured with regex pattern, you will be prompted in the browser to enter a header that matches it.

### More details

In case the mirrord browser extenstion is not downloaded prior to running `mirrord exec` with the configured `mirrord.json`, the URL will fail to open. 