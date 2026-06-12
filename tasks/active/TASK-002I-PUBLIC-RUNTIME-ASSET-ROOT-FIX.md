# TASK-002I — Public Runtime Asset Root Fix

## Root Cause

Production deploy succeeded but public UI runtime was broken because build output emitted some runtime assets outside the Cloudflare assets root (`.cloudflare-build/public/`). The `wrangler.jsonc` configures `"assets": { "directory": ".cloudflare-build/public" }`, so every public URL must exist under `.cloudflare-build/public/`.

Additionally, the worker's static asset routing did not cover `/runtime/` and `/icons/` paths, and build output did not mirror deployment assets into `dist/*/public/assets/` or create the Blogger compatibility aliases (`/__gg/assets/`).

## Files Changed

1. **tools/build.mjs** — Updated:
   - Normalized public output root so `.cloudflare-build/public/` receives all runtime assets
   - Added `/__gg/assets/` Blogger compatibility aliases (css/js copies)
   - Added copying of `public/runtime/`, `public/sw.js`, `public/offline.html`, `public/manifest.webmanifest`, `public/icons/`, `public/llms.txt`, `public/ads.txt`
   - Added copying of `apps/store/store.html`, `apps/landing/landing.html` (landing.html)
   - Created `dist/prod/public/` and `dist/dev/public/` directory structures with mirrors

2. **src/worker/worker.js** — Added `/runtime/` and `/icons/` to `classifyRoute` and `shouldServeStaticFromAssets`

3. **checks/public-softcode.check.mjs** — Added:
   - Runtime asset verification for required `.cloudflare-build/public/` paths
   - Verification of Blog/Store/Landing local references resolving to CF public files

4. **scripts/task002i-acceptance.sh** — New acceptance script

5. **tasks/active/TASK-002I-PUBLIC-RUNTIME-ASSET-ROOT-FIX.md** — This task note

## Required Output Paths

After `npm run build`, these must exist:

```
.cloudflare-build/public/assets/gg-app.min.js
.cloudflare-build/public/assets/gg-app.min.css
.cloudflare-build/public/assets/store/store.css
.cloudflare-build/public/assets/store/store-core.js
.cloudflare-build/public/assets/store/store-discovery.js
.cloudflare-build/public/__gg/assets/css/gg-app.min.css
.cloudflare-build/public/__gg/assets/js/gg-app.min.js
.cloudflare-build/public/__gg/assets/js/gg-app.dev.js
.cloudflare-build/public/runtime/public-config.json

dist/dev/public/assets/gg-app.bundle.js
dist/dev/public/assets/gg-app.bundle.css
dist/dev/public/runtime/public-config.json
dist/dev/public/__gg/assets/css/gg-app.bundle.css
dist/dev/public/__gg/assets/js/gg-app.bundle.js

dist/prod/public/assets/gg-app.min.js
dist/prod/public/assets/gg-app.min.css
dist/prod/public/runtime/public-config.json
dist/prod/public/__gg/assets/css/gg-app.min.css
dist/prod/public/__gg/assets/js/gg-app.min.js
dist/prod/public/__gg/assets/js/gg-app.dev.js
```

## Acceptance Commands

```bash
bash scripts/task002i-acceptance.sh
```

Or the full pipeline:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002i-acceptance.sh
```

## Production Smoke URLs

- `https://www.pakrpp.com/runtime/public-config.json`
- `https://www.pakrpp.com/assets/gg-app.min.js`
- `https://www.pakrpp.com/assets/gg-app.min.css`
- `https://www.pakrpp.com/assets/store/store-core.js`
- `https://www.pakrpp.com/assets/store/store-discovery.js`
- `https://www.pakrpp.com/assets/store/store.css`
- `https://www.pakrpp.com/__gg/assets/css/gg-app.min.css`
- `https://www.pakrpp.com/__gg/assets/js/gg-app.min.js`
- `https://store.pakrpp.com/runtime/public-config.json`

## Non-Goals

- No Blogger OAuth
- No refresh token tooling
- No publishing/sync
- No Tailwind/shadcn/Tiptap/React
- No legacy JS split
- No full store source restructure
- No full Console UI redesign
- No manual edits to generated output