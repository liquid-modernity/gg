# TASK-085-002 — Semantic HTML and HTML Fallback Contract

Priority: **P0**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Make the baseline HTML understandable without JavaScript, crawler-friendly, and screen-reader-friendly across `/`, `/landing`, `/store`, category pages, and post/detail surfaces. Fallback must be semantic and minimal, not a second competing app.

## Current evidence from audit ZIP
The ZIP contains Blogger XML, static `landing.html`, static `store.html`, category pages, `offline.html`, and Worker fallback logic. The current architecture already has fallback pieces, but the contract is not formalized as a cross-surface rule.

## Scope
Define and enforce the minimum no-JS DOM structure: `header`, `main`, `nav`, `article`, `section`, `aside`, `footer`, crawlable links, readable headings, and non-empty primary content. Worker fallback must only appear on hard render failure and must not author rich UI in healthy Blogger renders.

## Likely files / areas
- `index.xml`
- `template/partials/*`
- `landing.html`
- `store.html`
- `store-*.html`
- `worker.js`
- `qa/semantic-html-guard.mjs`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Write `docs/architecture/html-fallback-contract.md`.
2. Define required landmarks and no-JS content rules per surface.
3. Ensure `/`, `/landing`, `/store`, and category pages expose crawlable primary links without JS.
4. Keep Worker fallback minimal: title, canonical link, primary content shell, and safe error message only.
5. Add guard that fails if a surface has missing `main`, duplicate primary headings, empty primary content, or JS-only navigation.

## Acceptance criteria
- No-JS baseline still exposes primary content and navigation.
- There is only one fallback contract, not scattered assumptions.
- Worker fallback does not duplicate toolbar, comments, Discovery, Store UI, or dock UI in healthy cases.
- Guard reports surface-by-surface status.

## Required QA / proof
```bash
node qa/semantic-html-guard.mjs
npm run ci:qa
npm run build
```

## Notes
- Keep the implementation boring, explicit, and reversible. Do not add clever abstractions unless they reduce duplicated behavior across `/`, `/landing`, and `/store`.
