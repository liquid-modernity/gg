# CI Guard Policy

This document defines the repository validation model for human maintainers and AI agents. It reconciles strict architecture guards with local environment limits.

## Validation Levels

| Level | Meaning | CI behavior |
|---|---|---|
| `BLOCKER` | Real architecture, build, deploy, source/generated, route, schema, accessibility, or production-readiness risk. | Must fail CI. |
| `WARNING` | Non-blocking issue that should be reported and tracked. | Must not fail normal development CI unless promoted by explicit release mode. |
| `INFO` | Trend/report-only data. | Must not fail CI. |

## Blocker Guards

Treat these as blockers:

- build failure in the CI authority environment
- missing `.gitignore`
- missing required GitHub Actions workflows
- broken Cloudflare deploy configuration
- missing source-of-truth files
- generated file manually patched as the primary fix
- HTML fallback removed
- route registry broken
- duplicate central controller or duplicated route logic across `/`, `/landing`, and `/store`
- invalid schema or metadata on critical public routes
- critical accessibility issue
- production placeholder asset
- production flags opened without release checklist
- `.DS_Store` or `__MACOSX` in repo handoff/archive scope
- broken Worker syntax or route mapping
- missing required deployment secret reference by name
- failure of critical source/generated boundary guard

## Warning Guards

Treat these as warnings unless a release task explicitly promotes them:

- CSS/JS above advisory budget
- minor unused CSS selector
- folder README missing
- minor naming inconsistency
- non-critical microcopy issue
- non-critical accessibility warning
- Lighthouse score below target during development
- visual rhythm warning
- stale report file
- advisory image/cache budget
- local `npm ci` failure on macOS 10.15.x caused by `@esbuild/darwin-x64@0.27.0` requiring macOS 12.0

Local macOS 10.15.x `npm ci` failure is a local environment blocker, not a CI blocker, when GitHub Actions or Linux/Docker Node 20 validation passes. See `docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`.

## Info Signals

Treat these as info:

- asset size trend
- bundle growth trend
- file count
- selector count
- hook count
- build duration
- number of routes
- number of generated outputs

## Local Commands

Normal local hardening commands:

```bash
git diff --check
npm run gg:console:check
npm run build
npm run ci:qa
npm run ci:85
npm run ci:95
```

Fresh install proof:

```bash
npm ci
```

On macOS 10.15.x, `npm ci` may fail because the current `wrangler -> esbuild` native binary targets macOS 12.0. In that case, do not downgrade package versions as an automatic fix. Use GitHub Actions or Linux/Docker Node 20 for validation authority.

## CI Commands

CI uses aggregate package scripts:

```bash
npm ci
npm run ci:cloudflare
```

The required CI authority environment is the GitHub Actions workflow environment:

```txt
ubuntu-latest
Node 20
```

## Release Candidate Commands

Run or verify these for release-candidate readiness:

```bash
npm ci
npm run build
npm run ci:qa
npm run ci:store
npm run ci:cloudflare
npm run ci:85
npm run gaga:verify-95
npm run ci:95
```

`PASS_WITH_WARNINGS` is acceptable only for documented non-blocking warnings. `CONTRACT_FAILURE` or a non-zero command exit in CI authority is not acceptable.

## Cloudflare Deploy Command

The deploy workflow owns production deploy sequencing:

```bash
npm ci
npm run ci:cloudflare
npm run deploy:cloudflare:prepared
npm run gaga:verify-worker-live:strict
```

Do not replace this with ad-hoc `wrangler deploy` calls.

## Before Pushing

Humans should run, at minimum:

```bash
git diff --check
npm run build
npm run ci:qa
```

For release or deploy-adjacent changes, also run:

```bash
npm run ci:85
npm run ci:95
```

If local macOS 10.15.x cannot run `npm ci`, record the local environment blocker and rely on GitHub Actions or Linux/Docker Node 20 for fresh install proof.

## AI Agent Done Criteria

Before claiming done, AI agents must report:

- files changed
- source/generated distinction
- package script changes, if any
- workflow changes, if any
- exact commands run
- PASS/FAIL/WARNING status
- known local environment blockers
- intentional non-changes

AI agents must not hide local `npm ci` failures. For the known macOS 10.15.x esbuild failure, classify it as local environment blocker and CI non-blocking only when the evidence matches `docs/audits/LOCAL_NPM_CI_ESBUILD_COMPATIBILITY_REPORT.md`.

## Future Guard Classification

Classify future guards by blast radius:

- Make it `BLOCKER` if failure can break crawlability, source/generated integrity, deploy safety, production indexing, schema, accessibility basics, Store isolation, comments, route truth, Worker syntax, or CI install in the authority environment.
- Make it `WARNING` if the issue is advisory, local-only, cosmetic, non-critical, budget-related, or not yet tied to user-visible/SEO/deploy breakage.
- Make it `INFO` if it only tracks trends or inventory.

## Avoid Over-Strict Guards

Do not hard-fail normal development CI for:

- advisory Lighthouse scores
- advisory bundle budgets
- non-critical visual rhythm drift
- local-only macOS native dependency limitations when CI authority passes
- stale reports that are not deployed/runtime artifacts

## Avoid Weak Guards

Do not downgrade blockers to warnings when they affect:

- public crawlable HTML
- schema/canonical/robots correctness
- route truth
- source/generated parity
- Cloudflare deploy safety
- Worker routing/syntax
- production flags
- Store isolation/readiness
- accessibility-critical controls
- Blogger-native comments contract
