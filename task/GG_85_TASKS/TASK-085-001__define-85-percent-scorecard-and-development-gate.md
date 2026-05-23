# TASK-085-001 — Define 85 Percent Scorecard and Development Gate

Priority: **P0**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Create a single development-readiness scorecard that turns the broad target into measurable checks. The aim is not to claim production readiness, but to prove that the architecture can reach roughly 85% before production crawler/indexing flags are opened.

## Current evidence from audit ZIP
Current audit position is approximately 70%. Existing `ci:qa` and `ci:store` are useful, but they do not express the target as one coherent readiness gate. Existing reports include `qa/qa-report.md`, `qa/custom-audit.md`, `qa/zip-audit.latest.md`, and store build reports, but no single GG 85 scorecard.

## Scope
Add a compact scorecard document and a lightweight guard that reports pass/fail per domain: HTML fallback, semantic HTML, registry, controller contract, adapters, CSS rhythm, a11y, schema, store data, performance, PWA, and AI-agent readability.

## Likely files / areas
- `docs/architecture/gg-85-readiness-scorecard.md`
- `qa/gg-85-readiness-guard.mjs`
- `package.json` scripts
- Existing QA reports only as inputs, not as replacements

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Create `docs/architecture/gg-85-readiness-scorecard.md` with weighted categories.
2. Add `qa/gg-85-readiness-guard.mjs` that checks for the presence of required contracts, reports missing parts, and exits non-zero only for P0 critical failures.
3. Add scripts:
   - `gaga:verify-85`
   - `ci:85`
4. Do not require production crawler/indexing openness in this guard.
5. Mark release-only requirements separately as `deferred-production`.

## Acceptance criteria
- There is one readable scorecard with category weights.
- Running `npm run gaga:verify-85` produces a clear pass/warn/fail report.
- The guard distinguishes development blockers from release-only blockers.
- The scorecard explicitly says that crawler/indexing flags remain blocked until production release.

## Required QA / proof
```bash
npm run ci:qa
npm run ci:store
npm run gaga:verify-85
```

## Notes
- Keep the implementation boring, explicit, and reversible. Do not add clever abstractions unless they reduce duplicated behavior across `/`, `/landing`, and `/store`.
