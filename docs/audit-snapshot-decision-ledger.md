# Audit Snapshot Decision Ledger

Status: active decision ledger
Owner: docs / QA / repo governance
Scope: tracked audit snapshots and closely related audit tooling

This ledger records which audit artifacts are source/tooling and which are
legacy generated snapshots. This task makes decisions only; it does not delete,
move, or regenerate tracked snapshots.

## Decision Vocabulary

| Status | Meaning |
| --- | --- |
| `keep` | Keep in place as source/tooling or active governance input. |
| `archive_candidate` | Keep for now, but move to a dedicated audit-history location or replace with a governed artifact in a future cleanup. |
| `remove_candidate` | Safe candidate for deletion after confirmation because it is superseded and has low durable value. |
| `decision_pending` | Do not move or delete until ownership or replacement evidence is clearer. |

## Snapshot Decisions

| Artifact | Classification | Why it exists | Durable value | Superseded? | Deletion risk | Recommended next action |
| --- | --- | --- | --- | --- | --- | --- |
| `qa/custom-audit.json` | `archive_candidate` | JSON report for a historical ZIP audit of `dist/gg-audit-4702eaa.zip` generated on 2026-03-12. | Preserves evidence of earlier package junk and missing-tooling conditions. | Yes, superseded by later audit tooling and `qa/zip-audit.latest.*`, but still useful as packaging-history evidence. | Medium. Deleting it erases historical proof of the packaging problem that later hygiene work addressed. | Keep for now. In a future cleanup, move to a clearly named audit history location or replace with a consolidated historical note. |
| `qa/custom-audit.md` | `archive_candidate` | Human-readable report paired with `qa/custom-audit.json`. | Useful for non-expert review of the same historical packaging failure. | Yes, superseded by later audit runs. | Medium. Same historical-proof concern as the JSON pair. | Keep for now. Archive with the JSON pair in a future cleanup. |
| `qa/zip-audit.latest.json` | `decision_pending` | JSON report for a later ZIP audit of `dist/gg-audit.zip` generated on 2026-03-26. | Provides a later baseline showing no junk entries and current audit expectations at that point. | Partially. The `latest` name is misleading because the repo has moved forward, but it still documents a known-good audit baseline. | Medium. Removing it before defining replacement output policy may weaken audit continuity. | Keep in place until the audit-output policy decides whether root-level `latest` snapshots should be regenerated, archived, or replaced by `qa/audit-output/*`. |
| `qa/zip-audit.latest.md` | `decision_pending` | Human-readable report paired with `qa/zip-audit.latest.json`. | Useful for quick review of the later ZIP baseline. | Partially. Same as JSON pair. | Medium. Same audit-continuity concern as the JSON pair. | Keep in place until the audit-output policy is finalized. |

## Tooling Decisions

These are not legacy snapshots. They are source/tooling unless a future task
proves otherwise.

| Artifact | Classification | Reason | Recommended next action |
| --- | --- | --- | --- |
| `qa/gaga-audit.mjs` | `keep` | Active audit script. It writes report artifacts under `qa/audit-output/*` by default. | Keep. |
| `qa/package-audit.mjs` | `keep` | Active package/audit pack support script. | Keep. |
| `qa/generate-audit-zip.js` | `decision_pending` | Older helper that creates `.audit-report/audit-*.zip`. It may be superseded by newer audit flow but is tooling, not a snapshot. | Do not delete in this task. Reassess in a tooling-focused cleanup. |
| `qa/template-proof.sh` | `keep` | Active template proof script. | Keep. |
| `qa/live-smoke.sh` | `keep` | Active public/template smoke script. | Keep. |
| `qa/live-smoke-worker.sh` | `keep` | Active Worker-scope smoke script. | Keep. |

## Policy Decision

Tracked generated audit snapshots should not be treated as normal source of
truth. They may stay temporarily only when they preserve useful historical
evidence or a known-good baseline.

Future cleanup should prefer:

1. Keep active audit scripts in `qa/`.
2. Write new generated audit outputs to a dedicated generated-output location.
3. Archive historical snapshots with explicit dates and task context if their evidence is still valuable.
4. Remove superseded snapshots only after the replacement evidence path is in place and documented.

## Current Keep List

```text
qa/gaga-audit.mjs
qa/package-audit.mjs
qa/template-proof.sh
qa/live-smoke.sh
qa/live-smoke-worker.sh
```

## Current Archive Candidates

```text
qa/custom-audit.json
qa/custom-audit.md
```

## Current Decision Pending

```text
qa/zip-audit.latest.json
qa/zip-audit.latest.md
qa/generate-audit-zip.js
```

## Current Remove Candidates

```text
none
```

## Remaining Debt

There is not yet a single finalized policy for whether root-level tracked
`qa/*audit*.{json,md}` snapshots should be archived under docs, regenerated into
`qa/audit-output/*`, or removed after replacement. This ledger makes that debt
explicit so future cleanup can be narrow and non-destructive.
