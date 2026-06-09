# TASK 001 — Root Listing Table UX + Index XML Reconciliation

## Status

Development only. Do not treat this as a production release task.

This task supersedes any broad repo-cleanup work for now. Do not execute old `task-002-reconcile.md` separately unless this task ends with unrelated CI failures. Use the old task only as a guard-policy reference.

## Goal

Safely reconcile the newer `index.xml` feature work into the repository baseline so the root blog listing becomes a clean visual table with:

- root listing rows styled as a table/grid
- sticky table header
- profile/avatar area on the left
- contextual filter/dropdown on the right
- root/listing pagination displayed through the outline-peek family
- no regression to Blogger SSR, schema, preview sheet, comments, or global dock
- GitHub Actions deployment path remains green

The attached/pasted `index2.xml` must be treated as a feature source, not as a direct replacement.

## Product Intent

The root blog is the main professional-personal blog surface. It should feel organized, lightweight, and app-like, but must remain readable and indexable as a blog.

The listing should look like a table, but the semantic structure should stay article/list based.

Preferred semantic shape:

```html
<section class="gg-entry-list" role="list">
  <article class="gg-entry-row" role="listitem">
    ...
  </article>
</section>
```

Do not convert root listing into a literal `<table>` unless there is a strong reason and all a11y/SEO guards are updated accordingly.

## Scope

### Include

- Reconcile newer `index2.xml` changes into the repo `index.xml`.
- Implement root listing visual table styles.
- Implement `gg-listing-toolbar` or equivalent header contract.
- Keep avatar/profile header using `gg-*` namespace.
- Add context-aware listing filter trigger/dropdown.
- Add root/listing pagination mode using outline-peek/dock clearance without breaking post detail TOC mode.
- Update or add QA guards that protect the new contract.
- Update fingerprint after final template changes.
- Ensure GitHub Actions `ci.yml` and `deploy-cloudflare.yml` remain compatible.

### Exclude

- Full config-aware/registry-driven refactor.
- Full Store architecture refactor.
- Static landing/store changes unless required by shared CSS/JS contract.
- New dashboard UI. That is Task 004.
- Production deploy.

## Required Reconciliation Approach

1. Save current repo state.
2. Compare current repo `index.xml` with the newer feature `index2.xml`.
3. Merge only intentional feature blocks.
4. Do not direct overwrite the repo `index2.xml`.
5. Preserve Blogger expressions exactly unless a change is required.
6. Keep existing generated/extracted asset wiring intact.
7. Fix all duplicate IDs introduced by the feature source.
8. Fix all a11y issues introduced by the feature source.
9. Update fingerprint only after final merged template is stable.

## Known Feature Source Issues To Fix

These issues were observed in the newer `index.xml` and must be handled during merge:

- `gg-template-fingerprint` may be stale.
- Some buttons may have no accessible name.
- `data-gg-nav` inside HTML comments may be picked up by regex guards.
- `.gg-root-profilve__avatar` is likely a typo and should become `.gg-root-profile__avatar`.
- `background-color: fbfaf4;` should be `background-color: #fbfaf4;`.
- `gg-preview-taxonomy` / `gg-preview-taxonomy-items` may be duplicated.
- sponsored discovery tab may incorrectly use `data-gg-command-tab="trending"`; if sponsored is implemented, use `sponsored`.
- discovery guards may need conscious updates if new filters become official.

## Required Markup Contract

Add or preserve a stable listing toolbar contract:

```html
<header class="gg-listing-toolbar" data-gg-module="listing-toolbar">
  <a class="gg-root-profile__card" href="/p/about.html">
    <span class="gg-root-profile__avatar" aria-hidden="true">...</span>
    <span class="gg-root-profile__copy">...</span>
  </a>

  <button
    class="gg-listing-toolbar__filter"
    data-gg-listing-filter-trigger="true"
    aria-haspopup="menu"
    aria-expanded="false"
    type="button">
    ...
  </button>
</header>
```

Class names may differ only if a guard/documentation record explains the final contract.

## Listing Filter Contract

Initial filter set:

- Latest
- Lab
- Insight
- Case Notes
- Perspective
- Saved
- Popular Posts

For this task, hard-coded Blogger label links are allowed as an intermediate step. However, all markup must be easy to move into a registry later.

Expected future registry shape:

```js
listingFilters: [
  { id: "latest", label: "Latest", href: "/" },
  { id: "lab", label: "Lab", href: "/search/label/Lab" },
  { id: "insight", label: "Insight", href: "/search/label/Insight" },
  { id: "case-notes", label: "Case Notes", href: "/search/label/Case Notes" },
  { id: "perspective", label: "Perspective", href: "/search/label/Perspective" },
  { id: "saved", label: "Saved", href: "#saved" },
  { id: "popular", label: "Popular Posts", href: "#popularpost" }
]
```

## Outline Peek Pagination Mode

The outline-peek family may be reused, but it must have explicit mode separation:

```html
<nav
  class="gg-detail-outline"
  data-gg-module="outline-peek"
  data-gg-outline-mode="pagination">
</nav>
```

Expected modes:

| Surface | Mode |
| --- | --- |
| Post detail | `toc` |
| Page detail | `toc` |
| Root listing | `pagination` |
| Label listing | `pagination` |
| Search listing | `pagination` |
| Archive listing | `pagination` |

Do not break existing post/page detail TOC behavior.

Pagination should support at minimum:

- Back
- numeric pages when available or derived
- ellipsis state
- Next
- accessible labels
- graceful fallback to Blogger older/newer URLs when total page count is unknown

## Store Isolation Requirement

Root listing must continue to exclude Store/Yellow Cart posts unless the active view is an explicit label/source view where Store content is expected.

Preserve or improve the existing filter logic around:

- `Store`
- `Store Fashion`
- `Store Skincare`
- `Store Workspace`
- `Store Tech`
- `Store Everyday`
- `Store Etc`
- `Store Lainnya`
- `Store:`
- `Store/`
- `gg-store-data`
- `gg-yellowcard-data`

## QA/Guard Requirements

Update or create guards only when needed. Do not weaken standards.

Likely touched guards:

- `qa/a11y-static-guard.mjs`
- `qa/semantic-ssr-guard.mjs`
- `qa/preview-sheet-contract-guard.mjs`
- `qa/discovery-filter-taxonomy-guard.mjs`
- `qa/nav-more-contract-guard.mjs`
- `qa/template-fingerprint.mjs`
- `qa/store-isolation-guard.mjs`
- `qa/shell-interaction-guard.mjs`

If a guard fails because it is outdated relative to the intentional new contract, update the guard and document the new contract. Do not bypass it.

## Required Commands

Run these after implementation:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
npm run gaga:template:pack
npm run gaga:verify-semantic-ssr
npm run gaga:verify-a11y-static
npm run gaga:verify-store-isolation
npm run gaga:verify-preview-sheet
npm run gaga:verify-shell
npm run build
npm run ci:cloudflare
```

Before claiming done, also run:

```bash
npm run ci:qa
```

If `npm run ci:qa` fails, classify the failure as:

- true blocker introduced by this task
- true pre-existing blocker
- environment issue
- outdated guard that must be reconciled
- advisory issue incorrectly hard-failing

## GitHub Actions Green Requirement

The task is not complete until the commands used by GitHub Actions are expected to pass:

- `npm ci`
- `npm run ci:cloudflare`
- `npm run deploy:cloudflare:prepared` after build preparation, without exposing secrets

Do not require live Cloudflare secrets for local completion. Missing secrets must be documented as environment/secret requirements, not code failure.

## Acceptance Criteria

- Root listing visually matches the table direction from the mockup.
- Sticky listing header with avatar/profile and contextual filter exists.
- Listing remains semantic and accessible.
- Post/page detail TOC mode still works.
- Root/listing pagination mode exists or has a guarded MVP fallback.
- Store posts remain isolated from normal blog listing.
- No duplicate IDs.
- No comment-only `data-gg-nav` or similar tokens break regex guards.
- Template fingerprint is updated.
- `npm run build` passes.
- `npm run ci:cloudflare` passes.
- `npm run ci:qa` passes or any failure is clearly classified and reconciled.

## Stop Rule

If this task starts requiring broad config/profile refactor, stop and report. That belongs to a later independence phase, not this task.
