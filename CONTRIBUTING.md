# How it's built

This website consists of two independent Hugo apps, that are compiled separately.
One of them is located in the root directory, the other one in the `mirrord.dev` subdirectory.

The applications are compiled separately, and their artifacts are merged manually in `build.sh`.

# How to run this locally

```bash
npm install
CF_PAGES_URL=http://localhost:1337 ./build.sh
cd public && python3 -m http.server --bind 127.0.0.1 1337
```

The site will be available at http://localhost:1337.
