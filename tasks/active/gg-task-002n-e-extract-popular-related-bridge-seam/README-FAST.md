# TASK-002N-E — Extract Popular/Related Bridge Seam

Purpose: continue reducing `src/modules/legacy-app/legacy-app.js` by extracting a **small, low-risk Popular/Related helper seam** into a dedicated module, without rewriting UI behavior.

This task follows the accepted sequence:

- TASK-002N-B: `template-hydration` bridge extracted
- TASK-002N-C: `comments-bridge` seam extracted
- TASK-002N-D: `saved-listing-bridge` seam extracted
- TASK-002N-D-PATCH/PATCH-2: saved listing presentation fixed
- TASK-002N-E: extract Popular/Related bridge seam

## Copy/paste to Cline

Open `CLINE-PASTE-ME.txt` and paste the whole content into Cline.

## Expected target files

```txt
src/modules/popular-related-bridge/popular-related-bridge.js
src/modules/popular-related-bridge/popular-related-bridge.contract.json
scripts/task002n-e-acceptance.sh
```

Likely existing files to update:

```txt
src/modules/legacy-app/legacy-app.js
registry/modules.json
tools/build.mjs
src/modules/legacy-app/bridge-map.json
src/modules/legacy-app/README.md
config/legacy-app-bridge-policy.json
config/public-dom-generation-policy.json
docs/legacy-app-bridge-inventory.md
docs/public-dom-generation-audit.md
```

## Validation target

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-e-acceptance.sh
```

## Important boundary

This is a seam extraction task, **not** a rewrite task.

Do not rewrite Popular/Related rendering. Do not alter templates. Do not touch saved listing, comments orchestration, Store, Landing, OAuth, or legacy donor deletion.
