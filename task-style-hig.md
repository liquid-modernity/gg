TASK: Apple HIG Full-Product Semantics and Behavior Audit Pass

File scope:
- index.xml
- qa/template-proof.sh
- qa/template-status.sh only if needed for reporting clarity
- worker.js only if `/blog` redirect/legacy alias is actually supported
- Do not touch unrelated files.

Primary goal:
Raise BLOG GAGA from Apple-HIG-like UI shell to Apple-HIG-like product experience by auditing and fixing route semantics, navigation semantics, accessibility behavior, input behavior, error states, and platform expectations.

This is NOT a CSS polish task.
The visual shell, dock, detail outline positioning, dark/light/system appearance, touch targets, and Material Symbols quieting are already implemented. Do not redesign them.

Current known state:
- `gg-detail-outline` is bottom-attached when dock is hidden, uses normal width, keeps safe-area internally, and remains openable.
- The template has explicit QA manual matrix coverage for mobile, tablet, desktop, keyboard, sheets, language switcher, appearance switcher, drag dismiss, and live route matrix.
- There are existing contracts for detail outline, error404 surface, search-empty fallback, listing growth, and discovery.
- Remaining product debt is likely route vocabulary and behavioral consistency, especially `/`, `/landing`, `/blog`, `home`, `blog`, `listing`, and `landing`.

Hard constraints:
- Do not change the Apple HIG CSS pass unless required for accessibility correctness.
- Do not change `gg-detail-outline` CSS positioning/width.
- Do not replace Material Symbols.
- Do not add a new framework.
- Do not weaken QA scripts just to pass.
- Do not create fake public routes merely to satisfy outdated tests.
- Do not change Blogger widget structure unless unavoidable.
- Do not break SSR / Blogger route rendering.
- Do not touch Cloudflare Worker unless route redirect truth requires it.

PHASE 1 — Route vocabulary audit

Search all references in index.xml, qa scripts, and worker.js:
- `/blog`
- `/landing`
- `/?view=blog`
- `/?view=landing`
- `/listing`
- `home`
- `blog`
- `listing`
- `landing`
- `special`
- `data-gg-surface`
- `data-gg-page`
- `aria-current`
- `expected_surface`
- `expected_page`
- `route_blog`

Classify every reference into one of these buckets:
A. UI label only
B. Canonical public URL
C. Legacy alias
D. QA-only expectation
E. Runtime surface vocabulary
F. Worker redirect/routing rule
G. SEO/canonical/schema reference
H. Dock/breadcrumb/navigation current-state logic

Before patching, produce a short internal report:
- Is `/blog` linked anywhere in actual rendered UI?
- Is `/blog` present in sitemap, canonical, schema, manifest, dock, More sheet, breadcrumb, or Worker route rules?
- Is `/blog` only a QA expectation?
- Is `/listing` ever used as a URL, or only as a surface/page state?
- Does `home` still mean root listing anywhere?
- Does `special` still include landing/error behavior that should now be explicit?

Target canonical route truth:
- `/` = listing/blog surface
- `/landing` = landing/home surface
- `/blog` = legacy alias only if proven necessary
- `/listing` = not a public route unless explicitly documented elsewhere
- `home` as UI label should point to `/landing`
- `blog` as UI label should point to `/`
- `listing` is a technical surface/page name, not necessarily a user-facing label

Acceptance for Phase 1:
- No patch yet unless classification is obvious.
- Add a comment or contract object documenting final route vocabulary if one does not already exist.
- Do not keep ambiguous comments such as “home means root” if product truth now says root is listing/blog.

PHASE 2 — Public surface/page contract

Goal:
Make public route truth visible without relying only on runtime JS.

Required public contract:
- `/`
  surface=listing
  page=listing

- `/landing`
  surface=landing
  page=landing

- `/blog`
  If classified as supported legacy alias:
    must redirect to `/`
  If classified as dead/QA-only:
    remove/downgrade `/blog` from proof expectations instead of adding a fake route.

Implement:
- Ensure `#gg-fingerprint`, `#gg-shell`, and `#main` expose route surface/page truth where safe.
- Add or normalize:
  data-gg-surface
  data-gg-page
- Runtime JS may still refine state, but raw HTML should expose enough truth for curl-based QA when possible.

Do not:
- Do not rely only on `applySurfaceContract()` after JS boot if proof expects SSR-visible attributes.
- Do not introduce `surface=home` for `/`.
- Do not introduce `/listing` as a public URL.

Acceptance:
- `/` reports listing/listing.
- `/landing` reports landing/landing.
- `/blog` either redirects to `/` or is explicitly no longer part of proof.
- Canonical and OG do not show malformed double slash paths such as `//blog`.

PHASE 3 — Navigation semantics audit

Goal:
Make dock, More sheet, breadcrumbs, and contextual controls semantically consistent with route truth.

Check:
- Dock item “Home” should correspond to `/landing`.
- Dock item “Blog” should correspond to `/`.
- More sheet “Blog” should correspond to `/`.
- Any “Home” recovery action in 404/search-empty should go to `/landing` unless product intentionally defines Home as `/`.
- Breadcrumbs on post/page should not contradict route truth.
- `aria-current="page"` should be applied to the correct dock item for:
  `/`
  `/landing`
  post detail
  static page
  search
  label
  archive
  404
- Dock should not highlight Blog for landing unless intentionally designed.
- Dock should not highlight Home for listing unless intentionally designed.

Acceptance:
- UI labels may stay human-friendly: Home, Blog, Search, Comments, More.
- Technical surface names stay consistent: listing, landing, post, page, search, label, archive, error404.
- No mixed public meaning where `home` sometimes means `/` and sometimes means `/landing`.

PHASE 4 — Accessibility and focus behavior audit

Goal:
Confirm the interface behaves like a serious app, not just a good-looking page.

Audit and fix if needed:
- Every sheet/panel has appropriate role and accessible name.
- Modal-like sheets should trap focus while open.
- Background content should be inert or effectively unreachable while modal sheets are active.
- Escape closes the topmost active sheet/panel and returns focus to the triggering control.
- Focus return must work for:
  command/search sheet
  More sheet
  Comments sheet
  Preview top sheet
  detail outline expanded state
- Tab and Shift+Tab should not leak into hidden panels.
- Hidden panels should use `hidden`, `aria-hidden`, or equivalent consistently.
- Buttons must have clear accessible labels.
- Icon-only controls must have `aria-label`.
- Segmented controls:
  language switcher
  appearance switcher
  discovery tabs
  must expose active state through `aria-pressed` or `aria-selected` consistently, not only `data-gg-active`.

Do not:
- Do not add noisy visible labels if existing ARIA labels solve it.
- Do not create focus traps that break native Blogger comment iframe/input behavior.

Acceptance:
- Keyboard-only user can open, operate, and close every sheet.
- Focus returns to the opener.
- Escape behavior is predictable.
- No invisible focus inside hidden sheets.

PHASE 5 — Input behavior audit

Goal:
Make command/search and controls behave predictably across keyboard, touch, and mobile.

Check:
- Ctrl/Cmd+K opens command/search.
- Search input focus behavior does not accidentally reopen the sheet after close.
- Arrow navigation in discovery results works.
- Enter activates active discovery item or submits search.
- Empty search state has clear recovery actions.
- 404 search recovery opens discovery with focus in the input.
- Appearance switcher persists:
  system
  light
  dark
- Language switcher persists and does not fight appearance persistence.
- Drag dismiss does not conflict with scrollable sheet content.
- Tap/click outside sheet closes only when intended.
- Press animations do not fire on disabled/hidden controls.

Acceptance:
- Mouse, keyboard, and touch have equivalent functional access.
- No “trap” where user cannot exit sheet.
- No accidental page navigation from inert/hidden controls.

PHASE 6 — Content behavior and reading semantics

Goal:
Make reading behavior consistent and calm.

Audit:
- Article metadata grammar:
  preview
  article tail
  toolbar
  comments
  taxonomy
  should not duplicate or contradict each other.
- Detail outline:
  should appear only on post/page with enough headings.
  should hide gracefully if no headings exist.
  should not show empty tray unless explicit empty copy is useful.
- Heading extraction:
  H2/H3 order should produce sensible outline hierarchy.
  Broken heading order should not crash.
- Article images:
  should not break layout.
  should preserve aspect ratio.
  if missing alt text, do not invent alt text, but ensure layout remains accessible as much as Blogger permits.
- Reading flow:
  dock and outline should not cover final paragraph, article tail, or comments trigger.
- Search result previews:
  should not promise content that is unavailable.
- Empty states:
  search-empty and error404 should end in useful recovery, not dead text.

Acceptance:
- A real article with headings feels coherent.
- A short article without headings does not show a misleading TOC.
- Article bottom is readable without being hidden behind dock/outline.
- Empty/failure states provide next action.

PHASE 7 — Error-state governance

Goal:
Make error handling honest and recoverable.

Existing contracts include:
- native Blogger error view as `surface=error404`
- search-empty fallback
- error404 fallback
- recent articles fallback

Audit:
- Native Blogger 404 should set surface=error404.
- Unmatched special routes should not be falsely promoted to error404 unless Blogger exposes native error marker.
- Error404 should provide:
  clear title
  calm explanation
  Home action
  Search action
  optional recent articles fallback
- Fallback loading must resolve into success or terminal failure message.
- Terminal failure should not look like the site is broken.
- Dock current state on 404 should be neutral or intentionally selected, not misleading.

Acceptance:
- 404 route is recoverable.
- Search-empty route is recoverable.
- Failed fallback does not leave spinner/loading forever.
- Copy is calm and not overexplaining.

PHASE 8 — Platform expectation audit

Goal:
Make the PWA/Blogger experience feel intentionally web-native and Apple-like without pretending to be native iOS.

Check:
- Viewport and safe-area handling remain correct.
- Appearance follows system by default.
- Explicit Light/Dark overrides persist.
- Reduced motion works.
- Contrast/forced colors work.
- Backdrop-filter fallback remains readable.
- Mobile Safari:
  no horizontal overflow
  no home indicator collision
  no tiny tap targets
  no sheet stuck below viewport
- Desktop:
  keyboard operation is complete
  hover does not become the only affordance
- Blogger-native comments:
  remain reachable
  do not break focus or scroll lock.

Acceptance:
- No platform-hostile behavior.
- The interface feels app-like but still honest as a website/PWA.

PHASE 9 — QA script alignment

Goal:
Make QA verify the chosen product truth, not legacy assumptions.

Do:
- Update `qa/template-proof.sh` only after route classification is complete.
- If `/blog` is dead/QA-only, remove it from hard failures or convert to advisory.
- If `/blog` is legacy-supported, verify redirect to `/`.
- Make proof output explain:
  route
  expected surface/page
  observed surface/page
  redirect policy
  fingerprint state

Do not:
- Do not weaken `/` and `/landing` proof.
- Do not make proof pass by ignoring missing surface/page markers.
- Do not hide live drift warnings.

Acceptance:
- `npm run gaga:template:status` reports fingerprint parity.
- `npm run gaga:template:proof` passes under the documented route contract.
- If proof fails, output identifies real contract failure.

PHASE 10 — Final verification

Run locally:
xmllint --noout index.xml
node qa/template-fingerprint.mjs --check
npm run gaga:template:status
npm run gaga:template:proof

Manual QA routes:
- /
- /landing
- /?view=blog
- /?view=landing
- /blog only if supported legacy alias
- one post detail page
- one static page
- search with results
- search empty
- label page
- archive page
- native 404

Manual QA viewports:
- iPhone SE width
- modern iPhone width
- iPad portrait
- iPad landscape
- desktop narrow
- desktop wide

Manual QA interactions:
- Tab through dock
- Cmd/Ctrl+K open search
- Escape close sheets
- Focus return after close
- Open More sheet
- Change language
- Change appearance System/Light/Dark
- Open comments
- Open preview
- Scroll post until dock hides
- Open bottom-attached detail outline
- Select heading from outline
- Trigger search-empty actions
- Trigger 404 search recovery

Deliverable:
- Commit-style summary.
- Route vocabulary classification.
- Exact sections changed.
- QA result.
- State whether full-product Apple-HIG-like score should move from ~8.5 toward ~9.
- If unresolved, list remaining blockers explicitly.