Preview hero max-height boundary fix

Purpose:
- Keep the final 4/5 preview hero design.
- Add a viewport-safe max-height boundary to the shared preview hero container.
- Do not restore aspect-ratio:auto.
- Do not add runtime override CSS.

Run from repo root:
node fix-preview-hero-max-height-boundary.mjs
npm run gaga:template:pack
npm run gaga:verify-store-modal-preview
npm run ci:cloudflare

The script edits only canonical source:
src/css/components/gg-preview-frame.css

Then it tries to run:
npm run gaga:sync-components
npm run store:build
