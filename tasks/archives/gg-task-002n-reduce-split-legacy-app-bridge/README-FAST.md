# TASK-002N — Reduce/Split legacy-app Bridge

## Goal
Reduce the active Blog legacy bridge safely after the public DOM/template-first cleanup.

This is **not** a deletion task. Do not remove `legacy-donor/` or `src/modules/legacy-app/` yet.

## Paste to Cline
Open `CLINE-PASTE-ME.txt` and paste it into Cline.

## Acceptance
After Cline finishes, run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-acceptance.sh
```

## Task shape
This task should create the bridge-reduction foundation:

1. Inventory `src/modules/legacy-app/legacy-app.js` by domain.
2. Add a no-growth / no-new-hidden-UI guard for the bridge.
3. Create extraction seams for future module splits.
4. Extract only one very safe helper/seam if the repo supports it without behavior changes.
5. Keep public DOM `needsTemplate=0` and `unclassified=0`.

## Do not do
- Do not delete `legacy-donor/`.
- Do not delete `src/modules/legacy-app/`.
- Do not rewrite all comments/saved/related/popular logic in one task.
- Do not restructure Store folders.
- Do not implement OAuth/Blogger API.
- Do not install dependencies.
- Do not manually edit `dist/**` or `.cloudflare-build/**`.
