# Task 018 — Stabilize Store Artifact Contract

## Objective

Make the Store artifact contract explicit and stable during the transition from flat category files to canonical nested routes.

Canonical Store routes should be nested. Flat files may remain temporarily as transitional fallbacks, but the contract must be documented and tested intentionally.

## Scope

Likely files:

```txt
tools/build-store-static.mjs
tools/cloudflare-prepare.mjs
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh
worker.js
src/store/lib/store-routes.mjs
src/store/store.config.mjs
```

## Canonical Artifacts

Nested category artifacts are canonical:

```txt
store/fashion/index.html
store/skincare/index.html
store/workspace/index.html
store/tech/index.html
store/everyday/index.html
```

Pagination artifacts are canonical when generated:

```txt
store/fashion/page/2/index.html
store/fashion/page/3/index.html
...
```

## Transitional Flat Artifacts

Flat artifacts may remain during transition:

```txt
store-fashion.html
store-skincare.html
store-workspace.html
store-tech.html
store-everyday.html
store-fashion-page-2.html
store-fashion-page-3.html
...
```

## Required Changes

1. Add an explicit config flag if useful:

   ```txt
   GG_STORE_REQUIRE_FLAT_TRANSITIONAL=1
   ```

   Default should preserve current behavior unless project conventions suggest otherwise.

2. Proof and smoke must clearly distinguish:
   - canonical nested artifact missing = `FAIL`
   - transitional flat artifact missing = `FAIL` only when transitional mode is enabled
   - pagination artifact missing = `FAIL` only when it should exist

3. `tools/cloudflare-prepare.mjs` must dynamically stage all generated Store artifacts:
   - canonical nested artifacts
   - manifest/data files
   - external CSS/JS assets
   - transitional flat artifacts if required
   - pagination flat artifacts if generated

4. Avoid hardcoding category file names where possible.

5. Worker route behavior must remain unchanged:
   - clean nested routes are canonical
   - flat files are fallback/legacy only
   - invalid categories return controlled 404s
   - missing pagination pages return controlled 404s

## Acceptance Criteria

Run and pass:

```bash
npm run store:build
npm run store:proof
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
npm run gaga:preflight
```

Check staged artifacts:

```bash
find .cloudflare-build/public -maxdepth 3 -path '*store*' | sort
```

Expected:
- nested category artifacts exist
- flat transitional artifacts exist if transitional mode is enabled
- manifest exists
- store CSS/JS assets exist

## Non-Goals

Do not:
- delete flat artifacts yet
- redesign Worker routing
- alter product data
- change category registry beyond what is needed for artifact discovery
