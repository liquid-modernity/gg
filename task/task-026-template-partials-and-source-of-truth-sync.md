# Task 026 — Template Partials and Source-of-Truth Sync

## Objective

Prevent drift between source files, Blogger template output, staged assets, and deployable artifacts after Tasks 023–025.

This repo has multiple copies of the same runtime truth. Codex must not edit only one copy and leave the deployed copy stale.

## Source-of-Truth Contract

Treat these as the preferred sources:

```txt
src/css/gg-app.source.css        -> Blogger app CSS source
src/js/gg-app.source.js          -> Blogger app JS source
src/store/store.css              -> Store CSS source
src/store/store.js               -> Store JS source
template/partials/*.xml          -> Blogger template partial source
```

Treat these as generated/staged/deploy artifacts that must be synchronized:

```txt
index.xml
dist/blogger-template.publish.xml
dist/index.final.xml
dist/index.final.production.xml
dist/index.standalone.development.xml
__gg/assets/css/gg-app.dev.css
__gg/assets/css/gg-app.min.css
__gg/assets/js/gg-app.dev.js
__gg/assets/js/gg-app.min.js
dist/assets/css/gg-app.dev.css
dist/assets/css/gg-app.min.css
dist/assets/js/gg-app.dev.js
dist/assets/js/gg-app.min.js
assets/store/store.css
assets/store/store.js
```

If the repo has a tool that updates these files, use it. If not, mirror carefully and document it in the final implementation summary.

## Scope

Likely files:

```txt
template/partials/05-bskin-wrapper-original.xml
template/partials/12-post-detail-comments.xml
template/partials/16-discovery-panel-and-templates.xml
template/partials/17-preview-panel-and-templates.xml
template/partials/18-more-panel.xml
src/css/gg-app.source.css
src/js/gg-app.source.js
src/store/store.css
src/store/store.js
index.xml
store.html
landing.html
assets/store/store.css
assets/store/store.js
__gg/assets/css/gg-app.dev.css
__gg/assets/css/gg-app.min.css
__gg/assets/js/gg-app.dev.js
__gg/assets/js/gg-app.min.js
dist/assets/css/gg-app.dev.css
dist/assets/css/gg-app.min.css
dist/assets/js/gg-app.dev.js
dist/assets/js/gg-app.min.js
dist/blogger-template.publish.xml
dist/index.final.xml
dist/index.final.production.xml
dist/index.standalone.development.xml
```

## Required Changes

1. Update partials first when the change concerns Blogger XML markup.

   Do not only patch `index.xml` if a matching partial exists.

2. Regenerate Blogger template artifacts:

   ```bash
   npm run gaga:template:pack
   ```

3. Confirm `index.xml` and generated `dist/*xml` contain the new sheet markup, handle buttons, and shared panel width.

4. Sync Blogger CSS/JS assets.

   Current repo state may mirror these files byte-for-byte:

   ```txt
   src/css/gg-app.source.css == __gg/assets/css/gg-app.dev.css == dist/assets/css/gg-app.dev.css
   src/js/gg-app.source.js   == __gg/assets/js/gg-app.dev.js   == dist/assets/js/gg-app.dev.js
   ```

   If the repo does not minify, keep `.min.*` in sync with `.dev.*` as the current convention.

5. Sync Store CSS/JS assets:

   ```txt
   src/store/store.css == assets/store/store.css
   src/store/store.js  == assets/store/store.js
   ```

   If `store.html` embeds or depends on copied asset content, ensure it reflects source updates after `npm run store:build`.

6. Remove accidental edits to macOS metadata:

   ```txt
   __MACOSX/**
   .DS_Store
   ```

   These should never be part of the implementation diff.

## Required Diff Checks

Run these after implementation:

```bash
sha256sum src/css/gg-app.source.css __gg/assets/css/gg-app.dev.css dist/assets/css/gg-app.dev.css
sha256sum src/js/gg-app.source.js __gg/assets/js/gg-app.dev.js dist/assets/js/gg-app.dev.js
sha256sum src/store/store.css assets/store/store.css
sha256sum src/store/store.js assets/store/store.js
```

If hashes intentionally differ because a real build/minify step exists, document why.

Search for stale controls:

```bash
grep -RInE -- "min\(100%, 920px\)|min\(100%, 760px\)|min\(calc\(100% - 12px\), 720px\)" \
  index.xml landing.html store.html src/css src/store template __gg/assets dist/assets
```

Search for passive interactive handles:

```bash
grep -RInE -- "aria-hidden=['\"]true['\"].*data-(gg|store)-drag-handle|data-(gg|store)-drag-handle=.*aria-hidden=['\"]true['\"]" \
  index.xml store.html template src
```

## Required Verification

Run:

```bash
npm run gaga:template:pack
npm run gaga:template:status
npm run gaga:template:proof
npm run store:build
npm run store:proof
npm run gaga:preflight
```

If available and network is stable:

```bash
npm run gaga:verify-worker-live:local
```

## Final Acceptance Standard

```txt
PASS: source partials and index.xml agree
PASS: source CSS/JS and staged CSS/JS agree
PASS: Store source and Store assets agree
PASS: generated Blogger dist files contain new markup
PASS: no __MACOSX or .DS_Store noise is introduced
PASS: no stale 720/760/920 panel-control widths remain
PASS: no passive aria-hidden drag handle remains where tap-close is required
```

## Non-Goals

Do not:

- invent a new build system
- rewrite template-pack tooling unless it is broken
- minify manually with unrelated formatting churn
- change unrelated generated artifacts
- change production deployment config unless required by verification
