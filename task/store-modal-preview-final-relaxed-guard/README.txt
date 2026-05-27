Replace only the Store modal preview reliability guard.

Command from repo root:
cp store-modal-preview-final-relaxed-guard/qa/store-modal-preview-reliability-guard.mjs qa/store-modal-preview-reliability-guard.mjs

Then run:
npm run gaga:sync-components
npm run store:build
npm run gaga:template:pack
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-store-modal-preview
npm run ci:cloudflare

This guard accepts the final 4/5 hero-first reveal contract and does not require
--gg-preview-hero-aspect to live inside src/css/modules/visual-tokens.css.
