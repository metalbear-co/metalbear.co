---
title: "Hooking Go from Rust - Hitchhiker’s Guide to the Go-laxy"
description: "How did we hook Go functions from Rust to work with mirrord? A quick dive into the Go Runtime and switching from the Go stack to the system stack."
lead: "How did we hook Go functions from Rust to work with mirrord? A quick dive into the Go Runtime and switching from the Go stack to the system stack."
date: 2022-08-17T15:00:00+00:00
lastmod: 2022-08-17T15:00:00+00:00
draft: false
weight: 50
images: ["mirrord-go-hooks-thumbnail.png"]
contributors: ["Aviram Hassan", "Mehul Arora"]
---

Most mainstream programming languages strive to fit into a few common standards, to increase interoperability and decrease adoption friction. Golang isn’t one of those (there [are](https://spectralops.io/blog/rust-vs-go-why-not-use-both/) [several](https://words.filippo.io/rustgo/) [articles](https://fasterthanli.me/articles/lies-we-tell-ourselves-to-keep-using-golang) on the subject). In this blog post we’ll demonstrate how to overcome Go’s isolationist design and integrate with it from another language (in our case Rust).

Why do we need to interop with Go? [mirrord works by hooking system calls to the operating systems](https://metalbear.co/blog/mirrord-internals-hooking-libc-functions-in-rust-and-fixing-bugs/) and applying logic that decides whether to execute locally or remotely. To do that, mirrord side-loads (using `LD_PRELOAD`) into the process, then hooks relevant functions.
To cover most common scenarios, mirrord hooks libc functions and this works for most common languages (Python, Go on macOS, Rust, Node to name a few) as they all rely on libc.

## Mostly Harmless

[Golang doesn’t use libc on Linux](https://lwn.net/Articles/771441/), and instead calls syscalls directly. This is mostly harmless for the common developer - they don’t care about the assembly, syscalls, linkage, etc - they just want their binary to work. Therefore, being self-contained provides a very good user experience, as Go applications aren’t dependent on the local machine’s libc.

It’s pretty harmful for us, though. Since we explicitly override libc functions, our software simply doesn’t function when run with Go apps (or any other process that doesn’t call libc). Therefore, we must hook Golang functions!

## Almost, but not quite, entirely unlike tea

Luckily for us, Go applications are not entirely unlike other software. Golang **has** to work with the operating system, so it has to use syscalls. Since libc doesn’t add much logic on top of the syscalls it wraps, we can still use all our existing code - we just have to override a different function with it.

How do we hook Golang functions? Same way we do libc functions -  with [Frida](http://frida.re/). The problem is that writing Rust code that can work from a Go routine call state isn’t trivial. Go has its own ABI, which doesn’t conform to any common ABI. This nonconformance is relatively common, though. For example, Rust also has an unstable internal ABI. If we could recompile the Go binary before side-loading into it, we could use cgo to have standard C ABI accessible, but in our use case we can’t. This means we have to implement a [trampoline](https://en.wikipedia.org/wiki/Trampoline_(computing))[^1].

{{<figure src="mirrord-rust-go-trampoline.png" alt="rust, go, asm trampoline" height="100%" width="100%">}}

The trampoline will be written in Assembly and its purpose is to translate a Go function call into a Rust function call, then return the result as the caller of the original Go function expected it to return.

Looking at the backtrace of our Go [binary](https://github.com/metalbear-co/mirrord/blob/main/tests/go-e2e/main.go) and dependencies of the `net/http` package, it was obvious that it involved the use of the `syscall` package. By reverse engineering the Go binary using [Ghidra](https://github.com/NationalSecurityAgency/ghidra), we mapped out the relevant flows (socket, listen, accept, etc.) to three different functions that we need to hook:

- `syscall.Syscall6.abi0` - syscalls with 6 parameters letting the runtime know we switched to a blocking operation so it can schedule on another thread/goroutine.
- `syscall.Syscall.abi0` - same as `syscall.Syscall6.abi0` but with three parameters.
- `syscall.RawSyscall.abi0` - same as the above but without notifying the runtime.

## Don’t Panic

### The Big Jump

Let’s start with a very basic trampoline, hooking `syscall.RawSyscall.abi0` (a routine that calls a syscall with 3 parameters, also used by `socket` in the syscall package). Below is the disassembly of this function:

{{<figure src="mirrord-go-rawsyscall-disasm.png" alt="disassembly of syscall.RawSyscall.abi0 using Ghidra" height="100%" width="100%">}}

We will implement this trampoline by moving arguments from the stack to registers as Rust expects in a C ABI, then return the result on the stack as Go expects.

### From stack to registers

```asm
mov rsi, QWORD PTR [rsp+0x10]
mov rdx, QWORD PTR [rsp+0x18]
mov rcx, QWORD PTR [rsp+0x20]
mov rdi, QWORD PTR [rsp+0x8]
```

Golang has its own ABI(as mentioned before), precisely `ABI0` and `ABIInternal`. Go keeps [backward compatibility](https://go.googlesource.com/proposal/+/master/design/27539-internal-abi.md) with a stack based calling convention along with the recently introduced register based calling convention. Turns out `ABI0` functions follow a stack based convention, which is why we move values from the stack rather than registers.

### Calling the handler

```asm
call c_abi_syscall_handler
```

Following the stack based convention from Go, we move the arguments to registers. But what registers exactly and why? Since we’re hooking a function that directly makes the syscall, we would require a handler to manage the syscalls for us. Our handler will be called using the C ABI calling convention, it will match on syscalls and redirect them based on their type to their specific detours and return the result in the specific register conforming to the C ABI.

```rs
#[no_mangle]
unsafe extern "C" fn c_abi_syscall_handler(
    syscall: i64,
    param1: i64,
    param2: i64,
    param3: i64,
) -> i32 {    
    debug!("c_abi_sycall_handler received syscall: {syscall:?}");
    let res = match syscall {        
        libc::SYS_socket => {
            let sock = libc::socket(param1 as i32, param2 as i32, param3 as i32);            
            sock
        }
        _ => libc::syscall(syscall, param1, param2, param3) as i32,
    };
    return res;
}
```

### Putting it back on the stack for Go

[asm_linux_amd64.s](https://go.googlesource.com/go/+/c0d6d33/src/syscall/asm_linux_amd64.s):

```
// func Syscall(trap int64, a1, a2, a3 uintptr) (r1, r2, err uintptr);
// Trap # in AX, args in DI SI DX R10 R8 R9, return in AX DX
// Note that this differs from "standard" ABI convention, which
// would pass 4th arg in CX, not R10.
```

As mentioned above and as we saw in the disassembly, we will move the result returned by the handler back to the stack like so:

```asm

mov  QWORD PTR [rsp+0x28],rax
mov  QWORD PTR [rsp+0x30],rdx
mov  QWORD PTR [rsp+0x38],0x0
ret
```

### Summing it up

```rs
#[cfg(target_os = "linux")]
#[cfg(target_arch = "x86_64")]
#[naked]
unsafe extern "C" fn go_raw_syscall_detour() {
    asm!(
        "mov rsi, QWORD PTR [rsp+0x10]",
        "mov rdx, QWORD PTR [rsp+0x18]",
        "mov rcx, QWORD PTR [rsp+0x20]",
        "mov rdi, QWORD PTR [rsp+0x8]",
        "call c_abi_syscall_handler",
        "mov  QWORD PTR [rsp+0x28],rax",
        "mov  QWORD PTR [rsp+0x30],rdx",
        "mov  QWORD PTR [rsp+0x38],0x0",
        "ret",
        options(noreturn),
    );
}
```

Note the usage of the [Naked function feature](https://rust-lang.github.io/rfcs/2972-constrained-naked.html). Naked functions give us full control over the generated assembly(as needed in our use case) since Rust doesn’t generate an epilogue/prologue for them.

Let’s do a sample run and see if everything works:

{{<figure src="mirrord-go-run.png" alt="running the gin server with the rawsyscall hook" height="100%" width="100%">}}

Great! It works just as we expected. However, the actual detours in mirrord contain logs and do a lot of book-keeping. Let’s start by adding a simple debug statement and see where things go.

```rs
#[no_mangle]
unsafe extern "C" fn c_abi_syscall_handler(
    syscall: i64,
    param1: i64,
    param2: i64,
    param3: i64,
) -> i32 {    
    debug!("c_abi_sycall_handler received syscall: {syscall:?}");
    let res = match syscall {        
        libc::SYS_socket => {
            let sock = libc::socket(param1 as i32, param2 as i32, param3 as i32);            
            sock
        }
        _ => libc::syscall(syscall, param1, param2, param3) as i32,
    };
    return res;
}

```

And action!

```bash
mehula@mehul-machine:~/golang-e2e/server$ LD_PRELOAD=../target/debug/libmirrord.so ./server
2022-08-15T17:15:36.497241Z DEBUG mirrord: LD_PRELOAD SET
2022-08-15T17:15:36.498403Z DEBUG mirrord: "syscall.RawSyscall.abi0" hooked
Server listening on port 8080
2022-08-15T17:15:36.505606Z DEBUG mirrord: c_abi_sycall_handler received syscall: 41
2022-08-15T17:15:36.505689Z DEBUG mirrord: c_abi_sycall_handler received syscall: 41
2022-08-15T17:15:36.505738Z DEBUG mirrord: c_abi_sycall_handler received syscall: 41
unexpected fault address 0x0
fatal error: fault
[signal SIGSEGV: segmentation violation code=0x80 addr=0x0 pc=0x7fa45a87f6b2]

goroutine 1 [running]:
runtime.throw({0x7e0b21?, 0x46?})
        /usr/local/go/src/runtime/panic.go:992 +0x71 fp=0xc0002372a8 sp=0xc000237278 pc=0x4354b1
runtime: unexpected return pc for runtime.sigpanic called from 0x7fa45a87f6b2
stack: frame={sp:0xc0002372a8, fp:0xc0002372f8} stack=[0xc000218000,0xc000238000)
0x000000c0002371a8:  0x000000000045551b <runtime.write+0x000000000000003b>  0x0000000000000002 
0x000000c0002371b8:  0x000000c0002371f0  0x0000000000436bae <runtime.recordForPanic+0x000000000000004e> 
0x000000c0002371c8:  0x000000000045551b <runtime.write+0x000000000000003b>  0x0000000000000002 
0x000000c0002371d8:  0x00000000008833ec  0x0000000000000001 
0x000000c0002371e8:  0x0000000000000001  0x000000c000237228 
0x000000c0002371f8:  0x0000000000436eb2 <runtime.gwrite+0x00000000000000f2>  0x00000000008833ec 
0x000000c000237208:  0x0000000000000001  0x0000000000000001 
0x000000c000237218:  0x000000c000237295  0x0000000000000003 
0x000000c000237228:  0x000000c000237278  0x000000000046274e <runtime.systemstack+0x000000000000002e> 
0x000000c000237238:  0x00000000004356f0 <runtime.fatalthrow+0x0000000000000050>  0x000000c000237248 
0x000000c000237248:  0x0000000000435720 <runtime.fatalthrow.func1+0x0000000000000000>  0x000000c0000021a0 
0x000000c000237258:  0x00000000004354b1 <runtime.throw+0x0000000000000071>  0x000000c000237278 
0x000000c000237268:  0x000000c000237298  0x00000000004354b1 <runtime.throw+0x0000000000000071> 
0x000000c000237278:  0x000000c000237280  0x00000000004354e0 <runtime.throw.func1+0x0000000000000000> 
0x000000c000237288:  0x00000000007e0b21  0x0000000000000005 
0x000000c000237298:  0x000000c0002372e8  0x000000000044a8c5 <runtime.sigpanic+0x0000000000000305> 
0x000000c0002372a8: <0x00000000007e0b21  0x0000000000000046 
0x000000c0002372b8:  0x00007fa45a0f27c0  0x00007fa45a89e8e9 
0x000000c0002372c8:  0x0000000000000000  0x0000000000000000 
0x000000c0002372d8:  0x00007fa45a0f27c0  0x0000000000000000 
0x000000c0002372e8:  0x000000c000237ab0 !0x00007fa45a87f6b2 
0x000000c0002372f8: >0x000000c000237320  0x000000c0002373e8 
0x000000c000237308:  0x00007fa45a0f27c0  0x0000000000000000 
0x000000c000237318:  0x00007fa45a0f27c0  0x00007fa45a0f27c0 
0x000000c000237328:  0x00007fa45a0f27c0  0x0000000000000000 
0x000000c000237338:  0x0000000000000000  0x0000000000000000 
0x000000c000237348:  0x00007fa45a895d84  0x0000000000000000 
0x000000c000237358:  0x000000000237c328  0x00007fa45a0f2840 
0x000000c000237368:  0x0000000000000000  0x00007fa45b698f50 
0x000000c000237378:  0x0000000000000000  0xffffffffffffffff 
0x000000c000237388:  0x00007fa45a0f2840  0x0000000000000000 
0x000000c000237398:  0x00007fa45a0f2840  0xffffffffffffffff 
0x000000c0002373a8:  0x0000000000000000  0x00007fa45a0f27c0 
0x000000c0002373b8:  0x00007fa45a0f27c0  0x00007fa45a0f27c0 
0x000000c0002373c8:  0x00007fa45a0f27c0  0x00007fa45a87e8e7 
0x000000c0002373d8:  0x0000000000000000  0x00007fa45a895d44 
0x000000c0002373e8:  0x000000c000237420  0x000000000237c340 
runtime.sigpanic()
        /usr/local/go/src/runtime/signal_unix.go:825 +0x305 fp=0xc0002372f8 sp=0xc0002372a8 pc=0x44a8c5
```

### Why did this goroutine panic with our hook?

Go’s runtime scheduler follows a very peculiar yet smart way of scheduling goroutines. The scheduler mainly works on four important objects:

- G - The goroutine
- N - Number of goroutines
- M - OS thread (N is mapped to M)
- P - Represents the notion of a processor i.e. resource provider for M when its running a goroutine.

As described in the [design document](https://docs.google.com/document/d/1TTj4T2JO42uD5ID9e89oa0sLKhJYD0Y_kqxDv3I3XMw/edit) for the Go runtime scheduler,

> “When a new G is created or an existing G becomes runnable, it is pushed onto a list of runnable goroutines of current P. When P finishes executing G, it first tries to pop a G from own list of runnable goroutines; if the list is empty, P chooses a random victim (another P) and tries to steal a half of runnable goroutines from it.”

In summary, every G runs on an M assigned to a P.

Now that we know a bit about how Go schedules goroutines, by looking at [this](https://cs.opensource.google/go/go/+/master:src/runtime/stack.go) source file we can see Golang doesn’t work with the “system stack” (on Linux in most cases, the pthread stack) but with its own goroutine stack implementation with a minimum size of 2048 bytes.

Goroutine stack is dynamic, i.e. it is constantly expanding/shrinking depending on the current needs. This means any common code that runs in system stack assumes it can grow as it wishes (until it exceeds max stack size) while actually, it can’t unless using Go APIs for expanding. Our Rust code isn’t aware of it, so it uses parts of the stack that aren't actually usable and causes stack overflow.

We lack some steps. One might consider using `runtime.morestack`, but that's probably not ideal for us because that involves managing the stack manually per our needs. Luckily, we aren’t the first ones to do FFI in Go, so we looked into what cgo does when calling foreign functions:

Referring [runtime/cgocall.go](https://go.dev/src/runtime/cgocall.go):

```
// Cgo call and callback support.1
//
// To call into the C function f from Go, the cgo-generated code calls
// runtime.cgocall(_cgo_Cfunc_f, frame), where _cgo_Cfunc_f is a
// gcc-compiled function written by cgo.
//
// runtime.cgocall (below) calls entersyscall so as not to block
// other goroutines or the garbage collector, and then calls
// runtime.asmcgocall(_cgo_Cfunc_f, frame).
//
// runtime.asmcgocall (in asm_$GOARCH.s) switches to the m->g0 stack
// (assumed to be an operating system-allocated stack, so safe to run
// gcc-compiled code on) and calls _cgo_Cfunc_f(frame).
//
// _cgo_Cfunc_f invokes the actual C function f with arguments
// taken from the frame structure, records the results in the frame,
// and returns to runtime.asmcgocall.
//
// After it regains control, runtime.asmcgocall switches back to the
// original g (m->curg)'s stack and returns to runtime.cgocall.
//
// After it regains control, runtime.cgocall calls exitsyscall, which blocks
// until this m can run Go code without violating the $GOMAXPROCS limit,
// and then unlocks g from m.
//

```

We will skip the non-blocking part i.e. calling runtime.entersyscall/runtime.exitsyscall for letting the scheduler beware of the “blocking” call so that the scheduler can yield its time to another goroutine as seen in the case of `Syscall.Syscall6.abi0` and `Syscall.Syscall.abi0`. Therefore, we just replace the stack from the goroutine to the system stack using the implementation of`runtime.asmcgocall.abi0`.

```asm
mov rbx, QWORD PTR [rsp+0x10]
mov r10, QWORD PTR [rsp+0x18]
mov rcx, QWORD PTR [rsp+0x20]
mov rax, QWORD PTR [rsp+0x8]
mov    rdx, rsp
mov    rdi, QWORD PTR fs:[0xfffffff8]
cmp    rdi, 0x0
je     2f
mov    r8, QWORD PTR [rdi+0x30]
mov    rsi, QWORD PTR [r8+0x50]
cmp    rdi, rsi
je     2f
mov    rsi, QWORD PTR [r8]
cmp    rdi, rsi
je     2f
call   go_systemstack_switch
mov    QWORD PTR fs:[0xfffffff8], rsi
mov    rsp, QWORD PTR [rsi+0x38]
sub    rsp, 0x40
and    rsp, 0xfffffffffffffff0
mov    QWORD PTR [rsp+0x30], rdi
mov    rdi, QWORD PTR [rdi+0x8]
sub    rdi, rdx
mov    QWORD PTR [rsp+0x28],rdi
mov    rsi, rbx
mov    rdx, r10
mov    rdi, rax
call   c_abi_syscall_handler
```

After saving the arguments in some untouched registers we call the handler on the system stack, and shuffle the registers/stack data to match Go’s expectations, mainly returning parameters to be in a specific place in the stack.

```asm
mov    QWORD PTR [rsp+0x28], -0x1
mov    QWORD PTR [rsp+0x30], 0x0
neg    rax
mov    QWORD PTR [rsp+0x38], rax
xorps  xmm15, xmm15
mov    r14, QWORD PTR FS:[0xfffffff8]
ret
3:
mov    QWORD PTR [rsp+0x28], rax
mov    QWORD PTR [rsp+0x30], 0x0
mov    QWORD PTR [rsp+0x38], 0x0
xorps  xmm15, xmm15
mov    r14, QWORD PTR FS:[0xfffffff8]
ret
```

After stitching together all the `ABI0` syscall detours with mirrord, let’s look if things work as expected -

{{<figure src="mirrord-go-hook-good-run.png" alt="running the gin server with the rawsyscall hook" height="100%" width="100%">}}

Success! 🥂

Complete implementation of all hooks is available [here](https://github.com/metalbear-co/mirrord/blob/main/mirrord-layer/src/go_hooks.rs).

We decided **not** to handle the non-blocking changes that Go makes, primarily because it doesn’t really matter for our use-case (having “a bit of delay” isn’t critical to the value we try to provide with mirrord). We are planning to address it later on, though.

## So Long, and Thanks for All the Fish

One of the ideas we had while working on this was to write a framework that will provide APIs to hook Go functions, i.e make trampolines from Rust using proc macros. It felt like too big of a project, and what we ended up doing suits our current needs, but if anyone is up for working on such a framework, we’d be happy to sponsor it! We’d love to hear your feedback and thoughts in our Backend Engineers community on [Discord](https://discord.com/invite/J5YSrStDKD).

Feel free to checkout [mirrord](https://github.com/metalbear-co/mirrord), send corrections/issues with the blog post on our [website’s repository](https://github.com/metalbear-co/metalbear.co) or just reach us at hi@metalbear.co.

[^1]: The cool Gopher was made using https://gopherize.me/.
