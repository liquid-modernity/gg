# GG MASTER
**Status:** Binding operational law  
**Project:** BLOG GAGA-ish / PakRPP  
**Role:** Supreme SSOT for product, route model, naming law, ownership law, performance, accessibility, trust, testing, and AI-agent governance.

---

## 0. Authority, Constitutional Order, and Change Control

### 0.1 Supreme authority
`gg_master.md` is the highest operational contract for BLOG GAGA-ish.

No other file, prompt, patch note, AI output, local convenience rule, or legacy habit may override this document unless this document itself is revised.

### 0.2 The only five binding governance documents
The project has only these five governing documents:
1. `gg_master.md`
2. `gg_rules_of_xml.md`
3. `gg_rules_of_css.md`
4. `gg_rules_of_js.md`
5. `gg_rules_of_worker.md`

Anything else is support material only, not constitutional law.

### 0.3 Precedence order
1. `gg_master.md`
2. layer law (`gg_rules_of_xml.md`, `gg_rules_of_css.md`, `gg_rules_of_js.md`, `gg_rules_of_worker.md`)
3. task-specific patch note or AI prompt

### 0.4 Sibling-rule clarification
`gg_rules_of_xml.md`, `gg_rules_of_css.md`, `gg_rules_of_js.md`, and `gg_rules_of_worker.md` are sibling laws under this master.
They do not create a second constitution.
They may narrow implementation inside their own layer, but they may not rewrite product law, naming law, route law, or ownership law defined here.

### 0.5 Conflict rule
If a lower document conflicts with this master, the lower document is invalid.
If layer guidance appears to collide, resolve the issue through the ownership matrix in this master rather than through opinion, convenience, or implementation shortcuts.

### 0.6 Layer scoped priority
XML, CSS, JS, and Worker do not have equal authority over the same question.

**XML wins** on:
- route ownership
- render-context ownership
- whether a structure should exist in SSR at all
- semantic shell and DOM hierarchy
- host placement for global or protected systems
- machine-facing surface markers and structural hooks

**CSS wins** on:
- presentation
- spacing
- sizing
- visual layout expression
- motion expression
- visual state expression inside already valid XML-owned structure

**CSS may not overrule XML** by:
- becoming the hidden route router
- making a foreign surface appear “inactive” through blanket hiding
- turning structurally wrong SSR into a fake-correct experience
- redefining ownership by selector strength or `!important`
- moving protected host responsibility away from XML

**XML may not overrule CSS** by:
- smuggling styling systems into template logic
- encoding cosmetic values as structural law
- duplicating structure just to compensate for weak CSS architecture

**JS scoped priority**:
- JS wins on route-transition lifecycle, soft-navigation re-init, module activation/deactivation, runtime state discipline, event coordination, and non-critical runtime orchestration.
- JS may not overrule XML on SSR structure, render-context truth, DOM ownership, or protected host existence.
- JS may not overrule CSS on presentation or visual layout truth.
- JS may not overrule Worker on public URL normalization, redirects, rewrites, canonical edge discipline, cache policy, or release/drift guard.

**Worker scoped priority**:
- Worker wins on public URL normalization, redirects, rewrites, header policy, canonical edge discipline, cache policy, and release/drift guard.
- Worker may not overrule XML on SSR structure, render-context truth, DOM ownership, or protected host authorship.
- Worker may not overrule CSS on presentation.
- Worker may not overrule JS on route lifecycle and module re-init.

### 0.7 Change classes
Every revision must be labeled:
- **Major** = changes behavior, route ownership, naming law, family registry, performance budget, or platform boundary
- **Minor** = clarifies rules without changing intended behavior
- **Patch** = wording, typo, formatting, or precision only

### 0.8 Review threshold
A change is blocked unless it states:
- what changed
- why it changed
- what existing behavior is affected
- what must be re-tested
- whether rollback is needed

---

## 1. Product Thesis and Non-Negotiables

### 1.1 Product thesis
BLOG GAGA-ish is a content-first web app built on Blogger and disciplined by a strict front-end system so that it feels app-like without becoming fake-native, bloated, or structurally dishonest.

### 1.2 Experience target
The visitor experience must feel:
- fast
- stable
- smooth
- consistent
- intentional
- premium
- trustworthy

### 1.3 Non-negotiables
1. **App-like feel, not page-like friction**
2. **Quiet luxury, not decorative excess**
3. **SEO + GEO/AI readability + SEA readiness together**
4. **Performance is a product rule, not a later polish pass**
5. **Accessibility is mandatory**
6. **Centralization beats improvisation**
7. **Stability beats architecture cosplay**
8. **One internal language, not parallel dialects**
9. **Semantic honesty beats backward-compatibility theater**
10. **Legacy is debt, not a second architecture**

### 1.4 Definition of success
The system is successful only if it is:
- fast enough to feel immediate
- stable enough to trust
- readable enough for humans and machines
- modular enough to maintain
- strict enough to resist drift
- elegant enough to feel premium without hiding the structure

### 1.5 Non-goals
The project does not chase:
- decorative motion for its own sake
- framework churn without operational gain
- speculative micro-frontends without real pressure
- fake-native behavior that harms clarity or crawlability
- enterprise paperwork that does not improve outcomes

---

## 2. Actual Stack and Hard Limits

### 2.1 Official stack
The official stack is exactly:
- Blogger as content engine and native comments host
- GitHub as code SSOT and CI/CD control point
- Cloudflare DNS + Cloudflare Workers as edge layer
- Browser runtime as enhancement layer
- VS Code + AI-assisted workflow as implementation environment

### 2.2 Hard constraints
1. No paid backend dependency is assumed.
2. No separate application server is assumed.
3. Native Blogger comments remain a protected black box.
4. Edge logic must respect Cloudflare Workers limits.
5. The system must remain maintainable by a small operator using AI.
6. Enhancements must degrade with dignity under weak JS, weak network, or weak hardware.

### 2.3 Architectural honesty rule
Any proposal that sounds advanced but increases operator burden, debugging opacity, runtime fragility, or release risk without proportional value is wrong.

---

## 3. Ownership Matrix

### 3.1 Layer ownership
- **Cloudflare Worker** owns public URL handling, redirects, rewrites, header policy, and canonical edge discipline.
- **Blogger XML** owns SSR structure, render-context selection, semantic shell, server-delivered DOM, host placement, and route-critical structural markers.
- **CSS** owns presentation, layout expression, and visual state inside valid XML-owned structure.
- **JS** owns behavior, enhancement, orchestration, and non-critical runtime polish.
- **Docs** own governance, not runtime behavior.

### 3.2 Absolute rule
A lower layer may not quietly steal the job of another layer because it is easier.

Examples:
- CSS may not become the real route router.
- CSS may not “fix” structurally wrong XML by hiding the evidence as the default architecture.
- XML may not become a dumping ground for styling logic.
- XML may not duplicate or over-encode structure to solve what is really a CSS problem.
- JS may not become the only place where core meaning exists.
- Docs may not invent a second registry that code does not obey.

### 3.3 Thin-host rule
Global hosts may exist across surfaces only if they are lightweight, justified, and stable.
Global presence does not justify full payload everywhere.

---

## 4. Surface Model and Render Context Law

### 4.1 Two-level model
The system must distinguish between:

#### A. Public route surfaces
- `/`
- `/blog` if retained as alias
- `/landing`
- `/offline`
- `/404`
- special pages such as tags, sitemap, library, store, portfolio, author pages

#### B. Internal render contexts
- `listing`
- `landing`
- `post`
- `page`
- `special`
- `error`
- `offline`
- `global`

### 4.2 Rule
A route maps to one primary render context at a time.
`global` is not a route. It is a lightweight host layer.

### 4.3 Canonical render-context registry

#### `landing`
Owns landing shell, hero, packages, contact, and landing storytelling.
It must not quietly ship full listing feed, comments panel, or post TOC.

#### `listing`
Owns post feed, post-card family, listing-card-toolbar, mixed-media rails, editorial-preview, listing preview TOC, search shell, and listing-specific dock behavior.
It must not impersonate post/page detail infrastructure.

#### `post`
Owns article detail, detail toolbar, detail info sheet, TOC, comments-panel host, share trigger contract, and post-specific dock behavior.
It must not carry listing rails as default SSR burden.

#### `page`
Owns non-system static page shell, page body, detail toolbar where enabled, detail info sheet where justified, comments-panel host when enabled, share trigger when enabled, and TOC when justified.
It must not inherit listing-only ownership names.

#### `special`
Owns tags, sitemap, library, store, portfolio, author pages, and special-page navigation/recovery affordances.

#### `error`
Owns 404 and related recovery flows.

#### `offline`
Owns offline recovery surface and retry/re-entry guidance.

#### `global`
Owns only justified lightweight hosts such as dock, toast, dialog, overlay, and share-sheet host.
`global` must stay thin.

### 4.4 Cross-surface leakage ban
A surface may not SSR another surface’s major structure and hide it with CSS as the default strategy.

---

## 5. Naming Law

### 5.1 One internal language
All machine-facing internal contracts must use one GAGA-ish naming language.
The project may not maintain parallel dialects between docs, XML, CSS, JS, tests, registries, and manifests.

### 5.2 What must use GG naming
The following must use GG-scoped naming when machine-facing:
- component families
- primitive families
- classes
- IDs
- `data-gg-*` hooks
- CSS custom properties
- template IDs
- custom events
- storage keys
- registries
- ledgers
- manifests
- SSOT-side identifiers
- migration adapters that touch internal contracts

### 5.3 What must NOT be forced into GG naming
The following remain standard platform language:
- native HTML attributes
- ARIA attributes
- semantic HTML elements
- Schema.org vocabulary
- canonical/meta conventions
- Blogger internals inside protected comment zone
- third-party standard names that are external by definition

### 5.4 Semantic honesty rule
A GG prefix does not rescue a dishonest name.
A name must describe the real role of the thing it names.

Invalid examples:
- support action named `like`
- post/page detail metadata hidden under `editorial-preview`
- a page-and-post toolbar permanently named `post-toolbar`
- `gg-info-panel` pretending to be the final family when the real ownership is detail info sheet

### 5.5 Official naming patterns
- class: `.gg-*`
- state class: `.gg-is-*`
- ID: `#gg-*`
- hook: `data-gg-*`
- token: `--gg-*`
- template ID: `#gg-tpl-*`
- event: `gg:*`
- storage: `gg:*`
- editable zone: `gg-zone-*`

### 5.6 Official family registry

#### Primitive families
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

#### Component families
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
- `gg-install-prompt`
- `gg-update-flow`
- `gg-offline-recovery`
- `gg-notfound`
- `gg-toc`

#### Card families
- `gg-post-card`
- `gg-featured-card`
- `gg-mixed-card`
- `gg-panel-card`
- `gg-landing-card`

#### Layout / structural families
- `gg-page-shell`
- `gg-header`
- `gg-home-switcher`
- `gg-blog-grid`
- `gg-sidebars`

### 5.7 Legacy migration law
Legacy names may survive only if all four conditions are true:
1. they are documented as legacy
2. the replacement is named explicitly
3. parity verification exists
4. removal intent is explicit

### 5.8 Current migration ledger
The current codebase still contains naming debt. The contract must command migration rather than pretend the debt does not exist.

Required target mapping:
- `data-gg-action="like"` → `data-gg-action="support"`
- `post.action.like` copy namespace → support-oriented naming
- `.gg-post__toolbar` → `gg-detail-toolbar` family bridge, then removal
- `gg-postinfo` host ID → `gg-detail-info-sheet` host ID bridge, then removal
- `gg-info-panel` as active family → split honestly into listing-owned `gg-editorial-preview` and detail-owned `gg-detail-info-sheet`
- `gg-editorial-preview` must remain listing-owned only

### 5.9 Rule
No new work may introduce deprecated names.
New work must use the target language, not the debt language.

---

## 6. Shared Contracts That Must Survive

### 6.1 Dock contract
- `#gg-dock` is the global host for `gg-dock`
- dock behavior may vary by context
- global dock presence does not justify multiple dock systems

### 6.2 Share contract
- listing share must survive
- post share must survive
- page share must survive where enabled
- `#gg-share-sheet` is the global host for `gg-share-sheet`
- host and trigger contract must stay stable even if payload is delayed

### 6.3 Toolbar contract
- `gg-detail-toolbar` belongs to post and page detail contexts
- `gg-listing-card-toolbar` belongs to listing cards only
- shared design DNA does not mean shared ownership identity

### 6.4 Editorial-preview contract
`gg-editorial-preview` is a listing-owned family.
It is not a synonym for post/page metadata infrastructure.

### 6.5 Detail-info-sheet contract
Post/page metadata infrastructure must use `gg-detail-info-sheet` as its final family.
Legacy `gg-info-panel` or `gg-postinfo` may survive only as bridge contracts.

### 6.6 TOC contract
- `gg-toc` is the detail TOC family by default
- page TOC may use `gg-toc` where behavior remains consistent
- listing preview TOC is not allowed to erase detail TOC ownership boundaries

### 6.7 Comments contract
Comments remain a Blogger-controlled protected subsystem.
The project may wrap and frame comments safely through `gg-comments` and `gg-comments-panel`, but may not casually restructure comment internals into brittle assumptions.

---

## 7. Copy, SEO, GEO, SEA, Accessibility, and Trust

### 7.1 Copy law
Public UI copy must be centralized, auditable, and fallback-safe.
No random hard-coded product UI strings in JS or CSS.

### 7.2 SEO + GEO + SEA rule
The system must be easy to crawl, quote, understand, and adapt for campaign surfaces without breaking content integrity.

### 7.3 Accessibility rule
Keyboard support, focus visibility, semantic structure, reduced-motion respect, and readable fallback are product law.

### 7.4 Trust rule
The interface may reassure the user, but it may not deceive the user.
Do not simulate confidence with fake status, fake loading, or dark-pattern interaction.

---

## 8. Performance and Progressive Enhancement Law

### 8.1 Performance is a product rule
Luxury may not be purchased with runtime waste, hidden SSR cargo, blur spam, shadow escalation, or animation vanity.

### 8.2 Progressive enhancement rule
Core reading, route understanding, and major meaning must survive without JS.

### 8.3 Global-host restraint
Global hosts may ship lightly across contexts, but their full payload must not become default SSR cargo without measured value.

### 8.4 Reduced-motion rule
Relevant motion-capable interfaces must degrade cleanly for reduced-motion users.

---

## 9. Protected Zones

### 9.1 Comments protected zone
Protected:
- native Blogger comment behavior
- reply flow assumptions
- composer visibility
- keyboard accessibility

### 9.2 Head and canonical protected zone
Protected:
- canonical integrity
- indexability logic
- route-specific metadata discipline

### 9.3 Global-host protected zone
Protected hosts:
- `#gg-dock`
- `#gg-share-sheet`
- `#gg-dialog`
- `#gg-overlay`
- `#gg-toast`

### 9.4 Render-context mapping protected zone
Protected:
- route → render-context mapping
- route-critical conditional gates
- `data-gg-*` ownership markers that determine active surface/context

---

## 10. AI-Agent Execution Law

### 10.1 AI role
AI agents are implementation assistants, not autonomous architects.

### 10.2 AI may not
- invent a second naming dialect
- preserve misleading semantics for convenience
- rewrite architecture casually
- bypass primitive families
- smuggle business logic into XML
- treat legacy aliases as permanent architecture
- claim success without verification criteria

### 10.3 AI must
- follow this master before any task prompt
- state objective, touched files, assumptions, risks, verify, and rollback note when risk exists
- report naming debt honestly
- prefer semantic honesty over shallow compatibility theater

---

## 11. Testing, Audit, and Acceptance Gates

### 11.1 Universal audit minimum
Any serious change must check, at minimum:
1. route behavior
2. render-context integrity
3. naming-law compliance
4. component/primitive ownership clarity
5. keyboard and focus path
6. semantic fallback
7. performance impact
8. comment safety if relevant
9. canonical/indexability integrity if relevant
10. no cross-surface leakage

### 11.2 Release blockers
A release fails if it:
- breaks core route readability
- breaks canonical/indexability logic
- introduces primitive duplication
- weakens accessibility in primary flows
- violates naming law
- regresses comments
- creates unreviewed copy fallback failures
- introduces unjustified performance regression
- preserves parallel dialects as silent architecture

### 11.3 Verification rule
“Looks okay” is not verification.

---

## 12. Closing Rule

This project becomes enterprise-grade not by looking complicated, but by being strict where it matters:
- one constitution
- one internal language
- one owner per family
- honest route ownership
- honest naming
- disciplined enhancement
- stable protected zones
- repeatable release behavior

If a decision makes the system harder to understand, slower to load, easier to break, or easier for AI to misunderstand, that decision is wrong.
