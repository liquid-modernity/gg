FINAL PREVIEW 4/5 CONTRACT BUNDLE

Purpose:
- Keep preview hero visually 4/5.
- Stop guards from forcing aspect-ratio:auto on .gg-preview__hero / .store-preview__hero.
- Keep generic sheet/panel containers protected from accidental 4/5 aspect ratio.

Copy these files into the repo root, preserving paths:

src/css/components/gg-preview-frame.css
src/css/modules/preview-frame.css
qa/sheet-lifecycle-contract-guard.mjs
qa/store-modal-preview-reliability-guard.mjs

Then run:

npm run gaga:sync-components
npm run store:build
npm run gaga:template:pack
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-store-modal-preview
npm run ci:cloudflare

Do not run older patch scripts that force aspect-ratio:auto.
