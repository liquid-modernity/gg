# GAGA RULES OF CSS
**Status:** Active operational law  
**Authority:** Subordinate to `BLOG_GAGA_ISH_MASTER_CONTRACT.md` and governed by `GG-NAMING.md` for all naming-related matters  
**Scope:** All source CSS, generated CSS, CSS-related patching, CSS-related AI work, CSS ownership decisions, component family ownership, primitive family ownership, and CSS-side selector/token discipline for BLOG GAGA-ish.

---

## 0. Purpose

This document exists to enforce a styling system that is:

- premium without noise
- app-like without runtime waste
- modular without architecture cosplay
- maintainable by a small operator using AI-assisted implementation
- strict enough to prevent duplicate selectors, override debt, ownership drift, selector drift, naming drift, and CSS sprawl

This document is not a note. It is operational law for the CSS system.

---

## 1. Authority and Precedence

### 1.1 Precedence order
1. `BLOG_GAGA_ISH_MASTER_CONTRACT.md`
2. `GG-NAMING.md`
3. `gaga-rules-of-css.md`
4. `gaga-rules-of-xml.md`
5. wave prompts / patch prompts / task-specific AI instructions

### 1.2 Conflict rule
If a prompt conflicts with this document or with `GG-NAMING.md`, the prompt is invalid.

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
- official CSS family registry
- CSS naming compliance with GG law

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
13. Official family names, selectors, tokens, and states follow GG naming law.
14. Deprecated family names do not remain active architecture after parity.

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

### 3.7 No naming drift
CSS may not preserve a generic family registry while code and hooks use GG naming. The registry, selectors, and owner families must speak one language.

### 3.8 No shadow family survival
A deprecated or legacy family may survive only as a documented bridge with explicit cleanup intent. It may not remain a hidden second architecture.

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

### 5.3 Rule
Naming law applies across all layers. A layer may differ in role, but not in naming dialect.

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

### 6.3 File vs family distinction
A source file may use practical filesystem naming, but the official owned family inside it must still be GG-scoped.

Example:
- file: `detail-toolbar.css`
- owned family: `gg-detail-toolbar`

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
- `global`

### 7.2 Rule
Route surface behavior and render-context styling must not be confused.

### 7.3 Rule
Surface files may define contextual placement, spacing, layout usage, and surface-specific variants.  
Surface files may not redefine primitives or shared components.

### 7.4 Rule
A global host may be visually present across contexts, but surface/context files still own contextual variant styling rather than forking the family.

---

## 8. Official Primitive Registry

The following are official primitive families and their official internal family names must be GG-scoped:

- `gg-overlay`
- `gg-dialog`
- `gg-sheet`
- `gg-drawer`
- `gg-toast`
- `gg-banner`
- `gg-inline-alert`
- `gg-tooltip`
- `gg-skeleton`
- `gg-empty-state`
- `gg-loading-state`
- `gg-progress-indicator`
- `gg-field-help`
- `gg-confirm-action`

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

The following families are official component owners unless revised, and their official internal family names are GG-scoped:

- `gg-nav`
- `gg-lang-switcher`
- `gg-dock`
- `gg-dock-search`
- `gg-drawer-more`
- `gg-search-surface`
- `gg-search-assist`
- `gg-command-palette`
- `gg-detail-toolbar`
- `gg-listing-card-toolbar`
- `gg-editorial-preview`
- `gg-detail-info-sheet`
- `gg-toc`
- `gg-comments`
- `gg-comments-panel`
- `gg-share-sheet`
- `gg-labeltree`
- `gg-library`
- `gg-mixed-media`
- `gg-install-prompt`
- `gg-update-flow`
- `gg-offline-recovery`
- `gg-notfound`
- `gg-ads`
- `gg-footer`
- `gg-cards-post-card`
- `gg-cards-featured-card`
- `gg-cards-mixed-card`
- `gg-cards-panel-card`
- `gg-cards-landing-card`

### 10.1 Component rule
Each component family must have one clear owner file.

### 10.2 No hidden split ownership
A component may not have its visual identity distributed across multiple unrelated files.

### 10.3 Component vs primitive rule
A component may compose primitives.  
A component may not reinvent a primitive.

### 10.4 Editorial preview rule
`gg-editorial-preview` is an official component family in its own right.  
It is not an alias, fallback name, or temporary synonym for a detail metadata sheet.

### 10.5 Detail info sheet rule
`gg-detail-info-sheet` is the official component family for post/page detail metadata sheets.  
It is not `gg-editorial-preview`, and it is not a continuing license to keep `gg-info-panel` alive as active architecture.

### 10.6 Toolbar rule
`gg-detail-toolbar` is the official family for post/page detail toolbar behavior.  
`gg-listing-card-toolbar` is the official family for card-level listing actions.

### 10.7 Deprecated family rule
The following are not valid active family names for new work:
- `info-panel`
- `gg-info-panel`
- `post-toolbar` when it actually serves page detail too
- `like` as the action name for support behavior

### 10.8 Share-sheet rule
`gg-share-sheet` is an official component family built on top of the `gg-sheet` primitive.  
It must retain a stable trigger and host contract across listing and detail contexts.

---

## 11. Layout Shell Rules

Official layout shell families include:

- `gg-page-shell`
- `gg-wrap`
- `gg-containers`
- `gg-header`
- `gg-home-switcher`
- `gg-blog-grid`
- `gg-sidebars`

### 11.1 Rule
Layout shells manage structure, placement, and macro layout behavior.

### 11.2 Rule
Layout files do not own component aesthetics beyond structural needs.

### 11.3 Rule
Sidebar shell ownership must remain separate from `gg-comments-panel`, `gg-editorial-preview`, `gg-toc`, `gg-detail-info-sheet`, and card families.

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
Interactive panels, drawers, dialogs, and search interfaces must behave safely around virtual keyboards.

---

## 13. Selector and Token Discipline

### 13.1 Naming law compliance
All selectors, states, and tokens must comply with `GG-NAMING.md`.

### 13.2 No generic selector drift
Selectors such as `.toolbar`, `.panel`, `.info`, `.active`, or `.open` are forbidden as new official hooks unless scoped inside a valid GG family and used only as internal implementation detail where they do not become contract selectors.

### 13.3 Contract selector rule
Any selector relied on by XML, JS, tests, or docs becomes a contract selector and must remain stable until a documented migration exists.

### 13.4 Token discipline
Custom properties must remain semantically grouped and GG-prefixed. Tokens may not be invented ad hoc inside random component files without system relevance.

### 13.5 State discipline
Use `.gg-is-*` for states. Do not invent parallel state dialects.

---

## 14. Comments Safety Rule

### 14.1 Protected zone respect
Native Blogger comments remain a protected zone.

### 14.2 Allowed styling scope
Comments may be styled through GAGA-ish wrappers and safe scoping only.

### 14.3 Forbidden behavior
CSS may not hide, clip, or structurally undermine comment form, reply UI, or keyboard accessibility.

### 14.4 Required comment check
Any CSS patch touching comments or adjacent layout must verify:
- comment section renders
- form is visible and focusable
- reply UI still appears
- no clipping/overflow hides controls
- no keyboard trap or visual obstruction appears

---

## 15. Performance and Runtime Discipline

### 15.1 CSS must respect payload law
CSS may not assume that every global host ships full payload on first paint.

### 15.2 No decorative cost spikes
Large blur stacks, shadow stacks, animated filters, and paint-heavy illusions must be treated as suspect by default.

### 15.3 Reduced motion
All relevant motion-capable families must respect reduced-motion preferences.

### 15.4 Progressive enhancement safety
CSS must preserve readable fallback when JS-enhanced states are absent.

---

## 16. Migration Rules

### 16.1 Migration by family
Refactor by family ownership boundary, not by random selector snippets.

### 16.2 Legacy bridge rule
A legacy family may remain temporarily only if:
- it is documented as legacy
- its replacement family is named
- cleanup intent is explicit
- parity verification exists

### 16.3 No silent alias permanence
Do not keep legacy aliases indefinitely because “nothing broke yet.”

### 16.4 Naming migration rule
When a family name changes, CSS owner files, XML hooks, JS hooks, and docs must be updated through a controlled migration, not a partial rename that leaves split dialects alive.

---

## 17. CSS Audit Minimum Contract

Any serious CSS audit must check, at minimum:
1. `main.css` is treated as generated artifact only
2. no duplicate selectors in source
3. no split ownership across official families
4. no primitive reinvention in feature files
5. no layout shell stealing component identity
6. no naming drift against `GG-NAMING.md`
7. no deprecated family kept as active architecture without migration note
8. comments safety where relevant
9. responsive behavior consistency across mobile/tablet/desktop
10. no premium illusion built from wasteful styling

### 17.1 Rule
If a CSS audit ignores ownership or naming law, it is incomplete.

---

## 18. CSS Verify Minimum Contract

Any CSS patch that affects families, selectors, layout, responsive behavior, or adjacent protected zones must verify, at minimum:
1. selector contract stability
2. no family ownership drift
3. no cross-surface leakage through surface styling
4. comments safety if relevant
5. toolbar behavior visibility if relevant
6. editorial-preview/detail-info-sheet separation if relevant
7. dock/share-sheet/global host styling safety if relevant
8. no unjustified paint/perf regression
9. no naming drift between CSS, XML, JS, and docs

### 18.1 Rule
“Looks okay” is not verification.

---

## 19. Required Output Format for AI/CODEX

Every CSS patch proposal must include:

### Objective
What changes and why.

### Family Owner
Which official family owns the change.

### Layer
Which cascade layer is affected.

### Files
Which source files are changed.

### Selectors Added/Changed/Removed
Contract selectors only.

### Token Impact
New, changed, or removed tokens.

### JS Impact
Which JS hooks or state logic must be checked.

### XML Impact
Which XML hooks or structure must be checked.

### Risk
Low / medium / high.

### Rollback Note
Required if risk is medium or high.

### Verify
What must pass before accepting the patch.

---

## 20. CSS Acceptance Gates

No CSS patch is accepted without passing all required gates.

### 20.1 Minimum pass conditions
A CSS patch fails if it:
- edits `main.css` as source of truth
- introduces duplicate selectors
- creates split family ownership
- invents a new primitive family
- uses naming that violates GG law
- preserves deprecated family names as active architecture
- compromises comments safety
- breaks keyboard/focus-visible paths
- increases visual cost without product value
- causes cross-surface leakage or context confusion

### 20.2 Verification rule
“Looks okay” is not verification.

---

## 21. CSS Rejection Triggers

A CSS patch must be rejected if it:
- invents a second naming dialect
- keeps generic family registry names while code uses GG names
- rebrands a dishonest semantic name with a GG prefix instead of fixing meaning
- spreads one family across unrelated files without justification
- uses layout shell files to own component aesthetics
- relies on `!important` as architectural escape hatch
- hides protected comments controls or form
- adds premium-looking but wasteful paint effects without measured need
- leaves legacy aliases alive after parity without time-boxed justification

---

## 22. AI Behavior Limits

AI may not:
- invent a new family registry dialect
- preserve generic family names in docs while code speaks GG
- solve CSS ownership problems with overrides dumping
- rename selectors casually for aesthetics
- treat deprecated families as permanent architecture

AI must:
- follow `GG-NAMING.md`
- keep one family, one owner
- preserve contract selectors unless a migration is documented
- report naming and ownership risk honestly
- keep CSS boring and predictable behind the scenes

---

## 23. Closing Rule

This CSS system becomes “enterprise-grade” not by having more selectors, more layers, or more visual tricks.

It becomes enterprise-grade when:
- each family has one owner
- naming is GG-consistent
- selectors remain stable and honest
- layout shells stay in their lane
- protected zones stay safe
- performance remains disciplined
- migration removes drift instead of decorating it

If a CSS decision makes the system:
- harder to maintain
- harder for AI to reason about
- heavier to paint
- more dependent on legacy aliases
- more likely to split into parallel naming dialects
- more visually loud without improving hierarchy

that decision is wrong.

