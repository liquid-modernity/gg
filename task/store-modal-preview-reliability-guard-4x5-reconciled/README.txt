Replace only this guard file:

cp store-modal-preview-reliability-guard-4x5-reconciled/qa/store-modal-preview-reliability-guard.mjs qa/store-modal-preview-reliability-guard.mjs

Then run:

npm run gaga:sync-components
npm run gaga:template:pack
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-store-modal-preview
npm run ci:cloudflare

This reconciled guard allows --gg-preview-hero-aspect: 4 / 5 and no longer requires aspect-ratio:auto as the only valid preview hero contract.
