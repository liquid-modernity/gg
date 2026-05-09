# TASK 006 — Real minify and versioned build

## Context

The repo must stop shipping readable development source as if it were production assets. `.min.js` and `.min.css` must be real minified release outputs, not copies.

Source may be modular. Release output should stay bundled and strategic.

## Goal

Create reproducible release assets:

```text
- real minified CSS/JS
- versioned or fingerprinted assets
- immutable cache policy for versioned assets
- dev assets remain available for development
- generated template references correct asset mode
```

## Files to inspect

```text
package.json
tools/template-pack.mjs
scripts/build*.js
scripts/build*.mjs
scripts/preflight*.js
worker.js
wrangler.jsonc
template/index.xml
templates/*.tpl
src/css/**/*
src/js/**/*
```

Adjust paths to actual repo.

## Required changes

### 1. Add build dependency

Use `esbuild` unless the repo already uses an equivalent bundler.

```bash
npm i -D esbuild
```

### 2. Keep dev outputs unminified

Examples:

```text
__gg/assets/css/gg-app.dev.css
__gg/assets/js/gg-app.dev.js
dist/assets/css/gg-app.dev.css
dist/assets/js/gg-app.dev.js
```

Do not break current development workflow.

### 3. Generate true minified outputs

Example JS build:

```js
import { buildSync } from "esbuild";

buildSync({
  entryPoints: ["src/js/gg-app.source.js"],
  outfile: "__gg/assets/js/gg-app.min.js",
  bundle: false,
  minify: true,
  sourcemap: false,
  target: ["es2018"]
});
```

Example CSS build:

```js
buildSync({
  entryPoints: ["src/css/gg-app.source.css"],
  outfile: "__gg/assets/css/gg-app.min.css",
  bundle: true,
  minify: true,
  loader: { ".css": "css" }
});
```

If source is already modular, prefer:

```text
src/css/index.css
src/js/index.js
```

or surface entries:

```text
src/css/core.css
src/css/blog.css
src/css/landing.css
src/css/store.css
src/js/boot.js
src/js/blog.js
src/js/landing.js
src/js/store.js
```

But do not over-split runtime in this task.

### 4. Add versioning/fingerprint

Options:

```text
A. filename hash: gg-app.<hash>.min.js
B. query fingerprint: gg-app.min.js?v=<fingerprint>
```

Preferred for immutable caching:

```text
gg-app.<contenthash>.min.js
gg-app.<contenthash>.min.css
```

Generate an asset manifest:

```json
{
  "css": {
    "app": "/__gg/assets/css/gg-app.a1b2c3.min.css"
  },
  "js": {
    "app": "/__gg/assets/js/gg-app.d4e5f6.min.js"
  }
}
```

### 5. Template/Worker integration

Generated XML/HTML must reference correct assets depending on mode:

```text
development => .dev assets
staging/performanceAudit => minified/versioned assets if stable enough
production => minified/versioned assets
```

If staging must still use dev assets temporarily, document why. Do not silently mix.

### 6. QA check: min smaller than dev

Add check:

```js
const fs = require("fs");
const dev = fs.statSync("__gg/assets/js/gg-app.dev.js").size;
const min = fs.statSync("__gg/assets/js/gg-app.min.js").size;
if (min >= dev) {
  console.error("FAIL: minified JS is not smaller than dev JS");
  process.exit(1);
}
```

Also check CSS.

### 7. Immutable cache for versioned assets

Coordinate with `worker.js` from TASK 000:

```text
versioned-asset => public, max-age=31536000, immutable
```

Do not apply immutable caching to unversioned dev assets.

## Non-goals

- Do not perform full source modularization unless already prepared.
- Do not redesign pages.
- Do not change route truth.
- Do not implement dashboard.
- Do not remove development `.dev` assets.

## Acceptance criteria

```text
- .min.js is truly minified and smaller than .dev.js.
- .min.css is truly minified and smaller than .dev.css.
- Build is reproducible from scripts/CI.
- Asset manifest exists or equivalent mapping exists.
- Generated XML/HTML references correct assets.
- Versioned assets get immutable cache policy.
- Development mode remains usable.
```

## Suggested commit

```text
feat(build): generate real minified and versioned assets
```
