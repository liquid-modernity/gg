# Task 016 — Centralize Store Category Registry

## Objective

Create a single source of truth for Store categories so adding, removing, renaming, or aliasing a category requires editing only one config file.

Current category logic is spread across build, route, proof, smoke, and possibly Worker code. That is not maintainable. The target is one central category registry used or generated into every other layer.

## Scope

Likely files:

```txt
src/store/store-categories.config.mjs
src/store/lib/category-config.mjs
src/store/lib/store-routes.mjs
src/store/lib/render-category-page.mjs
src/store/lib/build-store-jsonld.mjs
tools/build-store-static.mjs
tools/proof-store-static.mjs
qa/store-artifact-smoke.sh
worker.js
```

If Worker cannot import the ESM config directly, generate a Worker-safe category map during build.

## Required Category Config

Create or consolidate:

```txt
src/store/store-categories.config.mjs
```

Each category should define at least:

```js
{
  key: "fashion",
  label: "Fashion",
  slug: "fashion",
  path: "/store/fashion",
  title: "Fashion Picks · Yellow Cart",
  h1: "Fashion Picks",
  description: "Curated fashion picks from Yellow Cart.",
  intro: "Short editorial category intro.",
  aliases: ["fashion", "style", "outfit"],
  fallback: false
}
```

For the current fallback category:

```js
{
  key: "everyday",
  label: "Lainnya",
  slug: "everyday",
  path: "/store/everyday",
  aliases: ["everyday", "etc", "lainnya", "other"],
  fallback: true
}
```

## Required Behavior

1. Existing category routes must still work:

   ```txt
   /store/fashion
   /store/skincare
   /store/workspace
   /store/tech
   /store/everyday
   ```

2. Existing alias behavior must remain correct if currently supported:

   ```txt
   /store/lainnya
   /store/etc
   ```

3. Category page generation must consume the central config.

4. Category navigation, labels, titles, canonical URLs, descriptions, semantic copy, and JSON-LD should consume the central config.

5. Proof and smoke should not hardcode category lists unless generated from the central config.

6. Worker route allowlist must be generated from or synchronized with the central config.

7. Adding a new category should require only:
   - editing `src/store/store-categories.config.mjs`
   - running the existing Store build/check scripts

## Acceptance Criteria

Run and pass:

```bash
npm run store:build
npm run store:proof
node tools/cloudflare-prepare.mjs
bash qa/store-artifact-smoke.sh
npm run gaga:verify-store-artifact
```

Manual verification:

```bash
grep -R "fashion skincare workspace tech everyday" -n src tools qa worker.js
```

There should be no fragile hardcoded category list unless it is generated, documented, or clearly derived from the central config.

## Non-Goals

Do not:
- redesign category page UI
- remove transitional flat artifacts
- change pagination page size
- split JS
- change image policy
