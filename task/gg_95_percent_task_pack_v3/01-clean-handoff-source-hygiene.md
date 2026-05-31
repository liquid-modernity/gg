# Task 01 — Clean Handoff & Source Hygiene

## Objective

Make the repo and deployable archive clean, reproducible, and AI-agent friendly without changing runtime behavior.

This task is about handoff hygiene, not UI redesign.

## Hard Constraints

- Do not change visual behavior.
- Do not change controller behavior.
- Do not change Blogger post loop behavior.
- Do not introduce override CSS/JS.
- Do not manually patch generated artifacts.
- Do not remove active source files.

## Required Work

### 1. Normalize `.gitignore`

Ensure `.gitignore` exists and excludes at least:

```gitignore
.DS_Store
__MACOSX/
._*
node_modules/
.cache/
.tmp/
*.log
.env
.env.*
```

Do not ignore files required for build/deploy unless the repo has documented regeneration steps.

### 2. Preserve Dotfiles and Dotfolders in Deployable Archives

The previous archive missed workflow files. Fix packaging so deployable archives include:

```txt
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
.github/workflows/lighthouse-ci.yml
.gitignore
package.json
package-lock.json if used
QA-COMMANDS.md
ARCHITECTURE-CONTRACT.md or equivalent
wrangler config if required
```

### 3. Remove OS Junk From Package Output

Final handoff ZIP must not contain:

```txt
__MACOSX/
.DS_Store
._*
```

Do not create ZIPs via Finder. Use a script or documented CLI command.

### 4. Declare Handoff Mode vs Repo Mode

A deployable repo archive must include `.github/workflows`. A limited task pack may omit workflows only if `HANDOFF-MANIFEST.md` explicitly says it is not deployable.

Required status labels:

```txt
HANDOFF_FAILURE = archive/package problem
CONTRACT_FAILURE = source/architecture problem
```

Do not misdiagnose missing workflow in a task-only ZIP as runtime architecture failure.

### 5. Generated Artifact Sync

After `npm run build` or existing build command:

- generated assets must reflect source;
- stale dist files must be detected;
- generated files must not be manually edited;
- source-to-artifact parity must be verifiable.

## Acceptance Criteria

- Clean archive contains no macOS junk.
- Deployable archive contains `.github/workflows` and `.gitignore`.
- Package scripts are documented and mapped.
- No generated artifact is manually edited to satisfy a guard.
- `npm ci` can install from the archive/repo.
- A fresh extract can run the documented verification sequence.
