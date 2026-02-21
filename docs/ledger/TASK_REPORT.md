TASK_REPORT
Last updated: 2026-02-21

TASK_ID: TASK-AUTHORS-DIR-20260221
TITLE: Authors dir datasource contract + verifier

TASK_SUMMARY
- Tambah source template `docs/pages/p-author.html` untuk kontrak datasource `/p/author.html`.
- Pastikan template memuat `#gg-authors-dir` (JSON datasource) dan fallback `<ul>` crawlable.
- Minimal mandatory data dipenuhi: `pakrpp -> /p/pak-rpp.html`.
- Tambah verifier `tools/verify-authors-dir-contract.mjs` untuk validasi JSON + key wajib + kontrak href.
- Wire verifier ke suite verify (`package.json`, CI, deploy workflow, gate-prod script).
- Update ledger (`GG_CAPSULE`, `TASK_LOG`, `TASK_REPORT`).

CHANGES
- docs/pages/p-author.html
- tools/verify-authors-dir-contract.mjs
- package.json
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- tools/gate-prod.sh
- docs/ledger/GG_CAPSULE.md
- docs/ledger/TASK_LOG.md
- docs/ledger/TASK_REPORT.md
- index.prod.xml
- public/sw.js
- src/worker.js
- public/assets/v/* (release alignment from build)

VERIFICATION EVIDENCE (manual)
- `node tools/verify-authors-dir-contract.mjs` -> PASS
- `npm run verify:release` -> FAIL (release drift after metadata updates) -> fixed by `ALLOW_DIRTY_RELEASE=1 npm run build`
- `npm run verify:release` -> PASS
- `npm run verify:assets` -> PASS
- `node tools/verify-template-contract.mjs` -> PASS
- `node tools/verify-router-contract.mjs` -> PASS
- `node tools/verify-budgets.mjs` -> PASS
- `node tools/verify-inline-css.mjs` -> PASS
- `node tools/verify-crp.mjs` -> PASS
- `SMOKE_LIVE_HTML=1 tools/smoke.sh` -> FAIL (strict expected release `cd8a289`, live worker still `3f9a7f9`)
- `SMOKE_EXPECT=live SMOKE_LIVE_HTML=1 tools/smoke.sh` -> FAIL (sandbox DNS: `Could not resolve host: www.pakrpp.com`)
- `SMOKE_ALLOW_OFFLINE_FALLBACK=1 SMOKE_LIVE_HTML=1 tools/smoke.sh` -> PASS (offline fallback)

RISKS / ROLLBACK
- Risk: low/med; live smoke strict belum hijau karena release live belum sejalan dan DNS/network sandbox intermittent.
- Rollback: revert commit task ini untuk kembali ke state sebelum kontrak authors dir ditambahkan.
