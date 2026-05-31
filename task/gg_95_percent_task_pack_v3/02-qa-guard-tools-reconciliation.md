# Task 02 — QA Guard & Tools Reconciliation

## Objective

Reconcile QA scripts, guards, tool categories, and CI expectations so the project can be verified consistently without making normal source editing painful.

## Hard Constraints

- Do not invent new QA script names unless mapped in `package.json` and documented in `QA-COMMANDS.md`.
- Mandatory guards must be read-only.
- Mutating tools must be classified as build/staging tools.
- Advisory checks must not fail normal CI.
- Do not make CSS guards micromanage design.
- Do not add duplicate guard layers that check the same thing under different names.

## Required Work

### 1. Inventory Existing Scripts

Inventory scripts from `package.json`, especially:

```txt
ci:qa
ci:store
ci:cloudflare
ci:85
gaga:verify-*
build
deploy:cloudflare:prepared
```

Create or update `QA-COMMANDS.md` with:

```txt
script name
purpose
read-only or mutating
blocking or advisory
used by CI? yes/no
used by deploy? yes/no
expected output/failure class
```

### 2. Classify Guards

Mandatory/read-only guard examples:

```txt
source-of-truth boundary guard
generated artifact manual-edit guard
Blogger unresolved substitution guard
schema validity guard
SSR fallback guard
required CSS module registration guard
forbidden override/patch layer guard
required workflow presence guard in repo/deployable archive mode
Cloudflare deploy contract guard
```

Advisory/read-only guard examples:

```txt
performance budget warning
Lighthouse warning
token consistency warning
visual rhythm warning
selector naming warning
CSS optimization opportunity warning
zero-duplication ideal warning
```

Mutating/build tools:

```txt
build scripts
CSS bundling/minification
Blogger template generation
Cloudflare staging/prepared build
package clean/build tools
```

### 3. Reconcile Failure Labels

Use clear failure labels:

```txt
CONTRACT_FAILURE
HANDOFF_FAILURE
BUILD_FAILURE
SCHEMA_FAILURE
SSR_FAILURE
CI_FAILURE
ADVISORY_WARNING
```

Avoid vague failures.

### 4. CSS Guard Scope

Mandatory CSS guards may fail only on:

```txt
generated CSS edited manually
source CSS missing from declared build path
obvious duplicate override/patch files
forbidden emergency CSS layers
missing required CSS module registration
clearly unused large CSS artifacts
```

Everything else must be advisory.

Do not create hard rules for:

```txt
every selector format
every spacing token
every border-radius value
every color value
every component requiring a separate CSS file
declaration order
manual src/css editing that is otherwise valid
```

## Acceptance Criteria

- `QA-COMMANDS.md` exists and is complete enough for Codex/humans.
- Every guard is classified.
- CI aggregate commands call mapped scripts only.
- No advisory-only check blocks normal CI.
- CSS guard scope is architecture-level and lightweight.
- Mutating tools are not mislabeled as verifiers.
