# GG RULES OF WORKER
**Status:** Binding Worker law under `gg_master.md`  
**Role:** Operational law for Cloudflare Worker ownership, edge routing, headers, cache, narrow HTML rewrites, release guards, and Worker-side AI discipline.

---

## 0. Authority and Scope

### 0.1 Authority
This document is subordinate to `gg_master.md`.
It may specialize Worker behavior, but it may not rewrite master-level law.

### 0.2 Scope
This document governs:
- public URL handling at the edge
- redirects and rewrites
- canonical edge discipline
- cache policy and response class discipline
- security headers and CSP mode discipline
- release, fingerprint, and drift guards
- observability and edge-safe diagnostics
- narrow HTML rewrite rules
- Worker-side patch acceptance and rejection

### 0.3 Worker constitutional rule
The Worker is an edge governor, not a second template system.

The Worker may:
- normalize public URLs
- protect canonical behavior
- enforce edge policy
- harden response behavior
- repair narrow edge-safe defects
- provide controlled fail-safe behavior

The Worker may not:
- become the primary author of render-context truth
- become the permanent owner of SSR structure
- become the long-term home of component migration
- become the hidden UI architecture behind XML

---

## 1. Definition of 10/10 Worker

The Worker is 10/10 only if all conditions below are true:
1. It makes public routes feel cleaner, faster, safer, and more intentional.
2. It strengthens trust without introducing opaque behavior.
3. It reduces drift rather than creating a second structural brain.
4. It respects XML ownership of SSR structure and render-context truth.
5. It respects CSS ownership of presentation.
6. It keeps HTML rewrites narrow, explainable, and reversible.
7. It improves release safety, cache safety, and canonical safety.
8. It does not create route inconsistency between hard refresh and soft navigation.
9. It remains maintainable by a small operator using AI.
10. It does not become a god file that quietly absorbs unrelated responsibilities.

If one of the above fails, the Worker is not 10/10.

---

## 2. Ownership Law

### 2.1 Worker owns
The Worker owns:
- public URL handling
- redirects and rewrite routing
- canonical path discipline
- tracking-parameter stripping
- security headers
- cache policy
- asset policy at the edge
- release/fingerprint/drift guards
- observability endpoints
- narrow HTML rewrites allowed by this document

### 2.2 Worker does not own
The Worker does not own:
- long-term render-context truth
- family ownership truth
- primary SSR shell authorship
- component placement that belongs in XML
- visual layout truth
- UI state design that belongs in JS
- naming migration as permanent architecture

### 2.3 XML priority rule
If the problem is about:
- whether a block should exist
- where it should live in SSR
- which surface owns it
- which host should exist by default
- what the detail shell fundamentally contains

then XML must own the fix.

The Worker may provide temporary fail-safe protection, but it may not become the final solution to XML-owned structure.

### 2.4 CSS priority rule
If the problem is spacing, sizing, alignment, emphasis, motion, or visual state inside valid structure, CSS owns the fix.
The Worker may not rewrite HTML merely to patch a visual problem.

### 2.5 JS priority rule
If the problem is route transition lifecycle, module binding, soft-navigation re-init, enhancement timing, or runtime orchestration, JS owns the fix.
The Worker may not be used to excuse broken client-side lifecycle.

---

## 3. Route and Surface Discipline

### 3.1 Worker route role
The Worker may normalize route surfaces such as:
- `/`
- `/blog` if retained
- `/landing`
- `/offline`
- `/404`
- safe special routes

### 3.2 Route normalization rule
The Worker may normalize route intent and remove illegal or noisy URL variants.
It may not invent a parallel route model that conflicts with `gg_master.md`.

### 3.3 Surface-correction restraint
The Worker may provide narrow surface correction when needed for:
- canonical route cleanliness
- release-safe temporary routing
- edge-safe fallback
- emergency defect containment

It may not become the default author of listing, landing, post, or page structure.

### 3.4 Hard-refresh vs soft-navigation parity law
The Worker must not become the reason that a route works only on hard refresh.

If a detail toolbar, detail info sheet, comments panel, TOC host, or other core detail infrastructure exists only after hard refresh but disappears on soft navigation, the system is architecturally wrong.

That failure must be treated as:
- XML ownership gap, and/or
- JS route-lifecycle gap

not as a success of Worker cleverness.

---

## 4. HTML Rewrite Law

### 4.1 Allowed HTML rewrites
The Worker may perform narrow HTML rewrites for:
- canonical URL correction
- head/meta cleanup
- OG/Twitter/canonical normalization
- schema-safe URL cleanup
- asset reference normalization
- release/fingerprint markers
- thin route-surface markers
- emergency containment of known invalid blocks
- safe insertion of tiny fail-safe hosts when explicitly justified
- removal of foreign SSR cargo from alias or normalized route surfaces, when done as narrow edge cleanup and not as permanent UI authorship

### 4.2 Allowed temporary fail-safe rewrites
Temporary fail-safe rewrites are allowed only if all conditions below are true:
1. the XML-side fix is not yet safely deployed
2. the rewrite prevents an actual public defect
3. the rewrite is small and explainable
4. rollback is possible
5. cleanup intent is explicit
6. verification exists

### 4.3 Forbidden HTML rewrites
The Worker may not:
- become the permanent author of `gg-detail-toolbar`
- become the permanent author of `gg-detail-info-sheet`
- become the permanent author of `gg-comments-panel`
- become the permanent author of `gg-toc`
- perform large-scale family migration by edge patch
- compose full route shells that XML should own
- preserve legacy family names as edge architecture
- create route correctness by hiding structural drift indefinitely

### 4.4 HTMLRewriter restraint rule
`HTMLRewriter` is an edge scalpel, not a second templating engine.

Using `HTMLRewriter` for `/` or `/landing` is allowed when it improves canonical route discipline and thin fail-safe cleanup.
Using it to permanently author UI structure that should live in XML is invalid.

---

## 5. Cache and Response Class Law

### 5.1 Cache policy ownership
The Worker owns cache policy for:
- versioned static assets
- latest assets
- HTML route classes
- Service Worker file
- manifest
- offline assets
- diagnostic endpoints where applicable

### 5.2 Response class discipline
Every meaningful response should belong to an explicit class, such as:
- immutable versioned asset
- mutable latest asset
- HTML route response
- no-store sensitive response
- diagnostic response
- report endpoint response

### 5.3 No-store restraint
`no-store` is allowed when correctness truly requires it.
It is not allowed as lazy architecture.

If a route remains `no-store` only because the system cannot guarantee parity, drift safety, or correct invalidation, that weakness must be documented as debt.

### 5.4 HTML cache honesty rule
The Worker may not claim performance ambition while forcing unnecessary repeated HTML work on every request without measured reason.

### 5.5 Versioned asset law
Versioned assets should be aggressively cacheable and treated as immutable.
Latest-alias convenience must not weaken versioned cache truth.

---

## 6. Security and Trust Law

### 6.1 Security ownership
The Worker owns edge security headers and related response hardening.

### 6.2 Trust rule
Security behavior must increase user trust without causing broken primary experience.

### 6.3 CSP mode rule
`report-only` is allowed during investigation, migration, or staged hardening.
It may not be mislabeled as final security completion.

### 6.4 Header discipline
Header policy must be:
- deliberate
- minimal where possible
- consistent by response class
- documented when route-specific

### 6.5 No fake confidence rule
The Worker may not simulate safety through decorative headers while leaving core route behavior inconsistent.

---

## 7. Release, Drift, and Contract Guards

### 7.1 Release guard ownership
The Worker may validate:
- template fingerprint presence
- expected environment markers
- expected release markers
- allowed-release windows
- boot asset presence
- contract marker presence

### 7.2 Drift law
The Worker may degrade, warn, bypass, or contain based on documented drift policy.
It may not silently mask severe contract drift and pretend the system is healthy.

### 7.3 Fail-safe honesty rule
A fail-safe mode must remain obviously defensive in governance logic.
It must not quietly become permanent architecture.

---

## 8. Observability Law

### 8.1 Allowed observability
The Worker may expose:
- telemetry endpoints
- CSP reporting endpoints
- health or contract diagnostics
- release/debug markers under controlled access or controlled output

### 8.2 Observability restraint
Observability must not leak implementation chaos into the public experience.
Debugging convenience is not permission to weaken product trust.

---

## 9. Modularity and Maintainability Law

### 9.1 God-file warning
A Worker file that mixes routing, headers, cache, release policy, HTML surgery, route-specific UI behavior, diagnostics, and asset policy without clear internal boundaries is high-risk.

### 9.2 Required internal separation
Even when shipped as one Worker entrypoint, logic should be separable by concern:
- routing/canonical
- headers/security
- cache/asset policy
- release/drift guards
- observability
- HTML rewrite helpers by narrow purpose

### 9.3 AI maintainability rule
The Worker must stay readable enough that AI can patch one concern without accidentally changing another concern.

### 9.4 Anti-shortcut rule
The Worker may not become the preferred place to solve every hard problem merely because edge patching feels faster than XML or JS repair.

---

## 10. Naming and Contract Discipline

### 10.1 Naming inheritance
Worker-side identifiers, diagnostics, flags, and edge contracts must follow the GG naming law where machine-facing internal naming is introduced.

### 10.2 No legacy cementing
The Worker may bridge legacy names temporarily.
It may not cement them as permanent edge truth.

### 10.3 Contract stability rule
If the Worker depends on:
- `data-gg-*` markers
- host IDs
- release markers
- fingerprint carriers
- boot markers
- contract selectors

then those dependencies must be explicit, documented, and verified.

---

## 11. Worker Audit Minimum Contract

Any serious Worker audit must check, at minimum:
1. route normalization correctness
2. canonical integrity
3. HTML rewrite scope restraint
4. no XML ownership theft
5. no CSS ownership theft
6. no hard-refresh/soft-navigation parity break introduced by Worker assumptions
7. cache policy correctness
8. security header correctness
9. release/drift guard correctness
10. naming and contract stability
11. response-class consistency
12. rollback clarity for risky changes

If a Worker audit ignores ownership law, it is incomplete.

---

## 12. Worker Verify Minimum Contract

Any Worker patch that affects routing, headers, cache, HTML rewriting, release guards, or route behavior must verify, at minimum:
1. `/` works as intended
2. `/landing` works as intended
3. listing → post detail behavior remains intact
4. hard refresh and soft navigation reach equivalent route truth
5. canonical/meta/head output remains correct
6. no wrong-surface structural dependency is introduced
7. cache headers match response class intent
8. release/fingerprint logic still behaves correctly
9. comments/detail-toolbar/detail-info-sheet/TOC are not made edge-dependent as final architecture
10. no unjustified latency or repeated transform cost is introduced
11. Soft-navigation fetch paths must not rely on a weaker or structurally different response contract than full-document navigation for the same route truth

“Works on hard refresh” is not verification.

---

## 13. Required Output Format for AI/CODEX

Every Worker patch proposal must include:
- Objective
- Route Impact
- Response Classes Affected
- HTML Rewrite Impact
- Cache Impact
- Header/Security Impact
- Release/Drift Impact
- XML Ownership Risk
- JS Lifecycle Risk
- Rollback Note when risk is medium or high
- Verify list

---

## 14. Worker Rejection Triggers

Reject a Worker patch if it:
- turns the Worker into permanent UI author for XML-owned structure
- makes hard refresh the only path to route correctness
- uses edge rewrites to hide long-term render-context mistakes
- keeps legacy names alive as edge truth
- weakens canonical integrity
- adds no-store lazily instead of solving invalidation logic
- increases route complexity without measurable product value
- creates opaque edge behavior that AI cannot safely reason about
- mixes concerns in ways that raise god-file risk
- solves a JS lifecycle problem by pretending the Worker fixed it

---

## 15. Closing Rule

The Worker becomes high-end not by becoming more magical, but by becoming more disciplined:
- strong on edge truth
- weak on UI authorship
- narrow in rewrite scope
- explicit in cache policy
- honest in release guards
- aligned with XML ownership
- aligned with JS lifecycle reality
- understandable by a small operator using AI