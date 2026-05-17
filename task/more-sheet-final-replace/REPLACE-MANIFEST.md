# More Sheet Final Replacement Package

## Scope
This package updates the More Sheet into a native-app-style global surface for:

- `/` and Blogger post/page/label/archive routes through `index.xml`
- `/landing` through `landing.html`
- `/store` and generated store category pages through `store.html` and store static artifacts

No Worker UI change is included. The Worker should remain routing/policy/fallback only.

## Main changes

- Rebuilt More Sheet markup with profile card, grouped Navigation, Discover, Info, Preferences cards, local More search, share buttons, and legal footer.
- Preserved public IA truth:
  - Home → `/landing`
  - Blog → `/`
  - Store → `/store`
  - Contact → `/landing#contact`
- Added row-style Preferences:
  - Language
  - Appearance
  - Reading
  - Motion
- Added in-sheet preference panels with Back/Escape behavior.
- Added local search that filters More Sheet rows only; it does not trigger global discovery.
- Added Reading and Motion state persistence:
  - `gg:reading`
  - `gg:motion`
- Synced EN/ID copy registries.
- Rebuilt store static pages and Blogger template artifact.
- Updated QA guards for the new Global More Sheet contract.

## Replace instructions

Unzip this package at the repository root and allow files to overwrite existing files.

The ZIP preserves repository-relative paths, so the safest flow is:

```bash
cd /path/to/gg
unzip -o more-sheet-final-replace.zip
```

Then run:

```bash
npm run gaga:verify-nav-more
npm run gaga:verify-more-global
npm run store:proof
```

## Validation already run in sandbox

```bash
node -c src/js/gg-app.source.js
node -c src/store/store-discovery.js
node -c assets/store/store-discovery.js
node qa/nav-more-contract-guard.mjs
node qa/copy-registry-guard.mjs
bash qa/sheet-contract-smoke.sh
node tools/proof-store-static.mjs
node tools/template-pack.mjs
STORE_CI=1 GG_STORE_MODE=ci STORE_REQUIRE_LIVE_FEED=0 STORE_STRICT_IMAGES=0 bash tools/store-build.sh
```

Passed results:

- `NAV MORE CONTRACT GUARD RESULT: PASS`
- `COPY REGISTRY GUARD RESULT: PASS`
- `SHEET CONTRACT SMOKE RESULT: PASS checks=35`
- `STORE STATIC PROOF PASS mode=development path=store.html products=20 itemList=20`
- `TEMPLATE PACK OK`
- `STORE STATIC BUILD OK`

Note: live Store feed was unavailable inside the sandbox because `www.pakrpp.com` could not be resolved, so the store build reused the existing static snapshot of 20 products. This is safe for UI replacement, but you should run `npm run store:build` again locally if you want live feed refresh.

## Files included

See the ZIP contents. All paths are repository-relative.
