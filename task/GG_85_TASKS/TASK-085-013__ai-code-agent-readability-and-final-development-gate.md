# TASK-085-013 — AI Code Agent Readability and Final Development Gate

Priority: **P0**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Make the codebase understandable for AI Code Agent and non-technical vibe coding by documenting source-of-truth, generated files, contracts, safe edit zones, danger zones, and final GG 85 gate. This task ties the previous tasks into one operational handoff.

## Current evidence from audit ZIP
The project has many moving parts: Blogger XML, Cloudflare Worker, generated dist assets, registry JSON, source JS/CSS, store static generation, PWA, and QA scripts. Without a human-readable map, future AI edits will keep touching wrong files or adding override code.

## Scope
Create a concise agent operating manual and final development gate that says what can be edited, what must be generated, what must not be touched, and which commands prove readiness.

## Likely files / areas
- `README.md` or `AGENTS.md`
- `docs/architecture/*`
- `qa/gg-85-readiness-guard.mjs`
- `package.json`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Create `AGENTS.md` at repo root.
2. Include:
   - route truth: `/landing` = Home, `/` = Blog, `/store` = Store
   - source files vs generated files
   - registry edit rules
   - controller contract
   - adapter contract
   - CSS rhythm contract
   - QA commands
   - forbidden override patterns
3. Add final script `npm run ci:85` that chains the relevant development-readiness guards.
4. Add a final section: production release flags are deliberately excluded from this milestone.

## Acceptance criteria
- A new coder or AI agent can understand the architecture without reading the whole codebase.
- `AGENTS.md` identifies safe edit zones and danger zones.
- `npm run ci:85` gives a single development-readiness signal.
- The project can honestly claim approximately 85% development readiness once this gate passes.

## Required QA / proof
```bash
npm run ci:85
npm run ci:qa
npm run ci:store
```

## Notes
This is where your tendency to add more features must be controlled. A readable system beats a glamorous but unmaintainable system.
