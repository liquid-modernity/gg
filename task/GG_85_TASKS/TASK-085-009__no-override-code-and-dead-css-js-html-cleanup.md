# TASK-085-009 — No Override Code and Dead CSS JS HTML Cleanup

Priority: **P1**  
Target milestone: **GG 85% development-readiness**  
Status: **Ready for coder / AI code agent**

## Objective
Remove unused files, empty assets, legacy duplicates, and override-style patches that make the codebase hard for AI agents and humans to understand. This is cleanup with proof, not blind deletion.

## Current evidence from audit ZIP
The ZIP includes zero-byte legacy files such as `src/landing/landing.js`, `src/landing/landing.css`, `assets/landing/landing.js`, and similar dashboard/knowledgebase placeholders. There are also duplicate built/source assets and Mac metadata in the uploaded ZIP context. Large generated files make source-of-truth harder to inspect.

## Scope
Identify what is source, what is generated, what is legacy, and what is safe to remove. Add a manifest of generated artifacts so agents do not edit the wrong files.

## Likely files / areas
- Zero-byte files in `src/landing`, `assets/landing`, `src/dashboard`, `src/knowledge base`, etc.
- `dist/*` generated artifacts
- `assets/*` generated/published assets
- `docs/architecture/asset-architecture-v1.md`
- New: `qa/dead-code-guard.mjs`

## Hard constraints
- Do **not** touch native Blogger comments plumbing.
- Do **not** replace Blog1 as the source of post/detail truth.
- Do **not** change Discovery taxonomy unless this task explicitly says so.
- Do **not** break Store isolation: Store-labelled products must not leak into `/`, `/landing`, or general Blog Discover.
- Do **not** remove development crawler blocking / noindex flags in this milestone. Production flags are deferred to final release.
- Do **not** create parallel override code. Fix the source contract instead.
- Do **not** hide failures by weakening guards.

## Implementation steps
1. Create `docs/architecture/source-generated-map.md`.
2. Mark generated files with clear comments or documentation.
3. Remove zero-byte placeholder files if not referenced.
4. Remove stale duplicate artifacts only if build/test proves no reference.
5. Add guard for zero-byte JS/CSS, orphaned assets, and known legacy placeholders.
6. Do not delete dist files if deployment pipeline still requires them; document instead.

## Acceptance criteria
- No zero-byte JS/CSS files remain unless documented as intentional.
- Coder/agent can identify source files versus generated files quickly.
- No runtime references point to deleted assets.
- Build and QA still pass.

## Required QA / proof
```bash
node qa/dead-code-guard.mjs
npm run build
npm run ci:qa
npm run ci:store
```

## Notes
Be strict but not reckless. Cleanup that breaks Blogger publishing or Cloudflare deploy is fake progress.
