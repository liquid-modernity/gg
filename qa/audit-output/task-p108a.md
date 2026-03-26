# TASK-P1.08A

## Commits
- Runtime bootstrap fix: `f0d4f106825fa2174102da18a64ffb4f77f17094`
- Homepage mixed smoke contract alignment: `742e80395d63222a75dc3342b74173cc5fa606df`
- Third-party recaptcha false-positive filter: `c416279eca2f88c3cdb400353808a25cd314e36f`

## Workflow Runs
- CI: PASS  
  https://github.com/liquid-modernity/gg/actions/runs/23333374540
- Deploy Worker/Assets to Cloudflare: PASS  
  https://github.com/liquid-modernity/gg/actions/runs/23333393682

## Exact Files Changed
- `public/assets/latest/core.js`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`
- `qa/live-smoke.sh`

## Root Cause
- `/` was still booting through an older homepage-path contract in `public/assets/latest/core.js`, so plain root homepage traffic was not treated as the blog/listing home consistently.
- Mixed-media loading on `/` was not first-class in bucket boot. `ui.bucket.mixed.js` was not guaranteed to load on plain `/`, so mixed hosts stayed present in DOM but remained hidden.
- The initial homepage mixed smoke gate was too strict after the runtime fix. It incorrectly required every mixed slot to render, even though XML marks `youtubeish`, `shortish`, `newsish-2`, and `podcastish` as deferred and the mixed module legitimately collapses them when their feeds are empty.

## Homepage Mixed Contract
Expected slot order on `/`:
- `gg-mixed-featuredstrip`
- `gg-mixed-newsish-1`
- `gg-mixed-youtubeish`
- `gg-mixed-shortish`
- `gg-mixed-newsish-2`
- `gg-mixed-podcastish`
- `gg-mixed-bookish`

Expected first-surface visible sections:
- `gg-mixed-featuredstrip`
- `gg-mixed-newsish-1`
- `gg-mixed-bookish`

Deferred sections allowed to collapse when feed data is empty:
- `gg-mixed-youtubeish`
- `gg-mixed-shortish`
- `gg-mixed-newsish-2`
- `gg-mixed-podcastish`

## Before / After Proof For `/`
- Before screenshot: `qa/audit-output/screenshots/task-p108a-before-home.png`
- After screenshot: `qa/audit-output/screenshots/task-p108a-after-home.png`
- DOM proof: `qa/audit-output/task-p108a-homepage-proof.json`

Before proof method:
- request interception blocked `ui.bucket.mixed.js`, reproducing the broken runtime outcome where mixed hosts existed but all remained hidden.

After proof summary:
- `ui.bucket.mixed.js` loads on `/`
- slot order matches the XML contract
- `featuredstrip`, `newsish-1`, and `bookish` render visibly with non-zero counts
- deferred slots remain present and may stay collapsed when feed count is zero

## Live Smoke
- Final result: PASS
- Log: `qa/audit-output/task-p108a-live-smoke.txt`

### Summary
- homepage mixed surface-state: PASS
- homepage mixed module-load: PASS
- homepage mixed order: PASS
- homepage mixed primary-visible: PASS
- homepage mixed deferred-contract: PASS
- zero fixture: PASS
- two fixture: PASS
- sixteen fixture: PASS
- compose lane: SKIP (open-comment fixtures unset)
- worker version: PASS
- template parity: PASS

## Accepted Limitations
- Homepage mixed-media on `/` is runtime-hydrated over Blogger feed data.
- Deferred mixed sections are allowed to stay collapsed when their label feeds return zero entries.
- The home-root runtime may expose `main[data-gg-surface="home"]` with `data-gg-home-state="blog"` while the body surface and main view still represent the listing homepage contract.
- Comments compose lane remains `SKIP` until open-comment fixtures are configured.

## Freeze Note
- Comments rail freeze remains in effect.
- TASK-P1.08A repaired homepage mixed-media runtime/bootstrap behavior and aligned smoke evidence only.
- No XML purity work, comments architecture changes, or unrelated feature work was added here.

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
- `public/assets/latest/core.js`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/core.js`
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
- `qa/audit-output/task-p108a.md`
- `qa/audit-output/task-p108a.json`
- `qa/audit-output/task-p108a-live-smoke.txt`
- `qa/audit-output/task-p108a-homepage-proof.json`
- `qa/audit-output/screenshots/task-p108a-before-home.png`
- `qa/audit-output/screenshots/task-p108a-after-home.png`
