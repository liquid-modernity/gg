# TASK-P1.08C

## Commit
- Restore homepage mixed order and preview contract: `95d5fbda0a9a8a6ce542ca39652478e3249c0b7e`

## Workflow Runs
- CI: PASS  
  https://github.com/liquid-modernity/gg/actions/runs/23334847997
- Deploy Worker/Assets to Cloudflare: PASS  
  https://github.com/liquid-modernity/gg/actions/runs/23334871845

## Exact Files Changed
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`
- `qa/live-smoke.sh`

## Intended Homepage Mixed Order
Primary mixed sections on `/`:
- `gg-mixed-featuredstrip`
- `gg-mixed-newsish-1`
- `gg-mixed-bookish`

Deferred mixed sections on `/`:
- `gg-mixed-youtubeish`
- `gg-mixed-shortish`
- `gg-mixed-newsish-2`
- `gg-mixed-podcastish`

Correct order contract on `/`:
1. `gg-mixed-featuredstrip`
2. `gg-mixed-newsish-1`
3. `gg-mixed-bookish`
4. `gg-mixed-youtubeish`
5. `gg-mixed-shortish`
6. `gg-mixed-newsish-2`
7. `gg-mixed-podcastish`

Empty-feed collapse rule:
- deferred sections may collapse when their feed returns zero entries
- primary sections are still expected to appear first
- deferred collapse must not change the relative order of the sections that do render

## Intended Editorial Preview Contract
- Surface: homepage editorial preview in `.gg-blog-sidebar--right .gg-info-panel .gg-editorial-preview`
- Mount/live area: right sidebar info panel on `/` in homepage blog state
- Data behavior: preview opens from listing-card hover/focus and shows title, author, CTA, and snippet or TOC row
- Must not regress when mixed runtime changes:
  - preview shell presence
  - preview visibility on hover
  - preview visibility on focus
  - right-panel/info-panel open state
  - preview content hydration

## Root Cause
- Mixed-order mismatch: `bookish` was still structurally living in `#gg-mixed-deferred`, so runtime on `/` rendered `bookish` after the blog listing instead of in the primary mixed group.
- Editorial preview regression: `InfoPanel.canHoverPreview()` only treated `feed` and `listing` as hover-preview surfaces. Homepage `/` runs as `main[data-gg-surface="home"][data-gg-home-state="blog"]`, so preview shell existed but hover/focus never opened it.

## What Was Restored Before Safeguard
- Editorial preview on `/` was restored first by treating homepage blog state as a listing-like preview surface.
- After restore, hover/focus on the first listing card opens the right sidebar panel and renders editorial preview content again.
- Mixed-media order on `/` was then corrected by runtime-normalizing `bookish` into the primary mixed section ahead of deferred mixed slots.

## Safeguard Added
- `isListingLikeSurface()` is now the shared homepage/listing guard for editorial preview behavior.
- `normalizeHomepageMixedOrder()` now runs in both `GG.app.ensureBuckets()` and `GG.app.rehydrate()` so `/` cannot silently fall back to the wrong primary/deferred grouping.
- `qa/live-smoke.sh` now checks the true homepage contract:
  - explicit mixed order
  - primary visible mixed sections
  - deferred collapse logic
  - editorial preview shell
  - editorial preview hover
  - editorial preview focus
  - editorial preview content

## Before / After Proof
Homepage order proof:
- `qa/audit-output/task-p108c-homepage-order-proof.json`

Editorial preview restore proof:
- `qa/audit-output/task-p108c-editorial-preview-proof.json`

Screenshots:
- Before homepage `/`: `qa/audit-output/screenshots/task-p108c-before-home.png`
- After homepage `/`: `qa/audit-output/screenshots/task-p108c-after-home.png`
- Before editorial preview `/`: `qa/audit-output/screenshots/task-p108c-before-preview.png`
- After editorial preview `/`: `qa/audit-output/screenshots/task-p108c-after-preview.png`

Before runtime proof:
- mixed order was `featuredstrip -> newsish-1 -> youtubeish -> shortish -> newsish-2 -> podcastish -> bookish`
- primary widget group only contained `HTML15` and `HTML6`
- `bookish` stayed in deferred widgets as `HTML5`
- editorial preview shell existed, but hover/focus kept `rightPanel=closed`, `infoPanel=closed`, `previewVisible=false`

After runtime proof:
- mixed order is `featuredstrip -> newsish-1 -> bookish -> youtubeish -> shortish -> newsish-2 -> podcastish`
- primary widget group now contains `HTML15`, `HTML6`, and `HTML5`
- deferred widgets contain only `HTML10`, `HTML11`, `HTML7`, and `HTML12`
- editorial preview opens on `/` with `rightPanel=open`, `infoPanel=open`, visible preview content, hydrated title/author/snippet, and a real CTA link

## Live Smoke
- Final result: PASS
- Log summary: `qa/audit-output/task-p108c-live-smoke.txt`

### Summary
- homepage mixed surface-state: PASS
- homepage mixed module-load: PASS
- homepage mixed order: PASS
- homepage mixed primary-visible: PASS
- homepage mixed deferred-contract: PASS
- homepage editorial-preview-shell: PASS
- homepage editorial-preview-hover: PASS
- homepage editorial-preview-focus: PASS
- homepage editorial-preview-content: PASS
- zero fixture: PASS
- two fixture: PASS
- sixteen fixture: PASS
- compose lane: SKIP (open-comment fixtures unset)
- worker version: PASS
- template parity: PASS

## Accepted Limitations
- Homepage mixed order on `/` is runtime-normalized over Blogger-emitted widget containers.
- Deferred homepage mixed sections may stay collapsed when their feeds are empty.
- Homepage editorial preview is runtime-owned in the right sidebar info panel and depends on listing-like homepage blog state.
- Comments compose lane remains `SKIP` until open-comment fixtures are configured.

## Freeze Note
- Comments rail freeze remains in effect.
- TASK-P1.08C only repaired homepage mixed ordering and homepage editorial preview behavior.
- No comments architecture work, XML rework, or feature expansion was introduced here.

## ZIP Entries For This Task
- `package.json`
- `package-lock.json`
- `wrangler.jsonc`
- `index.prod.xml`
- `src/worker.js`
- `public/manifest.webmanifest`
- `public/_headers`
- `public/robots.txt`
- `public/llms.txt`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`
- `qa/live-smoke.sh`
- `qa/gaga-audit.mjs`
- `qa/package-audit.mjs`
- `qa/template-pack.sh`
- `qa/template-proof.sh`
- `qa/template-status.sh`
- `qa/template-fingerprint.mjs`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `qa/audit-output/task-p108c.md`
- `qa/audit-output/task-p108c.json`
- `qa/audit-output/task-p108c-live-smoke.txt`
- `qa/audit-output/task-p108c-homepage-order-proof.json`
- `qa/audit-output/task-p108c-editorial-preview-proof.json`
- `qa/audit-output/screenshots/task-p108c-before-home.png`
- `qa/audit-output/screenshots/task-p108c-after-home.png`
- `qa/audit-output/screenshots/task-p108c-before-preview.png`
- `qa/audit-output/screenshots/task-p108c-after-preview.png`
