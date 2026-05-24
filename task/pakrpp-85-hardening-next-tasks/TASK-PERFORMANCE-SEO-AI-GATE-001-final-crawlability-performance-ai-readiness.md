# TASK-PERFORMANCE-SEO-AI-GATE-001 — Final Crawlability, Performance, and AI Discoverability Readiness Gate


Baseline assumption: Store Isolation, Store Isolation JS, Discovery 002/003, Theme 001, Shell 001/002, Preview 001, and CI/CD hardening are already stable.

Global rule for every task:
- Treat this as hardening/audit/contract work.
- Do not rewrite stable Store/Discovery/Shell/Preview controllers unless a guard proves a real defect.
- Preserve Blog1 detail, Blogger native comments, threaded comments, Store isolation, Discovery taxonomy, Theme Light/Dark, global sheet controller, preview contract, preview scroll reset, and current passing CI.
- Do not hardblock post titles, URLs, or slugs.
- Do not weaken QA guards.


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
npm run ci:cloudflare
```

Run live smoke after deploy or when the task changes Worker/static assets:

```bash
npm run gaga:verify-worker-live:strict
```

`PASS_WITH_WARNINGS` is acceptable only for known non-blocking warnings. `CONTRACT_FAILURE` is not acceptable.
