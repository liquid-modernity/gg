# GG RULES OF CSS
**Status:** Binding CSS law under `gg_master.md`  
**Role:** Operational law for source CSS, family ownership, token discipline, surface styling, runtime cost discipline, and CSS-side migration control.

---

## 0. Authority and Scope

### 0.1 Authority
This document is subordinate to `gg_master.md`.
It may specialize styling law, but it may not rewrite master-level law.
Family listings in this document are scoped, not exhaustive.
The authoritative registry lives in `gg_master.md`.
This document inherits that registry and may not create a parallel family law.

### 0.2 Scope
This document governs:
- source-of-truth model for CSS
- file and folder discipline
- primitive/component/surface ownership
- selector, token, and state discipline
- responsive rules
- CSS runtime and paint-cost discipline
- comments safety from CSS side
- CSS patch acceptance and rejection

### 0.3 CSS constitutional rule
CSS is allowed to be refined.
CSS is not allowed to become a dumping ground, routing crutch, or specificity arms race.

---

## 1. Definition of 10/10 CSS

CSS is 10/10 only if all conditions below are true:
1. `main.css` is a generated artifact, not the manual source of truth.
2. Source CSS obeys the zero-escape `!important` law defined in this document.
3. Source CSS has no duplicate selector ownership.
4. Each primitive family has one official owner.
5. Each component family has one official owner.
6. Surface files contain context only, not primitive reinvention.
7. Responsive behavior is intentional across mobile, tablet, and desktop.
8. Keyboard and focus-visible paths remain intact.
9. CSS does not compromise route readability, semantic fallback, comment safety, or performance budgets.
10. Official selectors, tokens, and states follow the master naming law.
11. Deprecated families do not remain active architecture after parity.
12. Premium feel comes from discipline, not visual overwork.

If one of the above fails, CSS is not 10/10.

---

## 2. Source-of-Truth Model

### 2.1 Generated artifact rule
`public/assets/.../main.css` is a generated artifact only.
It must not be treated as the manual authoring source.

### 2.2 Suggested source structure
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

### 2.3 File-purpose rule
Every source file must have:
- one clear purpose
- stable naming
- explicit ownership
- no “temporary” status that silently becomes permanent chaos

### 2.4 No override dumping ground
A catch-all `overrides.css` file is forbidden.
If a conflict requires dump-overrides, the architecture is already sick.

### 2.5 Zero-escape `!important` law
`!important` is banned in source CSS except for the two cases below and nothing else:
1. platform-enforced hiding utility such as `[hidden]{display:none !important;}`
2. a documented emergency accessibility recovery utility placed in one quarantined rule block with explicit removal intent

Everything else is invalid.

That means `!important` may not be used to:
- win selector wars
- hide structural mistakes from XML
- override ownership mistakes
- force state precedence
- patch layout collisions
- rescue weak architecture under deadline pressure

Generated CSS does not weaken this law.
A compiled artifact inheriting legacy `!important` debt is still debt, not permission.

### 2.6 `!important` rejection rule
A patch is automatically rejected if it introduces new `!important` usage outside the two allowed cases above.
If a contributor claims `!important` is “required,” the burden is on the contributor to prove why the ownership model is not the real problem.

---

## 3. Ownership Law

### 3.1 One family, one owner
A family must not be spread across unrelated files unless this document explicitly justifies it.

### 3.2 Layout-vs-component rule
Layout shells may place, size, and contextually arrange families.
They may not steal component identity.

### 3.3 Surface rule
Surface files may define contextual spacing, placement, and variants.
They may not reinvent primitives or shared components.

### 3.4 No family duplication
No feature may invent its own tooltip, modal, toast, banner, drawer, sheet, or other primitive when an official family already exists.

### 3.5 No architecture improvisation
No AI patch may invent a new styling architecture, naming dialect, or ownership model without explicit revision of the master.

---

## 4. Official Primitive Registry

The official primitive families are:
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

### 4.1 Centralization rule
Each primitive family must be centralized.

### 4.2 No one-off primitive rule
No feature may create its own private modal, tooltip, toast, sheet, or drawer family outside the official registry.

### 4.3 Overlay-capable primitive rule
Overlay-capable primitives must define:
- overlay ownership or explicit non-use of overlay
- focus entry
- focus return
- escape behavior
- dismissal behavior
- reduced-motion compatibility
- z-index behavior
- state ownership

`gg-overlay` is the official shared overlay primitive.
No dialog, sheet, drawer, or other overlay-capable family may invent a private overlay contract when `gg-overlay` can serve the job.

---

## 5. Official Component Family Direction

The intended component family language includes:
- `gg-dock`
- `gg-drawer-more`
- `gg-search-surface`
- `gg-command-palette`
- `gg-detail-toolbar`
- `gg-listing-card-toolbar`
- `gg-editorial-preview`
- `gg-detail-info-sheet`
- `gg-comments`
- `gg-comments-panel`
- `gg-share-sheet`
- `gg-labeltree`
- `gg-library`
- `gg-mixed-media`
- `gg-toc`
This section illustrates high-frequency CSS family direction only. The authoritative family registry remains in `gg_master.md`.

### 5.1 Honesty rule
A CSS family name must describe the real family.
Do not keep a misleading family name alive because it is already wired.

### 5.2 Current debt rule
The codebase still contains legacy forms such as `gg-post__toolbar` and `gg-info-panel`.
CSS may bridge them temporarily, but it may not treat them as final family law.

---

## 6. Selector, Token, and State Discipline

### 6.1 Naming inheritance
All selectors, states, and tokens must comply with the master naming law.

### 6.2 No generic selector drift
Selectors such as `.toolbar`, `.panel`, `.info`, `.active`, or `.open` are forbidden as new official hooks unless safely scoped inside a valid GG family and not promoted into contract selectors.

### 6.3 Contract selector rule
Any selector relied on by XML, JS, tests, or docs becomes a contract selector and must remain stable until a documented migration exists.

### 6.4 Token discipline
Custom properties must stay semantically grouped and GG-prefixed.
Tokens may not be invented ad hoc inside random component files without system relevance.

### 6.5 State discipline
Use `.gg-is-*` for state classes.
Do not invent parallel state dialects.

### 6.6 File-vs-family distinction
A file name may remain practical.
The owned family inside it must still use GG-scoped naming.

Example:
- file: `detail-toolbar.css`
- owned family: `gg-detail-toolbar`

---

## 7. Responsive and Interaction Discipline

### 7.1 Viewport equality rule
The system must behave intentionally across:
- mobile
- tablet
- desktop

Tablet may not become the forgotten orphan.

### 7.2 Responsive duplication ban
Do not solve the same responsive problem in both a component file and a surface file unless the distinction is explicit and legitimate.

### 7.3 Virtual keyboard safety
Interactive panels, drawers, dialogs, and search interfaces must behave safely around virtual keyboards.

### 7.4 Focus-visible rule
Primary interactions must preserve focus visibility and keyboard reachability.

---

## 8. Comments Safety Rule

### 8.1 Protected zone respect
Native Blogger comments remain a protected zone.

### 8.2 Allowed styling scope
Comments may be styled through GG wrappers and safe scoping only.

### 8.3 Forbidden behavior
CSS may not hide, clip, or structurally undermine comment form, reply UI, or keyboard accessibility.

### 8.4 Required comment check
Any CSS patch touching comments or adjacent layout must verify:
- comment section renders
- form is visible and focusable
- reply UI still appears
- no clipping or overflow hides controls
- no keyboard trap or visual obstruction appears

---

## 9. Performance and Runtime Discipline

### 9.1 CSS must respect payload law
CSS may not assume that every global host ships full payload on first paint.

### 9.2 No decorative cost spikes
Large blur stacks, shadow stacks, animated filters, paint-heavy illusions, and ornamental layering are suspect by default.

### 9.3 Reduced motion
Relevant motion-capable families must respect reduced-motion preferences.

### 9.4 Progressive enhancement safety
CSS must preserve readable fallback when JS-enhanced states are absent.

### 9.5 No visual luxury fraud
Premium feel may not be purchased through ornamental runtime waste.

---

## 10. Migration Rules

### 10.1 Migration by family
Refactor by family ownership boundary, not by random selector snippets.

### 10.2 Legacy bridge rule
A legacy family may remain temporarily only if:
- it is documented as legacy
- its replacement family is named
- cleanup intent is explicit
- parity verification exists

### 10.3 No silent alias permanence
Do not keep legacy aliases indefinitely because “nothing broke yet.”

### 10.4 Naming migration rule
When a family name changes, CSS owner files, XML hooks, JS hooks, tests, and docs must be updated through a controlled migration.
Partial rename theater is forbidden.

### 10.5 Current migration targets
- `.gg-post__toolbar` must be treated as bridge toward `gg-detail-toolbar`
- `.gg-info-panel` must be downgraded from final identity into bridge language only
- detail metadata styling must converge on `gg-detail-info-sheet`
- listing-owned info styling must remain under `gg-editorial-preview`
- support-action styling must stop encoding `like` semantics

---

## 11. CSS Audit Minimum Contract

Any serious CSS audit must check, at minimum:
1. `main.css` is treated as generated artifact only
2. no duplicate selectors in source
3. no split ownership across official families
4. no primitive reinvention in feature files
5. no layout shell stealing component identity
6. no naming drift against the master law
7. no deprecated family kept as active architecture without migration note
8. comments safety where relevant
9. responsive consistency across mobile, tablet, and desktop
10. no premium illusion built from wasteful styling

If a CSS audit ignores ownership or naming law, it is incomplete.

---

## 12. CSS Verify Minimum Contract

Any CSS patch that affects families, selectors, layout, responsive behavior, or adjacent protected zones must verify, at minimum:
1. selector contract stability
2. no family ownership drift
3. no cross-surface leakage through surface styling
4. comments safety if relevant
5. toolbar behavior visibility if relevant
6. editorial-preview/detail-info-sheet separation if relevant
7. dock/share-sheet/global host styling safety if relevant
8. no unjustified paint or perf regression
9. no naming drift between CSS, XML, JS, tests, and docs

“Looks okay” is not verification.

---

## 13. Required Output Format for AI/CODEX

Every CSS patch proposal must include:
- Objective
- Family Owner
- Layer
- Files changed
- Selectors Added/Changed/Removed
- Token Impact
- JS Impact
- XML Impact
- Risk
- Rollback Note when risk is medium or high
- Verify list

---

## 14. CSS Rejection Triggers

Reject a CSS patch if it:
- edits `main.css` as source of truth
- introduces duplicate selectors
- creates split family ownership
- invents a new primitive family
- introduces forbidden `!important` usage
- uses naming that violates the master law
- preserves deprecated family names as active architecture
- compromises comments safety
- breaks keyboard or focus-visible paths
- increases visual cost without product value
- causes cross-surface leakage or context confusion
- rebrands a dishonest name with `gg-` instead of fixing meaning

---

## 15. Closing Rule

This CSS system becomes enterprise-grade when it becomes boring in the right places:
- one owner per family
- stable selectors
- honest names
- restrained runtime cost
- protected comment safety
- no override theater
- no fake luxury built from waste
