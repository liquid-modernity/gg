# Task 028 — Sheet QA Smoke and Regression Proof

## Objective

Add regression proof for the sheet/dock contract so the fixes from Tasks 023–027 do not silently break later.

The QA should catch:

```txt
panel width drifting back to 720/760/920/1040
handles reverting to passive div/span elements
Blogger preview losing Store-style sheet grammar
source/staged asset drift
generated template drift
```

## Scope

Likely files:

```txt
qa/template-proof.sh
qa/live-smoke-worker.sh
qa/live-smoke.sh
qa/store-artifact-smoke.sh
package.json
```

Optional new file if cleaner:

```txt
qa/sheet-contract-smoke.sh
```

Do not add Playwright or heavy browser dependencies unless the repo already has them. Static and curl-based proof is acceptable if that matches current repo style.

## Required Checks

### 1. Width Contract Check

Add a check that fails if control surfaces still use stale panel widths:

```txt
720px bottom-sheet/dock contract
760px top-sheet contract
920px Blogger panel contract
1040px dock/sheet contract
```

The check should distinguish content widths from control widths. `--store-max-wide: 1040px` for product grids should not fail. A dock/sheet using 1040px should fail.

Suggested static checks:

```bash
grep -RInE -- "--gg-panel-width:.*(720px|760px|920px|1040px)" index.xml landing.html store.html src css template

grep -RInE -- "(gg-dock|gg-sheet__panel|store-sheet-width|store-bottom-sheet-width).*720px|760px|920px|1040px" \
  index.xml landing.html store.html src/css src/store template
```

Implement robustly. Do not create false failures for content grid tokens.

### 2. Interactive Handle Check

Fail if visible drag handles are passive and aria-hidden:

```txt
div/span + data-gg-drag-handle + aria-hidden=true
span + data-store-drag-handle + aria-hidden=true
```

Acceptable visible handle pattern:

```html
<button ... data-gg-drag-handle="..." data-gg-close="...">
<button ... data-store-drag-handle="..." data-store-close="...">
```

Preview Store handle may use:

```html
<button class="store-preview__handle" data-store-close="preview">
```

### 3. Sticky Handle Placement Check

Static proof should verify expected class markers exist:

```txt
Blogger top preview has gg-content-sheet__affordance / gg-preview__affordance
Store preview has store-preview__footer / store-preview__handle
Bottom sheets have gg-sheet__head / gg-sheet__handle
```

This does not prove runtime behavior fully, but it catches template regressions.

### 4. Blogger Preview Grammar Check

Verify Blogger preview template contains the new grammar markers:

```txt
gg-preview__hero
gg-preview__shade
gg-preview__intro
gg-preview__surface
gg-preview__affordance
gg-preview__cta
```

Fail if the preview reverts to only the old body/media/title structure.

### 5. Source / Asset Drift Check

Add or extend checks for hash parity:

```bash
sha256sum src/css/gg-app.source.css __gg/assets/css/gg-app.dev.css dist/assets/css/gg-app.dev.css
sha256sum src/js/gg-app.source.js __gg/assets/js/gg-app.dev.js dist/assets/js/gg-app.dev.js
sha256sum src/store/store.css assets/store/store.css
sha256sum src/store/store.js assets/store/store.js
```

The script should fail when source and staged assets drift under the repo's current mirror convention.

### 6. Live Smoke Markers

Extend `qa/live-smoke-worker.sh` or equivalent so live fetches can prove that these routes serve the updated shell:

```txt
/
/landing
/store
```

Suggested live marker assertions:

```txt
--gg-panel-width
600px
gg-preview__hero
gg-preview__surface
store-preview__handle
store-bottom-sheet
```

Keep retry/timeout behavior consistent with existing live smoke conventions. Do not make transient infra errors look like product regressions.

## Suggested Package Script

Add a script if useful:

```json
{
  "gaga:verify-sheet-contract": "bash qa/sheet-contract-smoke.sh"
}
```

Then include it in the appropriate verification path if it is stable.

Do not overload production deployment with brittle checks until the script is clean.

## Required Verification

Run:

```bash
npm run gaga:template:pack
npm run gaga:template:proof
npm run store:build
npm run store:proof
bash qa/store-artifact-smoke.sh
npm run gaga:preflight
```

If you add the package script:

```bash
npm run gaga:verify-sheet-contract
```

If live network is stable:

```bash
npm run gaga:verify-worker-live:local
```

## Final Acceptance Standard

```txt
PASS: QA fails on stale dock/sheet widths
PASS: QA fails on passive aria-hidden visible handles
PASS: QA proves Blogger preview grammar markers exist
PASS: QA proves Store preview/bottom-sheet markers remain
PASS: QA catches source/staged asset drift
PASS: QA does not falsely fail on Store content-grid 1040px width
PASS: live smoke distinguishes infra unreachable from product failure
```

## Non-Goals

Do not:

- add heavy E2E dependencies without existing project support
- make tests flaky by depending on exact pixel screenshots
- fail content-grid widths that are intentionally wider than panels
- change deployment credentials or Cloudflare config
- test unrelated Store catalog content
