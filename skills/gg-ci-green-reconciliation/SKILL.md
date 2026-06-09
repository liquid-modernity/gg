---
name: gg-ci-green-reconciliation
description: Use when local checks, GitHub Actions, CI workflows, build commands, guards, deploy checks, or path-based checks fail or need reconciliation.
---

# GG CI Green Reconciliation Skill

Use this skill for any CI, QA, GitHub Actions, guard, or deploy-readiness failure.

## Prime Directive

Fix the cause, not the symptom. Do not bypass or weaken guards just to get green.

## Failure Classification

Classify every failure:

- `source defect`: implementation violates contract.
- `generated stale`: source changed but generated output/fingerprint not updated.
- `path mismatch`: repo structure or script path changed.
- `environment`: missing token, DNS/network, unsupported runtime.
- `test/guard stale`: guard expects old contract, and contract was intentionally changed.
- `workflow wiring`: GitHub Actions or package script calls wrong command.

Only update a guard when the product contract intentionally changed and the new contract is documented.

## Procedure

1. Capture exact failing command.
2. Capture error output.
3. Identify failure class.
4. Find owning source file.
5. Fix source or wiring.
6. Re-run the smallest failing command.
7. Re-run the relevant aggregate command.
8. Record PASS/FAIL.

## GitHub Actions Rules

- Do not make Actions green by skipping real checks.
- If a path moved into `product/`, use `working-directory: product` or `npm --prefix product` intentionally.
- Keep buyer workflows simple: `npm ci`, `npm run doctor`, `npm run build`, deploy if configured.
- Keep dev workflows allowed to run heavier internal QA.

## Guard Update Rules

A guard can be changed only when:

1. a contract changed intentionally;
2. docs/config/registry changed with it;
3. old behavior is no longer desired;
4. the guard checks the new contract deterministically.

Never replace a precise guard with a broad permissive check.

## Common Commands

Current repo:

```bash
git diff --check
npm run ci:qa
npm run ci:cloudflare
```

Blogger template focused:

```bash
node qa/template-fingerprint.mjs --check
npm run gaga:verify-semantic-ssr
npm run gaga:verify-a11y-static
npm run gaga:verify-nav-more
npm run gaga:verify-discovery-filters
npm run gaga:verify-preview-sheet
```

Product repo future:

```bash
npm run doctor
npm run build
```

Dev root future:

```bash
npm --prefix product run doctor
npm --prefix product run build
```

## Handoff Format

Report:

- failing command;
- failure class;
- root cause;
- files changed;
- commands re-run;
- PASS/FAIL;
- remaining CI blockers.
