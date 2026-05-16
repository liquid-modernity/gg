# Discovery Global Index Fix — Replacement Files

Replace these files into the same paths in your repo.

## Files

```txt
src/js/gg-app.source.js
src/registry/gg-discovery.registry.js
landing.html
qa/discovery-contract-guard.mjs
__gg/assets/js/gg-app.dev.js
__gg/assets/js/gg-app.min.js
dist/assets/js/gg-app.dev.js
dist/assets/js/gg-app.min.js
dist/blogger-template.publish.xml
dist/blogger-template.publish.txt
```

## What this fixes

- `/` no longer opens an empty Global Discovery while waiting for Blogger feed JSON.
- Root Discovery renders the static Global Discovery base immediately: Home, Blog, Store, Contact, landing sections, and actions.
- Articles/topics still enhance asynchronously after feed load.
- `/landing` feed max-results is aligned with root: `80`, not stale `24`.
- Discovery registry now carries the shared Global Discovery feed contract and required static base item IDs.
- `qa/discovery-contract-guard.mjs` now fails if root/landing feed limits drift or if the immediate root base render is removed.

## Commands to run after replacement

```bash
npm run gaga:verify-discovery-contract
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run ci:cloudflare
```

## Manual check

After deploy/publish, open `/`, tap Search, and verify the Discovery body immediately shows rows. It should not wait blank while the feed loads.
