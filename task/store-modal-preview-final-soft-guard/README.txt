Replace only this guard file. Do not change CSS again just to satisfy the old guard.

Command from repo root:

cp store-modal-preview-final-soft-guard/qa/store-modal-preview-reliability-guard.mjs qa/store-modal-preview-reliability-guard.mjs

Then run:

npm run gaga:sync-components
npm run store:build
npm run gaga:template:pack
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-store-modal-preview
npm run ci:cloudflare

This guard accepts:
- hero aspect ratio 4 / 5 via --gg-preview-hero-aspect
- positive content reveal or negative overlay through the lift tokens
- hidden scrollbars, provided the sheet/panel still has a scroll owner
