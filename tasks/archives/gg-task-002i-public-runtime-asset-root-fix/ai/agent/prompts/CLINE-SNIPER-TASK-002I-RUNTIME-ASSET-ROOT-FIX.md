# CLINE SNIPER TASK — TASK-002I Public Runtime Asset Root Fix

You are editing the GG vNext repo. The repo is a unified dev + product repo for PakRPP/GG.

## Problem

Production deploy succeeds, but public UI runtime is broken:

- Root Blog and Store show icon names as text.
- Dock/sheet runtime does not work.
- `https://www.pakrpp.com/runtime/public-config.json` works.
- `https://store.pakrpp.com/runtime/public-config.json` may fail.
- Build/deploy currently emits some assets outside the Cloudflare assets root.

Cloudflare deploy root is configured by `wrangler.jsonc`:

```json
"assets": {
  "directory": ".cloudflare-build/public"
}
```

Therefore every public URL must exist under:

```txt
.cloudflare-build/public/
```

## Goal

Make public runtime asset delivery correct and verifiable.

The following production-style paths must exist after `npm run build`:

```txt
.cloudflare-build/public/assets/gg-app.min.js
.cloudflare-build/public/assets/gg-app.min.css
.cloudflare-build/public/assets/store/store.css
.cloudflare-build/public/assets/store/store-core.js
.cloudflare-build/public/assets/store/store-discovery.js
.cloudflare-build/public/__gg/assets/css/gg-app.min.css
.cloudflare-build/public/__gg/assets/js/gg-app.min.js
.cloudflare-build/public/__gg/assets/js/gg-app.dev.js
.cloudflare-build/public/runtime/public-config.json
```

Also mirror the same concept into dist public roots:

```txt
dist/dev/public/assets/**
dist/dev/public/runtime/**
dist/dev/public/__gg/assets/**
dist/prod/public/assets/**
dist/prod/public/runtime/**
dist/prod/public/__gg/assets/**
```

## Files to inspect first, and only these unless necessary

Read these first:

```txt
tools/build.mjs
src/worker/worker.js
apps/blog/index.xml
apps/store/store.html
apps/landing/landing.html
checks/public-softcode.check.mjs
package.json
```

If store runtime source paths are unclear, inspect only:

```txt
apps/store/store.css
apps/store/store-core.js
apps/store/store-discovery.js
src/modules/store/**
```

## Required implementation

### 1. Normalize public output root

Update build logic so that public runtime assets are emitted into:

```txt
dist/dev/public/
dist/prod/public/
.cloudflare-build/public/
```

`dist/*/assets` may remain as intermediate artifacts if already used, but runtime/deploy assets must be mirrored into `dist/*/public/assets` and `.cloudflare-build/public/assets`.

### 2. Ensure canonical GG app assets exist

After build, these must exist:

```txt
dist/prod/public/assets/gg-app.min.js
dist/prod/public/assets/gg-app.min.css
.cloudflare-build/public/assets/gg-app.min.js
.cloudflare-build/public/assets/gg-app.min.css
```

For dev:

```txt
dist/dev/public/assets/gg-app.bundle.js
dist/dev/public/assets/gg-app.bundle.css
```

If build produces different dev names, keep existing names but ensure public dev root has the files that dev pages or checks expect.

### 3. Ensure Blogger compatibility alias exists

Blog template may still use `/__gg/assets/...`.

Create compatibility aliases in build output:

```txt
dist/prod/public/__gg/assets/css/gg-app.min.css
dist/prod/public/__gg/assets/js/gg-app.min.js
dist/prod/public/__gg/assets/js/gg-app.dev.js
.cloudflare-build/public/__gg/assets/css/gg-app.min.css
.cloudflare-build/public/__gg/assets/js/gg-app.min.js
.cloudflare-build/public/__gg/assets/js/gg-app.dev.js
```

For now, `gg-app.dev.js` may be an alias/copy of `gg-app.min.js` for production compatibility. Do not rewrite the entire Blogger XML in this task.

### 4. Ensure Store runtime assets exist

Store HTML references:

```txt
/assets/store/store.css
/assets/store/store-core.js
/assets/store/store-discovery.js
```

Make build copy these to:

```txt
dist/prod/public/assets/store/store.css
dist/prod/public/assets/store/store-core.js
dist/prod/public/assets/store/store-discovery.js
.cloudflare-build/public/assets/store/store.css
.cloudflare-build/public/assets/store/store-core.js
.cloudflare-build/public/assets/store/store-discovery.js
```

Do not restructure `apps/store` in this task. This is a delivery fix only.

### 5. Worker static asset routing

Update `src/worker/worker.js` so static public asset paths are served before surface/origin routing, host-agnostic:

```txt
/runtime/
/assets/
/__gg/assets/
/icons/
/manifest.webmanifest
/sw.js
/offline.html
```

Do not make route handling broader than needed.

### 6. Strengthen public-softcode check

Update `checks/public-softcode.check.mjs` so it verifies real referenced runtime assets exist after build.

It must fail if any of these are missing:

```txt
.cloudflare-build/public/assets/gg-app.min.js
.cloudflare-build/public/assets/gg-app.min.css
.cloudflare-build/public/assets/store/store.css
.cloudflare-build/public/assets/store/store-core.js
.cloudflare-build/public/assets/store/store-discovery.js
.cloudflare-build/public/__gg/assets/css/gg-app.min.css
.cloudflare-build/public/__gg/assets/js/gg-app.min.js
.cloudflare-build/public/__gg/assets/js/gg-app.dev.js
.cloudflare-build/public/runtime/public-config.json
```

It should also verify that local CSS/JS references in Blog/Store/Landing resolve to files under `.cloudflare-build/public` where applicable.

### 7. Create acceptance script

Create `scripts/task002i-acceptance.sh`.

The script must:

- run the normal pipeline
- run `npm run check:public-softcode`
- assert required Cloudflare public output files exist
- assert no assets are stranded outside `.cloudflare-build/public` without also being mirrored inside it
- optionally print useful paths for manual production smoke test

### 8. Create task note

Create:

```txt
tasks/active/TASK-002I-PUBLIC-RUNTIME-ASSET-ROOT-FIX.md
```

Document:

- root cause
- files changed
- required output paths
- acceptance commands
- non-goals

## Hard boundaries

Do not implement:

- Blogger OAuth
- refresh token tooling
- publishing/sync
- Tailwind/shadcn/Tiptap/React
- legacy JS split
- full store source restructure
- full Console UI redesign

Do not manually edit generated output as the source fix:

```txt
dist/**
.cloudflare-build/**
*.bundle.js
*.bundle.css
*.min.js
*.min.css
```

Generated output can be inspected after build, but fixes belong in source/build scripts.

## Final acceptance command

Run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002i-acceptance.sh
```

Then report:

- files changed
- exact output paths confirmed
- acceptance result
- production smoke URLs to test after deploy
