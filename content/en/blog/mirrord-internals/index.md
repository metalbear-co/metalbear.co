---
title: "mirrord internals - hooking libc functions and fixing bugs"
description: "writing detours"
lead: "mirrord internals - hooking libc functions and fixing bugs"
date: 2022-06-24T0:00:00+00:00
lastmod: 2022-06-24T0:00:00+00:00
draft: false
weight: 50
images: []
contributors: ["Mehul Arora"]
---

“Is mirrord some kind of ptrace magic?”, that’s what I exactly thought when I was introduced to this idea of “mirroring traffic”. But to my surprise, the idea and design behind mirrord are completely out of the box! And this is what I want to discuss in the blog post along with my experience as a student learning how to tackle bugs working on this badass project.

## Recap ⏪

mirrord lets you run a local process in the context of a cloud service, which means we can test our code on staging, without actually deploying it there. This leads to shorter feedback loops (you don’t have to wait on long CI processes to test your code in staging conditions) and a more stable staging environment (since untested services aren’t being deployed there). There is a detailed overview of mirrord and what we strive to achieve with it in [this](https://metalbear.co/blog/reintroducing-mirrord/) blog post.

## mirrord-layer + LD_PRELOAD = ❤️

mirrord-layer, shipped as a dynamic library, is responsible for “overriding” or “hooking” libc functions through `LD_PRELOAD`.

### What is `LD_PRELOAD`?

`LD_PRELOAD`, available as an environment variable, is a feature provided by dynamic linkers like ldd that allows us to load our shared library i.e. mirrord-layer, in this case, before any other. This feature is available through `DYLD_INSERT_LIBRARIES` on OSX and therefore, mirrord-layer is cross-platform i.e. it works with all Unix-based systems.

And just to have some more context, we are overriding libc functions so that we can replace them with our custom implementation which enables incoming/outgoing traffic and allows us to redirect file read/writes bidirectionally between our local process and the remote pod.
Overriding these libc functions on different systems would have been a difficult task and this is where Frida-gum comes to save the day through its [inline hooking interceptor](https://github.com/frida/frida-gum/blob/main/gum/guminterceptor.h). Read more about Frida [here](https://frida.re/).

Let's go over a quick example of how we can hook the [open](https://man7.org/linux/man-pages/man2/open.2.html) system call by finding and replacing libc symbols through Frida's Rust bindings.

- Get a reference to the `Frida Gum` runtime.

```rs
lazy_static! {
    static ref GUM: Gum = unsafe { Gum::obtain() };
}
```

- Write a detour for `open`.

```rs
unsafe extern "C" fn open_detour(
    name: *const c_char, 
    flags: c_int,
) -> c_int {
    println!("open_detour: {}", std::ffi::CStr::from_ptr(name).to_str().unwrap());
    let res = libc::open(name, flags);
    res
}
```

- Inside the [constructor](https://docs.rs/ctor/latest/ctor/attr.ctor.html) of our shared library:

Create an interceptor.

Find the exported symbol from other shared libraries for `open` and replace it with our detour through our interceptor.

```rs
#[ctor]
fn init() {
    let mut interceptor = Interceptor::obtain(&GUM);
    let open = Module::find_export_by_name(None, "open").unwrap();
    interceptor.replace(open, NativePointer(open_detour as *mut c_void), NativePointer(0 as *mut c_void)).unwrap();
}
```

The complete crate for the example above is available [here](https://github.com/frida/frida-rust/tree/master/examples/gum/hook_open).

After `cargo +nightly build`, let's `LD_PRELOAD` our shared library and run the unix utility called `cat` om our very cool sample file.

```bash
mirrord-user@mirrord:~/mirrord$ LD_PRELOAD=target/debug/libmirrord.so cat file.txt
open_detour: file.txt
boots and cats
```

Awesome! we are able to override the functionality of libc's system call wrappers and replace them with our custom code.

## Mirroring network traffic & web servers 💻

I want to do a quick walkthrough of how a simple webserver would work when run with mirrord and how this led me to find my first bug! So, in general, web servers implement the flow of creating a socket and accepting connections on it by making the following system calls sequentially -  `socket`, `bind`, `listen`, `accept`.
Referring to the notes on the Linux manual for `listen` -

{{<figure src="manpage.png" class="center" height="200" width="1500">}}
We discuss these system calls in detail and how mirrord handles them.

**Note**: These system calls are just an abstraction/wrappers through libc functions that make the system call using the `syscall` instruction to the kernel.

### socket

[socket](https://man7.org/linux/man-pages/man2/socket.2.html) returns a _socket descriptor_ referring to a communication endpoint. However, in case of a process calling `socket()` being run with mirrord, we do provide similar behavior, but we also need to keep a log of this endpoint in our internal data structure. Now to describe this data structure and what's going on behind the scenes I will refer to this diagram below -

{{<figure src="socket.png" height="100%" width="100%">}}

The function call for `socket` is overridden by mirrord’s detour replaced through Frida as we discussed in an example before. In this detour, we call libc’s version of the `socket` and store the returned descriptor in a hashmap (called `SOCKETS`) that maps the socket to its related metadata and "initialized" state. In the end, we return the socket provided by libc, but we had to take that little detour there 😉.

```rs
pub(crate) static SOCKETS: LazyLock<Mutex<HashMap<RawFd, Arc<Socket>>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));
```

This is what our hashmap looks like in the codebase. We will talk about Rust primitives like `Arc` and `LazyLock` later in the Blogpost.

**Note**: The words “hook” and “detour” are used interchangeably as they refer to the same idea, but “detour” is more formal as it is used in the codebase.

### bind

To bind an address to the socket descriptor returned by the `socket` system call, [bind](https://man7.org/linux/man-pages/man2/bind.2.html) is called. Our detour for bind doesn’t really do much because all the juicy stuff happens in `listen`. However, here are a few notable things that our detour does do -

- Put the socket in a `Bound` state if it exists in our `SOCKETS` hashmap.
- Check if the port the socket is being bound to is an ignored port.
{{<figure src="bind.png" height="100%" width="100%">}}

```rs
pub struct Socket {
    domain: c_int,
    type_: c_int,
    protocol: c_int,
    pub state: SocketState,
}

pub enum SocketState {
    Initialized,
    Bound(Bound),
    Listening(Bound),
    Connected(Connected),
}
```
Structs for Socket metadata and its states.

**Note**: Ignored port refers to a port that could be used by a debugger or an IDE (which uses sockets). We need to ignore a certain range of ports because mirrord comes with a [VSCode extension](https://mirrord.dev/docs/overview/architecture/#vs-code-extension) that uses debugging support provided by the IDE to run our local process in the context of a remote cluster.

### listen
To start accepting connections on our socket, we have to mark the socket as passive using the [listen](https://man7.org/linux/man-pages/man2/listen.2.html) system call. There are quite a few things happening in our “little” detour here, so let's take it step by step with the help of a diagram.
{{<figure src="listen.png" height="100%" width="100%">}}

In our detour, notably, the following happen - 

- Change the socket state from `Bound` to `Listening` in our `SOCKETS` hashmap.
- Call libc’s `bind` with address port as 0, which looks something like `sockaddr_in.port = 0` at a lower level in C. This allows the - OS to assign a port to our address, without us having to check for any available ports.
- Call libc’s `getsockopt()` to get the port that was assigned to our address. This classifies as our “fake port”.
- Call libc’s `listen()` to qualify as an endpoint open to accepting new connections.
- Send a message to mirrord-agent that it is listening on the “real port”.

Well, long story short, mirrord-layer listens on the “fake port” bound to the address specified by the user. For example, if a user calls `bind` on port 80, mirrord-layer will create a port like 3424 and call listen on it by binding the address to it. This also means that we don’t need `sudo` to run our web server when listening on a special port like 80 since it is never actually bound. And in parallel, mirrord-agent is forwarding traffic to this fake port giving us the illusion that our process is running on the remote pod. We will talk about how mirrord-agent works in another blog post!

### accept

Now we just need to handle new connections! Every time `accept` is called in our local process, we call libc’s `accept` and get a new socket descriptor referring to that connection/socket passed to `accept`, but that’s just not it because under the hood we also maintain an internal connection queue for pending connections. This means that every time we receive a new connection request from the agent pod we enqueue that in our `CONNECTION_QUEUE` and each socket descriptor has its own unique queue.
Now furthermore in our detour for `accept`, we do the following -

- Is there a socket in `Listening` state in our `SOCKETS` hashmap?
- If yes, we get the pending connection from our `CONNECTION_QUEUE` for our original socket descriptor.
- Add the new socket descriptor to our `SOCKETS` hashmap in the `Connected` state.
- Modify the pointer to the sockaddr struct to implicitly return the address of the new connection.

{{<figure src="accept.png" height="100%" width="100%">}}

Alright then, we have all our detours in place. Everything should work smoothly! (that’s what I thought) So let’s test it out by rolling back to the commit with only these detours in place. Fair warning before we go ahead, those were primitive times and required manual labor 😔.

`git checkout d8b4de6`

That’s the commit before the patch I made for the bug I discovered. We don’t need to explicitly build and load the agent image in our cluster because the image is already hardcoded in the agent specification. So let’s get rolling?

```bash
MIRRORD_IMPERSONATED_POD_NAME=http-echo-deployment-77fddcdc49-6z22r LD_PRELOAD=/home/mehula/mirrord/target/debug/libmirrord.so node sample/app.js
```

The YAML file for the http-echo deployment is available [here](https://github.com/metalbear-co/mirrord/blob/main/tests/app.yaml).

Let’s look at some logs of our web server running with mirrord. I won’t dump all of them here, but I’ll just pick what’s important. All the logs are available [here](https://gist.github.com/infiniteregrets/4d471f576eb2ff66e44744352f24cb07).

```rust
2022-06-23T20:06:12.011931Z DEBUG mirrord: socket called
2022-06-23T20:06:12.012145Z DEBUG mirrord: bind called
2022-06-23T20:06:12.012473Z DEBUG mirrord: listen called
server listening to {"address":""}
2022-06-23T20:06:16.638872Z DEBUG mirrord: send message to client 80
```

Alright, so our web server is up and running, waiting to accept new connections! And just like we talked about the system calls involved before, all of `socket`, `bind`, and `listen` were called. But now let’s test out if sending a `GET` request to our remote pod mirrors the traffic to our local process.

`curl http://192.168.49.2:32118`

```rust
2022-06-23T20:41:19.082404Z DEBUG mirrord: send message to client 80
2022-06-23T20:41:21.901455Z DEBUG mirrord: new connection id: 0
2022-06-23T20:41:21.901647Z DEBUG mirrord: No socket found for connection_id: 0
events.js:174
      throw er; // Unhandled 'error' event
      ^

Error: accept EINVAL
    at TCP.onconnection (net.js:1497:24)
Emitted 'error' event at:
    at TCP.onconnection (net.js:1497:10)
```

Looks like even though a connection was enqueued in our `CONNECTION_QUEUE`, but was never dequeued and no new socket descriptor was inserted in our `SOCKETS` hashmap.

**Note**: All the references made are in context of the present version of mirrord, not commit `d8b4de6`.

That is weird, why was accept never called? Let’s debug our node process and see what’s going on!