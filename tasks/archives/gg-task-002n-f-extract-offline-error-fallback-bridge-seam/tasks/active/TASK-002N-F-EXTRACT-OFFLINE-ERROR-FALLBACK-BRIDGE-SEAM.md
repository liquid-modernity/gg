# TASK-002N-F — Extract Offline/Error/Fallback Bridge Seam

## Status
Active task for AI code agent.

## Objective
Create a small bridge module for offline/error/fallback helper logic so `legacy-app.js` can shrink gradually without changing runtime UI behavior.

## Module target

```txt
src/modules/offline-fallback-bridge/offline-fallback-bridge.js
src/modules/offline-fallback-bridge/offline-fallback-bridge.contract.json
```

Browser API:

```js
GG.offlineFallbackBridge
```

## Scope
Extract only pure/small helper logic related to:
- offline reason normalization
- network unavailable detection
- fallback copy key/text selection
- error/fallback status payloads
- safe error message normalization
- recoverable fetch/status decision helpers
- fallback URL normalization if already present in legacy-app

## Out of scope
- no rendering rewrite
- no service worker rewrite
- no cache strategy rewrite
- no 404 redesign
- no article/listing rewrite
- no store/landing refactor
- no deletion of `legacy-app` or `legacy-donor`
- no generated output edits

## Deliverables
- offline fallback bridge module and contract
- legacy app uses bridge helpers
- registry/build updates if needed
- bridge map and docs updates
- acceptance script
- full validation green

## Acceptance command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-f-acceptance.sh
```
