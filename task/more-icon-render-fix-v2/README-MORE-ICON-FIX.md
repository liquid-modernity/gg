# More Icon Render Fix

Fixes More Sheet icons rendering as raw ligature text (`HOME`, `ARTICLE`, `SHOPPING_BAG`, etc.) on `/` and `/landing` while `/store` renders correctly.

Cause: the Blogger XML head still loaded a restricted Material Symbols subset that did not include the new More Sheet icon names. `/store` used a broader Material Symbols request, so it rendered correctly.

What changed:
- Expanded the `Material Symbols Outlined` `icon_names` subset consistently across Blogger XML, landing, and store.
- Added ligature-safe `.gg-icon` reset: `font-feature-settings: "liga"` and `text-transform: none`.
- Synced generated CSS/assets to avoid sheet-contract hash drift.

Run after replace:

```bash
npm run gaga:verify-nav-more
npm run gaga:verify-sheet-contract
npm run ci:cloudflare
```

If browser still shows text once after deploy, hard-refresh or purge Cloudflare cache for `/`, `/landing`, `/__gg/assets/css/gg-app.min.css`, and the Google font CSS is not controllable from Cloudflare.
