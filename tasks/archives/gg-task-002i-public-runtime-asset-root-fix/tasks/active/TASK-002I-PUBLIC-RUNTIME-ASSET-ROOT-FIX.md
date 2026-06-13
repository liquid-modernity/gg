# TASK-002I — Public Runtime Asset Root Fix

## Goal

Fix runtime asset delivery for production Cloudflare deploy.

Deploy root is:

```txt
.cloudflare-build/public/
```

So all runtime public URLs must resolve to files under that folder.

## Root cause

Production deploy uploaded `runtime/public-config.json`, but app CSS/JS and Store runtime assets were not consistently emitted under `.cloudflare-build/public/`. Some files were emitted outside the Cloudflare assets root, causing public UI to render fallback text and lose dock/sheet behavior.

## Required output paths after build

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

## Required source changes

Likely files:

```txt
tools/build.mjs
src/worker/worker.js
checks/public-softcode.check.mjs
scripts/task002i-acceptance.sh
```

## Non-goals

- No OAuth.
- No Blogger publishing.
- No legacy JS split.
- No full store source restructure.
- No Tailwind/shadcn/Tiptap/React.
- No generated output edits as source fixes.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002i-acceptance.sh
```

## Manual smoke after deploy

```txt
https://www.pakrpp.com/runtime/public-config.json
https://store.pakrpp.com/runtime/public-config.json
https://www.pakrpp.com/__gg/assets/css/gg-app.min.css
https://www.pakrpp.com/__gg/assets/js/gg-app.dev.js
https://store.pakrpp.com/assets/store/store.css
https://store.pakrpp.com/assets/store/store-core.js
https://store.pakrpp.com/assets/store/store-discovery.js
```
