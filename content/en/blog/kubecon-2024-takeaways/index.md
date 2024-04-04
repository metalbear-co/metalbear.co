---
title: "KubeCon 2024 Takeaways"
description: "A summary of our collective impressions and insights from KubeCon Europe 2024"
lead: "A summary of our collective impressions and insights from KubeCon Europe 2024"
tags:
  - CNCF
  - KubeCon
  - cloud
  - application-testing  
  - platform-engineering 
date: 2024-04-03T0:00:00+00:00
lastmod: 2024-04-03T0:00:00+00:00
draft: false
weight: 50
images: ["thumbnail.png"]
contributors: ["Aviram Hassan", "Tal Zwick"]
---

Last month marked a huge milestone for us as we attended our first KubeCon! This was KubeCon Europe, which took place in Paris, city of lights and cloud orchestration. Below is a summary of our collective impressions and insights.

## Co-Located Events and Surprising Highlights

We arrived a day before KubeCon proper started so we could attend the co-located events. We ended up mostly going to AppDeveloperCon sessions, and it was surprisingly crowded. Our highlight from the first day was Daniel Bryant’s excellent talk **“[Testing Cloud Apps: Mocks vs. Service Virtualization vs. Remocal Tools](https://www.youtube.com/watch?v=3tP31j_T6IE)”**. Daniel covered our favorite pain - being unable to work against a real environment and iterate with it as part of the development workflow. We were pleased to see a very friendly shoutout to mirrord and our to talk later in the convention! 

{{<figure src="first-image.png" alt="KubeCon 2024 Takeaways " height="100%" width="100%">}}


## The Main Event™

The next day the main KubeCon event officially started, and it was PACKED. After two years of mostly working from our homes, we finally got to say hi to friends from all over the world who are part of our awesome community. Tal did his talk **“[When They Go High, We Go Low – Hooking Libc Calls to Debug Kubernetes Apps](https://youtu.be/3OSQdiKTNU8?si=wP3IPbMM2g-GSBl-)”**. There was a turnout of about 400 people, which was roughly 10 times what we expected - this was not lost on Tal. Feedback was incredibly positive though, and we lingered in the auditorium long after the talk to answer questions, discuss mirrord, and hand out some quality swag. 

{{<figure src="second-image.png" alt="KubeCon 2024 Takeaways " height="100%" width="100%">}}

Bonus: as the talk was happening, we found out that one of our Discord members was hiding in the crowd!

{{<figure src="third-image.png" alt="KubeCon 2024 Takeaways " height="100%" width="100%">}}

Most of our focus that day went to Tal’s talk, but there was something else that did not escape our attention: the sponsored coffee bars were probably the most popular booths in the expo level of the venue. Cloud-native caffeine addicts were queuing up for fancy coffee at every hour of the day. So if you want to attract a crowd to your booth in a future event - barista-grade coffee is sure to achieve that effect…

## Mandatory Rust Bit

On Thursday, the second day of the main event, we mingled with our fellow Rustaceans at **“[The Rustvolution: How Rust Is the Future of Cloud Native](https://youtu.be/2q3RLffSvEc?si=ogw9FbVZXMuVj14K)”** by Flynn from Buoyant. mirrord is almost entirely written in Rust, and the Rust ecosystem played a big part in getting our project off the ground. Flynn showcased multiple advantages of Rust over other languages like C++ and Go and explained some of the common safety issues that are pervasive in other languages. He then presented the Rust mechanisms that prevent those issues completely in programs written in safe Rust. He made the case that the infrastructure we’re all building with and around cloud native software is being relied upon by people and organizations, and we should therefore take safety very seriously in our work - and choose a safe language to write code in.

Another neat find was the Kubernetes Book Club where people meet up virtually every week and discuss the next chapter in a Kubernetes related book. Their session in the event wasn’t a regular club meeting, but rather an introduction to the club. Additionally, two book authors, Mauricio Salatino and Chad Crowell, were present in person. They talked about their books and their work in the cloud native ecosystem, and even gave out signed copies. We didn’t get a book because so many people wanted them, the books ran out before everybody could get one. Maybe next year!

Our favorite talk, also on Thursday, was **“[Kubernetes Controllers in Rust: Fast, Safe, Sane](https://kccnceu2024.sched.com/event/1YeOR/kubernetes-controllers-in-rust-fast-safe-sane-matei-david-buoyant)”** by Matei David, also from Buoyant, where we found about Kubert, which might be really useful for some of our use cases! Kubert is built on top of kube-rs, a Rust crate for interacting with the Kubernetes API. It provides abstractions and batteries for building operators/controllers and can be compared to the Operator Framework.
We had a fun surprise on the last day of the conference when a team that uses mirrord came up to us with an informal bug report (the bug wasn’t the fun part). There’s nothing better for us than actually meeting the people who use the tool we built on a daily basis.

## Closing Thoughts

To wrap things up: our first KubeCon was a blast. We had a chance to present the unique technical details of the implementation of mirrord, geek out about it with a great crowd, and meet our community face to face. We’re already waiting for KubeCon North America (at Salt Lake City, cloud-native capital of the western frontier!), and we might even do a booth this time. Looking forward to seeing everyone there!
