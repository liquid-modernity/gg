# TASK_LOG Policy
Last updated: 2026-02-06

Purpose: keep `docs/ledger/TASK_LOG.md` append-only and non-authoritative for release IDs.

Rules
- Append-only: do not edit or rewrite past entries.
- Do not record `RELEASE_ID` in TASK_LOG.
- Use `RELEASE_REF: GG_CAPSULE AUTOGEN` for new entries instead of a concrete release id.
- Canonical release id lives only in the AUTOGEN block of `docs/ledger/GG_CAPSULE.md`.
- CI enforces this via `tools/verify-ledger.mjs`.
