# More Sheet V2 Replace Patch

Fixes requested visual/interaction issues:

1. More Sheet now uses fixed bottom tray: local search + share/legal footer stay visible while body scrolls.
2. Preference choices open as centered modal dialogs, not another inline sheet. Appearance and Motion options are styled as compact segmented toggles inside the modal.
3. More row icons now use centralized `.gg-icon` Material Symbols instead of random glyphs.
4. More Sheet header is opaque/blurred and sits above the body, so the body no longer bleeds through the head.

Validation run in sandbox:

- `npm run gaga:verify-nav-more` PASS
- `npm run gaga:verify-discovery-contract` PASS
- `npm run gaga:verify-sheet-contract` PASS
- `npm run store:proof` PASS
- `npm run ci:cloudflare` PASS

Note: sandbox could not resolve `www.pakrpp.com`, so store build reused the existing 20-product static snapshot. Run `npm run store:build` locally to refresh live product data.
