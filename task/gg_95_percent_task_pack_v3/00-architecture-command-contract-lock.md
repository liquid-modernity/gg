# Task 00 — Architecture Command Contract Lock

## Objective

Freeze the project vocabulary, execution boundaries, command contract, and guard philosophy before any refactor begins.

This task prevents Codex from improvising new scripts, adding patch layers, or treating advisory concerns as CI blockers.

## Hard Constraints

- Do not modify runtime behavior in this task.
- Do not refactor controller, CSS, schema, or Blogger template logic here.
- Do not invent new QA script names unless they are added to `package.json` and documented in `QA-COMMANDS.md`.
- Do not add override CSS/JS layers.
- Do not manually patch generated artifacts.
- Do not turn Cloudflare Worker into a normal HTML rewriting/rendering layer. Worker is edge governance, routing, static serving, headers, diagnostics, and source/staging policy, not a substitute CMS or HTMLRewriter for healthy Blogger pages.

## Required Contract Definitions

Document these terms in the existing contract documents first. Prefer updating existing repo contracts instead of creating a competing new contract file:

```txt
AGENTS.md
ARCHITECTURE.md
ASSET-ARCHITECTURE.md
SOURCE-OF-TRUTH.md
SURFACE-CONTRACT.md
QA-COMMANDS.md
REPO-STRUCTURE.md when path policy changes
```

Create a new contract file only if the existing documents cannot host the contract cleanly, and then wire it into the existing docs/guard system.

Terms to lock:

```txt
canonical source
source-of-truth
Blogger source template
generated artifact
build artifact
staging artifact
runtime asset
mandatory guard
advisory guard
mutating tool
read-only verifier
aggregate CI command
Cloudflare deploy command
source boundary
surface adapter
public canonical route
source/backend CMS host
```

## Command Contract

Prefer existing scripts:

```txt
npm run ci:qa
npm run ci:store
npm run ci:cloudflare
npm run ci:85
npm run gaga:verify-*
```

If a new command is truly required, it must be:

1. added to `package.json`;
2. documented in `QA-COMMANDS.md`;
3. classified as read-only verification or mutating build/staging;
4. referenced by aggregate scripts if it is CI-relevant.

## Guard Classification

Classify every guard as exactly one of:

```txt
mandatory/read-only
advisory/read-only
mutating/build
mutating/staging
```

Mandatory guards may fail CI only when they detect contract-breaking architecture problems. Advisory guards must not fail normal development CI.

## Source/Artifact Contract

Declare which paths are canonical source and which are generated. At minimum classify:

```txt
index.xml
landing.html
src/**
assets/**
dist/**
__gg/**
.cloudflare-build/**
store/data/**
config/**
tools/**
.github/workflows/**
```

Generated artifacts must not be edited manually. The correct workflow is:

```txt
fix source → rebuild → verify → package/deploy
```

## Acceptance Criteria

- Existing contract docs are updated first, with no duplicate/competing architecture truth introduced.
- `QA-COMMANDS.md` maps scripts to purpose and blocking/advisory status.
- No new unmapped script is introduced.
- Mandatory guards are read-only.
- Mutating tools are not called directly by GitHub Actions unless intentionally classified.
- The repository clearly distinguishes source files from generated files.
- The contract explicitly states that rewrite means removing duplicate source-of-truth, not adding patches.


## Worker Boundary Lock

The Worker must not become an HTMLRewriter-based CMS or a broad HTML mutation layer.

Allowed Worker responsibilities:

```txt
canonical host / HTTPS normalization
static route serving for explicit static surfaces
Store clean-route normalization and static artifact lookup
headers, cache policy, robots policy, diagnostics, flags
Cloudflare staging/deploy governance
PWA/static asset gateway
source adapter fetch/staging only when explicitly declared
```

Forbidden Worker drift:

```txt
rewriting healthy Blogger post/page HTML to hide template problems
using HTMLRewriter as the normal rendering strategy
proxying and mutating all Blogger posts as a CMS replacement
authoring normal healthy Blogger UI at the edge
patching unresolved Blogger substitutions in Worker output
fixing schema/readability by edge mutation instead of source template fixes
```

If rendered HTML is wrong, fix `index.xml`, source registries, source adapters, or build tools first; do not mask it through Worker rewriting.
