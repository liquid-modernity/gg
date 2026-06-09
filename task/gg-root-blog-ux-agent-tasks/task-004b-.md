# TASK 004B — Root UX Polish, Popular Posts Listing, and GG Console Repair

## Status

This task must run after Tasks 001–004 and before repo structure reconciliation.

Do not start repo structure reconciliation.
Do not move files into `product/`.
Do not rename/move `qa/`, `tools/`, or build contracts.
Do not change Worker behavior unless a current guard explicitly requires it.

---

## Context

Tasks 001–003 implemented the root listing table, Blogger contact sheet, More sheet icons, Save Article, and Related Posts. Task 004 added `apps/console`, but the current GG Console renders as an unstyled/blank Loading screen.

This task is a focused polish and repair task.

Important product rule:

Public Blogger surfaces must use the Gaga Design System only.

Do not introduce shadcn/ui, React, Vue, Tailwind, Bootstrap, Radix, or any third-party UI framework/library into public Blogger root/store/landing surfaces.

GG Console and future GG Studio may use their own app stack later, but public Blogger output must remain framework-free and Gaga-owned.

---

## Goals

1. Repair GG Console so it actually renders as a styled read-only local control plane.
2. Polish root listing UI.
3. Rename the root visual header concept from `gg-listing-toolbar` to `gg-site-head`.
4. Add registry-driven label icons for root listing and menu items.
5. Make Saved and Popular Posts menu items functional.
6. Integrate native Blogger PopularPosts widgets as the source for Popular listing mode.
7. Redesign Related Posts into a compact retention card/carousel.
8. Polish Preview Sheet CTA and metadata.
9. Move social links from More sheet to Contact sheet.
10. Deprecate/remove redundant `gg-site-head`/old site-head duplication safely.
11. Make root listing aim to fit viewport height with pagination as primary navigation.

---

## Non-goals

Do not restructure the repository.

Do not move files into `product/`.

Do not create a full GG Studio editor.

Do not make the GG Console a command runner.

Do not fake Blogger ContactForm success.

Do not use shadcn/ui, React, Tailwind, or any external UI framework/library in public Blogger surfaces.

Do not replace Blogger comments/native rendering.

Do not use Worker HTMLRewriter as a CMS repair layer.

---

# 1. Public Surface Design System Rule

For `index.xml`, `landing.html`, `store.html`, generated Blogger templates, and all public runtime assets:

Use only:

* Gaga Design System classes
* `gg-*` classes, data attributes, functions, hooks, and registry contracts
* existing project build pipeline
* vanilla JavaScript where runtime behavior is needed
* project-owned CSS tokens and components

Do not add:

* shadcn/ui
* React
* Vue
* Svelte
* Tailwind runtime dependency
* Bootstrap
* Radix runtime dependency
* third-party UI framework
* public CDN UI component framework

Material icon usage must remain compatible with the current Gaga visual system. If adding new icons, prefer the existing icon mechanism already used by the project. Do not introduce a new icon library dependency unless it is already part of the current public surface contract.

---

# 2. GG Console Repair

Current issue: GG Console renders as unstyled HTML and stays in Loading state.

Repair `apps/console` so it renders a real local read-only control plane.

Required behavior:

* CSS loads correctly.
* JS loads correctly.
* `/api/snapshot` loads or produces a clear error state.
* The UI must not stay stuck on “Loading”.
* If snapshot fails, show a styled error card with the failing endpoint/status.
* Keep the Console read-only.
* No command runner.
* No arbitrary filesystem path parameter.
* No write endpoint.
* Snapshot server must read only whitelisted repo files.
* `dashboard.html` must remain documented as GG Studio prototype/reference, not the shipped GG Console.

Preferred visual direction:

* Cloudflare-like dashboard
* left sidebar
* topbar
* overview cards
* resource/status tables
* clear health badges
* calm neutral layout

Required Console sections:

* Profile
* Surfaces
* Navigation
* Copy
* A11y
* Build / CI
* Prototype Boundary

Required command:

```bash
npm run gg:console:check
```

`gg:console:check` must fail when:

* required Console files are missing
* CSS path is broken
* JS path is broken
* `/api/snapshot` contract is broken
* snapshot allowlist is not enforced
* dashboard.html is treated as shipped Console UI

---

# 3. Rename Root Header Concept to `gg-site-head`

The current root visual header should become the canonical `gg-site-head`.

Preferred final concept:

```html
<header class="gg-site-head" data-gg-module="site-head">
```

Transition allowed:

```html
<header class="gg-site-head gg-listing-toolbar" data-gg-module="site-head">
```

Use compatibility alias only if needed to keep existing guards green.

Final naming direction:

* `gg-site-head`
* `gg-site-head__profile`
* `gg-site-head__avatar`
* `gg-site-head__identity`
* `gg-site-head__title`
* `gg-site-head__subtitle`
* `gg-site-head__filter`
* `gg-site-head__menu`
* `gg-site-head__menu-item`

Audit all old `gg-site-head` and `gg-listing-toolbar` references before removal.

Do not leave duplicate root headers.

If the previous `gg-site-head` is only visual/redundant, migrate useful content into the new `gg-site-head` and remove/deprecate safely.

Do not break:

* SSR
* schema
* breadcrumbs
* a11y
* preview sheet
* root listing
* store isolation
* template fingerprint

---

# 4. Root Listing Label Icons

Add label/icon mapping in registry or source-of-truth copy/config, not hardcoded randomly in markup.

Required mapping:

```json
{
  "article": {
    "label": "Article",
    "icon": "article"
  },
  "latest": {
    "label": "Latest",
    "icon": "update"
  },
  "lab": {
    "label": "Lab",
    "icon": "science"
  },
  "insight": {
    "label": "Insight",
    "icon": "psychology"
  },
  "case-notes": {
    "label": "Case Notes",
    "icon": "clinical_notes"
  },
  "perspective": {
    "label": "Perspective",
    "icon": "visibility"
  },
  "saved": {
    "label": "Saved",
    "icon": "bookmark"
  },
  "popular-posts": {
    "label": "Popular Posts",
    "icon": "local_fire_department"
  },
  "recents": {
    "label": "Recents",
    "icon": "history"
  },
  "details": {
    "label": "Details",
    "icon": "top_panel_open"
  }
}
```

Behavior:

* Root listing row left side shows the article/label icon.
* Unknown label uses `article` fallback.
* Details action uses `top_panel_open`.
* Menu items show their own icon on the right side.
* Icons must be `aria-hidden="true"`.
* Text labels must remain accessible.
* Do not make icon-only controls without accessible names.

Root row target:

```txt
[left icon] Article title                         Details [top_panel_open]
```

Menu target:

```txt
Latest                                      update
Lab                                         science
Insight                                     psychology
Case Notes                                  clinical_notes
Perspective                                 visibility
Saved                                       bookmark
Popular Posts                               local_fire_department
```

---

# 5. Saved Listing Mode

Saved menu item must be functional.

Source:

```txt
localStorage key: gg:saved:v1
```

Behavior:

* Clicking Saved switches root listing to saved mode.
* Saved listing renders saved articles.
* Empty state renders when there are no saved articles.
* Save/Saved state remains synced between listing rows and preview sheet.
* localStorage unavailable must not throw runtime errors.
* Do not fake server sync.

Allowed route/hash:

```txt
#saved
```

or existing project route convention if already implemented.

---

# 6. Popular Posts Listing Mode

Popular Posts menu item must be functional.

Do not fake popularity.

Use native Blogger PopularPosts widgets as first-class data source.

The template may contain these native widgets:

```txt
PopularPosts1 = ALL_TIME
PopularPosts3 = LAST_YEAR
PopularPosts2 = LAST_MONTH
PopularPosts4 = LAST_WEEK
```

Existing native Blogger widget source example:

```xml
<b:widget id='PopularPosts1' locked='false' title='Popular Posts All time' type='PopularPosts' visible='true'>
  <b:widget-settings>
    <b:widget-setting name='numItemsToShow'>10</b:widget-setting>
    <b:widget-setting name='showThumbnails'>true</b:widget-setting>
    <b:widget-setting name='showSnippets'>true</b:widget-setting>
    <b:widget-setting name='timeRange'>ALL_TIME</b:widget-setting>
  </b:widget-settings>
  <b:includable id='main' var='this'>
    <b:include name='widget-title'/>
    <div class='widget-content'>
      <b:include name='snippetedPosts'/>
    </div>
  </b:includable>
</b:widget>
```

Required time ranges:

```txt
ALL_TIME
LAST_YEAR
LAST_MONTH
LAST_WEEK
```

Preferred UX:

Clicking Popular Posts opens popular listing mode with range options:

```txt
Popular Posts
All time | Last year | Last 30 days | Last 7 days
```

or a compact menu/subfilter if space is limited.

Implementation direction:

* Keep Blogger PopularPosts widgets as source data.
* Render or normalize their data into Gaga listing rows.
* It is acceptable to keep native widget output in a hidden/source container if needed.
* Public display must use Gaga Design System rows, not raw Blogger widget UI.
* Preserve thumbnails/snippets if available.
* Exclude Store products.
* If native popular data is unavailable, show clear empty state:
  “Popular posts are unavailable.”
* Do not synthesize fake popular ranking from latest posts.

Required contracts:

* Popular mode must not break Latest/Lab/Insight/Case Notes/Perspective/Saved modes.
* Popular mode must be keyboard accessible.
* Popular mode must be guardable.
* Popular source IDs and time ranges must be documented.

---

# 7. Root Pagination Attached to Dock

Current issue: pagination is visually detached and has extra labels like “Pagination” and “Browse entries”.

Required change:

* Attach root pagination visually to the global dock as dock-tail/dock-companion.
* Remove visible text labels:

  * “Pagination”
  * “Browse entries”
* Layout:

  * Back on left
  * page number(s) centered
  * Next on right
* Keep pagination only for root/listing surfaces.
* Do not use pagination mode on post/page detail outline-peek.
* Post/page detail outline-peek remains TOC mode only.

Target:

```txt
[Back]          [1] […]          [Next]
```

above/attached to:

```txt
Home | Contact | Search | Blog | More
```

Do not break olderPageUrl/newerPageUrl fallback.

---

# 8. Related Posts Retention Card

Current issue: Related Posts renders too much like a long table/list.

Redesign as a compact retention card.

Required behavior:

* Related posts render only on post/page detail.
* Do not render on root/listing pages.
* Do not include Store products.
* Show maximum 3 items at once.
* If more than 3 items exist, enable carousel/slider.
* Show dots only when item count is greater than 3.
* Prefer item structure:

  * small label/source meta
  * title
  * optional thumbnail on right
* If no thumbnail exists, use a subtle Gaga placeholder.
* Keep accessible names for carousel controls/dots.
* No external carousel library.

Target visual:

```txt
Related Posts >
────────────────────────
[Label] Title                         [thumb]
[Label] Title                         [thumb]
[Label] Title                         [thumb]

•  ○  ○
```

---

# 9. Preview Sheet Polish

Required changes:

* Replace “Article preview” text with current article/post label meta.
* Remove redundant `gg-preview__taxonomy` / meta cue if it duplicates the label/meta.
* Make `gg-preview__cta-row` a sticky footer.
* `gg-preview__cta-row` must use `display:flex`.
* Save/Saved button remains visible.
* Open full article button remains visible.
* Add/readjust dynamic saved icon.
* Add/readjust `read_more` icon for Open full article.
* Icons should appear on the right side where visually appropriate.
* Buttons must keep accessible names.
* Preview sheet must remain keyboard accessible.

Target footer:

```txt
[Save / Saved]                         [Open full article read_more]
```

---

# 10. Contact and More Sheet Cleanup

Move social links out of More sheet.

Required change:

* Remove `gg-more-footer__social` from More sheet.
* Add social links to Contact sheet as `gg-contact-social`.
* Contact sheet owns:

  * form/message intent
  * WhatsApp fallback
  * email fallback
  * social links
* More sheet owns:

  * About
  * Privacy Policy
  * Terms of Use
  * Disclaimer
  * Preferences
  * Search

Contact behavior:

* Do not fake Blogger ContactForm success.
* Native Blogger ContactForm is experimental/root-only best effort.
* Add provider fallback for all surfaces:

  * WhatsApp
  * email link
  * optional configured form provider if already available
* Landing/store contact must not point to a broken local anchor unless that anchor exists and works.
* Static surfaces should open a safe contact route/sheet/fallback.

---

# 11. Root Viewport-Fit Listing

Goal:

Root listing should feel like an app surface. On normal mobile viewport, visitor should ideally not need vertical scrolling to browse visible entries; pagination should become the primary navigation.

Required behavior:

* Root listing aims to fit visible viewport height.
* Keep accessibility fallback for large text/small screens.
* Do not hide inaccessible posts without pagination logic.
* Do not use fixed heights that clip content permanently.
* Use modern viewport-safe sizing where appropriate:

  * `100svh`
  * calculated available space
  * safe-area padding
* Pagination remains reachable above dock.
* Dock remains reachable.

Acceptable fallback:

Small screens, browser zoom, and large text may still allow controlled scroll. Do not break accessibility to force a no-scroll layout.

---

# 12. Guards and Documentation

Add or update focused guards where needed.

Required guard coverage:

* `gg-site-head` contract
* no duplicate root header
* label icon mapping exists
* unknown label fallback exists
* details icon uses `top_panel_open`
* Saved menu switches to saved listing mode
* Popular Posts menu switches to popular listing mode
* native PopularPosts source IDs/time ranges are present or empty-state is implemented
* pagination dock-tail has no “Pagination” / “Browse entries” visible text
* related posts show max 3 items at once and dots only when needed
* preview sheet sticky CTA contract
* social links moved from More to Contact
* GG Console is not blank/loading-only

Update docs:

* Document `dashboard.html` as GG Studio prototype/reference.
* Document `apps/console` as GG Console.
* Document public surface rule: Gaga Design System only, no external UI framework.
* Document native Blogger PopularPosts integration and time ranges.
* Document Contact provider fallback.

---

# 13. Validation Commands

Run and report exact results:

```bash
git status --short
git diff --check
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gg:console:check
npm run gaga:template:pack
npm run build
npm run ci:qa
npm run ci:cloudflare
```

If template content changes, update fingerprint only after source is stable:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
```

---

# 14. Required Handoff Report

Report:

```txt
1. Changed files grouped by area
2. Final template fingerprint
3. GG Console smoke result
4. PopularPosts source/range behavior
5. Saved listing behavior
6. Related posts behavior
7. Preview sheet behavior
8. Contact fallback behavior
9. Advisory warnings
10. Remaining blockers
```

Classify warnings as:

```txt
BLOCKER
SHOULD FIX BEFORE RESTRUCTURE
ADVISORY
BACKLOG
```

---

# Acceptance Criteria

This task is complete only when:

* GG Console renders styled and does not stay blank/loading.
* Public Blogger surface remains Gaga Design System only.
* `gg-site-head` is the canonical root header concept.
* Root listing rows have label icons.
* Details uses `top_panel_open`.
* Saved menu item works.
* Popular Posts menu item works using native Blogger PopularPosts data or clear unavailable empty state.
* Pagination is visually attached to dock and no longer shows “Pagination / Browse entries”.
* Related Posts card matches retention-card direction and supports dots when more than 3.
* Preview sheet has sticky CTA footer and no redundant taxonomy cue.
* Social links are moved from More sheet to Contact sheet.
* Root listing aims for viewport-fit behavior without breaking accessibility.
* Required validation commands pass or pass with documented existing advisory warnings only.
