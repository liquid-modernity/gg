# Task 01 — Clean Handoff & Source Hygiene

## Objective

Make the project archive/repo clean, readable, and AI-agent friendly without changing runtime behavior or touching Blog1.

This task is about source hygiene, not UI redesign.

## Hard Constraints

- Do not rewrite Blog1.
- Do not rewrite Blogger post loop.
- Do not modify native comments source.
- Do not change visual behavior.
- Do not introduce override CSS/JS.
- Do not make budget checks blocking.

## Scope

Clean the package and handoff structure so a fresh extract is understandable and does not contain stale or junk files.

## Required Work

### 1. Add or normalize `.gitignore`

Ensure the repo/archive includes a `.gitignore` that excludes at least:

```gitignore
.DS_Store
__MACOSX/
node_modules/
.tmp/
.cache/
dist/*.tmp
*.log
```

Keep files required for build/deploy tracked or present in the archive.

### 2. Remove macOS junk from package output

The final distributable ZIP must not contain:

```text
__MACOSX/
.DS_Store
._*
```

Do not rely on Finder ZIP. Create the ZIP through a script.

### 3. Remove zero-byte legacy assets unless documented

Find zero-byte assets or placeholder files. For each file:

- keep only if it has a documented purpose;
- otherwise remove it.

Do not delete active source files.

### 4. Ensure generated artifacts are synchronized

After running build, these must reflect the current source:

```text
assets/
dist/
store static artifacts
blogger template publish XML
```

If generated artifacts are intentionally excluded from source, document that clearly.

### 5. Create package scripts

Add or normalize scripts:

```json
{
  "package:clean": "node tools/package-clean.mjs",
  "package:verify": "node tools/package-verify.mjs"
}
```

The scripts should:

- remove junk metadata;
- verify no stale generated artifacts;
- verify no macOS junk;
- verify required handoff files exist;
- report budget notes as warnings only.

## Acceptance Criteria

- Fresh archive extraction contains no `__MACOSX`, `.DS_Store`, or `._*`.
- `.gitignore` exists.
- Build output is synchronized with source.
- `npm run package:clean` works.
- `npm run package:verify` works.
- Budget warnings do not fail the task.
- No Blog1 or Blogger loop logic is changed.

## Suggested Verification

```bash
npm run build
npm run package:clean
npm run package:verify
```

Optional:

```bash
find . -name ".DS_Store" -o -name "__MACOSX" -o -name "._*"
```

Expected: no results in the final package output.

## Non-Goals

- Do not refactor sheet behavior here.
- Do not split controllers here.
- Do not split CSS here.
- Do not alter page visuals here.
