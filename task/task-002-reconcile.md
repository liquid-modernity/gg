# TASK — Reconcile Guard, QA, Tools, and CI/CD

Use these audit files as the source of truth:

- `docs/audits/SYSTEM_ARCHITECTURE_COMPLIANCE_REPORT.md`
- `docs/audits/system-architecture-compliance-score.json`
- `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`

This task is for guard, QA, tooling, and CI/CD reconciliation.

Do not weaken architectural standards.
Do not hide real blockers.
Do not make advisory issues hard-fail unless they represent real architectural risk.
Do not change production flags.
Do not refactor product features unless required to fix guard/CI wiring.

The goal is to make validation strict on real risks, but not hostile to human maintainers.

---

## Main Goal

Create a clear 3-tier validation model:

1. BLOCKER — must fail CI
2. WARNING — reported but does not fail CI
3. INFO — trend/report only

The repository must remain aligned with `SYSTEM_ARCHITECTURE_AND_CODING_STANDARDS.md`.

---

## Required Work

Audit and reconcile:

- `package.json`
- `/qa`
- `/tools`
- `/tests`
- `.github/workflows`
- Cloudflare/Wrangler configuration
- Blogger-related publish scripts if present
- existing release/readiness scripts
- documentation that describes QA or CI commands

---

## Guard Classification

Classify each guard into one of these levels.

### BLOCKER

These must fail CI:

- build failure
- missing `.gitignore`
- missing required GitHub Actions workflows
- broken Cloudflare deploy configuration
- missing source-of-truth file
- generated file manually patched
- HTML fallback removed
- route registry broken
- duplicate central controller
- duplicated route logic across `/`, `/landing`, and `/store`
- invalid schema/metadata on critical public routes
- critical accessibility issue
- production placeholder asset
- production flags opened without release checklist
- `.DS_Store` or `__MACOSX` in repo
- broken Worker syntax or route mapping
- missing required deployment secret reference by name
- failure of critical source/generated boundary guard

### WARNING

These should be reported but not fail normal development CI:

- CSS/JS above advisory budget
- minor unused CSS selector
- folder README missing
- minor naming inconsistency
- non-critical microcopy issue
- non-critical accessibility warning
- Lighthouse score not perfect
- visual rhythm warning
- stale report file
- advisory image/cache budget

### INFO

These are trend/report only:

- asset size trend
- bundle growth trend
- file count
- selector count
- hook count
- build duration
- number of routes
- number of generated outputs

---

## Required GitHub Actions

Ensure these workflows exist:

```txt
.github/workflows/ci.yml
.github/workflows/deploy-cloudflare.yml
.github/workflows/lighthouse-ci.yml
ci.yml

Should run on pull request and push to main.

Must include:

checkout
setup Node
npm ci
npm run build
blocker QA guards
no deploy
deploy-cloudflare.yml

Should run on push to main and manual dispatch.

Must include:

checkout
setup Node
npm ci
npm run build
blocker QA guards
Cloudflare deploy via Wrangler

Use repository secret names only. Do not expose values.

Expected Cloudflare secret names:

CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID

Use Blogger secrets only if Blogger API publishing is actually part of the workflow:

BLOGGER_API_KEY
BLOGGER_ID_PAKRPP
BLOGGER_ID_PAKRPP_STORE
lighthouse-ci.yml

Should be advisory by default.

It may use continue-on-error: true unless production release mode explicitly requires Lighthouse as a hard gate.

Do not turn Lighthouse into a hard blocker too early.

Required Documentation

Create or update:

docs/ci-guard-policy.md

It must explain:

blocker guards
warning guards
info guards
local commands
CI commands
release candidate commands
Cloudflare deploy command
what humans should run before pushing
what AI agents must run before claiming done
how to classify future guards
how to avoid over-strict guards
how to avoid weak guards

Also update if needed:

QA-COMMANDS.md
SOURCE-OF-TRUTH.md
REPO-STRUCTURE.md
AGENTS.md

Do not create duplicate documentation if an existing file clearly owns the responsibility.
Update the existing source-of-truth doc instead.

Package Scripts

Ensure package.json has clear commands for:

npm run build
npm run ci:qa
npm run ci:85
npm run ci:95

If current names differ, preserve backward compatibility when practical.

Do not remove existing useful commands without documenting why.

Acceptance Criteria

After changes, run:

npm ci
npm run build
npm run ci:qa
npm run ci:85
npm run ci:95

If any command fails, report clearly whether the failure is:

true blocker
environment issue
missing secret
advisory warning incorrectly treated as hard fail
unrelated pre-existing issue

Do not claim success if any required command fails.

Required Final Report

Create:

docs/audits/GUARD_QA_CI_RECONCILIATION_REPORT.md

Include:

files changed
commands run
pass/fail results
guards reclassified
workflows created/updated
package scripts changed
docs updated
remaining blockers
remaining warnings
risks requiring human review
Final Response

When done, summarize only:

files changed
commands run
commands failed
whether CI/CD is now blocker/warning/info aligned
what remains before production readiness