# TASK-PERFORMANCE-SEO-AI-GATE-001 — Final Crawlability, Performance, and AI Discoverability Readiness Gate


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


## AI/Search Framing

Do not chase artificial AI-search tricks. The target is clean technical SEO: useful visible content, crawlable/indexable pages when production flags allow it, semantic HTML, structured data that matches visible content, safe JavaScript enhancement, and stable page experience.

## Strategic Purpose

Create the final hard gate for performance, SEO/GEO/SEA/GEA-style discoverability, crawlability, and AI-search readiness.

This task verifies readiness. It must not promise rankings, indexing, AI Overview inclusion, or traffic.

## Required Areas

```txt
crawlability
canonical
robots mode switch
sitemap/feed visibility
semantic HTML
JSON-LD/schema parity
performance budget
Core Web Vitals discipline
mobile-first UX
accessibility basics
AI-readable content structure
Store product discoverability
root/editorial separation
```

## Crawlability Requirements

Development mode may be locked down.

Production diagnostics must be indexable when simulated or switched.

Check:

```txt
/ production headers
/landing production headers
/store production headers
/store/category production headers
post detail production headers
manifest/json headers where applicable
```

## Discoverability Requirements

Verify:

```txt
meaningful title/description
canonical URLs
structured headings
schema parity
visible content matches schema
non-empty fallback HTML
real links
no cloaking by JS-only content
```

## Performance Requirements

Do not chase unrealistic 100/0ms numbers if it causes instability.

Set practical budgets:

```txt
critical CSS size noted
JS bundle size noted
store asset size noted
no obvious blocking mistakes
preload only high-value assets
no unnecessary duplicate assets
```

Lighthouse may remain advisory during development unless intentionally changed.

## Required Guard

Add or update:

```txt
qa/readiness-85-guard.mjs
```

It should verify that major guards exist and pass:

```txt
comments
nav-more
discovery contract
discovery filters
store isolation
theme
shell
preview sheet
semantic SSR
schema JSON-LD
asset architecture
a11y static
store proof
worker syntax
live smoke script syntax
```

Add script if stable:

```json
{
  "gaga:verify-85": "node qa/readiness-85-guard.mjs",
  "ci:85": "npm run ci:cloudflare && npm run gaga:verify-85"
}
```

## Required Report

Create:

```txt
READINESS-85-REPORT.md
```

Include:

```txt
what is complete
what is advisory
known warnings
intentionally deferred items
what blocks production indexing
what must be checked before production mode
```

## Known Warning Policy

Known warnings may be accepted only if documented, e.g.:

```txt
calendar_add_on legacy marker: cleanup candidate, not deploy blocker
development-mode robots: expected until production flag
Lighthouse advisory: expected during development
```

Unknown `CONTRACT_FAILURE` is never accepted.

## Guard Wiring Requirement

Any new guard added by this task must be wired into `package.json`, documented in `QA-COMMANDS.md`, and included in `ci:qa` if it protects a major contract. Do not leave orphaned guards.

## Acceptance Criteria

```txt
all major guards pass
live smoke is PASS or PASS_WITH_WARNINGS only
no CONTRACT_FAILURE
known warnings documented
READINESS-85-REPORT.md exists
production indexing switch requirements are explicit
no stable controller/regression issue
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
