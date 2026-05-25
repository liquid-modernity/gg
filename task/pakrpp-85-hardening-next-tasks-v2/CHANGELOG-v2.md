# CHANGELOG-v2

## What changed from v1

```txt
Added 01-PAKRPP-85-ARCHITECTURE-NORTH-STAR.md
Added TASK-QA-CI-RECONCILIATION-001
Updated README task order
Updated 00 baseline constraints
Added Rewrite, Not Override/Patch definition
Added QA / Guard / CI Reconciliation Contract
Added deployment artifact discipline
Updated task files with CI reconciliation reminder
Updated minimum QA wording to include ci:qa and ci:cloudflare
```

## Why this revision exists

The original pack had the right architectural direction, but it did not fully prevent drift between new guards, package scripts, aggregate QA, and GitHub Actions.

This revision makes the executable QA chain the source of truth.
