# TASK-002N-D-PATCH-2 — Saved Listing Exclusive Mode Runtime Fix

You are working in the GG vNext / PakRPP repo.

## Problem
Manual testing shows TASK-002N-D-PATCH did not fully satisfy the Saved listing presentation contract.

Observed runtime bug:

- Latest/native rows still appear while Saved mode is active.
- Saved rows render below native/latest rows instead of replacing the active listing view.
- The top selector/label still says `Latest` while Saved mode is active.
- `Details` text is improved/hidden, but Saved rows still visually look like appended extras.

## Required UX contract

Saved mode is an exclusive listing mode:

```txt
Latest mode  -> native/latest rows visible
Saved mode   -> only saved posts visible
Popular mode -> only popular posts visible
```

When Saved mode is active:

1. The main listing container MUST be marked with `data-gg-listing-mode="saved"`.
2. Native/latest rows MUST be hidden at runtime.
3. Saved rows MUST render as the active listing rows, not as an appended block below native rows.
4. Load-more and pagination controls MUST be hidden.
5. The visible mode label/control MUST NOT still display `Latest`; use `Saved` or hide/neutralize the selector while Saved is active.
6. Saved rows MUST continue to use `gg-template-listing-row`.
7. Saved empty state MUST continue to clone `gg-empty-state-saved-articles`.
8. `Details` MUST NOT be visible as raw text in saved rows; icon-only affordance is OK if accessible.
9. Unsave while in Saved mode MUST refresh/remove the row immediately.

## Implementation guidance

The previous patch likely depended on a selector that did not match the actual native Blogger/listing DOM. Make this robust.

Recommended approach:

### 1. Mark native/latest rows once

Add or refine a helper similar to:

```js
function markNativeListingRows() {
  if (!ui.listing) return;
  Array.prototype.forEach.call(ui.listing.children || [], function (node) {
    if (!node || node.nodeType !== 1) return;
    if (node.hasAttribute('data-gg-saved-row')) return;
    if (node.hasAttribute('data-gg-popular-row')) return;
    if (node.hasAttribute('data-gg-dynamic-listing-row')) return;
    if (node.matches('template, script, style')) return;
    node.setAttribute('data-gg-native-row', 'true');
  });
}
```

Use the actual repo style and selectors. The important contract is that native/latest rows get a stable marker such as `data-gg-native-row="true"`.

### 2. Hide/show by mode using markers

Add or refine a helper similar to:

```js
function setListingMode(mode) {
  if (!ui.listing) return;
  ui.listing.setAttribute('data-gg-listing-mode', mode || 'latest');
  markNativeListingRows();
  setNativeListingRowsHidden(mode === 'saved' || mode === 'popular');
}
```

Do not rely only on brittle class names. Hide the rows marked `data-gg-native-row="true"` when Saved or Popular is active.

### 3. Render saved rows into the active listing surface

Before rendering saved rows:

- clear only dynamic rows,
- mark/hide native rows,
- set listing mode to `saved`,
- hide load-more/pagination,
- append saved rows to the same listing container.

When leaving Saved mode:

- clear dynamic saved rows,
- set listing mode back to `latest` or the correct active mode,
- unhide native rows only when Popular is not active.

### 4. Fix the visible mode label

If the visible top control/label currently displays `Latest`, it must not stay that way in Saved mode.

Choose the least invasive option that matches current DOM:

- update the label to `Saved`, or
- hide/neutralize the Latest selector while Saved mode is active, or
- add a `data-gg-active-listing-label="Saved"` accessible label.

Do not introduce a full new filter system.

### 5. Keep template-first rule

Do not create new structural UI using `innerHTML`, `insertAdjacentHTML`, `outerHTML`, or large `createElement` structures.

Do not introduce generic templates such as:

- `gg-template-button`
- `gg-template-div`
- `gg-template-row`
- `gg-template-element`
- `gg-template-generic`

## Files likely involved

Likely:

- `src/modules/legacy-app/legacy-app.js`
- `config/saved-listing-presentation-contract.json`
- `docs/legacy-app-bridge-inventory.md`
- `docs/public-dom-generation-audit.md`
- `config/legacy-app-bridge-policy.json` if byte/line budget changed
- `config/public-dom-generation-policy.json` if DOM counts/allowlist changed
- `scripts/task002n-d-patch-2-acceptance.sh`

Only touch other files if required.

## Boundaries

Do NOT:

- extract Popular/Related bridge seam,
- rewrite full Saved system,
- rewrite full listing architecture,
- touch OAuth/Blogger API credentials,
- restructure Store folder,
- delete `legacy-donor/`,
- delete `src/modules/legacy-app/`,
- edit generated `dist/**` or `.cloudflare-build/**` manually,
- add new dependencies.

## Required acceptance script

Create `scripts/task002n-d-patch-2-acceptance.sh`.

It should run the validation pipeline and assert source-level runtime contract markers exist, including:

- saved listing presentation contract file exists,
- `data-gg-listing-mode` appears in `legacy-app.js`,
- a robust native marker such as `data-gg-native-row` appears in `legacy-app.js`,
- `data-gg-saved-row` appears in `legacy-app.js`,
- Saved mode hides native rows through a helper or marker path,
- no visible raw saved row `Details` regression pattern is introduced,
- `check:public-dom` passes with `needsTemplate=0` and `unclassified=0`,
- `check:legacy-bridge` passes.

Use robust grep/node assertions. Do not depend on exact line numbers.

## Required final command

Run:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002n-d-patch-2-acceptance.sh
```

Report:

- files changed,
- before/after `check:legacy-bridge` byte/line counts,
- final `check:public-dom` summary,
- final `check:legacy-bridge` summary,
- what manual smoke test should verify.
