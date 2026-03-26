# ZIP Audit Report

- Enforcement mode: fail-on-critical
- Result: PASS
- Counts: 0 warning(s), 0 critical failure(s)

## A. Archive Basics
- Path: `/Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg/dist/gg-audit.zip`
- Size: 2129894 bytes (2.03 MB)
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
- task id: `task-p108c`
- task markdown: [ok] `qa/audit-output/task-p108c.md`
- task json: [ok] `qa/audit-output/task-p108c.json`
- live smoke log: [ok] `qa/audit-output/task-p108c-live-smoke.txt`
- manifest task field: `TASK-P1.08C`
- manifest commit field: `95d5fbda0a9a8a6ce542ca39652478e3249c0b7e`
- manifest CI: `PASS` https://github.com/liquid-modernity/gg/actions/runs/23334847997
- manifest Deploy: `PASS` https://github.com/liquid-modernity/gg/actions/runs/23334871845
- manifest live smoke: `PASS` `qa/audit-output/task-p108c-live-smoke.txt`
- freeze mode: enabled (`Comments rail freeze remains in effect; TASK-P1.08C is limited to homepage mixed order and homepage editorial preview runtime repair plus smoke safeguarding.`)
- accepted limitations: 4
- task zip entries (29): `package.json`, `package-lock.json`, `wrangler.jsonc`, `index.prod.xml`, `src/worker.js`, `public/manifest.webmanifest`, `public/_headers`, `public/robots.txt`, `public/llms.txt`, `public/assets/latest/modules/ui.bucket.core.js`, `public/assets/v/ac33998/modules/ui.bucket.core.js`, `qa/live-smoke.sh`, `qa/gaga-audit.mjs`, `qa/package-audit.mjs`, `qa/template-pack.sh`, `qa/template-proof.sh`, `qa/template-status.sh`, `qa/template-fingerprint.mjs`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `qa/audit-output/task-p108c.md`, `qa/audit-output/task-p108c.json`, `qa/audit-output/task-p108c-live-smoke.txt`, `qa/audit-output/task-p108c-homepage-order-proof.json`, `qa/audit-output/task-p108c-editorial-preview-proof.json`, `qa/audit-output/screenshots/task-p108c-before-home.png`, `qa/audit-output/screenshots/task-p108c-after-home.png`, `qa/audit-output/screenshots/task-p108c-before-preview.png`, `qa/audit-output/screenshots/task-p108c-after-preview.png`

Report generated at: 2026-03-20T09:01:59.186Z
