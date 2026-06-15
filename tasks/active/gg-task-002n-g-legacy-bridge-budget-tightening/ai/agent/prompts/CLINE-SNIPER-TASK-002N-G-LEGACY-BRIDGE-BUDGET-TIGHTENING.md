# CLINE SNIPER — TASK-002N-G Legacy Bridge Budget Tightening

## Role
You are a careful code agent. You must make the smallest safe changes necessary to add stricter guardrails around `src/modules/legacy-app/legacy-app.js`.

## Context
The repo has completed public DOM template-first cleanup and bridge seam extraction:

- `src/modules/template-hydration/template-hydration.js`
- `src/modules/comments-bridge/comments-bridge.js`
- `src/modules/saved-listing-bridge/saved-listing-bridge.js`
- `src/modules/popular-related-bridge/popular-related-bridge.js`
- `src/modules/offline-fallback-bridge/offline-fallback-bridge.js`

`legacy-app.js` remains the orchestrator. This task locks the bridge budget so future feature work cannot dump new behavior into the legacy bridge.

## Hard boundaries

Do not implement new user-facing features.
Do not split another module.
Do not rewrite rendering/orchestration.
Do not delete `legacy-app` or `legacy-donor`.
Do not loosen any DOM/public UI guard.
Do not edit generated output.
Do not add dependencies.

## Baseline to lock

Expected latest baseline after TASK-002N-F:

```txt
legacy-app bytes: 471126
legacy-app lines: 11116
createElement: 6
allowedSmall: 0
allowedReviewed: 6
needsTemplate: 0
unclassified: 0
buckets: 9
```

If actual current repo differs slightly, inspect why. Set budgets to the actual current baseline plus minimal headroom only for this task's docs/check metadata. Do not use broad headroom.

Recommended maximums:

```txt
maxBytes = currentBytes + 1024 maximum
maxLines = currentLines + 30 maximum
maxCreateElement = 6
maxNeedsTemplate = 0
maxUnclassified = 0
requiredAllowedReviewed = 6
```

Prefer tighter than these if possible.

## Required implementation

### 1. Update `config/legacy-app-bridge-policy.json`
Add or tighten fields for:

- `baseline.bytes`
- `baseline.lines`
- `budget.maxBytes`
- `budget.maxLines`
- `publicDom.maxCreateElement`
- `publicDom.requiredAllowedReviewed`
- `publicDom.maxNeedsTemplate`
- `publicDom.maxUnclassified`
- `requiredBridgeModules`
- `requiredBridgeModuleOrderBeforeLegacyApp`
- `disallowedGrowthPrinciple`

Required bridge modules:

```txt
template-hydration
comments-bridge
saved-listing-bridge
popular-related-bridge
offline-fallback-bridge
legacy-app
```

All non-legacy bridge modules must appear before `legacy-app` in build order / registry order used by the build.

### 2. Tighten `checks/legacy-bridge.check.mjs`
The check must validate:

- `src/modules/legacy-app/legacy-app.js` exists.
- byte/line counts do not exceed budget.
- public DOM metrics for legacy-app do not regress:
  - `createElement <= 6`
  - `allowedReviewed === 6` or as configured
  - `needsTemplate === 0`
  - `unclassified === 0`
- all required bridge modules exist in `registry/modules.json`.
- required bridge modules are ordered before `legacy-app` in the effective module/build order.
- `src/modules/<bridge>/<bridge>.contract.json` exists for each extracted bridge except legacy-app if not applicable.
- `bridge-map.json` includes the bridge modules/buckets and references current baseline.

The check output should be explicit, e.g.:

```txt
legacy-bridge ok: bytes=.../max... lines=.../max... createElement=6 allowedReviewed=6 needsTemplate=0 unclassified=0 bridgeModules=5 buckets=9
```

### 3. Update docs
Update:

- `docs/legacy-app-bridge-inventory.md`
- `src/modules/legacy-app/README.md`
- `src/modules/legacy-app/bridge-map.json`

Document:

- current baseline
- budget rule
- extracted bridges
- what future feature tasks must not do
- next phase recommended: feature work can start after budget guard is green

### 4. Add acceptance script
Create:

```txt
scripts/task002n-g-acceptance.sh
```

It must verify:

- `config/legacy-app-bridge-policy.json` exists and contains budget fields.
- `checks/legacy-bridge.check.mjs` exists.
- `npm run check:legacy-bridge` passes.
- required bridge module names appear in `registry/modules.json`.
- required bridge contract files exist.
- `legacy-app.js` does not exceed configured budget.
- `needsTemplate=0` and `unclassified=0` are enforced or visible in check output.

## Full final command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-g-acceptance.sh
```

## Final response
Report:

- files changed
- final legacy-app bytes/lines and budgets
- final public DOM metrics
- bridge modules verified
- note that no runtime behavior was intentionally changed
