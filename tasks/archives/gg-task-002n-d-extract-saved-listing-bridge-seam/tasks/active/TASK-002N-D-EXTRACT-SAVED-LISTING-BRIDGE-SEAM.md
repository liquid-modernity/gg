# TASK-002N-D — Extract Saved Listing Bridge Seam

## Status

Ready for AI Code Agent.

## Goal

Extract low-risk saved listing helpers from `src/modules/legacy-app/legacy-app.js` into a new `saved-listing-bridge` module while keeping `legacy-app.js` as the orchestrator.

## Why

After public DOM templates are clean and the bridge is guarded, the next safe split is to move stable helper seams out of the giant legacy bridge. Saved listing is a good candidate because its UI templates are now stable, but its full orchestration should not be rewritten yet.

## New files

```txt
src/modules/saved-listing-bridge/saved-listing-bridge.js
src/modules/saved-listing-bridge/saved-listing-bridge.contract.json
```

## Required acceptance command

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-acceptance.sh
```

## Out of scope

- full saved listing rewrite
- comments/replies
- popular controls
- related posts
- Store/Landing restructure
- OAuth/Blogger API
- deleting legacy-donor or legacy-app
- generated outputs
