# TASK-DISCOVERY-SAVED-EMPTY-LIVE-PARITY-001

## Scope

Run this task only. Do not start any other task.

This is a focused live-parity fix for the Saved empty state in the Discovery sheet on the Blogger root surface (`/`). It must not become a broader Discovery, Store, Search, Sheet, CSS, or controller refactor.

## Problem

After the latest deploy, the Saved empty-state copy appears correctly on `/landing` and `/store`, but it still does not appear on live root `/` even after cache clearing and a successful redeploy.

Expected copy when Saved has no items:

```txt
No saved items yet. Save articles or products to find them here.
```

This is likely a root/Blogger Discovery runtime state/rendering path defect, not a cache issue and not a CSS-only issue.

## Goal

Ensure the Saved tab empty state displays the same canonical copy and visual behavior across:

- `/`
- `/landing`
- `/store`

The root/Blogger DOM path must have a real empty-state node/copy/state marker when the Saved tab is active and there are no saved items.

Static source-string presence is not enough.

## Hard Constraints

Do not:

- create a new Discovery controller;
- create a standalone Saved-only controller;
- add patch/override-only CSS;
- add random new CSS/JS layers;
- duplicate the search/empty-state visual system;
- remove or hide the valid post titled `todo`;
- change route truth: `/landing = Home`, `/ = Blog`, breadcrumb `Home(/landing) -> Blog(/) -> current`;
- touch Blogger-native comments plumbing;
- touch Blog1-safe schema protections;
- reintroduce dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops;
- change Store product source;
- change Worker healthy-route UI;
- change critical inline CSS/JS unless an existing contract defect explicitly requires it.

## Implementation Principle

Use the existing Discovery state/render/copy path and shared empty-state contract.

If logic is required, extend existing centralized Discovery behavior. Do not create a parallel controller.

The fix should make root/Blogger behave like landing and Store, not create a root-only special case unless documented as a surface adapter.

## Required Audit

Inspect the root/Blogger Discovery path and compare it against landing and Store:

- Saved tab activation state;
- saved-items storage/source path;
- empty-state node creation or reuse;
- copy binding path;
- `hidden`, `aria-hidden`, `data-*` state attributes;
- display/visibility toggling;
- tab/filter state when Saved has zero items;
- whether root has a different DOM container from landing/store;
- whether the existing guard only checks static copy presence instead of rendered DOM-path parity.

## Likely Areas

Investigate only as needed:

- `src/js/gg-app.source.js`
- `src/js/modules/controllers/discovery-controller.fragment.js`
- `src/js/modules/core/copy-registry.fragment.js`
- `registry/copy/gg-copy-en.json`
- `registry/copy/gg-copy-id.json`
- root `gg-copy-*.json` if used by the build
- `src/css/components/gg-discovery-sheet.css`
- `src/css/components/gg-visual-tokens.css`
- `qa/sheet-search-visual-parity-guard.mjs`
- existing Discovery guards, if more appropriate

Do not edit `landing.html` or Store runtime unless the parity contract requires alignment and the reason is documented.

## Guard Requirements

Prefer updating an existing guard instead of adding a redundant new guard.

A guard should verify, where practical:

- canonical Saved empty-state copy exists in registry/copy source;
- root/Blogger Discovery path has a Saved empty-state DOM marker or copy binding path;
- landing path still has the Saved empty-state contract;
- Store path still has the Saved empty-state contract;
- no root-only fake copy string is hardcoded outside the registry/copy contract;
- More search behavior remains preserved;
- searchbar visual parity guard still passes;
- no dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops are reintroduced.

If a guard is added or materially changed, wire/document it through:

- `package.json`
- `ci:qa`
- `qa/ci-reconciliation-guard.mjs`
- `QA-COMMANDS.md`
- `SOURCE-OF-TRUTH.md`

## QA Commands

Run at minimum:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-ci-reconciliation
npm run gaga:verify-semantic-ssr
npm run gaga:verify-schema-jsonld
npm run gaga:verify-registry-contract
npm run gaga:verify-a11y-static
npm run gaga:verify-asset-architecture
npm run gaga:verify-cleanup
npm run gaga:verify-css-sot-cleanup
npm run gaga:verify-css-module-wiring
npm run gaga:verify-repo-structure-tidy
npm run gaga:verify-sheet-search-visual-parity
npm run gaga:verify-85
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run store:proof
npm run ci:cloudflare
```

If there is an existing Discovery-specific guard, run it too.

## Manual Live Check After Deploy

After commit/deploy, check root `/` manually:

1. Open `/`.
2. Open Discovery sheet.
3. Switch to Saved.
4. Ensure the empty-state copy appears when no saved items exist:

```txt
No saved items yet. Save articles or products to find them here.
```

5. Confirm More search still works.
6. Confirm landing and Store Saved empty state still work.

Useful live-console diagnostic for root `/` if still failing:

```js
document.querySelectorAll('[data-gg-discovery-filter="saved"], [data-gg-saved], .gg-discovery-empty, .gg-discovery-saved-empty, [data-gg-copy*="saved"]').forEach(el => {
  console.log(el, {
    text: el.textContent.trim(),
    hidden: el.hidden,
    ariaHidden: el.getAttribute('aria-hidden'),
    display: getComputedStyle(el).display,
    visibility: getComputedStyle(el).visibility
  });
});
```

## Acceptance Criteria

This task is accepted only if:

- root `/` Saved empty state has a real DOM/copy/state path;
- landing Saved empty state remains correct;
- Store Saved empty state remains correct;
- More search behavior remains working;
- searchbar visual parity remains intact;
- no new controller is created;
- no one-off patch/override CSS is added;
- no route/schema/comments/Worker boundaries are touched;
- required QA passes.

## Final Report Required

Report:

- files changed;
- root Saved empty-state DOM behavior before/after;
- whether landing/store parity was preserved;
- whether More search was preserved;
- guard/script changes;
- QA PASS/FAIL;
- warnings;
- intentional non-changes.
