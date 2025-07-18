---
title: "Browser Extension"
description: "How to use Browser extenstion for automatic header injection"
date: 2024-07-07T09:39:44+01:00
lastmod: 2024-07-07T09:39:44+01:00
draft: false
menu:
  docs:
    parent: "using-mirrord"
weight: 168
toc: true
tags: ["team", "enterprise"]
---

The mirrord Browser Extension automatically injects an HTTP header into all your browser requests while a mirrord session is running. This solves the hassle of manually adding headers when debugging local services that rely on header-based routing, making it easier to test production-like flows in your browser with zero manual setup.

## Prerequisites

Before you start, make sure you have:
1. Header propagation set up in your app.
2. Google Chrome is installed.
3. [mirrord Browser Extension for Chrome](https://chromewebstore.google.com/detail/mirrord/bijejadnnfgjkfdocgocklekjhnhkhkf) installed.
4. A valid HTTP header filter defined in your `mirrord.json` under `feature.network.incoming.http_filter.header_filter` with `mode` set to `steal`.
5. Browser extension config enabled in your `mirrord.json`.  
   **Note:** This feature is experimental.

```json
{
  "feature": {
    "network": {
      "incoming": {
        "mode": "steal",
        "http_filter": {
          "header_filter": "X-My-Header: my-header-value"
        }
      }
    }
  },
  "experimental": {
    "browser_extension_config": true
  }
}

## Using mirrord Browser Extension

1. Run `mirrord exec` with the configured `mirrord.json`, mirrord will then:
   - Prints the localhost URL to the screen.
   - Launch the extension.
   - Opens the link automatically in a Chrome tab.
2. The extension injects the active session’s header into all browser requests across tabs.
3. You can check the current header and status in the extension popup, the extension can be opened anytime from the Chrome extension icon
4. To stop the extension from injecting HTTP request header, click the extension icon and remove the header from the pop up menu.

## Header Filter

The mirrord Browser extenstion will automatically inject the `header_filter` defined in `mirrord.json`.
In case `header_filter` configured with regex pattern, you will be prompted in the browser to enter a header that matches it:
`Please enter a header that matches pattern $HEADER_PATTERN`

## More details

- In case the mirrord browser extension is not downloaded prior to running `mirrord exec` with the configured `mirrord.json`, the URL will fail to open. Google Chrome will display an error page showing the URL is blocked by Google Chrome.
- In case the Browser Extension is enabled in `mirrord.json`, but no http header filter is configured, mirrord will not initiate the extension in Google Chrome and display a warning in the terminal.