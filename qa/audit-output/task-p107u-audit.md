# ZIP Audit Report

- Enforcement mode: fail-on-critical
- Result: PASS
- Counts: 1 warning(s), 0 critical failure(s)

## A. Archive Basics
- Path: `/Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/dist/gg-audit.zip`
- Size: 10251481 bytes (9.78 MB)
- Top-level roots: `.github`, `dist`, `index.prod.xml`, `package-lock.json`, `package.json`, `public`, `qa`, `src`, `wrangler.jsonc`
- File count: 26
- Junk entries: _none_

## B. Critical File Presence
- [ok] `package.json` -> `package.json`
- [ok] `package-lock.json` -> `package-lock.json`
- [ok] `wrangler.jsonc` -> `wrangler.jsonc`
- [ok] `index.prod.xml` -> `index.prod.xml`
- [ok] `src/worker.js` -> `src/worker.js`
- [ok] `public/manifest.webmanifest` -> `public/manifest.webmanifest`
- [ok] `public/_headers` -> `public/_headers`
- [ok] `public/robots.txt` -> `public/robots.txt`
- [ok] `public/llms.txt` -> `public/llms.txt`
- [ok] `.github/workflows/*` -> `.github/workflows/ci.yml`

## C. Package / Script Summary
- package name: gg
- script count: 7
- script `gaga`: yes
- script `gaga:dry`: yes
- script `gaga:audit`: yes
- script `build`: no
- script `ship`: no
- verify:* scripts: _none_

## D. Workflow Summary
- workflow files: 2
- `.github/workflows/ci.yml` | ci:yes deploy:yes wrangler:yes npm-run-gaga:yes run-blocks:8
- `.github/workflows/deploy.yml` | ci:no deploy:yes wrangler:yes npm-run-gaga:yes run-blocks:12
- any CI workflow signal: yes
- any Cloudflare deploy signal: yes
- any Wrangler call: yes
- any npm run gaga call: yes

## E. BLOG GAGA-ish Signals
- has public/assets/v/: yes
- has public/assets/latest/: yes
- has index.prod.xml: yes
- has src/worker.js: yes
- has .github/workflows/: yes
- has qa/* files: yes (12)
- template + worker + workflows co-exist: yes
- qa/live-smoke comments owner check: yes
- qa/live-smoke targets 0/2/16 comments matrix: no
- index.prod.xml references /assets/v/: yes
- index.prod.xml references /assets/latest/: no

## F. Warnings
- qa/live-smoke.sh does not target the 0/2/16 comments owner proof matrix.

## G. Critical Failures
- none

Report generated at: 2026-03-19T10:49:47.353Z
