# Task 12 — Release Candidate 95 Gate

## Objective

Define the final 95% release candidate gate after Tasks 00–11 are complete.

This is not a refactor task. It is the final verification gate.

## Hard Constraints

- Do not add new feature work inside this task.
- Do not manually patch generated artifacts to make checks pass.
- Do not bypass failing mandatory guards.
- Do not deploy unless `ci:cloudflare` passes.
- Do not treat advisory budget warnings as blockers unless strict release mode is explicitly enabled.

## Required Verification Sequence

Recommended sequence:

```txt
npm ci
npm run build
npm run ci:qa
npm run ci:store
npm run ci:cloudflare
npm run ci:85
```

If scripts differ, update `QA-COMMANDS.md` and `package.json` consistently. Do not invent names silently.

## Deploy Sequence

Deployment must follow:

```txt
npm run ci:cloudflare
npm run deploy:cloudflare:prepared
npm run gaga:verify-worker-live:strict
```

This must be reflected in GitHub Actions.

## Required Green Gates

```txt
source clean
commands reconciled
guards classified
CI green
Cloudflare deploy deterministic
SSR fallback intact
schema valid
registry authoritative
one behavior contract
one visual rhythm
no duplicate patch layer
root/store source boundary documented and enforced
post detail free from unresolved Blogger substitutions
post detail Reader Mode eligible by design
Store canonical public route under www.pakrpp.com/store/
source-only Store host not treated as public canonical
Worker not used as HTMLRewriter/CMS replacement
Existing contract docs updated without competing architecture truth
```

## Final Manual Review Checklist

Before release, verify:

```txt
/ renders root/editorial shell correctly
/landing and /landing/ route consistently
/store and /store/ route consistently
post detail has clean article structure
page detail has no false post schema
Store listing does not fetch root feed unnecessarily
Root does not fetch Store feed unnecessarily
canonical tags are correct
schema is route-appropriate
Reader Mode heuristic is reasonable on post details
mobile bottom/top sheets behave correctly
keyboard close/focus restore works
Cloudflare live smoke passes
```

## Failure Handling

Use specific labels:

```txt
CONTRACT_FAILURE
HANDOFF_FAILURE
BUILD_FAILURE
SCHEMA_FAILURE
SSR_FAILURE
CI_FAILURE
ADVISORY_WARNING
```

Do not hide failures with CSS/JS or Worker HTMLRewriter. Do not add emergency override layers. Fix the canonical source.

## Acceptance Criteria

- All mandatory gates pass.
- Advisory warnings are documented but do not block unless strict mode is active.
- Deploy workflow remains deterministic.
- Final archive/repo is clean and handoff-ready.
- No new duplicate source-of-truth is introduced.
