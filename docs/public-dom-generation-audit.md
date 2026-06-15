# Public DOM Generation Audit

## Rule

`largePublicUiMustLiveInHtmlOrTemplate` — large public UI chrome (Blog, Store, Landing) must live in HTML, XML, or `<template>` elements. JavaScript may only manage small state and behavior, not generate large DOM subtrees.

## Allowed Small Behavior

JavaScript may use these APIs for small UI state changes, icon toggles, labels, or template hydration:

- `createElement`
- `textContent`
- `setAttribute`
- `appendChild`
- `classList`
- `dataset`

Example: toggling a bookmark icon from `bookmark_add` to `bookmark_added` by changing `data-gg-icon` is allowed.

## Restricted Patterns

The following APIs are restricted and must be audited:

- `innerHTML`
- `insertAdjacentHTML`
- `outerHTML`

Additionally, JavaScript strings containing large public UI chrome markup (e.g., strings with `<section`, `<article`, `<button`, `<template` combined with `gg-` class names) are restricted. Empty states, cards, sheets, dock, preview actions, saved listing empty, comment empty, search empty, and store cards should never be generated only in JS.

Empty states like `gg-saved-listing-empty` should live in Blog `index.xml` or a `<template>`, not be fully generated from JS.

## CreateElement SRC Audit

The `check:public-dom` check scans all `src/**/*.js` and `src/**/*.mjs` files for `document.createElement()` usage and classifies each occurrence.

### Classification Rules

| Classification | Criteria |
|---|---|
| `allowedSmall` | Tag name in `allowedSmallTags` (e.g., `span`, `option`). Small state/behavior nodes. |
| `needsTemplate` | Tag name in `needsTemplateTags` (e.g., `section`, `article`, `button`, `nav`, `header`, `footer`, `dialog`, `form`, `aside`, `main`, `ul`, `ol`, `li`). Large chrome/UI structure — migration candidate. |
| `unclassified` | Tag not in either list (e.g., `div`, `p`, `h2`, `a`, `img`, `textarea`, `strong`, `iframe`, `script`). Warned but not failed. |

### Current Findings (post TASK-002M-G)

| Count | Classification |
|-------|----------------|
| 0 | `allowedSmall` |
| 6 | `allowedReviewed` (div, textarea, img, iframe, script) |
| 0 | `needsTemplate` |
| 0 | `unclassified` |

Current `npm run check:public-dom` summary:

```txt
public-dom ok: restricted=5 allowlisted=5 createElement=6 allowedSmall=0 allowedReviewed=6 needsTemplate=0 unclassified=0
```

### TASK-002M-B Migrated Items

**Before:** `createElement('section')` (3 occurrences) and `createElement('article')` (1 occurrence) in `src/modules/legacy-app/legacy-app.js` generated listing cards, saved/unavailable empty states, and discovery sections.

**After:** All section/article generation in legacy-app.js now uses template cloning from `<template>` elements defined in `apps/blog/index.xml`:
- `gg-template-listing-row` — `<article>` listing row card
- `gg-template-popular-range-selector` — `<section>` popular range selector
- `gg-empty-state-saved-articles` — `<section>` saved empty state
- `gg-empty-state-popular-unavailable` — `<section>` popular unavailable empty state

A `cloneTemplateElement(id)` helper in legacy-app.js handles template cloning.

### TASK-002M-C Migrated Items

**Before:** `createElement('button')` (8 occurrences) in `src/modules/legacy-app/legacy-app.js` generated comment sheet handles, reply buttons, more/like/copy-link/delete buttons, and related posts dots navigation.

**After:** All Blog button chrome generation in legacy-app.js now uses template cloning from `<template>` elements defined in `apps/blog/index.xml`:
- `gg-template-comments-sheet-handle` — sheet drag/replies handle button
- `gg-template-comment-replies-toggle` — expand/collapse replies toggle
- `gg-template-comment-reply-clear` — clear reply input button
- `gg-template-comment-copy-link-button` — copy permalink button
- `gg-template-comment-delete-button` — delete comment button
- `gg-template-comment-more-button` — show more comments button
- `gg-template-comment-reply-button` — reply to parent comment button
- `gg-template-comment-add-reply-button` — submit reply button

Related posts dots fallback was also migrated from `createElement('a')` to `gg-template-dots-pager-link` template.

**Result:** `createElement('button')` count in `src/modules/legacy-app/legacy-app.js`: 8 → 0 (zero).

### TASK-002M-D Migrated Items

**Before:** `createElement('button')` (2 occurrences) in `src/modules/store/store-discovery.js` generated semantic category chip buttons and semantic "more" buttons.

**After:** All Store discovery button chrome generation in store-discovery.js now uses template cloning from `<template>` elements defined in `apps/store/store.html`:
- `store-semantic-category-chip-template` — semantic category rail chip button
- `store-semantic-more-button-template` — semantic "more/see more" reveal button

**Result:** `createElement('button')` count in `src/modules/store/store-discovery.js`: 2 → 0 (zero).

### TASK-002M-F Migrated Items

**Before:** TASK-002M-E identified nine Blog structural `div`/`a` `needsTemplate` candidates in `src/modules/legacy-app/legacy-app.js`:

- Reply banner `div` — `gg-comments__reply-banner`
- Comment more menu `div` — `gg-comment-more__menu`
- Replies context label `div`
- Replies context row `div`
- Replies context copy `div`
- Replies context meta `div`
- Replies context body `div`
- Replies context count `div`
- Popular range navigation link `a` — `gg-popular-controls__range`

**After:** These Blog structural UI nodes now live in purpose-specific `<template>` elements in `apps/blog/index.xml`, and `legacy-app.js` clones those templates before applying runtime state/text/aria/href/data:

- `gg-template-comment-reply-banner`
- `gg-template-comment-more-menu`
- `gg-template-comment-replies-context-label`
- `gg-template-comment-replies-context-row`
- `gg-template-popular-range-link`

No generic/universal template such as `gg-template-div`, `gg-template-link`, `gg-template-button`, `gg-template-element`, or `gg-template-generic` was introduced.

**Result:** Known Blog `div`/`a` structural `needsTemplate` candidates: 9 → 0.

### TASK-002M-G Template Completeness Pass

**Before:** `npm run check:public-dom` reported:

```txt
createElement=16 allowedSmall=6 allowedReviewed=10 needsTemplate=0 unclassified=0
```

**Template migrated:** Remaining allowed/user-visible UI nodes that improved human and AI editability were moved into purpose-specific Blog templates:

| Previous JS element | Decision | Template |
|---|---|---|
| comment reply prefix `span` | `templateMigrated` | `gg-template-comment-reply-prefix` |
| comment status `div` | `templateMigrated` | `gg-template-comment-status` |
| comment more wrapper `span` | `templateMigrated` | `gg-template-comment-more-wrapper` |
| saved empty unavailable fallback `p` | `templateMigrated` | `gg-empty-state-saved-articles` |
| related post card fallback `a` | `templateMigrated` | `gg-template-related-post-card` |
| related posts dots fallback `div`/`span` | `templateMigrated` | `gg-template-related-posts-dot` |

**Kept in JS:** The remaining occurrences are not templateable public chrome:

| File | Tag | Decision | Rationale |
|---|---|---|---|
| `src/modules/legacy-app/legacy-app.js:1798` | `div` | `allowedParsing` | Temporary HTML strip helper used only for text extraction; never inserted into visible DOM. |
| `src/modules/legacy-app/legacy-app.js:4783` | `textarea` | `allowedRuntime` | Temporary off-screen clipboard fallback, removed immediately after copy attempt. |
| `src/modules/legacy-app/legacy-app.js:5054` | `img` | `allowedDynamicData` | Runtime comment avatar image created only when comment data supplies a source; structural context is templated. |
| `src/modules/legacy-app/legacy-app.js:10035` | `iframe` | `allowedRuntime` | Hidden route-matrix measurement iframe used for diagnostics infrastructure, not public chrome. |
| `src/modules/store/store.js` | `script` | `allowedRuntime` | Store compatibility entry dynamically loads the store core runtime script. |
| `src/modules/store/store-core.js` | `script` | `allowedRuntime` | Store core dynamically loads the discovery runtime script on demand. |

**After:** `npm run check:public-dom` reports:

```txt
createElement=6 allowedSmall=0 allowedReviewed=6 needsTemplate=0 unclassified=0
```

No generic/universal template such as `gg-template-div`, `gg-template-link`, `gg-template-button`, `gg-template-element`, or `gg-template-generic` was introduced.

### TASK-002N-D-PATCH-2 Runtime Saved Listing Fix

PATCH-2 did not add new public DOM generation. Saved listing exclusivity is handled through existing template-first rows and runtime state/attribute wiring:

- Native listing children are marked with `data-gg-native-row="true"` and hidden while Saved or Popular mode is active.
- Saved rows continue to clone `gg-template-listing-row`; empty state continues to clone `gg-empty-state-saved-articles`.
- Load-more/pagination visibility and the listing toolbar label are updated by state, not by new structural UI creation.

### TASK-002N-E Popular/Related Bridge Seam

TASK-002N-E did not add new public DOM generation. It moved small Popular/Related data helpers into `src/modules/popular-related-bridge/popular-related-bridge.js`:

- Popular range hash normalization, range href, and range label helpers.
- Related date score, post normalization, page state, and dot state helpers.
- Popular and Related visible structures still come from existing Blog templates and are cloned/hydrated by `legacy-app.js`.

### TASK-002N-F Offline/Error/Fallback Bridge Seam

TASK-002N-F did not add new public DOM generation. It moved small Offline/Error/Fallback data helpers into `src/modules/offline-fallback-bridge/offline-fallback-bridge.js`:

- Network state and fallback post filtering helpers.
- Fallback UI/load state and status payload helpers for search-empty and 404 surfaces.
- Search-empty, 404, listing growth, timers, rendering, and fetch orchestration still stay in `legacy-app.js` and existing Blog templates.

### Remaining needsTemplate Candidates

None. All `needsTemplate` tags (section, article, button, nav, header, footer, dialog, form, aside, main, ul, ol, li) have been migrated from public JS source files.

### Recommended Next Migration Tasks

1. **TASK-002M-E:** Completed — Public DOM Unclassified Element Audit. All 21 previously unclassified createElement calls reviewed and classified by occurrence. See section below.
2. **TASK-002M-F:** Completed — Blog div/link structural UI template migration.
3. **TASK-002M-G:** Completed — Public DOM template completeness pass.

## TASK-002M-E — Public DOM Unclassified Element Audit

### Summary

All 21 previously unclassified `document.createElement()` calls across `src/**/*.js` and `src/**/*.mjs` have been reviewed and classified by occurrence. No migration was performed in this task.

### Tags Reviewed

`div`, `strong`, `textarea`, `img`, `p`, `a`, `iframe`, `script`

### Classification Results

| Count | Classification |
|-------|----------------|
| 10 | `allowedSmall` (span, option) |
| 9 | `needsTemplate` (div, a) |
| 7 | `allowedRuntimeConstruct` (div, textarea, img, p, a, script) |
| 1 | `allowedSmallBehavior` (strong x2) |
| 1 | `allowedLegacyParsing` (div) |
| 1 | `allowedNonChromeInfrastructure` (iframe) |
| 0 | `unclassified` ✓ |

### Occurrence Classification Table

| File | Line | Tag | Classification | Context |
|------|------|-----|----------------|---------|
| `src/modules/legacy-app/legacy-app.js` | 1786 | div | `allowedLegacyParsing` | HTML strip helper — parsing only, never visible |
| `src/modules/legacy-app/legacy-app.js` | 4476 | div | `needsTemplate` | Reply banner (gg-comments__reply-banner) |
| `src/modules/legacy-app/legacy-app.js` | 4488 | strong | `allowedSmallBehavior` | Inline handle name emphasis |
| `src/modules/legacy-app/legacy-app.js` | 4845 | div | `allowedRuntimeConstruct` | Dynamic comment status (runtime-driven) |
| `src/modules/legacy-app/legacy-app.js` | 4863 | textarea | `allowedRuntimeConstruct` | Off-screen clipboard fallback |
| `src/modules/legacy-app/legacy-app.js` | 4934 | div | `needsTemplate` | Comment more menu popover (gg-comment-more__menu) |
| `src/modules/legacy-app/legacy-app.js` | 5136 | div | `needsTemplate` | Replies context label container |
| `src/modules/legacy-app/legacy-app.js` | 5141 | div | `needsTemplate` | Replies context row container |
| `src/modules/legacy-app/legacy-app.js` | 5145 | img | `allowedRuntimeConstruct` | Runtime-driven avatar image |
| `src/modules/legacy-app/legacy-app.js` | 5154 | div | `needsTemplate` | Replies context copy container |
| `src/modules/legacy-app/legacy-app.js` | 5157 | div | `needsTemplate` | Replies context meta container |
| `src/modules/legacy-app/legacy-app.js` | 5160 | strong | `allowedSmallBehavior` | Inline author name emphasis |
| `src/modules/legacy-app/legacy-app.js` | 5174 | div | `needsTemplate` | Replies context body container |
| `src/modules/legacy-app/legacy-app.js` | 5180 | div | `needsTemplate` | Replies context count container |
| `src/modules/legacy-app/legacy-app.js` | 6883 | p | `allowedRuntimeConstruct` | Template fallback — graceful degradation |
| `src/modules/legacy-app/legacy-app.js` | 7025 | a | `needsTemplate` | Popular range navigation link |
| `src/modules/legacy-app/legacy-app.js` | 8819 | a | `allowedRuntimeConstruct` | Template fallback — graceful degradation |
| `src/modules/legacy-app/legacy-app.js` | 8892 | div | `allowedRuntimeConstruct` | Template fallback — graceful degradation |
| `src/modules/legacy-app/legacy-app.js` | 10173 | iframe | `allowedNonChromeInfrastructure` | Hidden measurement iframe |
| `src/modules/store/store-core.js` | 61 | script | `allowedRuntimeConstruct` | Dynamic JS bundle loader |
| `src/modules/store/store.js` | 7 | script | `allowedRuntimeConstruct` | Entry-point JS loader |

### needsTemplate Follow-Up Candidates

Nine (9) `needsTemplate` candidates were identified for **TASK-002M-F** and have now been migrated:

1. Comment reply banner `div` — `gg-comments__reply-banner`
2. Comment more menu `div` — `gg-comment-more__menu`
3. Comment replies context label `div` — `gg-comment-replies__context-label`
4. Comment replies context row `div` — `gg-comment-replies__context-row`
5. Comment replies context copy `div` — `gg-comment-replies__context-copy`
6. Comment replies context meta `div` — `gg-comment-replies__context-meta`
7. Comment replies context body `div` — `gg-comment-replies__context-body`
8. Comment replies context count `div` — `gg-comment-replies__context-count`
9. Popular range navigation link `a` — `gg-popular-controls__range`

These structural public UI elements are now represented by purpose-specific templates in `apps/blog/index.xml`.

### Statement

No UI migration was performed. No createElement calls were removed or modified. This was purely an audit, policy, and guardrail pass. All unclassified occurrences are now reviewed and classified in the policy.

## Restricted APIs Found (current)

| File | API | Status |
|------|-----|--------|
| `src/modules/legacy-app/legacy-app.js:1799` | `innerHTML` | allowlisted-legacy-bridge |
| `src/modules/legacy-app/legacy-app.js:6146` | `innerHTML` | allowlisted-legacy-bridge |
| `src/modules/legacy-app/legacy-app.js:7491` | `innerHTML` | allowlisted-legacy-bridge |
| `apps/studio/app.js:1` | `insertAdjacentHTML` | allowlisted-error-display |
| `apps/landing/landing.html:3302` | `innerHTML` | allowlisted-legacy-bridge |
| `apps/landing/landing.html:3362` | `innerHTML` | allowlisted-legacy-bridge |

The legacy-app usages are HTML stripping/parsing helpers for Blogger feed content — read-only extractions, not UI generation. The studio usage is a one-line error display on catastrophic failure. The landing usages are legacy inline script patterns.

No restricted APIs found in public surface files (Blog XML, Store HTML, Landing HTML).

### Large UI HTML Strings in JS

No JS strings containing large UI HTML markup with `<section`, `<article`, `<button`, `<template` and `gg-` class names were detected in public JS source files.

### Legacy Donor Files

`legacy-donor/` files also contain `innerHTML` usage but these are reference/donor files, not compiled into public output. They are excluded from the audit source globs.
