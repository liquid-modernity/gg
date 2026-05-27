# Store Modal Preview Contract Fix

Run from repo root:

```bash
node fix-store-modal-preview-contract.mjs
npm run gaga:sync-components
npm run gaga:template:pack
npm run gaga:verify-store-modal-preview
npm run ci:cloudflare
```

This patches only canonical source files:

- `src/css/components/gg-preview-frame.css`
- `src/css/modules/tokens.css`
- `src/css/components/gg-visual-tokens.css` when present

It restores the Store modal preview contract:

- preview hero height is viewport-safe;
- preview hero does not use `aspect-ratio` as height driver;
- compact preview lift tokens exist;
- generated files must still be rebuilt by existing tools.
