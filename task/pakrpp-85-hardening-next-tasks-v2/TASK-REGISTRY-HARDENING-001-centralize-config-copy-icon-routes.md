# TASK-REGISTRY-HARDENING-001 — Centralize Config, Copy, Icons, Routes, Filters, and Surface Contracts


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, comments proof, and current CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Work one task only; do not start the next task.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.
- Do not add override-only CSS/JS.
- Do not edit generated output as the only fix.

Rewrite definition:
- Rewrite means consolidate duplicated behavior/configuration into one documented contract.
- Rewrite does not mean rebuilding stable systems from scratch.

QA/CI rule:
- Any new major guard must be wired into package.json, ci:qa or the relevant aggregate script, and QA-COMMANDS.md per TASK-QA-CI-RECONCILIATION-001.


## Strategic Purpose

Make the site easier for AI agents and non-technical vibe coding by reducing scattered magic strings and duplicated config.

This is hardening. Do not change current public taxonomy.

## Preserve Current Public Contracts

```txt
Dock: Home | Contact | Search | Blog | More
Global Discovery: All | Articles | Topics | Saved
Store Discovery: All | Products | Categories | Saved
Theme: Light | Dark
```

## Registry Domains

Centralize or verify centralization for:

```txt
routes
dock items
More sheet items
Discovery filters
Store categories
surface IDs
sheet IDs
icons
microcopy EN/ID
theme labels
schema identity
social/share links
QA marker strings where appropriate
```

## Do Not Over-Centralize

Centralize values that:

```txt
change often
appear in multiple files
define public IA
define route behavior
define copy/icons
define feature contracts
```

Do not make simple component-local logic unreadable.

## Required Guard

Update existing guards or add:

```txt
qa/registry-contract-guard.mjs
```

Guard should fail if:

```txt
public dock labels duplicate outside registry without reason
Discovery visible filters drift
Store categories drift between manifest/build/runtime
Theme labels expose System
public Landing label returns
More sheet IA drifts
```

Add script if stable:

```json
{
  "gaga:verify-registry-contract": "node qa/registry-contract-guard.mjs"
}
```

## Guard Wiring Requirement

Any new guard added by this task must be wired into `package.json`, documented in `QA-COMMANDS.md`, and included in `ci:qa` if it protects a major contract. Do not leave orphaned guards.

## Acceptance Criteria

```txt
registry/config ownership is clearer
public IA does not change accidentally
Store categories remain consistent
copy/icon changes become easier
no stable controller rewrite
CI remains PASS
```


Minimum QA after every task:

```bash
git diff --check
npm run gaga:template:pack
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-contract
npm run gaga:verify-discovery-filters
npm run gaga:verify-store-isolation
npm run gaga:verify-theme
npm run gaga:verify-shell
npm run gaga:verify-preview-sheet
npm run store:build
npm run store:proof
npm run ci:qa
npm run ci:cloudflare
```

After `TASK-QA-CI-RECONCILIATION-001` lands, `npm run gaga:verify-ci-reconciliation` must exist and pass as part of `ci:qa`.

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.
