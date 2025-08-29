---
title: "Fun with macOS's SIP"
description: "How we dealt with macOS's SIP mechanism to load mirrord into protected binaries"
lead: "How we dealt with macOS's SIP mechanism to load mirrord into protected binaries"
tags:
  - low-level
  - macos
  - sip
  - research
  - kubernetes
date: 2023-01-24T0:00:00+00:00
lastmod: 2023-01-24T0:00:00+00:00
draft: false
weight: 50
contributors: ["Aviram Hassan", "Tal Zwick"]
---

While developing mirrord, which heavily relies on injecting itself into other people's binaries, we ran into some challenges posed by macOS’s SIP (System Integrity Protection). This post details how we ultimately overcame these challenges, and we hope it can be of help to other people hoping to learn about SIP, as we've learned the hard way that there's very little written about this subject on the internet.

## What is mirrord?
[mirrord](/mirrord/) lets you run a local process in the context of a cloud service, which means we can test our code on our staging cluster without actually deploying it there. This leads to shorter feedback loops (you don’t have to wait on long CI processes to test your code in staging conditions) and a more stable staging environment (since untested services aren’t being deployed there). There is a detailed overview of mirrord in [this](https://metalbear.co/blog/mirrord-3.0-is-out/) blog post.

## What is SIP and why does mirrord care about it?

Apple introduced [SIP](https://en.wikipedia.org/wiki/System_Integrity_Protection) in 2015 to prevent tampering with system binaries because those usually have high permissions and entitlements.
mirrord works by injecting its library (.dylib or .so) into the local process, the one you want to “mirror” into the cloud. In order to inject itself into binaries, it uses `LD_PRELOAD` on Linux and `DYLD_INSERT_LIBRARIES` on macOS. 
One of the features of SIP is that it disallows the use of `DYLD_INSERT_LIBRARIES` with protected binaries. Bummer - we can’t use mirrord to locally run e.g. `bash` or `ls` in a cloud context. we can’t run `mirrord exec bash` or `mirrord exec ls`. We’ll have to find a way to get around SIP!

## Detecting if a binary is SIP-protected

In order to start bypassing SIP, we needed to find a way to check if a binary is even SIP protected to begin with. We initially used pretty coarse heuristic, assuming that a binary is SIP-protected if it’s in one of these locations:

- /System

- /bin

- /usr

- /sbin

- /var

However, we found that the “stat” function can return a flag called `RESTRICTED` which we read could be related, and decided to use that instead[^1]. The code is quite simple:

```rs
       let metadata = std::fs::metadata(&complete_path)?;
       if (metadata.st_flags() & SF_RESTRICTED) > 0 {
           return Ok(SipStatus::SomeSIP(complete_path, None));
       }
```

## Shebang!
Detection was simple enough when mirrord was run directly on a SIP-protected binary. However, we soon ran into a less trivial (but common) scenario - an interpreter script that starts with a shebang pointing to a SIP-protected binary, for example `yarn`/`npm`/`pyenv`. If we look at `npm` for instance, it points to a file which starts with the following code:

```bash
#!/usr/bin/env node
require('../lib/cli.js')(process)
```

In this example it will execute env, which will execute node with the next line.
The problem? `/usr/bin/env` is SIP protected, meaning it will strip our `DYLD_INSERT_LIBRARIES` then run node without mirrord. Thanks for nothing SIP!
So we also needed to check whether the file is a “shebang” file (i.e starts with #!), what file the shebang points to, and whether that file is a SIP-protected binary.

## Bypassing SIP
Now that we found a way to detect whether we’re being run on a SIP-protected binary, we need to figure out how to bypass SIP and let mirrord load into the binary with `DYLD_INSERT_LIBRARIES`. When googling around, we found people saying you can bypass SIP by copying the binary to another directory and re-signing it. We found that to be partially true.
Why partially? Because if you tried to do it on Apple Silicon (arm), it wouldn’t work. This is because beginning with M1, macOS ships with arm64e binaries. The `e` indicates an arm64 extension that adds pointer authentication. It’s another security measurement added by Apple (kudos to Apple for having great security, too bad it affects us).
We won’t go into details about what pointer authentication does, but you can read more about it [here](https://googleprojectzero.blogspot.com/2019/02/examining-pointer-authentication-on.html).
So why was this a problem? First, mirrord is written in Rust, which doesn’t support compiling arm64e binaries. The other problem is that only Apple-signed binaries can run with arm64e architecture.
This is what happens if we try the “old” trick:
➜  /tmp cp /usr/bin/env /tmp/env
➜  /tmp codesign -f -s - /tmp/env
/tmp/env: replacing existing signature
➜  /tmp /tmp/env
[1]	20114 killed 	/tmp/env

Killed! And it was so young. :(
Recording using Console (macOS’s built in log viewer) while running the binary reveals the reason:

{{<figure src="console.png" alt="screenshot from console saying exec_mach_imgact: not running binary env built against preview arm64e ABI" height="100%" width="100%">}}

From Apple’s point of view, arm64e is preview only, i.e the ABI can change and they don’t want a third party building on top of it, as it’s not guaranteed to work. You can enable running third party executables with arm64e ABI only if you boot into recovery mode and change the settings, which is not something we want to ask our users to do. 

## Handling arm64e

Initially we tried to convert the arm64e ABI into arm64 on the fly. Yes, people familiar with how this ABI works probably think we’re insane, but we were optimistic.. and it actually worked! for example, if you take `/usr/bin/env` and just change the file headers to say it’s arm64, you’d be able to re-sign it and run it normally! We actually do it for our binaries to be able to load to arm64e binaries:

```yaml
# from our release.yaml https://github.com/metalbear-co/mirrord/blob/main/.github/workflows/release.yaml
    - name: build mirrord-layer macOS arm/arm64e
      # Editing the arm64 binary, since arm64e can be loaded into both arm64 & arm64e
      # >> target/debug/libmirrord_layer.dylib: Mach-O 64-bit dynamically linked shared library arm64
      # >> magic bits: 0000000 facf feed 000c 0100 0000 0000 0006 0000
      # >> After editing using dd -
      # >> magic bits: 0000000 facf feed 000c 0100 0002 0000 0006 0000
      # >> target/debug/libmirrord_layer.dylib: Mach-O 64-bit dynamically linked shared library arm64e
      run: |
        cargo +nightly build --release -p mirrord-layer --target=aarch64-apple-darwin
        cp target/aarch64-apple-darwin/release/libmirrord_layer.dylib target/aarch64-apple-darwin/release/libmirrord_layer_arm64e.dylib
        printf '\x02' | dd of=target/aarch64-apple-darwin/release/libmirrord_layer_arm64e.dylib bs=1 seek=8 count=1 conv=notrunc
```

It didn’t work for all binaries though (`ls` for example) and when we started digging we found out that there are a lot of new features being used in arm64e, for example specific relocations that contain pointer authentication stuff. We decided to give up on ABI conversion for the time being.
Luckily, Apple ships fat binaries on both architecture machines. Fat binaries are Apple’s name for Mach-O files containing two different binaries, each built for a different architecture, so the runtime can decide which one it will use. By default, it will choose arm64e, but we can do something nice with the x64 binary.
```file /bin/ls
/bin/ls: Mach-O universal binary with 2 architectures: [x86_64:Mach-O 64-bit executable x86_64] [arm64e:Mach-O 64-bit executable arm64e]
/bin/ls (for architecture x86_64):    Mach-O 64-bit executable x86_64
/bin/ls (for architecture arm64e):    Mach-O 64-bit executable arm64e
```
The idea is that we take the binary we want to load ourself into, extract only the x64 binary (on arm), re-sign it, and run it. The only downside here is that we require Rosetta[^2] to be installed on the system and there’s a performance impact - but usually system binaries are used for simple operations like `env` or `bash` (see the shebang case).

## Putting it all together

1. Detect SIP (Shebang/Restricted)
2. Patch

    a. Extract x64 binary into a new file

    b. chmod +x it

    c. Sign it

3. Execute

```rs
   /// Read the contents (or just the x86_64 section in case of a fat file) from the SIP binary at
   /// `path`, write it into `output`, give it the same permissions, and sign the new binary.
   fn patch_binary<P: AsRef<Path>, K: AsRef<Path>>(path: P, output: K) -> Result<()> {
       let data = std::fs::read(path.as_ref())?;
       let binary_info = BinaryInfo::from_object_bytes(&data)?;


       let x64_binary = &data[binary_info.offset..binary_info.offset + binary_info.size];
       std::fs::write(output.as_ref(), x64_binary)?;
       // Give the new file the same permissions as the old file.
       std::fs::set_permissions(
           output.as_ref(),
           std::fs::metadata(path.as_ref())?.permissions(),
       )?;
       codesign::sign(output)
   }
```

Integration into mirrord took two steps:

1. When using mirrord directly on a SIP-protected binary, do the patch

2. When using mirrord on a process, and that process executes a SIP-protected binary, replace it on the fly. This was done by having mirrord hook `execve` in the process

`execve` hook:
```rs

/// Hook for `libc::execve`.
///
/// Patch file if it is SIPed, use new path if patched.
/// If any args in argv are paths to mirrord's temp directory, strip the temp dir part.
/// So if argv[1] is "/var/folders/1337/mirrord-bin/opt/homebrew/bin/npx"
/// Switch it to "/opt/homebrew/bin/npx"
/// then call normal execve with the possibly updated path and argv and the original envp.
#[hook_guard_fn]
pub(crate) unsafe extern "C" fn execve_detour(
   path: *const c_char,
   argv: *const *const c_char,
   envp: *const *const c_char,
) -> c_int {
   // Do unsafe part of path conversion here.
   let rawish_path = (!path.is_null()).then(|| CStr::from_ptr(path));
   let mut patched_path = CString::default();
   let final_path = patch_if_sip(rawish_path)
       .and_then(|s| match CString::new(s) {
           Ok(c_string) => {
               patched_path = c_string;
               Success(patched_path.as_ptr())
           }
           Err(err) => Error(Null(err)),
       })
       .unwrap_or(path); // Continue even if there were errors - just run without patching.


   let argv_arr = Nul::new_unchecked(argv);


   // If we intercept args, we create a new array.
   // execve takes a null terminated array of char pointers.
   // ptr_vec will own the vector that will be passed to execve as an array.
   let mut ptr_vec: Vec<*const c_char> = Vec::new();
   let final_argv = intercept_tmp_dir(argv_arr)
       .map(|new_vec| {
           ptr_vec = new_vec; // Make sure vector still lives when we pass the pointer to execve.
           ptr_vec.as_ptr()
       })
       .unwrap_or(argv);

// Call execve's default implementation
   FN_EXECVE(final_path, final_argv, envp)
}
```

## Bonus content: Why is this possible?
You might be asking yourself, “If this is a security feature by Apple, why is it possible to just bypass it that way?” The answer is that we do not bypass the security feature, just the problem it created for us. Apple operating systems have the concept of [“entitlements”](https://developer.apple.com/documentation/bundleresources/entitlements), which are definitions of which special operations an executable is allowed to perform, and which special resources it should have access to. Before released applications can have entitlements, they need to go through some approval process with Apple. Shared libraries get the entitlements of the host executable, so if we could load any library to any process, a non-Apple-approved library could enjoy entitlements it shouldn’t have by loading into an entitled process. That would be a pretty straight forward privilege escalation of that library’s code. SIP and the [hardened runtime](https://developer.apple.com/documentation/security/hardened_runtime) prevent that from happening.

When we, in our bypassing mechanism, copy an executable and resign it, it loses its entitlements. So it is still guaranteed that our dynamic library could not run with any ungranted entitlements. The integrity of granted entitlements is preserved.
The loss of entitlements is not a problem for mirrord, because we do not expect to ever execute with mirrord any application that requires Apple entitlements. So we give up the mirrored application’s entitlements (which do not exist or are not needed), in order to be able to load our library into that application.


## Afterword

You’re welcome to check out the full implementation in our [GitHub repository](https://github.com/metalbear-co/mirrord/tree/main/mirrord/sip), Join our [Backend Engineers Discord](https://discord.gg/metalbear) community, subscribe to our newsletter and of course use mirrord!


[^1]: But in fact there might be other locations that are SIP protected, and if someone has a good and reliable way to detect if a binary is SIP, we’d love to hear it.
[^2]: Apple emulator for running x86-64 binaries on arm. https://support.apple.com/en-il/HT211861