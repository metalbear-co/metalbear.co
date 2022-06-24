---
title: "mirrord internals - hooking libc functions and fixing bugs"
description: "writing detours"
lead: "mirrord internals - hooking libc functions and fixing bugs"
date: 2022-06-15T0:00:00+00:00
lastmod: 2022-06-15T0:00:00+00:00
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
Overriding these libc functions on different systems would have been a difficult task and this is where Frida-gum comes to save the day through its [inline hooking interceptor](https://github.com/frida/frida-gum/blob/main/gum/guminterceptor.h).

Let's go over a quick example of how we can hook the [open](https://man7.org/linux/man-pages/man2/open.2.html) system call by finding and replacing libc symbols in Rust through Frida's bindings.

```rs
#![feature(c_variadic)]
use frida_gum::{
    interceptor::{Interceptor},
    Gum,
    Module, NativePointer
};
use lazy_static::lazy_static;
use ctor::ctor;
use libc::{c_void, c_int, c_char};

lazy_static! {
    static ref GUM: Gum = unsafe { Gum::obtain() };
}

unsafe extern "C" fn open_detour(
    name: *const c_char, 
    flags: c_int,
) -> c_int {
    println!("open_detour: {}", std::ffi::CStr::from_ptr(name).to_str().unwrap());
    let res = libc::open(name, flags);
    res
}

#[ctor]
fn init() {
    let mut interceptor = Interceptor::obtain(&GUM);
    let open = Module::find_export_by_name(None, "open").unwrap();
    interceptor.replace(open, NativePointer(open_detour as *mut c_void), NativePointer(0 as *mut c_void)).unwrap();
}

```
