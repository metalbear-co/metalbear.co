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
        - Create an interceptor.
        - Find the exported symbol from other shared libraries for `open` and replace it with our detour through our interceptor.

```rs
#[ctor]
fn init() {
    let mut interceptor = Interceptor::obtain(&GUM);
    let open = Module::find_export_by_name(None, "open").unwrap();
    interceptor.replace(open, NativePointer(open_detour as *mut c_void), NativePointer(0 as *mut c_void)).unwrap();
}
```

The complete crate for the example above is available [here](https://github.com/frida/frida-rust/tree/master/examples/gum/hook_open).

After `cargo +nightly build`, let's `LD_PRELOAD` our shared library and run the unix utility called `cat`.

```bash
mirrord-user@mirrord:~/mirrord$ LD_PRELOAD=target/debug/libmirrord.so cat file.txt
open_detour: file.txt
boots and cats
```

Awesome! we are able to override the functionality of libc's system call wrappers and replace them with our custom code.