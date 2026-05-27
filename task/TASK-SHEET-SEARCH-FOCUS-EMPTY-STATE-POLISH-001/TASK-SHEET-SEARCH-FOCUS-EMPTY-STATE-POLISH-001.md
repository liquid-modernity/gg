# TASK-SHEET-SEARCH-FOCUS-EMPTY-STATE-POLISH-001

## Scope

Run this focused polish task only. Do not start any other task.

## Goal

Refine the shared sheet searchbar focus/hover visual treatment and fix Saved/Discovery empty-state parity across `/`, `/landing`, and `/store`.

This task is not a redesign and not a controller rewrite. It is a small parity/polish task after `TASK-SHEET-SEARCH-VISUAL-PARITY-001`.

## Known Issues

1. Sheet searchbar focus/hover treatment is visually too harsh.
   - Current focus can look like a thick black desktop form border.
   - Desired treatment: subtle, thin, native-feeling, visually quiet.

2. Saved Discovery state differs between root and landing.
   - Landing shows: `No saved items yet. Save articles or products to find them here.`
   - Root does not consistently show the same empty copy/state.

3. More sheet search behavior already works.
   - Preserve it.
   - Do not regress More search filtering.

4. The post titled `todo` is valid content.
   - Do not remove, hide, special-case, or treat it as dummy content.

## Hard Constraints

- Do not add patch/override-only CSS.
- Do not create a second searchbar visual system.
- Do not create a parallel More-only or Discovery-only search controller.
- Do not add random new CSS/JS layers.
- Use the existing shared `--gg-sheet-search-*` token contract.
- Use source-of-truth files only.
- Keep route truth:
  - `/landing = Home`
  - `/ = Blog`
  - breadcrumb `Home(/landing) -> Blog(/) -> current`
- Do not touch Blogger-native comments plumbing.
- Do not alter Blog1-safe schema protections.
- Do not reintroduce dynamic root `ItemList`, `data:schemaPosts`, or filtered root `data:posts` schema loops.
- Do not simplify `index.xml` for aesthetics.
- Do not change Store product source.
- Do not change Worker healthy-route UI.
- Do not change critical inline CSS/JS unless a specific existing contract defect requires it.

## Implementation Direction

### Searchbar Focus / Hover

Refine the shared tokens, not one-off selectors.

Likely token owner:

- `src/css/components/gg-visual-tokens.css`

Likely consumers:

- `src/css/components/gg-discovery-sheet.css`
- `src/css/components/gg-more-sheet.css`
- `src/store/store.css`
- generated/synced app CSS via existing source/bundle flow

Desired visual direction:

- default border: 1px and very soft
- hover border: still 1px, slightly clearer
- focus border: 1px, not thick black
- focus ring: subtle 1px visual ring or soft shadow, not a 2px harsh border
- preserve accessible focus visibility; do not remove focus indication

Do not solve this by adding late selectors such as `.some-surface input:focus { ... }` at the end of a generated file. Fix the shared token contract.

### Saved Empty-State Parity

Ensure Saved/Discovery empty state uses the same copy and layout across root and landing, and does not diverge across Store if the same Saved surface is present.

Canonical copy:

```txt
No saved items yet. Save articles or products to find them here.
```

If the text is not centralized, centralize or document its source-of-truth through the existing registry/copy pattern.

Likely areas:

- `src/js/gg-app.source.js`
- `landing.html`
- `src/store/store-discovery.js`
- `registry/copy/*` if copy source needs alignment
- Discovery/More sheet CSS component source files

### More Search Preservation

More search already works. Ensure this task does not break:

- root More search
- landing More search
- Store More search
- section/row filtering
- reset/clear behavior
- keyboard accessibility and accessible names

## Guarding

If practical, update the existing sheet search visual parity guard instead of creating another overlapping guard.

Preferred guard:

- `qa/sheet-search-visual-parity-guard.mjs`

The guard should verify, where practical:

- shared `--gg-sheet-search-*` tokens exist
- focus/hover treatment uses the shared token contract
- no thick hard-coded searchbar border is introduced in Discovery/More/Store searchbars
- Saved empty-state copy is present in the relevant source/runtime templates
- More search input contract remains present

If the existing guard is updated, ensure it remains wired into:

- `package.json`
- `ci:qa`
- `qa/ci-reconciliation-guard.mjs`
- `QA-COMMANDS.md`
- `SOURCE-OF-TRUTH.md`

## Required QA

Run:

```bash
git diff --check
npm run gaga:verify-docs-contract
npm run gaga:verify-ci-reconciliation
npm run gaga:verify-semantic-ssr
npm run gaga:verify-schema-jsonld
npm run gaga:verify-registry-contract
npm run gaga:verify-a11y-static
npm run gaga:verify-asset-architecture
npm run gaga:verify-cleanup
npm run gaga:verify-css-sot-cleanup
npm run gaga:verify-css-module-wiring
npm run gaga:verify-repo-structure-tidy
npm run gaga:verify-sheet-search-visual-parity
npm run gaga:verify-85
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run store:proof
npm run ci:cloudflare
```

If a command name differs, use the existing repo script and document the substitution.

## Final Report Must Include

- files changed
- whether focus/hover searchbar visual was refined
- exact token changes
- whether Saved empty-state root/landing parity is fixed
- whether More search still works
- guards/scripts changed
- QA PASS/FAIL
- warnings
- intentional non-changes

## Acceptance Criteria

- Searchbar focus/hover is visually quieter and uses the shared token contract.
- Border does not visually thicken into a harsh black desktop-form outline.
- Focus remains accessible.
- Saved empty-state copy appears consistently across root and landing.
- More search still filters More sheet content.
- No route truth changes.
- No Blogger comments changes.
- No Blog1 schema regressions.
- No generated-file primary fix.
- `npm run ci:cloudflare` passes.
