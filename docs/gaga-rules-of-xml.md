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
- strict enough to prevent route leakage, duplicate block sprawl, selector drift, and surface confusion

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
7. Core selector contracts are stable and intentional.
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

### 5.2 Rule
Public routes and internal render contexts must not be confused.

### 5.3 Rule
A route can map to one primary render context at a time.

### 5.4 Rule
Template conditions must make this mapping legible and testable.

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
- mixed-media primer
- mixed-media sekunder
- editorial-preview
- dock
- search shell
- load more

**SSR required:**
- post feed awal
- featured rail utama
- primary newsdeck
- editorial-preview shell
- dock shell

**After first paint:**
- YouTube rail
- Shorts rail

**On intersection / idle:**
- Podcast rail
- Bookish rail
- secondary newsdeck

**Must preserve:**
- listing share trigger
- listing editorial-preview
- listing preview TOC

**Forbidden:**
- landing hero full DOM
- post TOC
- post comments panel

---

## `post`
**Owns:**
- article detail
- post toolbar
- post editorial metadata shell where applicable
- post TOC
- comments panel host
- share trigger

**SSR required:**
- article
- toolbar shell
- editorial metadata shell where applicable
- TOC host
- comments host

**Can lazy-hydrate:**
- TOC population
- comments enhancement
- poster generation
- focus-mode polish

**Forbidden:**
- listing media rails as default SSR burden

---

## `page`
**Owns:**
- non-system static page shell
- page body
- optional page editorial metadata shell when justified
- optional page TOC when justified

---

## `special`
**Owns:**
- tags
- sitemap
- library
- store
- portfolio
- author pages

---

## `error`
**Owns:**
- 404 shell
- recovery/search fallback

---

## `offline`
**Owns:**
- offline recovery shell

---

## `global`
**Owns:**
- dock host
- toast host
- dialog host
- overlay host
- lightweight share-sheet host when justified
- announcer/light global primitives

**Rule:**
Global may contain lightweight hosts. Global may not become a parking lot for heavy feature payloads that belong to a specific render context.

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
- listing preview TOC = listing-only preview component
- do not merge them conceptually, structurally, or accidentally through lazy naming

### 9.3 Share contract
- listing share must remain functional
- post share must remain functional
- `#gg-share-sheet` may be a lazy global host
- listing share trigger must not be removed to “save weight”
- share-sheet payload may be delayed, but host and trigger contract must stay stable

### 9.4 Icon contract
Two icon systems are allowed only if role boundaries are explicit:
- Material Symbols = system/UI icons
- SVG sprite = social/brand/payment/AI icons

### 9.5 Editorial-preview contract
`editorial-preview` is an official listing-owned component family.
It is not a synonym for `post` metadata infrastructure, and it may not be quietly renamed back to `info-panel`.

### 9.6 Comments contract
Comments remain a protected Blogger-controlled subsystem. XML may integrate shells and wrappers around comments, but may not casually restructure comments internals into fragile assumptions.

---

## 10. Protected Zones

### 10.1 Comments protected zone
Protected:
- native Blogger comments widget behavior
- reply behavior assumptions
- composer visibility assumptions
- internal Blogger comments control flow

Allowed:
- wrapper placement
- surrounding shell structure
- defensive containment and panel integration

Forbidden:
- structural rewrites that risk reply/form behavior
- assumptions that Blogger internal DOM will remain stable
- “cleanup” that endangers keyboard or visibility paths

### 10.2 Metadata protected zone
Protected:
- canonical/meta logic
- robots/indexability logic
- JSON-LD placement and integrity
- meaningful head structure

### 10.3 Surface computation protected zone
Protected:
- route-to-render-context logic
- body/main data attributes that define active context

### 10.4 Global host protected zone
Protected:
- lightweight global primitive hosts
- docking and light announcement infrastructure

Rule:
These zones may be changed only with explicit ownership and impact notes.

---

## 11. Allowed Template Behaviors

The following are allowed in Blogger XML:
- semantic HTML structure
- Blogger conditionals and includes used to control render contexts
- critical CSS in approved boundaries
- versioned external asset references with proper script closing tags
- JSON-LD and structured data blocks
- lightweight global hosts
- markup templates or shells used for safe enhancement

---

## 12. Forbidden Template Behaviors

The following are forbidden unless explicitly justified and reviewed:

- inline executable JS as feature logic
- route-critical logic that only exists in JS
- large surface blocks rendered on the wrong context and hidden later
- duplicate major structural blocks added for patching convenience
- feature ownership hidden inside arbitrary HTML widgets without contract note
- XML becoming the place where styling architecture is improvised
- “temporary” shadow systems that become permanent
- shipping large SSR placeholder fleets that cost more than the initial value they provide

---

## 13. Duplication Rules

### 13.1 No duplicate major block rule
Large repeated blocks such as:
- footer clusters
- lang switchers
- social link sets
- quick-link clusters
- major panel shells

must not be copy-pasted per context without explicit justification.

### 13.2 Extraction rule
If two large blocks are materially the same, extract to a shared includable or shared pattern.

### 13.3 Time-boxed exception rule
A temporary duplicate is tolerated only if:
- its existence is explicitly documented
- its removal path is defined
- it is treated as debt, not architecture

---

## 14. Search, Share, Panel, and Drawer Payload Rules

### 14.1 Search rule
Search shell may be globally reachable. Heavy search assist or result payloads may be delayed.

### 14.2 Share rule
Share host may be global. Heavy share-sheet payload may be delayed. Trigger contracts must remain stable.

### 14.3 Drawer rule
Drawer shell may exist globally. Heavy drawer contents should be lazy if not first-paint essential.

### 14.4 Panel rule
Editorial-preview and other information panels may exist as shells in their owning surface, with dynamic content hydrated when needed.

---

## 15. XML Review Checklist

Every XML change must be reviewed against this list.

### 15.1 Surface review
- Which render context is touched?
- Which public route is affected?
- Does any foreign surface leak into this one?

### 15.2 SSR review
- Is this block truly SSR required?
- If not, why is it emitted now?
- Would after-paint, intersection, or on-demand be better?

### 15.3 Contract review
- Who owns this block?
- Which selectors are contract selectors?
- Which JS modules depend on it?
- Which CSS files depend on it?

### 15.4 Duplication review
- Does this already exist elsewhere?
- Can it be extracted?

### 15.5 Weight review
- How much DOM does this add?
- How much first-paint value does it add?
- Is this structural luxury or structural waste?

### 15.6 Trust review
- Does this make the experience more precise?
- Or merely more busy?

---

## 16. XML Verify Minimum Contract

Any XML verification flow must check, at minimum:

1. correct route → render-context mapping
2. no cross-surface leakage
3. no fake-hiding architecture used as the main solution
4. SSR vs delayed lifecycle correctness
5. selector contract drift
6. share trigger survival
7. editorial-preview survival on listing
8. TOC contract separation
9. comments safety
10. head / meta / canonical integrity where relevant

### 16.1 Rule
If XML verification does not cover the minimum contract above, it is incomplete.

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
6. final cleanup and contract stabilization

### 20.3 Legacy purge
Once parity is confirmed, legacy ownership must be removed.

### 20.4 No shadow systems
A migrated structure may not coexist indefinitely with the legacy structure without a documented time-boxed exception.

---

## 21. AI Behavior Limits

AI may not:
- rewrite route/render-context architecture casually
- invent a new hook dialect
- solve XML ownership problems with JS-only tricks
- solve wrong-surface SSR with CSS hiding
- duplicate large blocks because extraction is “too much work”
- claim success without explicit verification

AI must:
- follow this law
- stay within naming contracts
- preserve protected zones unless the task explicitly justifies touching them
- report assumptions and risks honestly

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
