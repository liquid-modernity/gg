# GG RULES OF XML
**Status:** Binding XML law under `gg_master.md`  
**Role:** Operational law for Blogger XML, SSR structure, route/render-context ownership, DOM contracts, and XML-side migration discipline.

---

## 0. Authority and Scope

### 0.1 Authority
This document is subordinate to `gg_master.md`.
It may specialize XML behavior, but it may not rewrite master-level law.

### 0.2 Scope
This document governs:
- Blogger template XML as SSR source of truth
- route and render-context ownership in template logic
- structural hooks for CSS and JS
- global host placement in SSR
- protected zones inside template markup
- XML-side duplication discipline
- XML lifecycle rules
- widget/section shell discipline
- XML vs CSS territorial enforcement at the XML boundary
- XML patch acceptance and rejection

### 0.3 XML constitutional rule
XML is allowed to be powerful.
XML is not allowed to become bloated, dishonest, or a workaround dump.

XML is the territorial owner of:
- SSR existence
- route and render-context gating
- semantic shell
- DOM hierarchy
- global/protected host placement
- machine-facing structural markers

If a question is structural, XML must answer it structurally.
It may not delegate structural truth to CSS concealment.

---

## 1. Definition of 10/10 XML

XML is 10/10 only if all conditions below are true:
1. `index.xml` is the clear SSR source of truth for public render contexts.
2. Route ownership is explicit and deterministic.
3. Wrong-surface DOM is not emitted and hidden as the default pattern.
4. Initial SSR contains only what the active context truly owns, except justified thin hosts.
5. Large duplicated structural blocks do not survive without explicit extraction plan.
6. XML does not smuggle styling systems or route-critical logic into the wrong layer.
7. Core contract selectors and hooks are stable and intentional.
8. Native Blogger comments remain protected.
9. XML-side naming follows the master naming law.
10. XML changes remain explainable, auditable, and reversible by a small operator using AI.

If one of the above fails, XML is not 10/10.

---

## 2. Source-of-Truth Model

### 2.1 Ownership hierarchy
- Worker owns public URL handling and edge logic.
- XML owns SSR shell and render-context selection.
- CSS owns presentation.
- JS owns behavior and enhancement.

### 2.2 Thin-shell rule
Blogger XML must remain a disciplined semantic shell.
It may provide structure, hooks, includables, and lightweight hosts.
It may not become a surrogate JS runtime or styling system.

### 2.3 CSS-is-not-router rule
CSS may not function as the real surface router.
If a component is not owned by the active render context, XML should not emit it unless it is a justified tiny global host.

### 2.4 XML territorial priority rule
When XML and CSS touch the same user-visible area, the first question is not “who can patch it faster.”
The first question is “is the problem structural or visual.”

**Structural problems belong to XML**, including:
- whether the block should exist at all
- where the block lives in the DOM
- which render context owns the block
- which global host owns the runtime entry point
- whether the shell is semantically honest
- whether the SSR payload is surface-correct

**Visual problems belong to CSS**, including:
- spacing
- sizing
- alignment
- appearance
- transitions
- visual emphasis inside valid XML-owned structure

If the problem begins with wrong existence, wrong ownership, wrong host placement, wrong hierarchy, or wrong SSR payload, XML must be changed first.

### 2.5 No CSS-cleanup architecture rule
XML may not knowingly emit wrong or foreign structure and rely on CSS to clean the scene afterward.
That is not progressive enhancement.
That is architectural dishonesty.

Allowed:
- lightweight global hosts with thin SSR presence
- defensive visual fallback for brief migration periods
- temporary visibility guards during documented migration

Forbidden as default architecture:
- cross-surface SSR plus blanket hiding
- fake “inactive” states masking wrong ownership
- CSS-only rescue of structurally misplaced toolbar, info-sheet, TOC, comments host, dock host, share-sheet host, or overlay host

---

## 3. Route Surface vs Render Context Model

### 3.1 Two-level model
Public route surfaces and internal render contexts are different things.
They must not be blurred.

### 3.2 Public routes
- `/`
- `/blog` if kept as alias
- `/landing`
- `/offline`
- `/404`
- special routes such as tags, sitemap, library, store, portfolio, author pages

### 3.3 Render contexts
- `listing`
- `landing`
- `post`
- `page`
- `special`
- `error`
- `offline`
- `global`

### 3.4 Mapping rule
A route maps to one primary render context at a time.
`global` is host layer only.

---

## 4. Official Render-Context Registry

## `landing`
**Canonical route:** `/landing`

**Owns:**
- landing shell
- hero
- packages
- contact
- landing CTA blocks
- landing storytelling

**SSR required:**
- landing shell
- hero
- top landing sections

**Can lazy-hydrate:**
- hero motion
- media behavior
- analytics hooks
- secondary polish

**Forbidden:**
- full listing feed
- `gg-detail-toolbar`
- `gg-comments-panel`
- `gg-toc`

## `listing`
**Canonical route:** `/` or `/blog` if retained as alias

**Owns:**
- `gg-post-card`
- `gg-listing-card-toolbar`
- `gg-mixed-media` primary and secondary rails
- `gg-editorial-preview`
- listing preview TOC under its own listing-owned contract
- search shell
- load more
- listing-specific `gg-dock` behavior

**SSR required:**
- initial post feed
- primary mixed-media structure justified for listing
- `gg-editorial-preview` shell
- `gg-listing-card-toolbar` shell
- `gg-dock` host

**After first paint / intersection / idle:**
- secondary mixed-media rails
- non-critical search polish
- non-critical recommendation rails

**Must preserve:**
- listing share trigger where implemented
- editorial preview ownership
- listing preview TOC ownership
- listing-card-toolbar action contracts

**Forbidden:**
- landing hero full DOM
- `gg-toc` as detail TOC
- `gg-comments-panel`
- `gg-detail-toolbar`
- `gg-detail-info-sheet` disguised as editorial preview

## `post`
**Owns:**
- article detail
- `gg-detail-toolbar`
- `gg-detail-info-sheet` where applicable
- `gg-toc`
- `gg-comments-panel` host
- `gg-share-sheet` trigger contract
- post-specific `gg-dock` behavior where relevant

**SSR required:**
- article
- detail toolbar shell
- detail info sheet shell where applicable
- TOC host
- comments-panel host

**Can lazy-hydrate:**
- TOC population
- comments enhancement
- focus-mode polish
- poster/share enhancement
- detail info sheet payload

**Forbidden:**
- listing rails as default SSR burden
- editorial-preview naming for detail metadata

## `page`
**Owns:**
- static page shell
- page body
- `gg-detail-toolbar` where enabled
- `gg-detail-info-sheet` where justified
- `gg-comments-panel` host when enabled
- `gg-share-sheet` trigger contract when enabled
- `gg-toc` when justified
- page-specific `gg-dock` behavior where relevant

**SSR required:**
- page shell
- page body
- detail toolbar shell where enabled
- comments-panel host where enabled
- detail info sheet shell where justified
- TOC host where justified

**Can lazy-hydrate:**
- detail info sheet payload
- comments enhancement
- poster/share enhancement
- TOC population where applicable

**Forbidden:**
- listing rails as default SSR burden
- editorial-preview as page metadata synonym
- post-only ownership names where page semantics differ materially

## `special`
**Owns:**
- tags
- sitemap
- library
- store
- portfolio
- author pages
- special-page-specific recovery and navigation affordances

## `error`
**Owns:**
- 404 structure
- recovery guidance
- redirect-safe navigation out

## `offline`
**Owns:**
- offline shell
- retry/re-entry guidance
- trustworthy recovery messaging

## `global`
**Owns only lightweight hosts:**
- `#gg-dock`
- `#gg-share-sheet`
- `#gg-dialog`
- `#gg-overlay`
- `#gg-toast`

Global presence must remain thin and justified.

---

## 5. DOM Contracts That Must Survive

### 5.1 Dock contract
- `#gg-dock` is the global host for `gg-dock`
- dock behavior may be context-aware
- global dock presence does not justify duplicate dock systems

### 5.2 Share contract
- listing share must remain functional where enabled
- post share must remain functional
- page share must remain functional where enabled
- `#gg-share-sheet` is the global host for `gg-share-sheet`
- payload may be delayed, but host and trigger contract must stay stable

### 5.3 Toolbar contract
- `gg-detail-toolbar` belongs to post and page detail contexts
- `gg-listing-card-toolbar` belongs to listing cards only
- they may share design DNA but not ownership identity

### 5.4 Editorial-preview contract
`gg-editorial-preview` is a listing-owned family.
It is not a synonym for post/page metadata infrastructure.
It may not be renamed back into `info-panel` logic by stealth.

### 5.5 Detail-info-sheet contract
Post/page detail metadata infrastructure must use `gg-detail-info-sheet` as the final family.
Legacy `gg-info-panel` or `gg-postinfo` may survive only as documented migration bridges.

### 5.6 TOC contract
- `gg-toc` is the detail TOC host by default
- page TOC may use `gg-toc` where ownership remains honest
- listing preview TOC is a separate listing-owned concern
- do not merge all TOC-like things into one vague bucket

### 5.7 Comments contract
Comments remain a Blogger-controlled protected subsystem.
XML may integrate shells and wrappers around comments through `gg-comments` and `gg-comments-panel`, but may not casually restructure comment internals.

### 5.8 Support-action contract
If listing card support exists, it must use semantically honest action naming.
It may not remain mislabeled as `like`.

---

## 6. Protected Zones

### 6.1 Comments protected zone
Protected:
- native Blogger comment behavior
- reply behavior assumptions
- composer visibility assumptions
- keyboard accessibility assumptions

Allowed:
- wrapper integration
- panel host placement
- safe semantic framing
- defensive hooks for styling and JS integration

Forbidden:
- brittle internal DOM assumptions
- behavior rewriting
- clipping or restructuring that risks reply or composer safety

### 6.2 Head and canonical protected zone
Protected:
- canonical integrity
- indexability logic
- metadata/head consistency
- route-specific SEO discipline

### 6.3 Global-host protected zone
Protected hosts:
- `#gg-dock`
- `#gg-share-sheet`
- `#gg-dialog`
- `#gg-overlay`
- `#gg-toast`

These hosts may be optimized, but not casually renamed or structurally broken without impact note and verification.

### 6.4 Render-context mapping protected zone
Protected:
- primary route → render-context mapping
- `data-gg-*` ownership markers that determine active surface/context
- route-critical conditional gates
- structural truth that CSS is not allowed to falsify visually

---

## 7. Blogger Section and Widget Shell Law

### 7.1 Allowed use
`<b:section>` and `<b:widget>` may be used when they act as:
- legitimate Blogger content containers
- optional editorial zones
- controlled shells for bounded platform features

### 7.2 Forbidden use
A Blogger section/widget shell may not be used to:
- disguise ownership of a core system component that already has a defined family owner
- preserve duplicate large blocks because extraction is inconvenient
- leave core system families as arbitrary widget HTML when they should be template-owned

### 7.3 Zone naming rule
Backend-editable placement zones must use `gg-zone-*` naming and must not be confused with template-owned component families.

### 7.4 Core-family rule
If a block is truly a system-owned family such as `gg-mixed-media`, `gg-toc`, `gg-editorial-preview`, `gg-detail-toolbar`, `gg-comments-panel`, or shared footer/support structure, XML should move it toward template-owned includables or documented owned hosts.

### 7.5 Family naming honesty in widget shells
A widget shell may not preserve a legacy or generic family name as the active XML law if the official family name has already moved to a GG-scoped contract.

Examples:
- `gg-info-panel` may survive temporarily as legacy bridge, but not as the final active family for detail metadata
- `gg-editorial-preview` may not be reused for detail info sheet ownership

---

## 8. Duplicate Block Discipline

### 8.1 Duplicate-major-block ban
The following may not be duplicated casually:
- footer clusters
- language switcher clusters
- social/support clusters
- quick-link clusters
- large mixed-media scaffolds
- near-identical detail metadata blocks across contexts

### 8.2 Exception rule
Duplication is allowed only if the patch explicitly states:
- why extraction is not yet feasible
- how long the duplication will survive
- how parity will be enforced temporarily
- what the extraction plan is

### 8.3 Extraction default
If two large blocks are materially the same, extraction to shared includables or clearly documented owned hosts is the default path.

---

## 9. Hook and Naming Discipline

### 9.1 Naming inheritance
XML must inherit the master naming law.
That means:
- classes = `.gg-*`
- IDs = `#gg-*` only when justified
- hooks = `data-gg-*`
- template IDs = `#gg-tpl-*`

### 9.2 No hook dialect drift
Do not invent parallel hook formats for similar jobs.

### 9.3 No dishonest semantics
If an action means support, it must not remain named `like` or another misleading verb.

### 9.4 Legacy bridge rule
Deprecated XML names may survive only as time-boxed bridges with explicit cleanup plan.

### 9.5 Official XML-side family examples
The intended XML-side contract language includes:
- `gg-dock`
- `gg-detail-toolbar`
- `gg-listing-card-toolbar`
- `gg-editorial-preview`
- `gg-detail-info-sheet`
- `gg-comments-panel`
- `gg-share-sheet`
- `gg-labeltree`
- `gg-mixed-media`
- `gg-zone-*`

---

## 10. Performance and Progressive Enhancement Rules

### 10.1 Performance is product law
XML must support premium feel without invisible SSR waste.

### 10.2 Progressive enhancement rule
Core meaning, content reading, and route understanding must survive without JS.

### 10.3 No hidden-critical-content rule
Critical meaning may not live behind JS-only rendering.

### 10.4 Enhancement triage rule
If a block improves polish but not first meaning, it is a candidate for delayed payload rather than SSR default.

### 10.5 Drawer/sheet restraint
Drawers, sheets, and utility layers may ship as lightweight hosts globally, but their full payload may not become default SSR cargo on content-first routes without measured value.

---

## 11. XML Audit Minimum Contract

Any serious XML audit must check, at minimum:
1. route → render-context clarity
2. no wrong-surface SSR hidden by CSS
3. duplicate large block risk
4. selector and ownership clarity
5. global host weight discipline
6. comments safety if touched
7. share trigger survival if touched
8. TOC ownership separation if touched
9. editorial-preview/detail-info-sheet honesty if touched
10. first-paint payload justification
11. naming-law compliance for machine-facing contracts
12. XML vs CSS territorial breach risk

If an XML audit ignores lifecycle, ownership, or naming law, it is incomplete.

---

## 12. XML Verify Minimum Contract

Any XML patch that affects structure, selectors, lifecycle, or render-context behavior must verify, at minimum:
1. correct route → render-context mapping
2. no cross-surface leakage
3. no fake-hiding architecture introduced as the main solution
4. selector contract drift between XML, JS, CSS, and docs
5. share trigger survival where relevant
6. editorial-preview survival on listing where relevant
7. detail-toolbar survival on post/page where relevant
8. TOC contract separation where relevant
9. comments safety where relevant
10. metadata/head/canonical integrity where relevant
11. no unjustified first-paint payload regression
12. no naming drift between code and docs
13. no structural issue left to CSS as the real fix

“Looks okay” is not verification.

---

## 13. Required Output Format for AI/CODEX

Every XML patch proposal must include:
- Objective
- Route Surface
- Render Context
- XML Blocks changed
- Ownership Decision
- Lifecycle Decision (SSR / after-paint / intersection / on-demand)
- Selectors Added/Changed/Removed
- JS Impact
- CSS Impact
- Risk
- Rollback Note when risk is medium or high
- Verify list

---

## 14. XML Rejection Triggers

Reject an XML patch if it:
- invents a new routing philosophy without master revision
- emits wrong-surface DOM and hides it as architecture
- preserves generic or legacy family names as final XML law
- rebrands a dishonest name with `gg-` without fixing meaning
- weakens protected comment assumptions
- breaks global host contracts
- duplicates large structural blocks without extraction plan
- lets XML, CSS, JS, and docs drift into separate family languages
- leaves a structural error in place and calls CSS the fix
- shifts host ownership from XML to CSS by visual trickery

---

## 15. Closing Rule

XML becomes high-end not by becoming bigger, but by becoming cleaner:
- clear route ownership
- thin justified hosts
- honest family names
- disciplined SSR
- protected comments
- extraction over duplication
- structure that AI can read without guessing
