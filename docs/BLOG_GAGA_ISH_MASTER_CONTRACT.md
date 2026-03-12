# BLOG GAGA-ish MASTER CONTRACT
**Status:** Final working draft v1.0  
**Project:** www.pakrpp.com  
**Owner:** PakRPP / Project Owner  
**System role:** Single Source of Truth (SSOT) for product, UX, architecture, naming, performance, accessibility, localization, SEO, GEO/AI readability, SEA readiness, and AI-agent implementation governance.  
**Supersedes:** `master_pre_production_brief_structure_v_1.md`, `NAMING.md`, and any other concept/legacy guidance that conflicts with this contract.  

---

## 0. Authority, Scope, and Change Control

### 0.1 Authority
This document is the **single operational contract** for BLOG GAGA-ish. All implementation, review, release, and AI-agent work must follow this document. No separate naming law, no parallel brief, no undocumented “common sense,” and no feature-level exception may override this contract unless this contract itself is revised.

### 0.2 Scope
This contract governs:
- product direction
- route/surface behavior
- UI/UX interaction model
- visual and motion governance
- naming and hook contract
- component and UI primitive governance
- copy, microcopy, i18n, and localization
- accessibility
- performance and progressive enhancement
- information architecture, SEO, GEO/AI readability, SEA readiness
- engineering and asset boundaries
- privacy and trust boundaries
- testing, readiness gates, and release control
- AI-agent execution rules

### 0.3 Out of scope
This contract does **not** authorize uncontrolled expansion into a general SaaS platform, paid backend stack, multi-team enterprise bureaucracy, or speculative architecture that exceeds the operator’s real maintenance capacity.

### 0.4 Change classes
Every revision must be labeled:
- **Major:** changes contract behavior, route model, naming rules, component family, performance budgets, or platform boundaries.
- **Minor:** clarifies rules without changing behavior.
- **Patch:** typo fix, wording precision, or formatting improvement only.

### 0.5 Review threshold
A change is blocked unless it explicitly states:
- what changed
- why it changed
- what existing behavior is affected
- what must be re-tested
- whether rollback is needed

---

## 1. Product Thesis and Non-Negotiables

### 1.1 Product thesis
BLOG GAGA-ish is a **content-first web app** built on Blogger and enhanced through a disciplined front-end system so that it feels **app-like**, not page-like, while remaining search-friendly, machine-readable, campaign-ready, accessible, and maintainable.

### 1.2 Experience target
The experience must feel:
- premium without being noisy
- responsive without being hyperactive
- elegant without hiding structure
- native-like without faking application complexity
- trustworthy without demanding effort from the visitor

### 1.3 Non-negotiables
1. **App-like feel, not page-like friction**  
   Navigation, focus, transitions, overlays, feedback, and controls must feel coherent and intentional.
2. **Quiet Luxury, not decorative excess**  
   Restraint beats ornament. Maturity beats novelty. Hierarchy beats visual clutter.
3. **SEO + GEO/AI readability + SEA readiness together**  
   The system must be easy to crawl, easy to quote, easy to understand, and easy to adapt for campaign landing needs.
4. **Performance is a product rule**  
   Luxury may not be purchased with runtime waste.
5. **Accessibility is not optional**  
   Keyboard support, semantic structure, focus visibility, readable copy, and assistive compatibility are core product rules.
6. **Centralization over improvisation**  
   Copy, tokens, UI primitives, and interaction rules must be centralized.
7. **Stability over architecture cosplay**  
   “Enterprise-grade” means disciplined, testable, and maintainable — not bloated.

### 1.4 Definition of success
The system is considered successful only if it is:
- fast enough to feel immediate
- stable enough to trust
- readable enough for humans and machines
- modular enough to maintain
- elegant enough to feel premium
- strict enough to prevent code drift

### 1.5 Non-goals
The project does not chase:
- decorative animation for its own sake
- framework churn without operational need
- speculative micro-frontends without real modular pressure
- fake-native behavior that harms clarity or SEO
- enterprise paperwork that does not improve outcomes

---

## 2. Actual Stack and Hard Platform Limits

### 2.1 Official stack
The official stack is exactly:
- **Blogger** as content engine and native comments host
- **GitHub** as code SSOT and CI/deploy control point
- **Cloudflare DNS + Cloudflare Workers (free plan)** as edge layer for routing, optimization, and controlled request handling
- **Browser runtime** as the enhancement surface
- **VS Code + AI agent workflow** as implementation environment

### 2.2 Hard constraints
1. No paid backend dependency is assumed.
2. No Google Apps Script dependency is part of this system.
3. No separate application server is assumed.
4. Native Blogger comments remain a protected black box.
5. Edge logic must respect Cloudflare Workers free-plan limitations.
6. All enhancements must degrade with dignity when JavaScript or network conditions are weak.
7. The system must remain operable by a small team and not require enterprise-scale staffing.

### 2.3 Architectural honesty rule
Any proposal that sounds powerful but increases operator burden, debugging opacity, runtime fragility, or release risk without proportional gain must be rejected.

---

## 3. Route and Surface Registry

### 3.1 Surface model
Only explicitly defined surfaces are first-class. No route should evolve ad hoc.

### 3.2 Official surfaces

#### `/` — Home / Blog Surface
- **Purpose:** primary content discovery and blog experience
- **Audience:** public visitors, search traffic, returning readers
- **Primary jobs:** read, browse, discover, navigate, trust the brand
- **Indexability:** indexable
- **Canonical:** self-canonical
- **Sitemap:** included
- **JS dependency:** low to medium; core content must remain readable without JS
- **Experience priority:** immediate content legibility, elegant navigation, strong hierarchy, low-friction discovery

#### `/landing` — Marketing Landing Surface
- **Purpose:** campaign-ready conversion surface
- **Audience:** ad/campaign traffic, first-touch visitors, offer-focused users
- **Primary jobs:** understand, trust, act
- **Indexability:** controlled per campaign strategy; default indexable if evergreen, otherwise case-by-case
- **Canonical:** explicit and controlled
- **Sitemap:** only when treated as evergreen surface
- **JS dependency:** low; CTA path must stay clear without JS
- **Experience priority:** speed, clarity, modular blocks, measurable CTA structure

#### `/offline` — Offline Fallback Surface
- **Purpose:** graceful offline or degraded-network fallback
- **Audience:** disrupted users
- **Primary jobs:** understand failure state, recover, retry, continue later
- **Indexability:** noindex
- **Canonical:** none / excluded
- **Sitemap:** excluded
- **JS dependency:** minimal; must remain legible in fallback mode
- **Experience priority:** reassurance, honesty, retry path, no dead-end confusion

#### `/404` — Not Found Surface
- **Purpose:** recover from broken or missing path
- **Audience:** misrouted visitors and broken-link traffic
- **Primary jobs:** orient, recover, continue
- **Indexability:** noindex
- **Canonical:** none / excluded
- **Sitemap:** excluded
- **JS dependency:** minimal
- **Experience priority:** orientation, recovery links, zero blame tone

### 3.3 Route governance
Any new first-class route must define:
- purpose
- audience
- indexability
- canonical policy
- sitemap status
- fallback behavior
- JS dependency level
- performance expectations
- primary CTA or interaction goal

---

## 4. Information Architecture, SEO, GEO/AI Readability, and SEA Readiness

### 4.1 IA principles
The structure must be legible to:
- human readers
- search engines
- AI systems extracting meaning
- campaign visitors needing fast understanding

### 4.2 IA rules
1. Each surface must have a clear information hierarchy.
2. Headlines must describe, not posture.
3. Content entities, summaries, labels, and explanatory structures must be consistent.
4. Repeated concepts must use stable terminology.
5. Navigation must reduce ambiguity, not increase options for their own sake.

### 4.3 SEO contract
- semantic heading hierarchy is mandatory
- canonical rules must be explicit
- internal links must support discovery and context
- metadata must be meaningful, not stuffed
- index/noindex decisions must be intentional
- crawlable content must not depend on JS-only rendering

### 4.4 GEO/AI readability contract
The system must produce pages that are:
- definitional
- extractable
- terminologically consistent
- context-rich but not bloated
- quote-friendly without leaking what should remain private

### 4.5 SEA readiness contract
Landing-oriented content blocks must be:
- fast
- modular
- easy to adapt without breaking structure
- measurable through clear CTA placement and message boundaries

### 4.6 Snippet-worthiness rule
Public content should be structured so that summaries, snippets, and AI extraction reflect the intended meaning rather than accidental fragments.

---

## 5. Interaction Model: App-Like Feel Without Runtime Waste

### 5.1 Input philosophy
The system must support dual interaction logic:
- **Mobile:** touch/gesture-centric
- **Desktop:** keyboard/mouse-centric

Neither mode may feel like a second-class adaptation.

### 5.2 Interaction laws
1. The system must feel coherent across surfaces.
2. Focus movement must be predictable.
3. Overlays must not trap users in confusing states.
4. The visible hierarchy must match interaction importance.
5. Every interaction must justify its cost.

### 5.3 Responsive behavior rules
The contract must enforce:
- tap target adequacy
- keyboard-complete paths
- sticky region discipline
- overlay behavior across viewport classes
- safe behavior near virtual keyboards
- gesture allowance only when discoverable and low-risk

### 5.4 State model
All meaningful interactive patterns must have explicit states such as:
- idle
- hover/focus-visible (where relevant)
- active
- open / closed
- loading
- success
- warning
- error
- disabled
- stale / unavailable

### 5.5 Finite state machine rule
Critical interactive patterns — navigation drawers, dialogs, search panels, menus, forms, notification layers, and media controls — must behave as if governed by a finite state machine even when implementation is lightweight. Ambiguous state transitions are defects.

### 5.6 Dangerous action rule
Actions that are risky, destructive, or trust-sensitive must use the correct friction level. Do not use low-friction patterns where confirmation or clarity is required.

---

## 6. UI Primitive and Component Governance

### 6.1 Principle
The system must have a **centralized primitive layer** and a **controlled component layer**. No feature is allowed to invent its own overlay, alert logic, or feedback component when an official primitive exists.

### 6.2 Official UI primitive families
The following are first-class primitives and must be centralized:
- dialog
- sheet / drawer
- popover / dropdown
- tooltip
- toast
- inline alert
- banner / announcement
- notification item / notification region
- skeleton
- progress indicator
- empty state
- loading state container
- confirm action pattern
- field help / validation message pattern

### 6.3 Official component layer
Higher-level components may be composed from primitives, such as:
- navigation shells
- post cards
- media cards
- TOC blocks
- search panels
- list/detail panels
- comment wrappers
- campaign blocks
- CTA groups
- footer blocks

### 6.4 Reuse law
If an official primitive or component can serve a new need with acceptable adaptation, reuse is mandatory. Creating a new family is blocked unless the existing family is proven insufficient.

### 6.5 Overlay rules
- dialog = decision or interruption requiring focus and explicit acknowledgement
- sheet/drawer = contextual panel or mobile-first side interaction
- toast = ephemeral feedback, never critical dependency
- inline alert = contextual problem or guidance near the relevant region
- banner = wider-scope state or announcement
- tooltip = optional hint, never sole carrier of critical meaning

### 6.6 Overlay accessibility rules
Every overlay-capable primitive must define:
- focus entry
- focus trap behavior if modal
- escape behavior
- dismissal rules
- return focus target
- reduced motion compatibility
- announcement strategy where appropriate

### 6.7 Queue and stack rules
Toast and notification systems must define:
- queue behavior
- max visible count
- auto-dismiss policy
- persistent-error behavior
- z-index governance
- duplication prevention

### 6.8 Primitive naming rule
Primitive families and implementations must follow the system naming contract. Example namespaces:
- `.gg-dialog`
- `.gg-toast`
- `.gg-banner`
- `.gg-inline-alert`
- `.gg-empty-state`

### 6.9 Anti-patterns
Rejected:
- feature-specific modal families when central dialog exists
- one-off alert CSS outside the primitive system
- notification logic embedded ad hoc in unrelated modules
- critical feedback shown only in toast

---

## 7. Design System and Quiet Luxury Governance

### 7.1 Design intent
The design system exists to prevent drift, not to manufacture aesthetic jargon.

### 7.2 Quiet Luxury rules
Quiet Luxury in this system means:
- restraint over decoration
- space over clutter
- typographic maturity over loud styling
- confidence over novelty
- motion economy over constant movement
- premium tactility without visual noise

### 7.3 Visual hierarchy rules
The interface must make clear:
- what matters first
- what is supportive
- what is optional
- what is dangerous
- what is persistent versus temporary

### 7.4 Density and rhythm
Spacing, alignment, grouping, and reading rhythm must feel deliberate. Dense layouts are allowed only when clarity survives.

### 7.5 Motion governance
Animation is allowed only when it improves:
- continuity
- feedback
- orientation
- perceived tactility

Animation is rejected when it exists only to signal “high-end.” Reduced-motion preferences must be respected.

### 7.6 Theming discipline
Theming must be controlled. The system may permit variation, but not drift that erodes brand coherence or a11y.

---

## 8. Token System and Adaptive Typography

### 8.1 Token architecture
The token system has three levels:
- primitive tokens
- semantic tokens
- component tokens

### 8.2 Token families
Official token families include:
- color
- typography
- spacing
- radius
- shadow
- motion
- z-index
- sizing
- content width / layout

### 8.3 Raw-value prohibition
Outside tightly justified exceptions, raw visual values should not be scattered across the system when a token can represent the decision.

### 8.4 Adaptive typography
Typography must adapt across viewport classes while preserving:
- hierarchy
- rhythm
- readability
- line length discipline
- elegance in display moments
- legibility in input and operational moments

### 8.5 Multilingual tolerance
Typography and layout must tolerate English and Bahasa Indonesia text expansion without collapsing hierarchy or CTA clarity.

---

## 9. Copy, Microcopy, Language, and Localization Contract

### 9.1 Copy centralization law
UI copy may not be scattered across templates, CSS, JS modules, and ad hoc patches without control. System copy must be centralized.

### 9.2 Official language model
- **Primary source language:** English
- **Secondary language:** Bahasa Indonesia
- **Fallback language:** English

If a string is missing in Bahasa Indonesia, the system falls back to English. Missing English system copy is a release blocker.

### 9.3 Copy classes
- canonical system copy
- controlled editable copy
- campaign / landing override copy
- derived or dynamic copy
- operational or environment-driven copy

### 9.4 Key structure
Copy keys must be namespaced and stable, for example:
- `global.nav.search`
- `home.hero.title`
- `landing.offer.ctaPrimary`
- `offline.retry.body`
- `notfound.recovery.linkHome`
- `toast.save.success`

### 9.5 Microcopy rules
Microcopy must be:
- concise
- action-oriented
- trust-safe
- human-readable
- severity-appropriate
- semantically equivalent across English and Bahasa Indonesia

### 9.6 Translation rule
Translation is not allowed to become tone drift. English and Bahasa Indonesia versions must express the same product intent, not two different personalities.

### 9.7 Override zones
Only designated campaign or operational namespaces may be overridden without changing this contract. Core trust, navigation, warning, consent, recovery, and structural copy are locked unless explicitly reviewed.

### 9.8 Date, number, and locale formatting
Displayed dates, numbers, and locale-sensitive strings must use locale-aware rules and avoid ambiguous formatting.

### 9.9 Missing-copy behavior
If localized copy is unavailable:
1. use fallback English
2. never show raw keys to users
3. log or flag the missing translation in review workflow

---

## 10. Accessibility and Inclusive UX Contract

### 10.1 Accessibility baseline
The system must support:
- semantic HTML first
- meaningful heading structure
- keyboard navigation for primary flows
- visible focus indication
- readable contrast and hierarchy
- error states that are understandable
- assistive technology compatibility

### 10.2 Accessibility minimums
- no critical flow may require pointer precision
- primary interactive paths must be keyboard-complete
- icon-only controls must have an accessible name
- decorative icons must not create noise for assistive tech
- overlays must preserve focus logic
- motion must respect reduced-motion preference

### 10.3 ARIA policy
ARIA is allowed only where semantics need augmentation. ARIA may not be used as a bandage for broken structure.

### 10.4 Form and input rules
Inputs must favor clarity, forgiveness, and readable validation over visual cleverness. Tiny action targets, ambiguous labels, and hidden instructions are defects.

### 10.5 Inclusive UX rule
The system must avoid unnecessary precision, hidden traps, and exclusionary interaction assumptions.

---

## 11. Markup, Style, Behavior Separation and Naming Contract

### 11.1 Separation contract
- HTML = structure and semantics
- CSS = presentation and visual state
- JS = behavior, state orchestration, and enhancement

### 11.2 Blogger XML as thin shell
In Blogger template XML, the following are allowed:
- critical CSS in `<b:skin>`
- versioned external scripts with explicit closing tags
- semantic markup skeletons and hooks
- JSON-LD non-executable structured data
- native Blogger comments widget

The following are forbidden:
- inline executable JS logic
- non-critical CSS outside the intended pipeline
- feature logic embedded directly in template XML

### 11.3 Global namespace
- single JS global namespace: `window.GG`
- no uncontrolled globals outside `GG.*`

### 11.4 CSS classes
- block prefix: `.gg-`
- state class: `.gg-is-*`
- IDs only when justified: `#gg-*`

### 11.5 Data attributes
Internal hooks must use `data-gg-*`.
Recommended forms include:
- `data-gg-action`
- `data-gg-state`
- `data-gg-slot`
- `data-gg-variant`

### 11.6 Tokens
CSS custom properties must use `--gg-*`.

### 11.7 Events and storage
- event format: `gg:[kebab-case]`
- storage key prefix: `gg:`

### 11.8 HTML/CSS in JS prohibition
Rejected:
- `innerHTML`-driven main UI construction
- `insertAdjacentHTML(...)` as UI system default
- CSS injection or CSS-in-JS as runtime pattern

Allowed:
- class toggling
- data-attribute binding
- template cloning from markup-defined templates
- CSS variable setting when justified

### 11.9 Comments protected zone
Native Blogger comments are a black box. Styling and wrapper polish are allowed. Behavior rewriting is not.

### 11.10 Patch rejection triggers
A patch must be rejected if it:
- invents hooks outside naming rules
- injects HTML/CSS into JS without justification
- breaks semantic fallback
- rewrites Blogger comments behavior
- creates duplicate primitive families
- weakens accessibility or performance budgets

---

## 12. Performance, Progressive Enhancement, and Support Matrix

### 12.1 Performance principle
Premium feel must be achieved through disciplined loading and interaction design, not brute-force runtime cost.

### 12.2 Working performance targets
These are product targets, not decorative metrics:
- **LCP target:** ≤ 2.5s on representative real-world conditions
- **CLS target:** ≤ 0.10
- **INP target:** ≤ 200ms where measurable
- **TBT target (lab):** as close to 0ms as realistically possible
- **JS budget:** keep core-path JS lean; no non-essential payload on primary routes
- **CSS budget:** keep above-the-fold CSS intentional; no ornamental bloat
- **request budget:** limit non-essential requests, especially on landing and content-first surfaces

### 12.3 Route-level expectations
- `/` must prioritize readable content and fast perceived navigation.
- `/landing` must prioritize speed, CTA clarity, and low-friction rendering.
- `/offline` and `/404` must be lightweight and recoverable.

### 12.4 Progressive enhancement contract
Must work without JS:
- core content reading
- basic navigation understanding
- fallback recovery surfaces

May degrade gracefully:
- enhanced drawers
- richer transitions
- advanced search interaction
- dynamic feedback layers

Must fail safely:
- no hidden critical content due to JS failure
- no dead-end route due to enhancement failure

### 12.5 Browser/device support model
The system must remain usable on modern browsers and reasonable low-to-mid hardware. Unsupported advanced features must degrade without collapsing core tasks.

### 12.6 Computational rationality rule
Do not spend runtime budget to simulate luxury. Spend it only where experience measurably improves.

---

## 13. Engineering Architecture and Modularity Rules

### 13.1 Architecture principle
The system must be modular, readable, and testable. That does not require performative complexity.

### 13.2 Component-based modularity
Modules must have clear boundaries such as:
- UI modules
- state modules
- service/data modules
- utility modules
- platform bridge modules

### 13.3 Boundary law
Each module must have:
- a clear job
- explicit dependencies
- limited side effects
- no hidden ownership confusion

### 13.4 Conditional path toward micro-frontends
Micro-frontends are not the default. They are allowed only if the existing modular system proves insufficient under real pressure.

### 13.5 File and folder discipline
Files must have clear purpose, stable naming, and explicit ownership. “Temporary” files that become permanent chaos are unacceptable.

---

## 14. Privacy, Trust, and Data Lifecycle

### 14.1 Trust baseline
Users must never be manipulated, deceived, or trapped by interface behavior.

### 14.2 Storage rule
Only store what is justified. Temporary UI state, preferences, and safe caches may be stored under controlled keys. Sensitive or trust-critical handling must be minimized and explicit.

### 14.3 Logging rule
Do not log more than needed. Do not create observability that undermines privacy or operator clarity.

### 14.4 Disclosure rule
Recovery, failure, and state messaging must be honest. The interface may be reassuring, but not deceptive.

### 14.5 Data lifecycle discipline
If data exists, the system should know why it exists, how long it lives, who depends on it, and how it is removed or invalidated.

---

## 15. Error, Notification, and Recovery Contract

### 15.1 Error taxonomy
The system must distinguish, at minimum:
- user error
- validation error
- runtime error
- network/offline error
- stale-state error
- platform/quota error
- partial failure
- unknown failure

### 15.2 Feedback channel selection
- toast for transient, non-critical acknowledgement
- inline alert for contextual problems or guidance
- dialog for interruptive or confirm-requiring events
- banner for broader-scope status or warnings
- offline surface for network collapse/recovery path

### 15.3 Recovery rule
Every meaningful failure must answer one of these:
- retry now
- try later
- go elsewhere
- recover automatically
- contact or wait with clarity

### 15.4 Silent failure ban
Critical failures may not disappear silently.

---

## 16. Testing, QA, and Readiness Gates

### 16.1 Testing philosophy
A change is not accepted because it “looks okay.” It must prove that it does not break structure, performance, accessibility, trust, or maintainability.

### 16.2 Minimum checks
Any significant change must be reviewed against:
- route behavior
- keyboard path
- focus visibility
- primitive/component reuse
- copy/i18n correctness
- semantic fallback
- performance impact
- comment widget safety if relevant

### 16.3 Release blockers
A release is blocked if it:
- breaks core route readability
- breaks canonical/indexability logic
- introduces primitive duplication
- weakens a11y in primary flows
- violates naming contract
- causes comment widget regression
- introduces unreviewed copy fallback failures
- creates unacceptable performance regression

### 16.4 Comments smoke checklist
If comments are touched, verify:
- comments render on post page
- form is visible and keyboard-focusable
- reply behavior still works if enabled
- no clipping hides actions or form
- no console errors related to comments

---

## 17. AI-Agent Execution Contract

### 17.1 Role of AI agents
AI agents are implementation assistants, not autonomous architects. They must follow this contract, not invent a parallel one.

### 17.2 Patch discipline
AI-generated changes must be:
- scoped
- explainable
- testable
- reversible
- tied to explicit acceptance criteria

### 17.3 Forbidden AI behavior
Agents must not:
- rewrite architecture casually
- create new naming dialects
- bypass primitives
- smuggle business logic into template XML
- add undocumented dependencies
- claim success without verification criteria

### 17.4 Required AI output shape
A serious patch proposal should state:
- objective
- touched files/surfaces
- assumptions
- risks
- acceptance criteria
- rollback note if risk exists

### 17.5 Human override
The owner retains final authority. AI confidence does not equal correctness.

---

## 18. Release and Operational Governance

### 18.1 Release rule
Deployments must be repeatable, non-manual where practical, and auditable.

### 18.2 Surface integrity before launch
Before promoting a release, confirm:
- `/` behaves as intended
- `/landing` stays fast and campaign-ready
- `/offline` works as recovery surface
- `/404` recovers users cleanly
- canonical/indexability rules are intact
- key primitives and copy fallback behave correctly

### 18.3 Rollback readiness
If a change affects routing, core interaction, comments, primitives, copy registry, or performance budget, rollback thinking must exist before release.

---

## 19. Immediate Implementation Priorities

### 19.1 Priority order
1. Establish this contract as the only SSOT.
2. Merge legacy naming rules into this contract and deprecate standalone authority.
3. Formalize route registry for `/`, `/landing`, `/offline`, and `/404`.
4. Build or normalize centralized primitive families.
5. Centralize copy with EN/ID structure and fallback discipline.
6. Enforce naming, separation, and template boundaries.
7. Validate performance and a11y on primary routes.

### 19.2 Immediate bans
Until explicitly approved, do not:
- create one-off modals, toasts, or banners per feature
- introduce new global namespaces
- bury copy inside arbitrary modules
- depend on route-critical JS for core meaning
- treat SEO/GEO/a11y as post-polish work

---

## 20. Closing Rule

This project becomes “enterprise-grade” **not** by pretending to be a giant platform, but by being strict where it matters: route clarity, interaction integrity, naming discipline, centralized primitives, stable copy, accessible structure, controlled enhancement, and repeatable release behavior.

If a decision makes the system look sophisticated but harder to maintain, harder to trust, slower to load, or easier to break, that decision is wrong.
