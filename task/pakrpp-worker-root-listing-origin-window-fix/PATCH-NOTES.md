# PakRPP Worker Root Listing Origin Window Fix

## Purpose

Fix root Blog listing starvation when Blogger limits `data:posts` before `index.xml` filters Store/product posts.

## Changed in worker.js

- Adds `ROOT_LISTING_ORIGIN_MAX_RESULTS = "33"`.
- Adds `shouldExpandRootListingOriginWindow(request, route)`.
- Updates `buildOriginRequest()` so internal origin fetches for the root listing route (`/`, internally `ROOT_LISTING_LEGACY_ROUTE`) add `max-results=33` when the incoming public request does not already specify `max-results`.
- Keeps the public URL unchanged.
- Does not affect landing, store, post, page, label, search, assets, or explicit `max-results` requests.
- Keeps Worker as an origin-request adapter only; Worker still does not author healthy-route UI.

## QA performed here

- `node --check worker.js`: PASS

## Important follow-up

After replacing the repo Worker source, run the repo QA chain:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-ci-reconciliation
npm run gaga:verify-semantic-ssr
npm run gaga:verify-schema-jsonld
npm run gaga:verify-registry-contract
npm run gaga:verify-a11y-static
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run ci:cloudflare
```
