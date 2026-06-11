# TASK 004C-R — Static Markup Contract Repair, Implementation First

## Status

Run this task after Task 004C and before repo structure reconciliation.

Task 004C is not accepted yet.

This is a repair task.

Do not start repo structure reconciliation.

Do not add new features.

Do not over-engineer guards.

---

## Context

Task 004C reported completion, but static review found that the public Blogger surface still violates the static markup contract.

The main problem is not missing templates. The main problem is that JavaScript still builds public Gaga UI structures programmatically.

The current guard also gives false positives: it passes even when implementation is still wrong.

This repair task prioritizes implementation over guard complexity.

Token/time budget rule:

```txt
70% implementation
20% validation/build fixes
10% guard/docs/handoff
```

---

## Product Law

Public Blogger surfaces must follow this rule:

```txt
index.xml = semantic/template/hook/microcopy source of truth
CSS       = visual system source of truth
JS        = behavior/state/data binding only
```

Allowed public runtime JS:

```txt
- clone templates from index.xml
- update textContent
- update href/src/alt/aria/data attributes
- toggle hidden
- toggle classes
- bind events
- update state
```

Not allowed for public Gaga UI chrome:

```txt
- JS-built listing rows
- JS-built related cards
- JS-built popular controls
- JS-built pagination shell
- JS-built preview CTA buttons
- JS-built empty/error state markup
- innerHTML / insertAdjacentHTML for Gaga UI chrome
- large document.createElement UI trees for public surface
```

Allowed exception:

```txt
Sanitized article body/content handling may remain if it does not create Gaga UI chrome.
GG Console internals are out of scope unless shared with public runtime.
```

---

# 1. Reset the 004C Guard

The current `qa/public-surface-static-markup-guard.mjs` is too broad and still not sharp enough.

Reset it.

Do not build a large static-analysis framework.

Do not spend excessive time making perfect guards.

Replace it with a minimal focused tripwire that checks only the actual regressions found.

The reset guard must check:

```txt
1. createListingRow does not build Gaga row UI with document.createElement.
2. createPopularControls does not build public controls with document.createElement.
3. createRelatedPostNode does not build related cards with document.createElement.
4. renderRelatedPosts does not build dots with document.createElement.
5. preview CTA row physically lives inside gg-preview__footer.
6. body-level duplicate gg-preview__cta-row does not exist.
7. hard-coded #fbfaf4 and #f4f3ed are not used in component CSS outside token declarations.
```

The guard may ignore:

```txt
- apps/console/**
- test files
- build scripts
- sanitized article body/content handling
- token declaration files
```

Keep the package script name stable:

```txt
npm run gaga:verify-public-surface-static-markup
```

Do not remove the script from `ci:qa`.

The guard should be small, readable, and easy to maintain.

---

# 2. Repair Listing Row Rendering

Current issue:

`src/js/gg-app.source.js` still builds public listing rows programmatically.

Required:

* Replace programmatic listing row UI creation with template cloning.
* Use the existing `index.xml` listing row template, or create/fix one canonical template.
* JS may only fill text, links, icons, labels, state, and attributes.
* JS must not create the listing row structure with `document.createElement`.

Required behavior:

```txt
Latest rows    → template clone
Saved rows     → template clone
Popular rows   → template clone
Unknown icon   → article
Details icon   → top_panel_open
```

Preferred template ID:

```txt
gg-template-listing-row
```

Keep the final template ID consistent across:

```txt
index.xml
src/js/gg-app.source.js
qa/public-surface-static-markup-guard.mjs
```

---

# 3. Repair Popular Controls Rendering

Current issue:

`createPopularControls()` still creates public UI programmatically.

Required:

* Popular range selector must come from `index.xml` template/shell.
* JS may clone it and update active state.
* JS must not build the section/link/button tree manually.

Required ranges:

```txt
ALL_TIME
LAST_YEAR
LAST_MONTH
LAST_WEEK
```

Visible labels:

```txt
All time
Last year
Last 30 days
Last 7 days
```

Native source must remain:

```txt
PopularPosts1 = ALL_TIME
PopularPosts3 = LAST_YEAR
PopularPosts2 = LAST_MONTH
PopularPosts4 = LAST_WEEK
```

Do not fake popularity.

Preferred template ID:

```txt
gg-template-popular-range-selector
```

---

# 4. Repair Related Posts Rendering

Current issue:

`createRelatedPostNode()` and related dots still create public UI programmatically.

Required:

* Related cards must clone an `index.xml` template.
* Related dots must clone an `index.xml` template.
* JS may only populate:

  * href
  * title
  * label/meta
  * thumbnail src/alt
  * placeholder visibility
  * active state
  * aria-label

JS must not build related card/dot structure with `document.createElement`.

Preferred template IDs:

```txt
gg-template-related-post-card
gg-template-related-posts-dot
```

Required behavior:

```txt
- detail page only
- exclude Store products
- max 3 visible cards
- dots only when item count > 3
- no external carousel library
```

---

# 5. Repair Empty/Error State Rendering

Current issue:

Fallback empty/error states may still be built by JS.

Required:

* Empty/error state markup must already exist in `index.xml`.
* JS only toggles the correct state.
* JS must not create empty/error state sections with `document.createElement`.
* JS must not append empty state below unrelated listing rows.

Required saved behavior:

```txt
Click Saved
→ normal/latest rows hidden
→ if saved items exist: show saved rows
→ if empty: show saved empty state at top/center of listing area
```

Required saved copy:

```txt
No saved articles yet.
Save articles from previews or article pages to find them here.
```

---

# 6. Move Preview CTA Physically into Footer

Current issue:

`gg-preview__cta-row` still lives in preview body/surface, not footer.

Required:

* Move `gg-preview__cta-row` physically into:

```html
<footer class="gg-preview__footer">
```

* Remove body-level duplicate CTA row.
* Footer owns CTA actions.
* Sticky behavior must be scoped inside the sheet.
* Mobile safe-area padding must remain.
* CTA layout uses `display:flex`.

Required behavior:

```txt
Save / Saved       left
Open full article  right
read_more icon     on Open full article
saved icon         dynamic
```

JS may only update state and attributes.

JS must not build CTA HTML.

Also remove or replace visible generic placeholder text:

```txt
Article preview
```

when it appears as static title/eyebrow instead of real article metadata.

---

# 7. Repair Root Pagination and Detail Navigation Only Where Broken

Do not redesign pagination.

Repair only contract violations.

Root/listing:

```txt
- uses gg-detail-outline
- mode = pagination
- attached to dock-tail
- no visible “Pagination”
- no visible “Browse entries”
- Back left
- page/range center
- Next right
```

Detail page:

```txt
- no dock TOC as primary navigation
- no root dock pagination treatment
- uses body-level adjacent navigation if present
- keeps Related Posts as retention module
```

Do not create a new navigation system.

---

# 8. Replace Hard-Coded Light Colors in Component Usage

Replace remaining hard-coded light-only colors found in component usage:

```txt
#fbfaf4
#f4f3ed
```

Required:

* Use Gaga tokens instead.
* Update both app CSS and critical CSS when needed.
* Do not introduce new hard-coded light-only colors.
* Literal colors may remain only in token declaration files.

Focus areas:

```txt
listing
filter menu
preview footer
dock-tail
detail outline
empty states
related posts
```

---

# 9. Handle index2.xml Safely

`index2.xml` was modified by Task 004C.

Required:

* Determine whether `index2.xml` is active pipeline source.
* If not active, revert Task 004C changes to `index2.xml`.
* If active, document why it must stay in sync.
* Do not silently modify legacy/reference files.

Preferred decision:

```txt
index.xml = active source
index2.xml = reference/legacy only
```

---

# 10. Validation

Run:

```bash
git status --short
git diff --check
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gaga:verify-public-surface-static-markup
npm run gaga:verify-root-ux-polish
npm run gaga:verify-preview-sheet
npm run gaga:verify-theme
npm run gg:console:check
npm run gaga:template:pack
npm run build
npm run ci:qa
npm run ci:cloudflare
```

If `index.xml` changes:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
```

---

# 11. Required Handoff Report

Report only:

```txt
1. Changed files
2. Functions repaired
3. Actual template IDs used
4. Preview CTA footer proof
5. Remaining JS createElement exceptions, if any
6. Hard-coded color replacement summary
7. index2.xml decision
8. Guard reset summary
9. Final fingerprint
10. ci:qa result
11. ci:cloudflare result
12. Remaining blockers
```

Classify remaining issues as:

```txt
BLOCKER
SHOULD FIX BEFORE RESTRUCTURE
ADVISORY
BACKLOG
```

---

# Acceptance Criteria

004C-R is accepted only when:

```txt
- createListingRow no longer builds public Gaga row UI programmatically
- createPopularControls no longer builds public popular controls programmatically
- createRelatedPostNode no longer builds related cards programmatically
- related dots are cloned from template
- empty/error states are not created programmatically
- preview CTA physically lives in gg-preview__footer
- body-level preview CTA duplicate is removed
- generic visible “Article preview” placeholder is removed or replaced
- root pagination remains dock-attached and label-free
- detail page keeps body-level adjacent navigation + Related Posts
- hard-coded light-only colors are replaced with Gaga tokens in component usage
- index2.xml is reverted or justified
- reset guard catches the exact old regressions
- generated assets are refreshed
- ci:qa passes
- ci:cloudflare passes
```

---

# Do Not Proceed

Do not proceed to repo structure reconciliation until 004C-R is accepted.
