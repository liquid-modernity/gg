# GAGA RULES OF XML
**Status:** Active operational law  
**Authority:** Subordinate to `BLOG_GAGA_ISH_MASTER_CONTRACT.md`  
**Scope:** All Blogger template XML, SSR structure, route/render-context ownership, template hooks, Blogger widget shell decisions, XML-related AI work, and XML-related patch governance for BLOG GAGA-ish.

---

## 0. Purpose

This document exists to enforce an XML system that is:

- powerful without becoming bloated
- premium without cheating through hidden waste
- app-like without breaking SSR clarity
- modular enough for AI-assisted maintenance
- strict enough to prevent route leakage, duplicate block sprawl, selector drift, hook drift, and surface confusion

This document is not a note. It is operational law for `index.xml` and all XML-side architecture decisions.

---

## 1. Authority and Precedence

### 1.1 Precedence order
1. `BLOG_GAGA_ISH_MASTER_CONTRACT.md`
2. `gaga-rules-of-xml.md`
3. wave prompts / patch prompts / task-specific AI instructions

### 1.2 Conflict rule
If a prompt conflicts with this document, the prompt is invalid.

### 1.3 XML-specific scope
This document governs:
- Blogger template XML as SSR source of truth
- route and render-context ownership in template logic
- structural hooks for CSS and JS
- SSR payload discipline
- allowed vs forbidden template behaviors
- protected zones inside template markup
- DOM contract discipline
- XML patch acceptance and rejection rules
- AI execution rules for XML changes

---

## 2. Definition of 10/10 XML

The XML system is considered **10/10** only if all conditions below are true:

1. `index.xml` is the clear SSR source of truth for public surfaces and render contexts.
2. Route ownership and render-context ownership are explicit and deterministic.
3. No major surface is rendered and then hidden as a default architectural pattern.
4. Initial SSR contains only what the active surface truly owns.
5. Heavy secondary UI is delayed to after-paint, intersection, or on-demand where appropriate.
6. Large duplicated structural blocks do not exist without explicit, justified exception.
7. Core selector contracts are stable, intentional, and documented.
8. XML does not smuggle business logic, styling systems, or route-critical behavior into the wrong layer.
9. Native Blogger comments remain protected and are not structurally “improved” into fragility.
10. XML changes are explainable, auditable, and reversible by a small operator using AI-assisted workflows.
11. XML structure supports premium UX without causing invisible bloat or cross-surface leakage.
12. The visitor experience feels high-end because the structure is disciplined, not because the template is overloaded.

If any of the above fails, the XML system is not 10/10.

---

## 3. Non-Negotiables

### 3.1 XML is SSR law
`index.xml` is the source of truth for SSR structure and render-context ownership.

### 3.2 No fake-hiding architecture
Rendering a component on the wrong surface and hiding it with CSS is forbidden as a normal architectural pattern.

### 3.3 No XML improvisation
No AI patch may invent new surface ownership logic, hook dialects, or template routing philosophy without explicit revision of this document.

### 3.4 No template-as-runtime-dump
Template XML may not become a dumping ground for:
- feature logic that belongs in JS
- styling that belongs in CSS source
- duplicated blocks added only because patching is faster
- global payload inflation for convenience

### 3.5 No luxury fraud
Premium feel may not be purchased through bloated SSR, fake app-shell complexity, or structural excess.

### 3.6 No shadow ownership
If XML introduces or preserves a block whose real owner is already defined elsewhere, the block must either become a thin host or be removed. XML may not keep parallel ownership alive for convenience.

---

## 4. Source-of-Truth Model

### 4.1 Ownership hierarchy
- **Cloudflare Worker** owns public URL handling, redirects, rewrites, canonical edge logic, and request discipline.
- **Blogger XML** owns SSR structure, render-context selection, semantic markup shell, and server-delivered DOM.
- **CSS** owns presentation and visual state.
- **JS** owns enhancement, state orchestration, delayed behavior, and on-demand payload activation.

### 4.2 Rule
XML is not allowed to abdicate surface ownership to JS.

### 4.3 Rule
CSS is not allowed to function as the primary route/surface router.

### 4.4 Rule
If a component is not owned by the active render context, it should not be emitted in SSR unless explicitly justified as a tiny global host.

### 4.5 Thin-shell rule
Blogger XML must remain a disciplined semantic shell. It may provide structure, hooks, and lightweight hosts, but it may not become a surrogate JS runtime or styling system.

---

## 5. Route Surface vs Render Context Model

### 5.1 Two-level model
The XML system must distinguish between:

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

### 5.2 Rule
Public routes and internal render contexts must not be confused.

### 5.3 Rule
A route can map to one primary render context at a time.

### 5.4 Rule
Template conditions must make this mapping legible and testable.

### 5.5 Rule
`global` is not a route. It is a host layer for lightweight primitives and shared shells that are justified across contexts.

---

## 6. Official Render-Context Registry

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
- post toolbar
- comments panel
- post TOC

---

## `listing`
**Canonical route:** `/` or `/blog` if retained as alias

**Owns:**
- post feed
- post cards
- listing card toolbar
- mixed-media primer
- mixed-media sekunder
- editorial-preview
- listing preview TOC
- search shell
- load more
- listing-specific dock behavior

**SSR required:**
- post feed awal
- featured rail utama
- primary newsdeck
- editorial-preview shell
- listing card toolbar shell
- dock shell

**After first paint:**
- YouTube rail
- Shorts rail
- non-critical search polish

**On intersection / idle:**
- Podcast rail
- Bookish rail
- secondary newsdeck

**Must preserve:**
- listing share trigger
- listing editorial-preview
- listing preview TOC
- listing card action contracts

**Forbidden:**
- landing hero full DOM
- post TOC
- post comments panel
- post/page detail toolbar
- generic detail metadata sheet disguised as editorial-preview

---

## `post`
**Owns:**
- article detail
- detail toolbar
- detail info sheet where applicable
- post TOC
- comments panel host
- share trigger
- post-specific dock behavior where relevant

**SSR required:**
- article
- toolbar shell
- detail info sheet shell where applicable
- TOC host
- comments host

**Can lazy-hydrate:**
- TOC population
- comments enhancement
- poster generation
- focus-mode polish
- detail info payload

**Forbidden:**
- listing media rails as default SSR burden
- editorial-preview naming for post detail sheet

---

## `page`
**Owns:**
- non-system static page shell
- page body
- detail toolbar
- page detail info sheet when justified
- comments panel host when enabled
- share trigger when enabled
- optional page TOC when justified
- page-specific dock behavior where relevant

**SSR required:**
- page shell
- page body
- detail toolbar shell where enabled
- comments host where enabled
- page detail info sheet shell where justified
- page TOC host where justified

**Can lazy-hydrate:**
- page detail info payload
- comments enhancement
- poster/share enhancement
- focus-mode polish
- TOC population where applicable

**Forbidden:**
- listing media rails as default SSR burden
- editorial-preview as page metadata synonym
- post-only TOC naming leakage

---

## `special`
**Owns:**
- tags
- sitemap
- library
- store
- portfolio
- author pages
- special-page-specific dock behavior where relevant

**SSR required:**
- special shell
- primary content shell
- route-appropriate recovery/navigation affordances

**Can lazy-hydrate:**
- directory browsing enhancement
- richer search/filter polish
- secondary utility behavior

**Forbidden:**
- full post detail toolbar by default
- comments panel by default unless the special surface explicitly becomes a documented exception

---

## `error`
**Owns:**
- 404 shell
- recovery/search fallback

**SSR required:**
- recovery shell
- clear orientation copy
- recovery navigation

**Can lazy-hydrate:**
- enhanced search assist
- secondary polish

---

## `offline`
**Owns:**
- offline recovery shell

**SSR required:**
- offline message
- recovery path
- back-home path

**Can lazy-hydrate:**
- retry enhancement
- stale-state refresh polish

---

## `global`
**Owns:**
- dock host
- toast host
- dialog host
- overlay host
- lightweight share-sheet host when justified
- lightweight drawer/sheet host when justified
- announcer/light global primitives

**Rule:**
Global may contain lightweight hosts. Global may not become a parking lot for heavy feature payloads that belong to a specific render context.

**Clarification:**
Global owns host presence. Individual render contexts own behavior variants, trigger semantics, and contextual meaning.

---

## 7. SSR Payload Law

### 7.1 Initial SSR rule
Initial SSR must contain only what the active render context needs for:
- meaning
- hierarchy
- crawlability
- fast first paint
- essential interaction shell

### 7.2 Lifecycle classes
Every substantial XML block must belong to one lifecycle class:
- **SSR required**
- **after-paint**
- **intersection**
- **on-demand**

### 7.3 Rule
If a block is not SSR required, XML must not emit its full heavy payload by default unless explicitly justified.

### 7.4 Mixed-media rule
Listing may feel media-grade, but rails must be tiered:
- primer = SSR
- sekunder = after-paint
- tersier = intersection or on-demand

### 7.5 Heavy-host rule
For features such as share-sheet payloads, drawer payloads, command-palette payloads, and secondary rails:
- SSR may provide a lightweight host
- full payload may be delayed

### 7.6 Global-host austerity rule
If a host is global, that does not justify global heavy payload. Global hosts must remain structurally light unless explicit measured value proves otherwise.

---

## 8. DOM Contract Rules

### 8.1 Core rule
Every important selector must have one explicit owner.

### 8.2 Minimum selector contract
Each important selector must define:
- owner
- render-context scope
- lifecycle
- JS dependency
- CSS dependency

### 8.3 Host vs payload rule
Host and payload must be distinguished.

Example:
- host may be SSR-light
- payload may be injected or hydrated later

### 8.4 Stable naming rule
Core IDs, classes, and `data-gg-*` hooks must remain stable unless there is a documented reason to change them.

### 8.5 Impact rule
If a selector contract changes, the patch must explicitly state:
- affected JS modules
- affected CSS files
- risk level
- rollback note if needed

### 8.6 Mental model rule
Different components may not share one vague conceptual name if they are structurally different.

Hard example:
- **Post TOC** is not the same thing as **Listing Preview TOC**.
- They may share styling DNA, but not ownership identity.

### 8.7 Legacy-bridge rule
A legacy selector or family name may survive temporarily only as a documented migration bridge. It may not remain as a silent second architecture.

---

## 9. Specific Contracts That Must Survive

### 9.1 Route contract
- `/` = listing
- `/blog` = listing alias only if intentionally retained
- `/landing` = landing
- `/offline` = offline recovery
- `404` = error recovery surface

### 9.2 TOC contract
- `#gg-toc` = post TOC only
- page TOC must not silently masquerade as post TOC if behavior differs materially
- listing preview TOC = listing-only preview component
- do not merge them conceptually, structurally, or accidentally through lazy naming

### 9.3 Share contract
- listing share must remain functional
- post share must remain functional
- page share must remain functional where page detail toolbar enables it
- `#gg-share-sheet` may be a lazy global host
- listing share trigger must not be removed to “save weight”
- share-sheet payload may be delayed, but host and trigger contract must stay stable

### 9.4 Dock contract
- `#gg-dock` may exist globally as a host
- dock behavior must be context-aware
- global dock presence must not justify duplicating dock systems per surface
- dock may not override or confuse higher-priority contextual controls without explicit justification

### 9.5 Toolbar contract
- detail toolbar belongs to post and page non-system detail contexts
- listing card toolbar belongs to listing cards only
- the two toolbar families may share design DNA but not ownership identity

### 9.6 Editorial-preview contract
`editorial-preview` is an official listing-owned component family.
It is not a synonym for post/page metadata infrastructure, and it may not be quietly renamed back to `info-panel`.

### 9.7 Detail-info-sheet contract
Post/page detail metadata infrastructure must use an explicitly named detail family.
It may not hide under `editorial-preview` naming.

### 9.8 Comments contract
Comments remain a protected Blogger-controlled subsystem. XML may integrate shells and wrappers around comments, but may not casually restructure comments internals into fragile assumptions.

### 9.9 Support-action contract
If listing card support exists, it must be semantically named as support and route to the declared support surface. It may not remain mislabeled as an unrelated action.

### 9.10 Icon contract
Two icon systems are allowed only if role boundaries are explicit:
- Material Symbols = system/UI icons
- SVG sprite = social/brand/payment/AI icons

---

## 10. Protected Zones

### 10.1 Comments protected zone
Protected:
- native Blogger comments widget behavior
- reply behavior assumptions
- composer visibility assumptions
- keyboard accessibility assumptions

Allowed:
- wrapper and panel integration
- shell placement
- safe semantic framing
- defensive styling hooks

Forbidden:
- behavior rewriting
- brittle internal DOM assumptions
- clipping or restructuring that risks reply/composer safety

### 10.2 Head and canonical protected zone
Protected:
- canonical integrity
- indexability logic
- metadata/head consistency
- route-specific SEO discipline

### 10.3 Global-host protected zone
Protected:
- `#gg-dock`
- `#gg-share-sheet`
- `#gg-dialog`
- `#gg-overlay`
- `#gg-toast`

These may be optimized, but not casually renamed or structurally broken without impact note and verification.

### 10.4 Render-context mapping protected zone
Protected:
- primary route → render-context mapping
- `data-gg-*` ownership markers that determine active surface/context
- route-critical conditional gates

---

## 11. Blogger Section and Widget Shell Law

### 11.1 Allowed use
`<b:section>` and `<b:widget>` may be used when they act as:
- legitimate Blogger content containers
- optional editorial zones
- controlled shells for bounded platform features

### 11.2 Forbidden use
A Blogger section/widget shell may not be used to:
- disguise ownership of a core system component that already has a defined family owner
- preserve duplicate large blocks because extraction is inconvenient
- let backend layout remain editable for components that should be template-owned

### 11.3 Zone naming rule
Backend-editable placement zones must use explicit zone naming and must not be confused with template-owned component family names.

### 11.4 Core-family rule
If a block is truly a system-owned family such as mixed-media, TOC, editorial-preview, detail toolbar, comments panel shell, or shared footer/support structure, XML should move it toward template-owned includables or documented owned hosts rather than leaving it as arbitrary HTML widget content.

---

## 12. Duplicate Block Discipline

### 12.1 Duplicate-major-block ban
The following may not be duplicated casually:
- footer clusters
- lang switcher clusters
- social/support clusters
- quick-link clusters
- large mixed-media scaffolds
- near-identical detail metadata blocks across contexts

### 12.2 Exception rule
Duplication is allowed only if the patch explicitly states:
- why extraction is not yet feasible
- how long the duplication will survive
- how parity will be enforced temporarily
- what the extraction plan is

### 12.3 Extraction rule
If two large blocks are materially the same, extraction to a shared includable or clearly documented owned host is the default path.

---

## 13. Hook and Naming Discipline

### 13.1 Naming law inheritance
XML must follow the global naming contract:
- classes: `.gg-*`
- IDs: `#gg-*` only when justified
- hooks: `data-gg-*`

### 13.2 No hook dialect drift
Do not invent parallel hook formats for similar jobs.

### 13.3 Semantic honesty rule
If an action means support, it must not remain named as `like` or another misleading verb.

### 13.4 Deprecation rule
Deprecated family names may survive only as time-boxed migration bridges with explicit cleanup plan.

---

## 14. Performance and Progressive Enhancement Rules for XML

### 14.1 Performance is a product rule
XML must support premium feel without initial SSR waste.

### 14.2 Progressive enhancement rule
Core meaning, content reading, and route understanding must survive without JS.

### 14.3 No hidden-critical-content rule
Do not place critical meaning behind JS-only rendering.

### 14.4 Enhancement triage rule
If a block improves polish but not first-meaning, it should be a candidate for delayed payload rather than SSR default.

### 14.5 Drawer/sheet restraint
Drawers, sheets, and utility layers may ship as lightweight hosts globally, but their full payload should not become default SSR cargo on content-first routes without measured value.

---

## 15. XML Audit Minimum Contract

Any serious XML audit must check, at minimum:
1. route → render-context clarity
2. no wrong-surface SSR hidden by CSS
3. duplicate large block risk
4. selector ownership clarity
5. global host weight discipline
6. comments safety if touched
7. share trigger survival if touched
8. TOC ownership separation if touched
9. editorial-preview ownership clarity
10. first-paint payload justification

### 15.1 Rule
If an XML audit ignores lifecycle, ownership, or selector contracts, it is incomplete.

---

## 16. XML Verify Minimum Contract

Any XML patch that affects structure, selectors, lifecycle, or render-context behavior must verify, at minimum:
1. correct route → render-context mapping
2. no cross-surface leakage
3. no fake-hiding architecture introduced as the main solution
4. selector contract drift between XML, JS, and CSS
5. share trigger survival where relevant
6. editorial-preview survival on listing where relevant
7. detail toolbar survival on post/page where relevant
8. TOC contract separation where relevant
9. comments safety where relevant
10. metadata/head/canonical integrity where relevant
11. no unjustified first-paint payload regression

### 16.1 Rule
“Looks okay” is not verification.

---

## 17. Required Output Format for AI/CODEX

Every XML patch proposal must include:

### Objective
What changes and why.

### Route Surface
Which public route(s) are affected.

### Render Context
Which internal context owns the change.

### XML Blocks
Which blocks/conditions/templates are changed.

### Ownership Decision
Who owns the affected component/block.

### Lifecycle Decision
SSR / after-paint / intersection / on-demand.

### Selectors Added/Changed/Removed
List contract selectors.

### JS Impact
Which JS modules must be checked.

### CSS Impact
Which CSS files/families must be checked.

### Risk
Low / medium / high.

### Rollback Note
Required if risk is medium or high.

### Verify
What must pass before accepting the patch.

---

## 18. XML Acceptance Gates

No XML patch is accepted without passing all required gates.

### 18.1 Minimum pass conditions
An XML patch fails if it:
- renders landing on listing as default architecture
- renders major foreign-surface blocks and hides them with CSS
- introduces unowned large blocks
- changes selector contracts without impact note
- duplicates major blocks without extraction justification
- weakens canonical/indexability/head integrity
- weakens comments safety
- weakens semantic fallback
- increases SSR payload without lifecycle justification
- creates route/render-context ambiguity
- preserves misleading action semantics after an ownership or behavior migration

### 18.2 Verification rule
“Looks okay” is not verification.

### 18.3 Required verification categories
At minimum verify:
- correct route → render-context mapping
- no cross-surface leakage
- comments safety if relevant
- TOC safety if relevant
- share trigger survival if relevant
- metadata/head integrity if relevant
- no accidental selector drift
- no lifecycle drift that bloats first paint

---

## 19. XML Rejection Triggers

An XML patch must be rejected if it:
- adds fake-hiding architecture
- uses CSS hiding to conceal wrong-surface SSR as the main solution
- inserts heavy payload without lifecycle rationale
- removes listing share capability
- collapses post TOC and listing preview TOC into one vague ownership bucket
- breaks editorial-preview ownership clarity
- edits protected zones without explicit impact note
- adds duplicate major block for convenience
- breaks route/render-context clarity
- hides route-critical meaning behind JS
- increases complexity without measurable value
- leaves shadow ownership alive after parity without a documented time-boxed exception
- renames core hooks casually during structural cleanup

---

## 20. Migration Policy

### 20.1 Migration unit
Refactor by family or ownership boundary, not by random snippets.

### 20.2 Preferred order
1. route/render-context logic
2. protected zones and core contracts
3. duplicated major blocks
4. heavy hosts and payload separation
5. secondary rails and delayed payloads
6. semantic cleanup and contract stabilization
7. final legacy purge

### 20.3 Legacy purge
Once parity is confirmed, legacy ownership must be removed.

### 20.4 No shadow systems
A migrated structure may not coexist indefinitely with the legacy structure without a documented time-boxed exception.

### 20.5 Adapter rule
A bridge or adapter layer is acceptable only if:
- it reduces breakage risk
- it is documented
- it is verified
- it has a cleanup target

---

## 21. AI Behavior Limits

AI may not:
- rewrite route/render-context architecture casually
- invent a new hook dialect
- solve XML ownership problems with JS-only tricks
- solve wrong-surface SSR with CSS hiding
- duplicate large blocks because extraction is “too much work”
- claim success without explicit verification
- rename selectors for aesthetic reasons without migration logic

AI must:
- follow this law
- stay within naming contracts
- preserve protected zones unless the task explicitly justifies touching them
- report assumptions and risks honestly
- keep XML boring and predictable behind the scenes

---

## 22. Closing Rule

This XML system becomes “enterprise-grade” not by emitting everything, but by emitting the right things at the right time.

If an XML decision makes the template:
- harder to maintain
- harder for AI to reason about
- heavier at first paint
- easier to break across surfaces
- more dependent on concealment tricks
- more structurally noisy without improving experience

that decision is wrong.

Powerful XML is not maximal XML.

Powerful XML is XML that:
- knows who owns what
- renders only what is justified
- keeps selector contracts stable
- protects fragile platform zones
- supports premium UX without SSR waste
- remains boring, readable, and predictable behind the scenes

