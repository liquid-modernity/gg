# GG RULES OF JS
**Status:** Binding JS law under `gg_master.md`  
**Role:** Operational law for browser-side JavaScript ownership, boot order, lifecycle, module loading, runtime state discipline, route-transition parity, and JS-side AI discipline.

---

## 0. Authority and Scope

### 0.1 Authority
This document is subordinate to `gg_master.md`.
It may specialize JS behavior, but it may not rewrite master-level law.

### 0.2 Scope
This document governs:
- browser-side boot and initialization
- route-transition lifecycle
- module loading and execution discipline
- runtime state and event discipline
- selector and contract consumption from XML-owned structure
- progressive enhancement behavior
- JS-side observability and debug restraint
- JS patch acceptance and rejection

### 0.3 JS constitutional rule
JS is the enhancement and orchestration layer, not the primary author of structural truth.

JS may:
- enhance valid XML-owned structure
- orchestrate interaction and route transitions
- populate non-critical runtime payload
- coordinate module activation and deactivation
- manage reversible runtime state
- improve app-like feel without breaking semantic honesty

JS may not:
- become the primary route router in conflict with declared route truth
- become the permanent owner of SSR meaning
- create a second render-context truth separate from XML
- create visual truth that belongs to CSS
- excuse ownership mistakes by compensating indefinitely in runtime code

---

## 1. Definition of 10/10 JS

JS is 10/10 only if all conditions below are true:
1. It makes interaction feel faster, smoother, and more intentional without becoming structurally dishonest.
2. It respects XML ownership of SSR structure and render-context truth.
3. It respects CSS ownership of presentation.
4. It keeps hard refresh and soft navigation behavior aligned.
5. It initializes and re-initializes safely without duplicate side effects.
6. It keeps module loading explicit, bounded, and explainable.
7. It does not make core route meaning depend on JS-only existence.
8. It stays maintainable by a small operator using AI.
9. It does not become a hidden second architecture.
10. It does not create route confusion, stale state, or rebind drift.

If one of the above fails, JS is not 10/10.

---

## 2. Ownership Law

### 2.1 JS owns
JS owns:
- behavior
- enhancement
- orchestration
- route-transition lifecycle
- soft-navigation re-init
- module activation and deactivation
- runtime state discipline
- event coordination
- non-critical runtime polish

### 2.2 JS does not own
JS does not own:
- public URL truth that belongs to Worker
- primary SSR shell truth that belongs to XML
- visual layout truth that belongs to CSS
- component family ownership truth
- semantic shell existence
- core route meaning that must survive without JS

### 2.3 XML priority rule
If the problem is about:
- whether a host should exist
- where it should live in SSR
- which surface owns it
- whether a detail shell is structurally present
- whether comments, toolbar, info sheet, or TOC host should exist by default

then XML must own the fix.

JS may enhance such structure, but it may not become the permanent substitute for missing XML-owned hosts.

### 2.4 CSS priority rule
If the problem is spacing, sizing, layout expression, motion styling, visual emphasis, or visual state inside valid structure, CSS owns the fix.
JS may toggle valid state, but it may not become a styling workaround engine.

### 2.5 Worker priority rule
If the problem is public URL normalization, redirects, rewrites, canonical edge discipline, cache policy, or release/drift guard, Worker owns the fix.
JS may react to route truth, but it may not invent a competing route model.

---

## 3. Boot and Lifecycle Law

### 3.1 Boot restraint
Boot code must stay minimal, predictable, and explainable.
Boot may coordinate startup, but it may not silently hide architecture debt.

### 3.2 One-time initialization rule
A one-time initializer must be truly one-time.
It must not rebind listeners, duplicate observers, duplicate timers, or duplicate state containers under repeated execution.

### 3.3 Re-init law
Any feature that must survive route transitions, DOM replacement, or partial navigation must support safe re-init.
Re-init must be:
- explicit
- idempotent
- bounded
- reversible where needed

### 3.4 DOMContentLoaded is not enough
A system that only works when initialized from `DOMContentLoaded` is not sufficient for app-like navigation.
If the product supports soft navigation, JS must define and honor a route-transition lifecycle beyond first document load.

### 3.5 Hard-refresh vs soft-navigation parity law
A route may not depend on full refresh to become functionally complete.

If detail toolbar, detail info sheet behavior, comments-panel behavior, TOC behavior, share behavior, or other core detail interaction appears only after hard refresh but fails after soft navigation, JS is architecturally wrong.

### 3.6 Cleanup law
Any module that attaches global listeners, observers, timers, or mutable runtime state must define cleanup or bounded persistence behavior.
Silent accumulation is invalid.

---

## 4. Module Loading and Execution Law

### 4.1 Explicit module ownership
Every significant JS module must have:
- one clear purpose
- one clear owner concern
- predictable init conditions
- predictable re-init conditions
- predictable cleanup expectations where relevant

### 4.2 No hidden side-effect architecture
A module may not require undocumented import order, incidental globals, or accidental execution timing to work.

### 4.3 Bucket-loading rule
If the codebase uses bucket loading or route-aware chunk activation, the activation contract must be explicit.
A bucket may not load merely because it happens to be present in a legacy path.

### 4.4 No duplicate init rule
A module may not initialize the same feature multiple times because several boot paths happen to touch it.
The module must guard against duplicate activation.

### 4.5 No ghost dependency rule
A module may not rely on DOM fragments, globals, or prior side effects that are not guaranteed by route truth or explicit boot contract.

### 4.6 Route-aware execution rule
If execution depends on render context or route surface, that dependency must be based on stable contract markers, not guesswork.

---

## 5. State and Event Discipline

### 5.1 Runtime state rule
Runtime state must be scoped, explainable, and resettable where relevant.
JS may not accumulate stale route state as silent architecture.

### 5.2 No random global rule
Ad hoc globals are forbidden as architecture.
If shared runtime state is necessary, it must be documented, intentionally named, and bounded.

### 5.3 Event naming law
Machine-facing custom events must follow the master naming law.
Use `gg:*` for contract events where project-level events are introduced.

### 5.4 Event duplication ban
A route transition must not produce stacked listeners for the same interaction because re-init was careless.

### 5.5 Stale-state ban
A feature may not display old route data, old article metadata, old TOC entries, or old comments state after navigation because cleanup or refresh logic was weak.

### 5.6 Cross-module restraint
Modules may communicate through documented contracts.
They may not become entangled through implicit knowledge of each other’s private state.

---

## 6. Selector, Naming, and Contract Discipline

### 6.1 Naming inheritance
JS must inherit the master naming law for:
- machine-facing identifiers
- events
- storage keys
- runtime registries
- internal state markers
- migration adapters touching internal contracts

### 6.2 Contract selector rule
JS may consume stable contract selectors from XML and docs.
It may not invent shadow dialects for the same job.

### 6.3 No brittle selector dependence
JS may not depend on fragile incidental DOM structure when a stable contract selector or `data-gg-*` marker should exist.

### 6.4 Legacy bridge rule
Legacy selectors or names may be consumed temporarily only if:
- they are documented as legacy
- the replacement is named
- cleanup intent is explicit
- parity verification exists

### 6.5 Semantic honesty rule
JS may not preserve misleading semantics merely because a legacy attribute is convenient.
A misleading internal name remains debt, not architecture.

---

## 7. Progressive Enhancement and Route Parity Law

### 7.1 Progressive enhancement rule
JS enhances route experience; it may not create core route meaning from nothing.

### 7.2 Core-host rule
If a feature is core route chrome for a surface, its host must already exist from XML where required.
Examples include:
- `gg-detail-toolbar`
- `gg-detail-info-sheet`
- `gg-comments-panel`
- `gg-toc`
- `gg-share-sheet` host contract
- `gg-dock` host contract

JS may activate, populate, and coordinate these features.
JS may not be their permanent structural substitute.

### 7.3 Soft-navigation parity rule
Soft navigation must not rely on a weaker DOM contract, weaker data contract, or weaker initialization path than the same route under hard refresh.

### 7.4 No fake SPA rule
App-like feel is invalid if it depends on partial navigation that drops core detail behavior, breaks focus continuity, or leaves route chrome half-initialized.

### 7.5 Fallback honesty rule
If a feature cannot be guaranteed under soft navigation, that weakness must be treated as debt to be fixed, not hidden behind reload-only success.

---

## 8. Performance and Runtime Discipline

### 8.1 Runtime restraint
JS may not purchase premium feel with uncontrolled listeners, heavy polling, unnecessary mutation loops, excessive observers, or repeated DOM work.

### 8.2 Main-thread honesty rule
Expensive work must be justified.
A feature may not block interaction merely because orchestration was lazy.

### 8.3 On-demand rule
If a feature is non-critical to first meaning, it is a candidate for delayed activation, idle work, or on-demand loading.

### 8.4 Reduced-motion respect
Behavior that creates motion-heavy interaction must respect reduced-motion preferences where relevant.

### 8.5 No enhancement cargo cult
JS complexity is invalid when it adds moving parts without measurable UX gain.

---

## 9. Observability and Debug Discipline

### 9.1 Allowed observability
JS may expose controlled diagnostics, timings, feature flags, and development markers when properly scoped.

### 9.2 Debug restraint
Debug logic may not leak noisy behavior, unstable UI, or trust-eroding artifacts into production experience.

### 9.3 Dev-only cleanup rule
Development helpers, test toggles, and diagnostics must be isolated so they do not silently become runtime architecture.

---

## 10. Migration Rules

### 10.1 Migration by ownership boundary
Refactor JS by concern and ownership boundary, not by random patch clusters.

### 10.2 No silent alias permanence
Legacy behavior bridges may survive temporarily, but they may not become permanent simply because nothing visibly exploded yet.

### 10.3 Naming migration rule
When a family or contract name changes, JS hooks, XML hooks, tests, docs, and relevant CSS state usage must be updated through controlled migration.

### 10.4 Runtime bridge honesty
If JS temporarily adapts between old and new contracts, the bridge must be named as bridge behavior, not disguised as final architecture.

---

## 11. JS Audit Minimum Contract

Any serious JS audit must check, at minimum:
1. boot order clarity
2. idempotent re-init safety
3. no duplicate listener drift
4. no stale state after route transition
5. route-aware module activation clarity
6. selector and naming-law compliance
7. no XML ownership theft
8. no CSS ownership theft
9. hard-refresh vs soft-navigation parity
10. comments/detail-toolbar/detail-info-sheet/TOC/share/dock behavior where relevant
11. no unjustified main-thread or repeated DOM work
12. cleanup and rollback clarity for risky behavior

If a JS audit ignores lifecycle or ownership law, it is incomplete.

---

## 12. JS Verify Minimum Contract

Any JS patch that affects boot, navigation, module loading, selectors, state, or route behavior must verify, at minimum:
1. no duplicate init under repeated execution
2. route transition behavior remains intact
3. hard refresh and soft navigation reach equivalent route truth
4. listing → post detail behavior remains intact
5. comments/detail-toolbar/detail-info-sheet/TOC/share/dock behavior survives re-init where relevant
6. no stale state appears after route change
7. selector contract remains aligned with XML, CSS, tests, and docs
8. no visual workaround is being used as substitute for CSS or XML ownership
9. no unjustified runtime cost or repeated DOM work is introduced
10. rollback is clear when risk is medium or high

“Works after reload” is not verification.

---

## 13. Required Output Format for AI/CODEX

Every JS patch proposal must include:
- Objective
- Route Impact
- Render Context Impact
- Modules changed
- Init/Re-init Impact
- State/Event Impact
- Selector Contract Impact
- XML Ownership Risk
- CSS Ownership Risk
- Worker Coordination Risk
- Rollback Note when risk is medium or high
- Verify list

---

## 14. JS Rejection Triggers

Reject a JS patch if it:
- creates route truth that conflicts with XML or Worker law
- makes hard refresh the only path to correct behavior
- introduces duplicate init or duplicate listeners
- depends on brittle incidental DOM instead of stable contracts
- preserves legacy naming as active architecture
- creates hidden globals as architecture
- uses JS to fake missing XML-owned structure
- uses JS to patch visual truth that belongs to CSS
- increases runtime complexity without clear product value
- creates stale state or route confusion after navigation
- adds opaque side-effect ordering that AI cannot safely reason about

---

## 15. Closing Rule

JS becomes high-end not by becoming more magical, but by becoming more disciplined:
- explicit boot
- safe re-init
- bounded state
- stable contracts
- route parity
- honest enhancement
- no hidden second architecture
- understandable by a small operator using AI