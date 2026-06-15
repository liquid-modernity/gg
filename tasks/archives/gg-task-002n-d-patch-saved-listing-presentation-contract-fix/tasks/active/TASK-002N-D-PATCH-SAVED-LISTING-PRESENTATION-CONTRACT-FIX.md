# TASK-002N-D-PATCH — Saved Listing Presentation Contract Fix

## Status

READY FOR CLINE

## Context

After `TASK-002N-D — Extract Saved Listing Bridge Seam`, saved storage/toggle works, but manual smoke test shows a presentation contract bug:

- The normal/latest listing still appears.
- Saved rows are appended at the bottom.
- Raw `Details` text is visible.
- Saved rows are visually inconsistent.

This patch fixes presentation, not storage architecture.

## Product decision

Saved is an exclusive listing mode:

```txt
Latest mode  -> show latest/native listing rows
Saved mode   -> show only saved articles
Popular mode -> show popular listing rows
```

Saved mode must not append below latest/native rows.

## In scope

1. Fix saved listing rendering so saved mode shows only saved rows.
2. Ensure native/latest rows are hidden whenever `state.savedListingActive === true`.
3. Ensure load-more/pagination is hidden in saved mode.
4. Ensure saved rows use existing `gg-template-listing-row` or equivalent canonical row template.
5. Ensure saved empty state uses `gg-empty-state-saved-articles` template.
6. Remove/hide raw visible `Details` text from saved rows.
7. Ensure unsave while saved mode is active refreshes/removes the row immediately.
8. Add a small contract file or doc for saved listing presentation, for future AI/human edits.
9. Keep `check:public-dom` and `check:legacy-bridge` green.

## Out of scope

- Do not extract popular/related.
- Do not rewrite comments/replies.
- Do not restructure Store/Landing.
- Do not delete `legacy-app` or `legacy-donor`.
- Do not manually edit `dist/**` or `.cloudflare-build/**`.
- Do not add dependencies.

## Implementation guidance

### 1. Inspect current saved listing flow

Start with:

```bash
grep -n "savedListingActive\|renderSavedListing\|setNativeListingRowsHidden\|clearDynamicListingRows\|loadMoreWrap\|Details" src/modules/legacy-app/legacy-app.js
```

Understand current behavior before editing.

### 2. Make saved mode exclusive

The render path should behave like this:

```txt
renderSavedListing()
  clear dynamic rows
  if saved mode inactive:
    restore latest/native visibility unless popular mode active
    return
  if saved mode active:
    hide latest/native rows
    hide load more/pagination
    render saved rows only
```

Native rows may be hidden by existing helper or by a stronger mode class/attribute on the listing container. The important contract is user-visible: saved mode must show only saved rows.

### 3. Do not append saved rows below visible latest rows

If native rows remain in DOM, they must be hidden while saved mode is active. Dynamic saved rows may be inserted before native rows or appended to the same container only if native rows are hidden.

Preferred:

```txt
listing container has active mode marker
native rows hidden in saved mode
saved rows rendered as dynamic rows using canonical template
```

### 4. Details text contract

Do not display raw `Details` text in saved rows.

Allowed:

- detail affordance is icon-only with `aria-label` or `.gg-visually-hidden` label.
- detail text is hidden as accessible text.
- detail affordance follows the normal listing row design.

Not allowed:

- visible text `Details` floating in saved rows.
- raw fallback text that breaks the row layout.

### 5. Unsave behavior

When in saved mode and user unsaves a row:

- Either remove that row immediately, or
- Re-render saved listing immediately.

If the last row is removed, show saved empty state from template.

### 6. Contract docs/config

Create one of these if it does not exist:

```txt
config/saved-listing-presentation-contract.json
docs/saved-listing-presentation-contract.md
```

Contract must document:

```json
{
  "savedModeExclusive": true,
  "hideNativeRowsWhenSavedActive": true,
  "hideLoadMoreWhenSavedActive": true,
  "savedRowsUseCanonicalListingTemplate": true,
  "rawDetailsTextVisible": false,
  "unsaveRefreshesSavedListing": true
}
```

## Acceptance

Run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-patch-acceptance.sh
```

Manual smoke test:

1. Open blog index/root.
2. Save two articles.
3. Activate Saved mode.
4. Confirm only saved articles are visible.
5. Confirm normal/latest posts do not appear above saved rows.
6. Confirm load more/pagination is hidden.
7. Confirm no visible raw `Details` text.
8. Unsave one saved article.
9. Confirm row disappears or listing refreshes.
10. Unsave all saved articles.
11. Confirm saved empty state appears.
