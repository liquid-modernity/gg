# TASK-P1.COPY.MASTER.10X — GG MICROCOPY SYSTEM FREEZE (END-TO-END, SINGLE TASK, NO SPLIT)

## Status
This task supersedes and replaces any earlier copy/i18n migration task, including:
- TASK-P1.COPY.10X
- any partial registry-only migration
- any ad hoc copy cleanup patch

This is the single source of truth for the entire GG microcopy migration.

---

## Core objective
Freeze and migrate the entire GG microcopy system into a production-grade, compatibility-safe, bilingual EN/ID architecture that is:

1. centralized,
2. registry-driven,
3. XML-contract based,
4. runtime-resolved,
5. linted,
6. fallback-safe,
7. compatible with existing working CSS/JS,
8. safe for Blogger constraints,
9. safe for comments/share/search/mixed media,
10. ready to support final public-release quality.

This task covers the full microcopy layer only.
It must be executed as one coherent migration, not split into mini-patches.

---

## Non-negotiable outcome
After this task:
- GG-controlled public UI microcopy must no longer be scattered across XML, JS, or CSS
- all GG-controlled public microcopy must be mapped to the registry system
- XML must use the final copy attribute contract
- runtime must resolve copy from registry with EN/ID fallback
- language switching must refresh migrated copy without full rerender
- native browser prompts must not be used for branded product UI
- CSS/JS currently working must remain working
- comments/search/share/mixed media must not regress
- no second parallel copy engine may exist

---

## What this task explicitly includes
### A. Registry system
Use and operationalize the embedded registry scripts already inserted in XML:
- `gg-copy-manifest`
- `gg-copy-en`
- `gg-copy-id`
- `gg-copy-meta`

These become the formal copy system base.

### B. Full microcopy migration scope
All GG-controlled public microcopy in these zones is in scope:

1. global actions
2. lang switcher
3. navigation labels
4. dock labels
5. drawer/bottom-sheet labels
6. search labels / placeholders / empty states
7. command palette labels / hints / results states
8. post card toolbar copy
9. post detail toolbar copy
10. library actions / statuses / empty states / confirms
11. share sheet / share actions / hints / statuses
12. comments wrapper / comments panel / comment actions / comment statuses
13. TOC labels / empty state
14. mixed media kicker / more links / empty/error states
15. dialog labels / destructive confirm labels / update dialog labels
16. toast labels / status feedback
17. banner/offline/update states
18. notfound / 404 search surface
19. install / PWA prompt language
20. any visible GG-controlled panel title / button / helper / hint / status string
21. any GG-controlled aria-label / title / placeholder in scope above

### C. XML contract finalization for microcopy
This task must finalize the XML usage pattern for microcopy.
That means:
- not only inventing attributes,
- but actually applying them in migrated zones as the final pattern.

### D. Runtime resolver
Create or integrate one resolver only.
No dual-system mess.

### E. Linter / verification
Add copy QA enforcement so future regressions are blocked.

---

## What this task does NOT include
Do not expand into unrelated architecture work unless directly required for microcopy safety.

Not included:
- full global XML architecture freeze
- route classifier rewrite
- `/landing` render-path rewrite beyond copy relevance
- mixed media structural redesign beyond copy relevance
- schema/JSON-LD rewrite
- visual redesign
- CSS redesign
- Worker routing redesign
- full component refactor unrelated to microcopy
- comment system rewrite
- blog content rewriting

This task is about microcopy system freeze, not total template redesign.

---

## Platform constraints
- Platform: Blogger XML template + existing GG runtime + current asset pipeline
- Must preserve working CSS classes
- Must preserve working interaction behavior
- Must preserve comments behavior
- Must preserve existing share flow behavior
- Must preserve search behavior
- Must preserve current mixed-media behavior, except copy ownership
- Must preserve current page rendering behavior
- Must not introduce visual regressions by renaming CSS hooks casually
- Must not introduce a second language/copy system

---

## Source of truth hierarchy
Use this ownership model:

1. `registry`
   - all GG-controlled public microcopy
2. `native-blogger`
   - Blogger messages/widgets explicitly passed through
3. `native-browser`
   - browser/OS prompts that cannot be branded
4. `editorial-content`
   - post/page content and editorial metadata outside system microcopy

Every visible string in audited scope must map to exactly one owner class.

---

## Touched files
Primary:
- `index.prod.xml`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`

Secondary / QA:
- `qa/gaga-audit.mjs`
- add `qa/verify-copy-registry.mjs` if needed
- update `package.json` scripts only if necessary
- optional helper module only if integration into existing runtime is too risky

Do not create needless new files.
Do not fork the copy system into multiple incompatible helpers.

---

## Final XML copy attribute contract
These are the only approved XML attributes for GG microcopy:

- `data-gg-copy`
- `data-gg-copy-aria`
- `data-gg-copy-title`
- `data-gg-copy-placeholder`
- `data-gg-copy-vars`

No new random variants unless there is a hard platform reason.

### Meaning
- `data-gg-copy="namespace.key"` → text content
- `data-gg-copy-aria="namespace.key"` → `aria-label`
- `data-gg-copy-title="namespace.key"` → `title`
- `data-gg-copy-placeholder="namespace.key"` → `placeholder`
- `data-gg-copy-vars='{"count":"12"}'` → interpolation vars

### Rule
English literal stays in markup as fallback.
Runtime replaces it with active locale.
Never render raw key to user.

---

## Final XML usage rules
### Rule 1
All migrated GG-controlled visible labels must use registry attributes.

### Rule 2
All migrated GG-controlled aria labels must use registry attributes.

### Rule 3
All migrated GG-controlled placeholders must use registry attributes.

### Rule 4
All migrated counters with `{count}` or other interpolation must use `data-gg-copy-vars`.

### Rule 5
Do not use `data-gg-copy-html` in this task unless unavoidable.
Default to text-only copy resolution.

### Rule 6
Do not remove English fallback text from markup.

---

## Final language-switch contract
Replace old hook usage:
- `data-lang-code`

with:
- `data-gg-lang-code`

Update runtime so language switch:
1. reads `data-gg-lang-code`
2. updates active locale state
3. refreshes resolved copy
4. preserves existing stored preference behavior
5. does not require full rerender or route reload

---

## Runtime resolver requirements
Implement one resolver only.

### Resolver must:
1. read:
   - `gg-copy-manifest`
   - `gg-copy-en`
   - `gg-copy-id`
   - optionally `gg-copy-meta`
2. resolve by locale:
   - `id[key]`
   - else `en[key]`
   - else literal markup fallback
3. support:
   - text content
   - aria-label
   - title
   - placeholder
   - interpolation vars
4. expose refresh method
5. integrate into existing GG runtime cleanly
6. avoid breaking current init order

### Resolver must not:
- introduce a separate parallel locale state
- bypass existing GG language persistence if already present
- require re-render of the whole surface
- inject visible raw keys
- replace working modules wholesale unless necessary

---

## JS cleanup requirements
Audit and migrate/remove hardcoded GG-controlled public strings from JS.

### Must fix
Replace or route through registry:
- hardcoded share strings
- hardcoded library strings
- hardcoded comment action strings
- hardcoded search/palette strings
- hardcoded update/offline dialog strings
- hardcoded toast messages
- hardcoded install prompt strings
- any user-facing string in migrated scope

### Must forbid
Do not use for branded product UI:
- `alert(...)`
- `confirm(...)`
- `prompt(...)`

For absolute emergency fallback only, native browser behavior may remain behind degraded path, but it must not be treated as branded UI.

### Share-flow note
If current copy-link fallback uses `window.prompt('Copy link:')`, replace branded/default path with GG-controlled UI copy.
Only keep last-resort degraded fallback if truly necessary.

---

## CSS copy policy
This task must also audit CSS for public-facing textual copy.

### Forbidden
Public UI copy must not live in CSS `content:` for:
- labels
- helper text
- statuses
- button-like text
- panel titles
- public navigation text

### Allowed
Decorative non-semantic symbols only, if they do not carry the main meaning.

---

## Mandatory migrated zones
These zones must be migrated in this task, not deferred:

### 1. XML / visible copy zones
- 404 / notfound surface
- search labels and placeholders
- search empty/loading states where XML-owned
- palette/combobox visible labels where XML-owned
- post card toolbar
- post detail toolbar
- TOC title / labels
- mixed media kickers and action link text
- duplicated footer/library/portfolio/store/lang labels
- language switcher labels
- drawer/bottom-sheet visible labels
- install prompt labels if XML-owned
- panel titles / helper labels in migrated scope

### 2. JS / runtime-owned copy zones
- share feedback
- copy-link feedback
- library save/remove feedback
- update-ready flow
- offline feedback where GG-controlled
- comment wrapper actions and statuses where GG-controlled
- toast messages
- any runtime language-controlled label in migrated scope

### 3. Attribute migration
- replace `data-lang-code` with `data-gg-lang-code`
- complete `gg-palette-list` contract

---

## Comments constraints
Comments are high-risk.

### Allowed
- migrate GG-controlled wrapper copy
- migrate comments panel labels
- migrate comment action labels owned by GG
- migrate comment status messages owned by GG

### Forbidden
- rewriting Blogger comment behavior
- breaking native comment rendering
- breaking reply/delete visibility
- breaking focus order
- breaking comments panel open/close behavior

### Ownership rule
Blogger-native messages may remain native passthrough if intentionally documented as such.

---

## Search / palette constraints
This task must complete the combobox contract.

### Required
Ensure an element with:
- `id="gg-palette-list"`
- appropriate listbox semantics
exists and is wired to the search input contract.

### Required
Search/palette labels and placeholders must be registry-driven.

### Forbidden
Do not break:
- keyboard navigation
- combobox semantics
- existing search activation behavior

---

## Mixed media constraints
This task is not allowed to redesign mixed media structure.
It is only allowed to:
- migrate visible mixed-media microcopy
- keep existing working behavior intact
- keep CSS hooks intact
- keep surface behavior intact

This task must not silently hide mixed media or refactor its whole layout.

---

## Duplicated list/post block policy
Where list/post duplication exists under:
- `data:view.isSingleItem`
- `data:view.isMultipleItems`

that duplication may remain structurally if Blogger constraints make reuse unsafe.

But:
- duplicated copy must not drift
- duplicated public labels must be registry-driven
- duplicate IDs must not remain
- surface-specific wrappers may differ
- literal text source must not differ silently

---

## Migration strategy (mandatory)
### Phase 0 — inventory and mapping
Before destructive edits:
- inventory all GG-controlled public strings in scope
- classify owner:
  - registry
  - native-blogger
  - native-browser
  - editorial-content
- map each migrated literal to a registry key
- map old runtime copy groups to new namespaces

### Phase 1 — resolver integration first
Add the resolver and refresh capability before mass XML rewiring.
Goal: reduce blast radius.

### Phase 2 — low-risk XML zones
Migrate:
- 404
- search
- TOC
- mixed media visible labels
- lang switcher labels
- duplicated footer/library/portfolio/store labels

### Phase 3 — action-heavy XML/JS zones
Migrate:
- post toolbars
- share sheet / share feedback
- library actions/statuses
- comments wrapper/actions/statuses
- drawer/bottom-sheet labels

### Phase 4 — old copy cleanup
Remove or deprecate old hardcoded strings in JS and XML only after resolver-backed usage works.

### Phase 5 — lint and QA gate
Add enforcement so new regressions are blocked.

---

## Required deliverables
### D1. XML migrated to final copy contract
Migrated zones must use:
- `data-gg-copy`
- `data-gg-copy-aria`
- `data-gg-copy-title`
- `data-gg-copy-placeholder`
- `data-gg-copy-vars`

### D2. One integrated runtime resolver
Must support locale fallback and refresh.

### D3. Language-switch refresh
Must refresh migrated copy safely after locale change.

### D4. JS hardcoded-string cleanup
Must replace GG-controlled user-facing strings in migrated scope.

### D5. CSS content audit
Must flag or remove forbidden public UI literals in `content:`.

### D6. Copy verification script
Must verify at least:
- EN/ID key parity
- placeholder parity
- forbidden raw key rendering
- forbidden product-use of `alert/confirm/prompt`
- remaining `data-lang-code`
- missing `gg-palette-list`
- optionally remaining raw literals in migrated zones

### D7. Output report
Codex must return:
1. objective
2. touched files
3. assumptions
4. risks
5. migrated zones
6. deferred zones
7. verification steps run
8. rollback note

---

## Acceptance criteria
Task is accepted only if ALL are true:

### Registry and runtime
- registry scripts are read successfully
- locale switch updates migrated copy without reload
- `id -> en -> markup` fallback works
- raw keys never appear in UI

### XML contract
- migrated XML zones use final `data-gg-copy*` contract
- migrated visible strings no longer use hardcoded literals as primary source
- English markup fallback remains intact

### JS contract
- hardcoded user-facing strings in migrated runtime zones are removed or resolver-backed
- no second parallel copy system exists
- no console errors from copy runtime

### Comments
- comments still render
- comments panel still works
- no comment action regressions in migrated wrapper layer
- no comment-related JS errors

### Search / palette
- `gg-palette-list` exists
- combobox semantics are not broken
- labels/placeholders switch language correctly

### Share
- share still works
- copy-link still works
- share feedback comes from registry in migrated path
- degraded fallback, if any, does not break flow

### CSS / visual safety
- no meaningful visual regression caused by migration
- CSS hooks remain intact
- current visual language remains stable

### General safety
- no route render regression on `/`, `/landing`, post, page, special, error
- no performance cliff caused by resolver integration

---

## Linter / verification expectations
At minimum, implement checks for:
1. EN/ID key parity
2. interpolation placeholder parity
3. forbidden raw key rendering
4. remaining `data-lang-code`
5. forbidden `alert(` usage in product UI
6. forbidden `confirm(` usage in product UI
7. forbidden `prompt(` usage in product UI
8. forbidden public CSS `content:` literals
9. missing `gg-palette-list`
10. optional grep of raw literals in migrated zones

---

## Rollback plan
Rollback must be possible by reverting the migration commit.

If regressions appear in:
- comments
- share
- search/palette
- lang switcher
- route render
- performance
- mixed media interaction

then rollback to:
- registry scripts still embedded
- resolver reverted
- migrated XML/JS reverted
- existing stable behavior restored

No rollback may require CSS redesign.

---

## Strong rejection criteria
Reject any Codex output that:
- creates a second competing copy system
- rewrites architecture casually beyond microcopy scope
- renames stable CSS/JS hooks without necessity
- breaks comments/share/search
- leaves copy scattered while pretending migration is complete
- introduces new naming dialects
- removes EN fallback from markup
- ignores native-source ownership distinctions
- treats native browser prompts as branded UI
- claims “done” without lint/verification evidence

---

## Final instruction
Execute this as a compatibility-first, registry-first, zero-drama migration.

Goal is not theoretical purity.
Goal is one coherent microcopy system that is operationally stable, auditable, and safe for final public-release hardening,
- commit hash(es),
- CI run URL/status passes,
- Deploy run URL/status passes.