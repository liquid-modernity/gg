Copy these two files into the same paths in the repo.

Primary canonical source:
  src/css/components/gg-preview-frame.css

Mirror file included for immediate parity:
  src/css/modules/preview-frame.css

After copying, run:
  npm run gaga:sync-components
  npm run gaga:template:pack
  npm run gaga:verify-sheet-lifecycle
  npm run gaga:verify-store-modal-preview
  npm run ci:cloudflare

Do not run the older fix-store-modal-preview-hero-contract-v3.mjs, because it forces the hero back to aspect-ratio:auto.
