# TASK-P2.TEMPLATE.FINAL.10X.REVISION — GG TEMPLATE FINAL RELEASE FREEZE + COPY EXIT 10/10

## Status
This task supersedes and replaces:
- `TASK-P2.TEMPLATE.FINAL.10X`

It also assumes:
- copy registry scripts are already embedded
- `TASK-P1.COPY.MASTER.10X` and `TASK-P1.COPY.CLOSURE.10X` have already been executed
- current work must remain compatibility-first, rollback-safe, and Blogger-aware

This revision adds one hard rule:
**the template is NOT considered final unless the copy layer exits at 10/10 discipline in the touched scope.**

---

## Core objective
Freeze the GG Blogger template as a final public-release product by hardening:

1. route/surface correctness
2. classifier SSOT
3. HTML/XML validity and semantics
4. naming and hook discipline
5. mixed-media contract
6. landing correctness
7. comments/search/share safety
8. SEO/schema/machine readability
9. performance safety
10. copy layer completeness and consistency

This is a final-release hardening task.
This is not a cosmetic redesign task.

---

## Non-negotiable outcome
After this task, the template must be fit for public presentation and release-hardening review.

That means:

- `/` behaves as listing
- `/landing` behaves as a real landing surface
- post/page/special/error/offline surfaces behave intentionally
- route meaning no longer drifts between XML branches
- invalid HTML patterns are removed in touched scope
- mixed media obeys final product intent
- comments remain intact
- search/palette contract is complete
- schema and metadata are final-grade enough for release
- copy layer is no longer treated as “already good enough”

### New mandatory rule
**P2 is not allowed to leave copy debt behind in touched scope.**
Any touched or affected surface must leave this task with copy layer at release-grade discipline.

---

## Official surface matrix to freeze
Use this as law:

- `/` → `listing`
- `/landing` → `landing`
- post route (`/YYYY/MM/slug.html`) → `post`
- `page utility` → `page`
- `page special` (`Portfolio`, `Library`, `Store`, `Tags`, `Sitemap`) → `special`
- `/404` → `error`
- `/offline` → `offline`

No accidental first-class surface behavior outside this matrix.

---

## What this task includes
### A. Route / classifier freeze
- create one SSOT for route/surface/page/view/special-kind
- remove classifier drift between body/main/render branches
- make `/landing` a true route-correct surface
- make `/` the true listing surface
- prevent cross-surface leakage

### B. HTML/XML hardening
- remove invalid markup in touched scope
- remove nested interactive patterns
- remove duplicate IDs in touched scope
- complete missing ARIA contracts
- finalize `gg-palette-list` and combobox/listbox contract
- normalize touched SVG/icon markup
- stabilize public anchors where required

### C. Naming / hook freeze
- freeze `data-gg-*` as primary hook system
- remove legacy hook duality where safe
- migrate remaining touched legacy hooks to `data-gg-*`
- keep controlled Blogger duplication only when necessary and documented

### D. Mixed-media finalization
- make mixed media obey final listing/discovery contract
- visible-first where product requires visibility
- preserve current behavior where not explicitly redesigned
- remove contradictions between XML contract and intended product behavior
- ensure mixed-media visible labels are registry-driven

### E. Landing finalization
- make `/landing` render correctly and intentionally
- keep CTA path clear
- keep landing fast and campaign-safe
- prevent blog/listing leakage into landing
- prevent landing leakage into other surfaces
- finalize landmarks only after render correctness is fixed

### F. Comments / search / share hardening
- protect Blogger comments
- harden GG wrapper layer
- finalize search/palette semantics and safety
- finalize share behavior and fallback safety
- preserve keyboard and focus behavior

### G. SEO / metadata / schema hardening
- complete surface-appropriate schema
- improve BlogPosting/Page/WebPage quality where justified
- ensure canonical/indexability safety
- ensure noindex logic for error/offline where appropriate
- improve machine-readable parity with visible IA

### H. Release-grade verification
- verify routes
- verify accessibility
- verify comments/search/share
- verify performance impact
- verify schema/indexability
- verify copy layer exit gate

---

## New section: COPY LAYER MUST EXIT 10/10
This is mandatory in this revised task.

### Principle
P2 is not allowed to treat copy as a secondary concern.
Any surface or component touched by this task must exit with production-grade copy discipline.

### Copy layer 10/10 means all of the following in touched scope
1. no GG-controlled visible label relies primarily on raw hardcoded literals
2. all GG-controlled public UI copy in touched scope is registry-driven
3. EN fallback remains in markup
4. no raw registry key is visible to users
5. no duplicate copy source exists for the same UI intent
6. no branded GG product UI uses native `alert/confirm/prompt`
7. no remaining old `data-lang-code` in touched scope
8. no touched visible mixed-media label remains literal-only
9. no touched panel/editorial/system label remains literal-only
10. search/share/comments/runtime statuses in touched scope resolve from registry or intentional native passthrough
11. EN/ID key parity passes
12. placeholder/interpolation parity passes
13. no public UI copy is hidden in CSS `content:` in touched scope
14. no runtime string literal remains in touched JS paths where registry should own it
15. all touched aria-label/title/placeholder copy is registry-backed where GG owns it

### Copy owner model
Every string in touched scope must belong to exactly one owner:
- `registry`
- `native-blogger`
- `native-browser`
- `editorial-content`

No ownership ambiguity is allowed.

---

## What this task explicitly does NOT include
Do not expand into speculative redesign.

Not included unless directly required by acceptance:
- total CSS redesign
- total JS framework rewrite
- content/editorial rewriting
- worker/platform rewrite
- speculative component system replacement
- Blogger comments replacement
- unrelated visual polish work

---

## Touched files (expected)
Primary:
- `index.prod.xml`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`

Secondary / QA:
- existing verify scripts
- add/update template/copy validators if needed
- `package.json` only if verify wiring is necessary

Do not create noisy architecture sprawl.

---

## Mandatory execution phases

### PHASE 0 — MAP CURRENT REALITY
Before destructive edits:
1. inventory current surface/render branches
2. inventory classifier outputs
3. inventory touched mixed-media behavior
4. inventory touched panel/system labels
5. inventory remaining invalid markup / duplicate IDs / broken ARIA / icon issues
6. inventory touched schema output
7. inventory touched copy ownership:
   - registry
   - native-blogger
   - native-browser
   - editorial-content

No guessing.
No blind rewrite.

---

### PHASE 1 — FREEZE ROUTE / SURFACE SSOT
Must produce stable outputs for:
- `data-gg-surface`
- `data-gg-page`
- `data-gg-view`
- `data-gg-special` if needed
- `data-gg-home-state` only if still justified

Requirements:
- no duplicate ternary logic that can drift
- `/landing` must render intentionally
- `/` must render intentionally
- core route meaning must not depend on fragile post-init JS

Acceptance:
- body/main/root branch all agree on final surface identity

---

### PHASE 2 — HTML/XML STRUCTURAL SANITY
Must fix in touched scope:
- invalid nested interactive markup
- duplicate IDs
- broken/missing ARIA contracts
- missing `gg-palette-list`
- required icon reference problems
- malformed or inconsistent touched SVG usage
- empty meaningless landmarks where touched
- broken public-anchor behavior where touched

Do not cause visual regressions casually.

---

### PHASE 3 — HOOK / NAMING FREEZE
Must:
- freeze `data-gg-*` as primary contract
- migrate remaining touched legacy hooks
- remove unsafe duality where safe
- document controlled sync-pair duplication where Blogger requires it
- preserve compatibility where removal is risky, but document it

No new naming dialects.

---

### PHASE 4 — MIXED-MEDIA FINAL CONTRACT
Must:
- make listing mixed media obey product intent
- visible-first where the product requires it
- preserve existing behavior where not explicitly redesigned
- ensure visible labels and actions are registry-driven
- ensure no root-level contradiction remains between intended product behavior and XML structure in touched scope

Do not hide required mixed media again through hacks.

---

### PHASE 5 — LANDING FINALIZATION
Must:
- fix `/landing` route/render correctness
- keep CTA path explicit
- keep landing fast and campaign-ready
- finalize landmarks after render correctness
- ensure `#contact` or equivalent anchor behavior works as intended
- prevent listing/blog leakage into landing
- prevent landing leakage into non-landing surfaces

---

### PHASE 6 — COMMENTS / SEARCH / SHARE SAFETY
#### Comments
Must preserve:
- render
- form
- focus order
- reply/delete exposure
- panel ownership
- no console errors

#### Search / palette
Must preserve and finalize:
- keyboard path
- combobox/listbox semantics
- labels/placeholders
- `gg-palette-list`
- no stale ARIA references

#### Share
Must preserve:
- share flow
- copy-link flow
- correct icon references
- branded GG UI path for user-facing feedback where applicable

---

### PHASE 7 — SEO / SCHEMA / MACHINE READABILITY
Must improve to final-release discipline:
- BlogPosting completeness
- Page/WebPage handling
- dateModified where justified
- description where justified
- organization/logo handling where appropriate
- canonical/noindex safety
- visible IA vs machine-readable IA consistency where practical

Do not add meaningless schema noise.

---

### PHASE 8 — COPY EXIT GATE
This phase is mandatory and cannot be skipped.

#### Audit all touched scope for:
- remaining raw visible literals owned by GG
- remaining legacy copy hooks
- remaining JS string literals in GG-owned UI paths
- remaining CSS public copy in `content:`
- missing registry backing for touched labels
- missing EN/ID parity
- missing placeholder parity
- raw key exposure risk
- native browser prompt misuse in active GG path

#### Required action
Any touched copy leak found in this phase must be fixed before task acceptance.

No “good enough” exit.

---

### PHASE 9 — FINAL QA / READINESS GATE
Run and document verification for:
- route behavior
- surface integrity
- keyboard path
- focus behavior
- comments safety
- search/palette safety
- share safety
- copy/i18n correctness
- schema/indexability
- performance impact
- rollback readiness

---

## Required acceptance criteria
Task is accepted only if ALL are true.

### Surface integrity
- `/` behaves as listing
- `/landing` behaves as landing
- post behaves as post
- page behaves as page
- special pages behave intentionally
- `/404` is recovery-first
- `/offline` is recovery-suitable

### Structural correctness
- no nested interactive invalid markup in touched scope
- no duplicate IDs in touched scope
- no broken palette/search ARIA contract
- no broken required icon references
- no empty meaningless landmark left in touched final scope
- no classifier drift in touched route logic

### Naming / hook correctness
- `data-gg-*` is primary
- `data-gg-lang-code` is the only active language hook in touched scope
- controlled duplication is documented
- no undocumented legacy naming dialect remains in touched scope

### Mixed media
- required mixed media behaves according to product intent
- touched visible labels/actions are registry-driven
- no touched root-level contradiction remains

### Comments / search / share
- comments smoke passes
- search/palette smoke passes
- share smoke passes
- no new console errors in touched flows

### SEO / schema
- canonical/indexability remains intact
- touched schema is valid and surface-appropriate
- no schema contradiction introduced

### Performance / trust
- no meaningful performance cliff
- no deceptive failure path
- no fragile JS dependency for core route meaning

### COPY EXIT 10/10
All of these must be true in touched scope:
- registry-backed copy ownership is clear
- no GG-controlled visible raw literals remain as primary source
- EN fallback remains intact
- no raw key appears in UI
- no duplicate copy source remains for same touched UI intent
- no branded GG active path uses native `alert/confirm/prompt`
- no remaining touched `data-lang-code`
- no touched visible mixed-media label remains literal-only
- no touched visible panel/editorial/system label remains literal-only
- touched share/comments/search/runtime statuses are registry-driven or intentional native passthrough
- EN/ID key parity passes
- placeholder/interpolation parity passes
- no touched public UI copy lives in CSS `content:`
- no touched GG-owned JS runtime path carries final user-facing literals unnecessarily

### Operational safety
- changes are scoped
- changes are testable
- rollback note exists
- verification evidence exists

---

## Verification steps Codex must run
Minimum:
1. verify route/render branch correctness for `/`, `/landing`, post, page, special, error, offline
2. grep for remaining invalid nested interactive patterns in touched scope
3. grep for duplicate IDs in touched scope where feasible
4. grep for remaining `data-lang-code`
5. grep for touched legacy hook variants still competing with `data-gg-*`
6. verify `gg-palette-list`
7. verify required share/social icons exist and are mapped correctly
8. verify mixed-media touched roots/actions/labels
9. verify comments smoke conditions structurally
10. verify schema outputs by surface
11. verify copy EN/ID parity
12. verify placeholder/interpolation parity
13. grep touched JS for user-facing string literals that should now be registry-owned
14. grep touched CSS for public copy in `content:`
15. verify no active branded GG path uses `alert(` / `confirm(` / `prompt(`
16. run existing verify/smoke scripts where available
17. report deferred risks explicitly

---

## Output shape required from Codex
Codex must return:
1. objective
2. touched files
3. assumptions
4. risks
5. fixed zones
6. deferred zones
7. verification steps run
8. acceptance status by category
9. explicit COPY EXIT 10/10 status
10. rollback note

No vague success claim.

---

## Strong rejection criteria
Reject any output that:
- treats copy as “already handled elsewhere”
- leaves `/landing` unresolved
- leaves mixed media contradicted while claiming final readiness
- breaks comments/search/share
- invents a new naming dialect
- leaves touched GG copy as raw literals while claiming copy completion
- leaves touched JS string literals that bypass registry
- leaves touched CSS public copy in `content:`
- claims 10/10 without verification evidence
- removes rollback safety
- expands into chaotic rewrite beyond scope

---

## Rollback plan
If regressions appear in:
- route rendering
- landing
- listing mixed media
- comments
- search/palette
- share
- copy fallback
- performance
- schema/indexability

rollback must be possible by reverting the patch commit.
No rollback may require emergency redesign.

---

## Final instruction
This is a contract-freeze and release-hardening task.

The template is not accepted as final merely because it works.
It is accepted as final only when:
- structure is trustworthy,
- routes are correct,
- machine/human readability are aligned,
- and the touched copy layer exits with 10/10 discipline.

# TASK-P2.TEMPLATE.FINAL.10X.CLOSURE — GG FINAL RELEASE CLOSURE (LAST 5 BLOCKERS ONLY)

## Status
This task is a narrow closure task.
It runs only after `TASK-P2.TEMPLATE.FINAL.10X.REVISION`.

Purpose:
close the remaining blockers that still prevent the GG Blogger template from being honestly called final-release-ready.

This is not a redesign.
This is not another broad refactor.
This is a targeted final closure patch.

---

## Core objective
Close the last 5 material blockers still alive in the latest template state:

1. `/landing` is still not fully route-correct and still tied too closely to homepage conditional logic
2. mixed-media root contract is still hidden-first where product intent requires visible-first discovery
3. special pages (`Tags`, `Sitemap`, and related special utility surfaces) are not yet copy-clean and final enough in touched scope
4. schema / metadata / robots contract is still not consistent enough for final-release quality
5. final acceptance is still being claimed too loosely

After this task, the template must be able to survive a serious final public presentation review without obvious architectural embarrassment.

---

## What this task includes

### A. Landing route/render closure
Make `/landing` a real first-class landing surface.

Must:
- stop relying on fragile homepage-only conditional behavior as the practical source of truth
- ensure `/landing` has an intentional render path
- ensure `/` remains listing
- ensure landing-specific content does not leak into listing/post/page/special surfaces
- ensure listing/blog content does not leak into landing
- preserve current CTA/contact anchor behavior

Acceptance:
- landing route meaning is explicit and stable
- route meaning is not dependent on accidental homepage semantics

---

### B. Mixed-media root contract closure
Mixed media is part of listing discovery and must stop contradicting that intent.

Must:
- review all first-class mixed-media root sections on listing
- remove root-level hidden-first contradiction where product intent requires visible-first presence
- keep placeholders/subparts hidden only where appropriate
- preserve current feed/render behavior
- preserve current CSS/JS behavior as much as possible
- keep visible labels registry-backed

At minimum review:
- featured strip
- newsdeck
- youtube rail
- shorts rail
- podcast rail
- bookish rail

Acceptance:
- no required listing mixed-media root remains hidden purely as legacy contradiction
- listing behaves like a real mixed-media discovery surface

---

### C. Special pages finalization (touched scope)
Close the copy/UX contract for special pages touched by this task.

Priority surfaces:
- `/p/tags.html`
- `/p/sitemap.html`

Must:
- ensure visible GG-controlled labels are registry-backed
- ensure placeholders / aria labels / filter labels are registry-backed
- ensure no raw literal is left as primary source in touched scope
- preserve EN fallback in markup
- preserve current search/filter/load-more behavior
- preserve current CSS hooks

Examples of copy that must be registry-owned in touched scope:
- Tags
- description text
- Sort
- Newest / Oldest
- Search sitemap
- Reset
- All
- All years
- All months
- All labels
- Load more
- title-sort options
- any visible special-page utility control labels in touched scope

Acceptance:
- touched special surfaces exit with copy layer 10/10 discipline

---

### D. Schema / metadata / robots closure
Raise machine-readable quality to honest final-release grade.

Must review and fix where justified:
- BlogPosting completeness:
  - `dateModified`
  - `description`
- Organization completeness:
  - `logo` if part of final contract
- WebPage / special page handling where needed
- canonical/indexability rules
- explicit `noindex` handling for `error` and `offline` where appropriate
- visible IA vs machine-readable IA consistency where practical

Do not add schema noise.
Add only what makes the contract clearer and more trustworthy.

Acceptance:
- schema/metadata no longer feel half-finished
- error/offline indexing posture is intentional
- post schema is not obviously missing critical expected fields

---

### E. Final acceptance tightening
This task must explicitly close the honesty gap between “works” and “final.”

Must:
- remove any remaining touched-scope claim inflation
- verify only against actual current artifacts
- fail honestly if any of the 5 blocker families remain open
- document deferred items explicitly if anything still survives

---

## What this task does NOT include
Do not expand into:
- full visual redesign
- complete copy rewrite outside touched closure scope
- service worker redesign
- Cloudflare Worker redesign
- total JS modular rewrite
- unrelated page copy polish
- replacing Blogger comments
- speculative performance experiments

This is a last-mile closure task only.

---

## Touched files (expected)

Primary:
- `index.prod.xml`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`

Secondary / QA:
- copy verify script if special-page keys need parity extension
- one schema/route verifier if current scripts do not cover these blockers

Do not touch CSS unless a minimal compatibility adjustment is truly required.

---

## Execution phases

### PHASE 0 — Map only the remaining 5 blockers
Before editing:
- confirm exact `/landing` render branch
- confirm exact mixed-media roots still hidden
- confirm exact special pages labels still literal
- confirm exact schema/robots gaps
- confirm touched runtime dependencies

No broad audit again.
No reopening already closed areas.

---

### PHASE 1 — Landing closure
Fix `/landing` route/render correctness first.

Must:
- make route meaning explicit
- keep `/` as listing
- keep anchors and CTA paths intact
- keep landing isolated from blog/listing leakage

Do not:
- casually invent a new route model
- break existing homepage/listing behavior

---

### PHASE 2 — Mixed-media root visibility closure
Fix root-level contradiction next.

Must:
- remove root `hidden='hidden'` from mixed-media sections that are required to appear as listing discovery content
- keep internal placeholder items hidden where needed
- preserve runtime hooks and CSS hooks

Do not:
- redesign layout
- hide required sections again through new hacks
- remove feed hooks

---

### PHASE 3 — Special page copy closure
Fix `Tags` and `Sitemap` touched scope thoroughly.

Must:
- finish registry-backed visible labels
- finish registry-backed aria/placeholder labels
- finish registry-backed options/filter labels
- keep EN fallback
- keep current behavior

No “mostly done.”
It must exit cleanly.

---

### PHASE 4 — Schema / robots closure
Finalize machine-readable quality.

Must:
- add missing justified fields
- set error/offline robots/indexability posture intentionally
- avoid noise
- preserve canonical safety

---

### PHASE 5 — Final verification
Run verification only against these blockers.

Must verify:
- `/` vs `/landing` route behavior
- mixed-media required roots visible
- special pages copy registry parity
- schema completeness in touched scope
- noindex handling where intended
- no regressions to search/filter/load-more on special pages
- no new console errors from touched areas

---

## Acceptance criteria

This task passes only if ALL are true:

### Landing
- `/landing` is route-correct and intentional
- `/` remains listing
- no landing/blog leakage remains in touched logic
- no empty landmark regression remains in touched landing structure

### Mixed media
- required mixed-media roots on listing are no longer hidden-first contradictions
- visible mixed-media labels stay registry-backed
- no runtime regression is introduced

### Special pages
- `Tags` and `Sitemap` touched scope are copy-clean
- no touched visible GG-controlled label remains literal-only
- aria/placeholder/filter labels are registry-backed
- EN fallback remains intact

### Schema / robots
- BlogPosting touched schema is no longer obviously missing expected fields
- Organization/logo posture is intentional
- error/offline indexing posture is intentional
- no schema contradiction is introduced

### Safety
- no comments regression
- no search/palette regression
- no share regression
- no meaningful performance cliff
- rollback remains simple

---

## Verification steps Codex must run

Minimum:
1. verify landing render branch logic
2. verify `/` remains listing and `/landing` remains landing
3. grep listing mixed-media roots for remaining root `hidden='hidden'`
4. verify special tags/sitemap visible labels and controls are registry-backed
5. run `node qa/verify-copy-registry.mjs`
6. grep touched scope for remaining literal labels in special pages
7. inspect schema output for:
   - BlogPosting `dateModified`
   - BlogPosting `description`
   - Organization `logo` if chosen
8. verify intended robots posture for `error` / `offline`
9. run existing smoke/verify scripts available in repo
10. report any surviving deferred item explicitly

---

## Output shape required from Codex
Codex must return:
1. objective
2. touched files
3. assumptions
4. risks
5. exact blocker status before/after
6. verification steps run
7. acceptance result by blocker family
8. rollback note

No vague “final done” statement.

---

## Rollback plan
Rollback must be possible by reverting the closure patch commit.

If regressions appear in:
- landing
- listing
- mixed media
- tags/sitemap
- schema/indexability
- special-page filters/search
then revert the closure commit and stop.

---

## Strong rejection criteria
Reject any output that:
- leaves `/landing` effectively homepage-fragile
- leaves required mixed-media roots hidden-first
- leaves touched special-page labels literal-only
- claims schema closure without actual field completion
- invents new architecture outside scope
- breaks listing/search/comments/share
- claims final-release-ready without proving these 5 blockers are closed