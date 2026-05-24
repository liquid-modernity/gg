# TASK-ARCH-LOCK-001 — Document Surface Contracts, Agent Rules, and Source-of-Truth Boundaries


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, and CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.


## Strategic Purpose

Create human- and AI-readable project contracts so Codex/AI agents stop guessing architecture.

## Required Output Files

Create or update:

```txt
AGENTS.md
ARCHITECTURE.md
SURFACE-CONTRACT.md
SOURCE-OF-TRUTH.md
QA-COMMANDS.md
```

## Required Content

### AGENTS.md

Must include:

```txt
project purpose
surface route meaning
hard no-touch areas
source vs generated files
how to run QA
how to handle Blogger XML
how to handle Cloudflare Worker/assets
how to handle Store static build
how to handle comments
how to handle sheets/previews
commit/checkpoint policy
```

### ARCHITECTURE.md

Must explain:

```txt
Blogger XML SSR role
Cloudflare Worker role
static assets role
Store static artifact role
landing static route role
registry/copy role
QA guard role
```

### SURFACE-CONTRACT.md

Must define:

```txt
/ route contract
/landing route contract
/store route contract
post detail contract
page detail contract
label/search/archive treatment
```

### SOURCE-OF-TRUTH.md

Must define:

```txt
which files are source
which files are generated
which files are deployment artifacts
what must not be edited manually
how to rebuild
```

### QA-COMMANDS.md

Must include standard local, deploy, and live smoke command sets.

## Optional Guard

Add `qa/docs-contract-guard.mjs` and `gaga:verify-docs-contract` if useful.

## Acceptance Criteria

```txt
AGENTS.md exists and is useful for Codex/AI agents
architecture docs define current stable contracts
source/generated boundaries are explicit
hard no-touch areas are explicit
QA commands are explicit
no functional behavior is changed unless required for doc guard
existing CI remains PASS
```

## Final Report Format

```txt
TASK-ARCH-LOCK-001 completed.

Changed:
- AGENTS.md added/updated: YES/NO
- ARCHITECTURE.md added/updated: YES/NO
- SURFACE-CONTRACT.md added/updated: YES/NO
- SOURCE-OF-TRUTH.md added/updated: YES/NO
- QA-COMMANDS.md added/updated: YES/NO
- Docs guard added: YES/NO

Verification:
- git diff --check: PASS/FAIL
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- npm run ci:cloudflare: PASS/FAIL
```
