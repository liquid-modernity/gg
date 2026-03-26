# ZIP Audit Report

- Enforcement mode: fail-on-critical
- Result: PASS
- Counts: 0 warning(s), 0 critical failure(s)

## A. Archive Basics
- Path: `/Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/dist/gg-audit.zip`
- Size: 4007987 bytes (3.82 MB)
- Top-level roots: `.github`, `index.prod.xml`, `package-lock.json`, `package.json`, `public`, `qa`, `src`, `wrangler.jsonc`
- File count: 29
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
- script count: 8
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
- has qa/* files: yes (16)
- template + worker + workflows co-exist: yes
- qa/live-smoke comments owner check: yes
- qa/live-smoke targets 0/2/16 comments matrix: yes
- index.prod.xml references /assets/v/: yes
- index.prod.xml references /assets/latest/: no

## F. Warnings
- none

## G. Critical Failures
- none

## H. Task Artifact Chain
- task id: `task-p107ac`
- task markdown: [ok] `qa/audit-output/task-p107ac.md`
- task json: [ok] `qa/audit-output/task-p107ac.json`
- live smoke log: [ok] `qa/audit-output/task-p107ac-live-smoke.txt`
- manifest task field: `TASK-P1.07AC`
- manifest commit field: `f21e7abc05879fa9e5936b041249f87eb981f806`
- manifest CI: `PASS` https://github.com/liquid-modernity/gg/actions/runs/23322066305
- manifest Deploy: `PASS` https://github.com/liquid-modernity/gg/actions/runs/23322089661
- manifest live smoke: `PASS` `qa/audit-output/task-p107ac-live-smoke.txt`
- task zip entries (29): `package.json`, `package-lock.json`, `wrangler.jsonc`, `index.prod.xml`, `src/worker.js`, `public/manifest.webmanifest`, `public/_headers`, `public/robots.txt`, `public/llms.txt`, `public/assets/latest/main.css`, `public/assets/v/ac33998/main.css`, `qa/live-smoke.sh`, `qa/gaga-audit.mjs`, `qa/package-audit.mjs`, `qa/template-pack.sh`, `qa/template-proof.sh`, `qa/template-status.sh`, `qa/template-fingerprint.mjs`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `qa/audit-output/task-p107ac.md`, `qa/audit-output/task-p107ac.json`, `qa/audit-output/task-p107ac-live-smoke.txt`, `qa/audit-output/screenshots/task-p107ac-before-zero.png`, `qa/audit-output/screenshots/task-p107ac-before-two.png`, `qa/audit-output/screenshots/task-p107ac-before-sixteen.png`, `qa/audit-output/screenshots/task-p107ac-after-zero.png`, `qa/audit-output/screenshots/task-p107ac-after-two.png`, `qa/audit-output/screenshots/task-p107ac-after-sixteen.png`

Report generated at: 2026-03-19T23:47:49.302Z
