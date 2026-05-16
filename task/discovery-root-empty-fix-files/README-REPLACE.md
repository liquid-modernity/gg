# Discovery Root Empty Fix — Replacement Files

Replace these files manually in the repo:

- `src/js/gg-app.source.js`
- `qa/discovery-contract-guard.mjs`
- `__gg/assets/js/gg-app.dev.js`
- `__gg/assets/js/gg-app.min.js`
- `dist/assets/js/gg-app.dev.js`
- `dist/assets/js/gg-app.min.js`

## What this fixes

The root `/` Discovery sheet opened with the shell, filters, and bottom input, but the result area stayed blank while `/landing` showed results.

Root was still waiting for the Blogger feed when local listing rows were empty. During that wait, the sheet could open with no rendered Global Discovery base items.

The fix makes root render the static Global Discovery base immediately:

- Home
- Blog
- Store
- Contact
- Landing sections
- Actions

The Blogger feed now enhances article/topic results asynchronously after the base rows are already visible.

## Verification after replacement

Run:

```bash
npm run gaga:verify-discovery-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run ci:cloudflare
```

Then visually check:

```txt
/        -> Search must show non-empty Global Discovery immediately
/landing -> Search must still show Global Discovery
/store   -> Search must still show Store Discovery
```

Do not commit until `/` Search is no longer blank.
