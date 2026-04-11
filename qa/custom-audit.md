# ZIP Audit Report

## A. Archive Basics
- Path: `/Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/dist/gg-audit-4702eaa.zip`
- Size: 1987832 bytes (1.90 MB)
- Top-level roots: `__MACOSX`, `gg-audit-4702eaa`
- File count: 161
- Junk entries: `__MACOSX/._gg-audit-4702eaa`, `__MACOSX/gg-audit-4702eaa/._.DS_Store`, `__MACOSX/gg-audit-4702eaa/docs/._.DS_Store`, `__MACOSX/gg-audit-4702eaa/docs/pages/._p-library.html`, `gg-audit-4702eaa/.DS_Store`, `gg-audit-4702eaa/docs/.DS_Store`

## B. Critical File Presence
- [ok] `package.json` -> `gg-audit-4702eaa/package.json`
- [ok] `package-lock.json` -> `gg-audit-4702eaa/package-lock.json`
- [ok] `wrangler.jsonc` -> `gg-audit-4702eaa/wrangler.jsonc`
- [ok] `index.prod.xml` -> `gg-audit-4702eaa/index.prod.xml`
- [ok] `src/worker.js` -> `gg-audit-4702eaa/src/worker.js`
- [ok] `public/manifest.webmanifest` -> `gg-audit-4702eaa/public/manifest.webmanifest`
- [ok] `public/_headers` -> `gg-audit-4702eaa/public/_headers`
- [ok] `public/robots.txt` -> `gg-audit-4702eaa/public/robots.txt`
- [ok] `public/llms.txt` -> `gg-audit-4702eaa/public/llms.txt`
- [ok] `.github/workflows/*` -> `gg-audit-4702eaa/.github/workflows/ci.yml`

## C. Package / Script Summary
- package name: gg
- script count: 25
- script `gaga`: no
- script `gaga:dry`: no
- script `gaga:audit`: no
- script `build`: yes
- script `ship`: yes
- verify:* scripts: `verify:assets`, `verify:authors-dir-contract`, `verify:p0`, `verify:p1`, `verify:p2`, `verify:release`, `verify:rulebooks`, `verify:runtime-es5`, `verify:template-contract`, `verify:template-fingerprint`, `verify:template-hygiene`, `verify:xml`

## D. Workflow Summary
- workflow files: 4
- `gg-audit-4702eaa/.github/workflows/ci.yml` | ci:yes deploy:no wrangler:no npm-run-gaga:no
- `gg-audit-4702eaa/.github/workflows/deploy.yml` | ci:no deploy:yes wrangler:yes npm-run-gaga:no
- `gg-audit-4702eaa/.github/workflows/perf-history-bootstrap.yml` | ci:no deploy:no wrangler:no npm-run-gaga:no
- `gg-audit-4702eaa/.github/workflows/perf-lighthouse.yml` | ci:no deploy:yes wrangler:no npm-run-gaga:no
- any CI workflow signal: yes
- any Cloudflare deploy signal: yes
- any Wrangler call: yes
- any npm run gaga call: no

## E. BLOG GAGA-ish Signals
- has public/assets/v/: yes
- has public/assets/latest/: yes
- has index.prod.xml: yes
- has src/worker.js: yes
- has .github/workflows/: yes
- has qa/* files: no (0)
- template + worker + workflows co-exist: yes
- index.prod.xml references /assets/v/: yes
- index.prod.xml references /assets/latest/: no

## F. Red Flags
- Archive contains junk entries: __MACOSX/._gg-audit-4702eaa, __MACOSX/gg-audit-4702eaa/._.DS_Store, __MACOSX/gg-audit-4702eaa/docs/._.DS_Store, __MACOSX/gg-audit-4702eaa/docs/pages/._p-library.html, gg-audit-4702eaa/.DS_Store, gg-audit-4702eaa/docs/.DS_Store
- package.json scripts still reference tools/* commands.
- Workflow files still reference tools/* paths.
- Scripts reference missing files: build -> tools/release.js, build:xml -> tools/validate-xml.js, gate:prod -> tools/gate-prod.sh, gate:release -> tools/gate-release.sh, install:hooks -> tools/install-hooks.mjs, release -> tools/release.js, ship -> tools/ship.mjs, verify-inline-css -> tools/verify-inline-css.mjs, verify:assets -> tools/verify-assets.mjs, verify:authors-dir-contract -> tools/verify-authors-dir-contract.mjs, verify:p0 -> tools/verify-postmeta-contract.mjs, verify:p1 -> tools/verify-dock-contract.mjs ...

Report generated at: 2026-03-12T06:37:43.995Z
