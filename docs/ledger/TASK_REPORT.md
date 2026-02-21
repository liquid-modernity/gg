TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-DIST-AUDIT-20260221
TITLE: Enforce gg-audit distribution contract

TASK_SUMMARY
- Tetapkan kontrak distribusi resmi bahwa handoff/share hanya boleh lewat `dist/gg-audit.zip` hasil `npm run zip:audit`.
- Tambah dokumentasi kontrak distribusi yang singkat dan tegas.
- Perbarui handoff ledger agar instruksi distribusi tidak ambigu.
- Tambah guardrail CI pada workflow deploy: build + upload artifact `dist/gg-audit.zip`.
- Konfirmasi script `zip:audit` sudah ada di `package.json` dan tetap dipakai sebagai jalur tunggal.

CHANGES
- docs/release/DISTRIBUTION.md
- docs/ledger/NEW_ROOM_HANDOFF.md
- .github/workflows/deploy.yml
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/* (release bumped by build for verify:release alignment)

VERIFICATION EVIDENCE (manual)
- `npm run verify:release` -> FAIL (expected release changed after GG_CAPSULE update) -> fixed by `ALLOW_DIRTY_RELEASE=1 npm run build`
- `npm run verify:release` -> PASS
- `npm run verify:assets` -> PASS
- `node tools/verify-template-contract.mjs` -> PASS
- `node tools/verify-router-contract.mjs` -> PASS
- `node tools/verify-budgets.mjs` -> PASS
- `node tools/verify-inline-css.mjs` -> PASS
- `node tools/verify-crp.mjs` -> PASS
- `SMOKE_LIVE_HTML=1 tools/smoke.sh` -> FAIL (sandbox DNS: `Could not resolve host: www.pakrpp.com`)
- `SMOKE_ALLOW_OFFLINE_FALLBACK=1 SMOKE_LIVE_HTML=1 tools/smoke.sh` -> PASS (offline fallback)
- `npm run zip:audit` -> FAIL before commit by design (clean-tree guardrail); rerun on clean tree after commit for distribution output

RISKS / ROLLBACK
- Risk: low/med; release lokal sudah `3f9a7f9` sementara live verification dari sandbox terbatas karena DNS/network.
- Rollback: revert commit ini untuk mengembalikan kontrak distribusi, workflow artifact, dan ledger.
