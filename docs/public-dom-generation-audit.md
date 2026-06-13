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

### Current Findings (post TASK-002M-D)

| Count | Classification |
|-------|----------------|
| 12 | `allowedSmall` (span, option) |
| 0 | `needsTemplate` (button) — MIGRATED ✓ |
| 0 | `needsTemplate` (section) — MIGRATED ✓ |
| 0 | `needsTemplate` (article) — MIGRATED ✓ |
| 0 | `needsTemplate` (button, Store discovery) — MIGRATED ✓ |
| 21 | `unclassified` (div, strong, textarea, img, p, h2, a, iframe, script) |

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

### Remaining needsTemplate Candidates

None. All `needsTemplate` tags (section, article, button, nav, header, footer, dialog, form, aside, main, ul, ol, li) have been migrated from public JS source files.

### Recommended Next Migration Tasks

1. **TASK-002M-E:** Migrate legacy Blogger HTML stripping/parsing from `innerHTML`-based helpers to `DOMParser` or template-based extraction.
2. **TASK-002M-F:** Migrate Landing discovery command panel `innerHTML` patterns to template-based rendering.

## Restricted APIs Found (current)

| File | API | Status |
|------|-----|--------|
| `src/modules/legacy-app/legacy-app.js:1787` | `innerHTML` | allowlisted-legacy-bridge |
| `src/modules/legacy-app/legacy-app.js:6264` | `innerHTML` | allowlisted-legacy-bridge |
| `src/modules/legacy-app/legacy-app.js:7610` | `innerHTML` | allowlisted-legacy-bridge |
| `apps/studio/app.js:1` | `insertAdjacentHTML` | allowlisted-error-display |
| `apps/landing/landing.html:3302` | `innerHTML` | allowlisted-legacy-bridge |
| `apps/landing/landing.html:3362` | `innerHTML` | allowlisted-legacy-bridge |

The legacy-app usages are HTML stripping/parsing helpers for Blogger feed content — read-only extractions, not UI generation. The studio usage is a one-line error display on catastrophic failure. The landing usages are legacy inline script patterns.

No restricted APIs found in public surface files (Blog XML, Store HTML, Landing HTML).

### Large UI HTML Strings in JS

No JS strings containing large UI HTML markup with `<section`, `<article`, `<button`, `<template` and `gg-` class names were detected in public JS source files.

### Legacy Donor Files

`legacy-donor/` files also contain `innerHTML` usage but these are reference/donor files, not compiled into public output. They are excluded from the audit source globs.