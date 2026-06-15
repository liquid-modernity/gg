# CLINE SNIPER — TASK-002N-D-PATCH Saved Listing Presentation Contract Fix

You are editing the GG repo.

## Goal

Fix saved listing presentation after saved storage/toggle extraction.

Current bug from manual smoke test:

- Saved rows appear at the bottom after latest/native rows.
- Latest/native rows still show in saved mode.
- Raw `Details` text is visible.
- Saved rows do not visually align with main listing rows.

## Product rule

Saved mode is exclusive.

When saved mode is active, only saved posts are visible. Other latest/native posts must not be visible.

## Read first

Read only the minimum necessary files:

- `src/modules/legacy-app/legacy-app.js`
- `src/modules/saved-listing-bridge/saved-listing-bridge.js`
- `apps/blog/index.xml`
- `src/modules/legacy-app/bridge-map.json`
- `config/legacy-app-bridge-policy.json`
- `config/public-dom-generation-policy.json`
- `docs/public-dom-generation-audit.md`

Search:

```bash
grep -n "savedListingActive\|renderSavedListing\|setNativeListingRowsHidden\|clearDynamicListingRows\|loadMoreWrap\|Details\|gg-template-listing-row\|gg-empty-state-saved-articles" src/modules/legacy-app/legacy-app.js apps/blog/index.xml
```

## Required changes

1. Saved listing must render as exclusive listing mode.
2. Hide native/latest rows whenever saved mode active.
3. Hide load-more/pagination while saved mode active.
4. Saved rows must use canonical listing row template/structure.
5. Empty state must use existing saved empty template.
6. Remove visible raw `Details` text from saved rows.
7. Unsave in saved mode must immediately remove row or refresh saved listing.
8. Add a saved listing presentation contract doc/config.
9. Keep all guards green.

## Strict boundaries

Do not:

- start TASK-002N-E.
- extract popular/related.
- rewrite comments/replies.
- restructure Store/Landing.
- delete `legacy-app`.
- delete `legacy-donor`.
- edit `dist/**` or `.cloudflare-build/**` manually.
- create generic templates.
- install dependencies.

## Template-first rule

If you need to adjust visible saved row UI, use the existing canonical row template or purpose-specific template in `apps/blog/index.xml`. Do not create large UI with JS.

JS may only:

- set mode state
- hide/show rows
- clone templates
- fill text/attributes
- set aria/icon state
- wire behavior

## Acceptance command

Run exactly:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-patch-acceptance.sh
```

Then report:

- what files changed
- how saved exclusive mode is enforced
- how raw `Details` text was removed/hidden
- how unsave refresh works
- final `check:public-dom` summary
- final `check:legacy-bridge` summary
