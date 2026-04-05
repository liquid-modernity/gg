# GAGA RULES OF CSS
**Status:** Active operational law  
**Authority:** Subordinate to `BLOG_GAGA_ISH_MASTER_CONTRACT.md`  
**Scope:** All source CSS, generated CSS, CSS-related patching, CSS-related AI work, and CSS ownership decisions for BLOG GAGA-ish.

---

## 0. Purpose

This document exists to enforce a styling system that is:

- premium without noise
- app-like without runtime waste
- modular without architecture cosplay
- maintainable by a small operator using AI-assisted implementation
- strict enough to prevent duplicate selectors, override debt, ownership drift, and CSS sprawl

This document is not a note. It is operational law for the CSS system.

---

## 1. Authority and Precedence

### 1.1 Precedence order
1. `BLOG_GAGA_ISH_MASTER_CONTRACT.md`
2. `gaga-rules-of-css.md`
3. wave prompts / patch prompts / task-specific AI instructions

### 1.2 Conflict rule
If a prompt conflicts with this document, the prompt is invalid.

### 1.3 CSS-specific scope
This document governs:
- source-of-truth model for CSS
- file/folder architecture for styling
- primitive/component/surface ownership
- selector discipline
- responsive rules
- performance discipline for CSS
- allowed and forbidden patterns
- audit and acceptance gates
- patch rejection triggers

---

## 2. Definition of 10/10 CSS

The CSS system is considered **10/10** only if all conditions below are true:

1. `main.css` is a generated artifact, not a manual authoring file.
2. Source CSS has **no `!important`** except the tightly governed accessibility emergency exception defined in this document.
3. Source CSS has **no duplicate selectors**.
4. Source CSS has **no ownership ambiguity**.
5. Each primitive family has **one official owner**.
6. Each component family has **one official owner**.
7. Surface files contain **context only**, not primitive or shared-component reinvention.
8. Responsive behavior is deterministic across desktop, tablet, and mobile.
9. Keyboard and focus-visible paths remain complete in primary flows.
10. CSS changes do not compromise route readability, comments safety, semantic fallback, or performance budgets.
11. The system remains readable, testable, and auditable by a small operator using AI-assisted workflows.
12. The visitor experience feels premium because it is disciplined, not because it is visually overworked.

If any of the above fails, the CSS system is not 10/10.

---

## 3. Non-Negotiables

### 3.1 Generated artifact rule
`public/assets/.../main.css` is a generated artifact only.  
It must not be treated as the manual source of truth.

### 3.2 No override dumping ground
A catch-all `overrides.css` file is forbidden.

### 3.3 No family duplication
No feature may invent its own tooltip, modal, toast, banner, drawer, sheet, or other primitive family when an official primitive exists.

### 3.4 No CSS architecture improvisation
No AI patch may invent a new styling architecture, naming dialect, or component ownership model without explicit revision of this document.

### 3.5 No styling logic in JS
CSS injection, CSS-in-JS, runtime-generated styling systems, and HTML/CSS construction inside JS are forbidden except for narrowly justified CSS variable updates or class/data-state toggles.

### 3.6 No visual luxury fraud
Premium feel may not be purchased through ornamental runtime waste, blur spam, shadow escalation, or excessive overlay complexity.

---

## 4. Source-of-Truth Model

### 4.1 Source ownership
The source of truth for CSS is:

```text
src/styles/**
```

### 4.2 Orchestrator
The single CSS orchestrator file is:

```text
src/styles/index.css
```

### 4.3 Generated output
The deployable output file is:

```text
public/assets/.../main.css
```

### 4.4 Build contract
`main.css` must be generated from `src/styles/index.css` through a repeatable build process.

### 4.5 No shadow ownership
If a rule family has been migrated to `src/styles/**`, its legacy ownership must be deleted after parity is confirmed. Temporary dual ownership is not allowed without explicit time-boxed migration notes.

---

## 5. Layer Order

The styling system must use deterministic cascade layers in this exact order:

1. `settings`
2. `base`
3. `primitives`
4. `layout`
5. `components`
6. `surfaces`

### 5.1 Rule
A lower layer may not casually fight a higher layer through specificity inflation.

### 5.2 Rule
If a style conflict requires `!important`, the architecture or ownership is wrong.

---

## 6. File and Folder Structure

The official structure is:

```text
src/
  styles/
    index.css

    00-settings/
    01-base/
    02-primitives/
    03-layout/
    04-components/
    04-components/cards/
    05-surfaces/
```

### 6.1 Stable naming rule
Files must have:
- a single clear purpose
- stable naming
- explicit ownership
- no “temporary” naming that becomes permanent debt

### 6.2 One family, one owner
A family must not be split across random files unless this document explicitly allows it.

---

## 7. Surface Model

### 7.1 Two-level surface model
The system has two levels of surface understanding:

#### A. Public route surfaces
- `/`
- `/landing`
- `/offline`
- `/404`

#### B. Internal render contexts
- `listing`
- `landing`
- `post`
- `page`
- `special`
- `error`
- `offline`

### 7.2 Rule
Route surface behavior and render-context styling must not be confused.

### 7.3 Rule
Surface files may define contextual placement, spacing, layout usage, and surface-specific variants.  
Surface files may not redefine primitives or shared components.

---

## 8. Official Primitive Registry

The following are official primitive families:

- overlay
- dialog
- sheet / drawer
- toast
- banner
- inline alert
- tooltip
- skeleton
- empty state
- loading state container
- progress indicator
- field help / validation message
- confirm action pattern

### 8.1 Centralization rule
Each primitive family must be centralized.

### 8.2 No one-off primitives
No feature may create:
- `comments-toast.css`
- `share-modal.css`
- `landing-tooltip.css`
- `library-banner.css`

If the primitive is needed, it must be expressed through the official family.

### 8.3 Overlay rule
Overlay-capable primitives must define:
- focus entry
- focus return
- escape behavior
- dismissal behavior
- reduced motion compatibility
- z-index behavior
- state ownership

### 8.4 Toast rule
Toast is for ephemeral, non-critical acknowledgement only.

### 8.5 Dialog rule
Dialog is for interruption, confirmation, or focus-requiring decisions.

### 8.6 Sheet / drawer rule
Sheet is for contextual panels, secondary workflows, and mobile-first side interactions.

### 8.7 Banner rule
Banner is for broader-scope status, warning, or announcement.

### 8.8 Inline alert rule
Inline alert is for contextual guidance, warning, or error near the relevant region.

---

## 9. Tooltip Normalization Rule

Tooltip is an official primitive family.

### 9.1 Tooltip job
Tooltip exists only to provide **optional hint text**.

### 9.2 Tooltip limitations
Tooltip must never be:
- the sole carrier of critical meaning
- the sole carrier of warning text
- the sole carrier of validation guidance
- the sole carrier of destructive-action explanation
- a fake popover with hidden action UI

### 9.3 Accessibility rule
Tooltip must support:
- focus-triggered access
- non-hover interaction tolerance
- reduced motion compatibility
- an accessible relationship through semantic association where appropriate

### 9.4 Touch rule
Tooltip must not rely on hover-only behavior for essential understanding.

### 9.5 Browser-title ban
The browser `title` attribute may not serve as the official product tooltip system.

### 9.6 Ownership rule
Tooltip styling belongs to the primitive family only.  
Components may not define their own tooltip family.

### 9.7 Legacy tooltip rule
Legacy Blogger or third-party tooltip styling must be isolated, neutralized, or wrapped so it does not become a parallel tooltip system.

---

## 10. Official Component Registry

The following families are official component owners unless revised:

- nav
- lang-switcher
- dock
- dock-search
- drawer-more
- search-surface
- search-assist
- command-palette
- post-toolbar
- editorial-preview
- toc
- comments
- comments-panel
- comments-toolbar
- share-sheet
- labeltree
- library
- mixed-media
- install-prompt
- update-flow
- offline-recovery
- notfound
- ads
- footer
- cards/post-card
- cards/featured-card
- cards/mixed-card
- cards/panel-card
- cards/landing-card

### 10.1 Component rule
Each component family must have one clear owner file.

### 10.2 No hidden split ownership
A component may not have its visual identity distributed across multiple unrelated files.

### 10.3 Component vs primitive rule
A component may compose primitives.  
A component may not reinvent a primitive.

### 10.4 Editorial preview rule
`editorial-preview` is an official component family in its own right.  
It is not an alias, fallback name, or temporary synonym for `info-panel`.

### 10.5 Info-panel deprecation rule
`info-panel` is no longer a valid active component family name for new work.  
Legacy references must be migrated toward `editorial-preview` or another explicitly declared family.

### 10.6 Share-sheet rule
`share-sheet` is an official component family built on top of the `sheet` primitive.  
It must retain a stable trigger and host contract across listing and post contexts.

---

## 11. Layout Shell Rules

Official layout shell families include:

- page-shell
- wrap / containers
- header
- home-switcher
- blog-grid
- sidebars

### 11.1 Rule
Layout shells manage structure, placement, and macro layout behavior.

### 11.2 Rule
Layout files do not own component aesthetics beyond structural needs.

### 11.3 Rule
Sidebar shell ownership must remain separate from comments, editorial-preview, toc, labeltree, and card families.

---

## 12. Responsive Rules

### 12.1 Mobile-first mandatory
All source CSS must be authored mobile-first unless a narrowly justified exception is documented.

### 12.2 Breakpoint ownership
Breakpoints must be centralized through settings tokens or a controlled custom-media system.

### 12.3 No random breakpoint literals
One-off breakpoint values are forbidden unless clearly justified and documented.

### 12.4 Viewport classes
The system must behave intentionally across:
- mobile
- tablet
- desktop

### 12.5 Equality rule
Tablet may not become the forgotten orphan between mobile and desktop.

### 12.6 Responsive duplication ban
Do not solve the same responsive problem in both a component file and a surface file unless the distinction is explicit and legitimate.

### 12.7 Virtual keyboard safety
Interactive panels, drawers, dialogs, and search interfaces must behave safely around virtual keyboards and constrained viewports.

---

## 13. Naming and Selector Rules

### 13.1 Official naming
- class prefix: `.gg-`
- state class: `.gg-is-*`
- ID prefix: `#gg-*`
- internal hooks: `data-gg-*`
- token prefix: `--gg-*`

### 13.2 Selector philosophy
Selectors must be:
- readable
- shallow
- predictable
- ownership-consistent

### 13.3 Specificity discipline
Specificity must remain low and intentional.

### 13.4 Depth rule
Long descendant chains are a code smell.

### 13.5 ID caution
ID selectors are allowed only when justified by structural identity.

### 13.6 Utility rule
Low-specificity utilities may use `:where()` where appropriate.

### 13.7 Suspicious selector rule
Selectors that look like accidental element selectors instead of intended class selectors must be treated as defects until proven valid.

---

## 14. Token Rules

### 14.1 Token-only principle
When a styling decision can be represented as a token, raw values must not be scattered casually.

### 14.2 Token families
Official token families include:
- color
- typography
- spacing
- radius
- shadow
- motion
- z-index
- sizing
- layout/content width

### 14.3 Component token rule
Component tokens may exist, but they must not silently replace or undermine global semantic tokens.

---

## 15. Prohibited Patterns

The following are prohibited:

- `!important` in source CSS
- duplicate selectors in source CSS
- duplicate component ownership
- primitive reinvention inside component or surface files
- catch-all `overrides.css`
- random raw visual values where tokens already exist
- hover-only critical disclosure
- CSS patching that leaves legacy ownership behind
- styling families spread across unrelated files
- selector inflation used to “win” cascade fights
- ad hoc glass / blur / shadow escalation to fake premium feel
- comments behavior rewriting
- browser default `title` as the official tooltip system

---

## 16. Accessibility Rules for CSS

### 16.1 Focus visibility
Focus-visible styling must remain clear and intentional.

### 16.2 No pointer-only dependency
Primary flows may not depend on pointer precision.

### 16.3 Icon-only controls
Icon-only controls must remain compatible with accessible naming patterns.

### 16.4 Reduced motion
Reduced motion preferences must be respected.

### 16.5 Hidden content rule
CSS may not hide core meaning in a way that breaks semantic or assistive understanding.

### 16.6 Forced-colors tolerance
Critical focus and overlay states must degrade safely in forced-colors environments.

---

## 17. Comments Protected-Zone Rule

Native Blogger comments are a protected black box.

### 17.1 Allowed
- wrapper styling
- spacing
- visual containment
- safe polish around the native widget
- panel placement and shell integration

### 17.2 Forbidden
- behavior rewriting
- breaking reply logic
- breaking form visibility
- breaking keyboard access
- clipping actions or composer areas
- relying on assumptions that require internal Blogger comment DOM stability beyond defensive styling

### 17.3 Comments smoke law
If comments are touched, the change must verify:
- comments render on post page
- form is visible and keyboard-focusable
- reply behavior still works if enabled
- no clipping hides actions or form
- no console errors related to comments

---

## 18. Performance Rules for CSS

### 18.1 Performance is a product rule
CSS must support a premium feel without runtime waste.

### 18.2 Glass restraint
Blur, backdrop-filter, saturation, heavy shadows, and layered translucency must be used selectively.

### 18.3 Fixed/sticky caution
Heavy visual effects on fixed or sticky UI must be treated as expensive and justified.

### 18.4 No ornamental cost
Do not spend runtime budget to simulate luxury.

### 18.5 Layout stability rule
CSS changes must not create unnecessary layout instability or interaction jank.

---

## 19. CSS Audit Minimum Contract

Any `css:audit` implementation must check, at minimum:

1. duplicate selectors in source CSS
2. any remaining `!important` in source CSS
3. suspicious selectors that may indicate accidental element-vs-class mistakes
4. primitive duplication
5. component ownership leakage across files
6. surface files redefining shared primitives or shared components
7. specificity outliers
8. heavy-effect overuse, including blur, backdrop-filter, or glass escalation
9. generated artifact integrity
10. desktop / tablet / mobile parity risk

### 19.1 Rule
If `css:audit` does not cover the minimum contract above, it is incomplete.

---

## 20. XML Verify Minimum Contract for CSS-Aware Changes

If a CSS patch depends on XML contracts or surface ownership, verification must explicitly check:

1. correct route → render-context mapping where relevant
2. no cross-surface leakage caused by styling assumptions
3. no fake-hiding architecture introduced as the main solution
4. selector contract drift between XML, JS, and CSS
5. share trigger survival where relevant
6. editorial-preview survival on listing where relevant
7. TOC contract separation where relevant
8. comments safety where relevant
9. head / meta / canonical integrity if the patch touches SSR-facing structures

### 20.1 Rule
CSS work that implicitly changes XML contract behavior without verifying it fails review.

---

## 21. Acceptance Gates

No CSS patch is accepted without passing all required gates.

### 21.1 Required scripts
- `css:lint`
- `css:build`
- `css:audit`
- `css:verify`

### 21.2 Minimum pass conditions
A CSS patch fails if:
- any `!important` remains in source CSS
- duplicate selectors remain in source CSS
- primitive duplication is introduced
- component ownership becomes ambiguous
- a surface file redefines a primitive or shared component
- route readability is weakened
- comments safety is compromised
- accessibility is weakened in primary flows
- performance regresses unacceptably

### 21.3 Verification rule
“Looks okay” is not verification.

---

## 22. AI Patch Output Contract

Every AI-generated CSS patch must state:

1. objective  
2. touched files/surfaces  
3. assumptions  
4. risks  
5. acceptance criteria  
6. rollback note if risk exists  
7. verification result

### 22.1 AI behavior limits
AI may not:
- rewrite architecture casually
- create new naming dialects
- bypass official primitives
- smuggle styling logic into template XML outside approved boundaries
- claim success without explicit verification

### 22.2 Human authority
The owner retains final authority.

---

## 23. Rejection Triggers

A CSS patch must be rejected if it:

- adds `!important`
- adds a duplicate selector
- invents a new primitive family
- creates `overrides.css`
- edits generated `main.css` as manual source
- breaks route readability
- breaks naming discipline
- touches comments in a way that risks behavior
- weakens semantic fallback
- increases complexity without measurable value
- leaves temporary duplicate ownership behind without a migration note

---

## 24. Migration Policy

### 24.1 Migration unit
Refactor by family, not by random scattered selectors.

### 24.2 Safe order
The preferred migration order is:
1. system guards
2. settings/base/layout
3. primitives
4. high-risk components
5. navigation/discovery
6. card families and rails
7. surfaces
8. final purge

### 24.3 Legacy purge
Once parity is confirmed, legacy ownership must be removed.

### 24.4 No shadow systems
A migrated family may not coexist indefinitely with a legacy family.

### 24.5 Tooltip migration rule
Legacy tooltip behavior must not become a hidden second tooltip system.

---

## 25. Emergency Exception Rule

The only tolerated use of `!important` is a narrowly justified, accessibility-protective emergency measure that is:

- explicitly documented
- tied to a ticket or issue ID
- assigned to a named owner
- given an expiry or review date
- temporary
- reviewed for removal
- never used to solve general architecture conflicts

If a patch uses `!important` outside this exception, the patch fails.

---

## 26. Closing Rule

This CSS system becomes “enterprise-grade” not by being bigger, but by being stricter.

If a CSS decision makes the system:
- harder to maintain
- harder to reason about
- slower to render
- easier to break
- more dependent on AI improvisation
- more visually noisy without improving hierarchy

that decision is wrong.
