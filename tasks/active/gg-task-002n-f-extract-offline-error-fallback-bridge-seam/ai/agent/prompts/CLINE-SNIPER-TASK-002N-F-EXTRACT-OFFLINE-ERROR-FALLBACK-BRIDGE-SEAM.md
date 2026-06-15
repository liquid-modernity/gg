# CLINE SNIPER — TASK-002N-F

## Task
Extract a small Offline/Error/Fallback Bridge Seam from `src/modules/legacy-app/legacy-app.js`.

## Context
Previous accepted seams:
- `template-hydration`
- `comments-bridge`
- `saved-listing-bridge`
- `popular-related-bridge`

Public DOM is template-first:
- `needsTemplate=0`
- `unclassified=0`

`legacy-app.js` remains a large orchestrator. This task should move only stable helper/data logic, not flow orchestration.

## Create new module

Create:

```txt
src/modules/offline-fallback-bridge/offline-fallback-bridge.js
src/modules/offline-fallback-bridge/offline-fallback-bridge.contract.json
```

Expose browser global:

```js
GG.offlineFallbackBridge
```

Keep compatibility with the current classic bundle approach. Follow the same pattern already used by:
- `template-hydration`
- `comments-bridge`
- `saved-listing-bridge`
- `popular-related-bridge`

If `tools/build.mjs` needs bundle order updates, make the minimal update only.

## Candidate helpers to extract

Search `legacy-app.js` for offline/error/fallback related helper logic. Extract only stable, non-stateful helpers such as:

```txt
normalizeOfflineReason
isNetworkUnavailable
isOfflineLikeError
getFallbackCopyKey
getFallbackCopyText
getOfflineStatusPayload
getErrorStatusPayload
normalizeFallbackUrl
isRecoverableFetchStatus
safeErrorMessage
```

Exact names may differ based on existing code. Prefer existing names if present.

## Allowed extraction

Allowed:
- pure helper functions
- small copy key resolver
- small status payload object builder
- offline/error reason normalization
- URL/status fallback helper
- safe error message helper
- bridge map/docs/policy updates

Not allowed:
- rewrite offline UI
- rewrite 404 rendering
- rewrite service worker/cache logic
- rewrite fetch orchestration
- rewrite article/listing rendering
- rewrite modal/sheet behavior
- add dependencies
- edit generated output manually
- delete `legacy-app` or `legacy-donor`

## Bridge usage

After extraction, `legacy-app.js` should call helpers through:

```js
GG.offlineFallbackBridge.someHelper(...)
```

Keep `legacy-app.js` orchestrating state, events, rendering, DOM placement, and timing.

## Required updates

Update/create:

```txt
src/modules/offline-fallback-bridge/offline-fallback-bridge.js
src/modules/offline-fallback-bridge/offline-fallback-bridge.contract.json
registry/modules.json
tools/build.mjs if bundle order needs it
src/modules/legacy-app/legacy-app.js
src/modules/legacy-app/bridge-map.json
src/modules/legacy-app/README.md
config/legacy-app-bridge-policy.json
config/public-dom-generation-policy.json
docs/legacy-app-bridge-inventory.md
docs/public-dom-generation-audit.md
scripts/task002n-f-acceptance.sh
```

## Acceptance expectations

The script must verify:
- new module exists
- contract exists
- `GG.offlineFallbackBridge` exists in source
- `registry/modules.json` references the module
- build order includes the module before `legacy-app` if applicable
- `bridge-map.json` documents the seam
- `legacy-app` still passes bridge guard
- public DOM remains clean
- no `needsTemplate` or `unclassified` regression

## Final validation command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-f-acceptance.sh
```

## Report format

When done, report:
- files changed
- helpers exposed in `GG.offlineFallbackBridge`
- legacy-app bytes/lines before and after
- `check:public-dom` summary
- `check:legacy-bridge` summary
- confirmation that no runtime UI behavior was intentionally changed
