# TASK 007 — Lighthouse regression gate

## Context

Performance must become a controlled quality gate, not a panic ritual at the end. Manual Lighthouse is useful during debugging, but CI/regression gates are needed before release.

## Goal

Create repeatable Lighthouse/performance evidence for key routes and prevent obvious regressions.

## Routes in scope

```text
/
/landing
/store
one post detail route
/search?q=zzzzzznotfound
/halaman-yang-tidak-ada
```

Use an actual stable post URL from the site for the post detail route.

## Files/folders to create

```text
qa/perf-baseline/
qa/perf-after-phase1/
qa/lighthouse/
qa/lighthouse/lighthouserc.json
qa/lighthouse/run-lighthouse.mjs
.github/workflows/lighthouse-ci.yml   optional if repo already ready
```

Adjust paths to actual repo.

## Required changes

### 1. Add route config

Create route list:

```json
{
  "routes": [
    { "name": "home-listing", "path": "/" },
    { "name": "landing", "path": "/landing" },
    { "name": "store", "path": "/store" },
    { "name": "post-detail", "path": "/2026/xx/example-post.html" },
    { "name": "search-empty", "path": "/search?q=zzzzzznotfound" },
    { "name": "not-found", "path": "/halaman-yang-tidak-ada" }
  ]
}
```

Do not leave placeholder post route unresolved.

### 2. Add Lighthouse CI config

Starting thresholds should be realistic:

```text
mobile performance >= 75 initially after Phase 1
landing/store target >= 75 after fixes
accessibility >= 95
best-practices >= 95
SEO may remain affected by noindex in development/staging; do not fail SEO if intentionally locked down
```

For production later:

```text
mobile performance >= 85
desktop performance >= 95
accessibility >= 95
best-practices >= 95
SEO = 100 if route is indexable
```

### 3. Save reports

Save:

```text
HTML report
JSON report
short markdown summary
```

Example folder:

```text
qa/perf-after-phase1/landing-mobile.html
qa/perf-after-phase1/landing-mobile.json
qa/perf-after-phase1/SUMMARY.md
```

Summary must include:

```text
- FCP
- LCP
- CLS
- TBT
- Speed Index
- transfer size
- main-thread work
- top render-blocking requests
- third-party cost
```

### 4. Distinguish local network issues from Worker issues

Add a helper or documented manual command:

```bash
for v in -4 -6; do
  echo "=== $v ==="
  curl $v -s -o /dev/null \
    -w 'dns:%{time_namelookup} connect:%{time_connect} tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total}\n' \
    https://www.pakrpp.com/landing
done
```

If IPv6 is slow but IPv4 is fast, classify as network/Cloudflare path, not necessarily Worker rendering.

### 5. Add preflight/smoke integration

Ensure smoke includes:

```text
/
/landing
/store
/sw.js
/flags.json
/__gg/assets/css/*
/__gg/assets/js/*
/assets/store/* if used
```

### 6. No fantasy thresholds

Do not set 100/100 as pass/fail. That creates noise and fake fixes.

Use ratcheting:

```text
Phase 1 gate: stable green >=75 mobile for target pages
Later production gate: raise to >=85 mobile
```

## Non-goals

- Do not optimize UI in this task.
- Do not change Worker policy.
- Do not redesign pages.
- Do not make SEO pass while noindex is intentionally active.

## Acceptance criteria

```text
- Lighthouse can run repeatedly against the defined route list.
- Reports are saved in predictable folders.
- Summary markdown is generated.
- CI/local script fails on severe regression according to realistic thresholds.
- SEO failure caused by intentional noindex is not misclassified as production SEO failure.
- Accessibility regression below 95 fails.
```

## Suggested commit

```text
test(perf): add Lighthouse regression gate for phase 1 routes
```
