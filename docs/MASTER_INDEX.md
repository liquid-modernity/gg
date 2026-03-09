# MASTER_INDEX
Last updated: 2026-03-09

## 1) Active Source Of Truth (runtime + release)
- Runtime template: `index.prod.xml`
- Worker runtime: `src/worker.js`
- Service worker runtime: `public/sw.js`
- Runtime headers/observability: `public/_headers`
- Runtime assets (authoring): `public/assets/latest/**`
- Runtime assets (pinned): `public/assets/v/<release-id>/**`
- Release computation: `tools/compute-release-id.mjs`
- Release stamp/sync: `tools/release.js`
- Release alignment verifier: `tools/verify-release-aligned.mjs`

## 2) Verify Tier Map
Canonical entry scripts in `package.json`:
- P0 blocking: `npm run verify:p0`
- P1 quality: `npm run verify:p1`
- P2 audit/reference: `npm run verify:p2`
- Ship final preflight: `npm run preflight:ship` (same gate path used by `npm run ship` before commit/push)

### P0 blocking (ship gate)
`npm run verify:p0` expands to:
- `npm run verify:xml`
- `npm run verify:assets`
- `npm run verify:release`
- `npm run verify:template-contract`
- `npm run verify:template-hygiene`
- `node tools/verify-mixed-config-gated.mjs`
- `node tools/verify-sidebar-sticky-contract.mjs`
- `node tools/verify-infopanel-toc-contract.mjs`
- `node tools/verify-postmeta-contract.mjs`

### P1 quality (merge/release candidate quality)
`npm run verify:p1` expands to:
- `npm run verify:runtime-es5`
- `node tools/verify-router-contract.mjs`
- `node tools/verify-dock-contract.mjs`
- `node tools/verify-route-a11y-contract.mjs`
- `node tools/verify-loadmore-contract.mjs`
- `node tools/verify-runtime-core-features.mjs`
- `node tools/verify-render-atomic-swap.mjs`
- `node tools/verify-ui-guardrails.mjs`
- `node tools/verify-template-no-nested-interactives.mjs`
- `node tools/verify-tap-targets.mjs`

### P2 audit/reference (non-blocking governance evidence)
`npm run verify:p2` expands to:
- `npm run verify:rulebooks`
- `node tools/verify-ledger.mjs`
- `npm run verify:template-fingerprint`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/verify-budgets.mjs`
- `npm run verify-inline-css`
- `node tools/verify-crp.mjs`
- `node tools/verify-perf-workflow-contract.mjs`
- `node tools/verify-perf-history-contract.mjs`
- `node tools/verify-perf-urls-ssot.mjs`

Live/reference checks tetap di P2 manual:
- `tools/verify-live-*.mjs`
- `tools/smoke.sh`
- `tools/verify-worker.sh`

## 3) Overlap And Consolidation (actual changes)
Overlap teridentifikasi:
- `npm run verify:release` sudah mencakup `verify-rulebooks` + `verify-authors-dir-contract`.
- `tools/gate-prod.sh` sebelumnya menjalankan dua verify itu lagi secara eksplisit.
- `tools/verify-runtime-core-features.mjs` (P1) menguji runtime nyata untuk 5 fitur inti: TOC, right/sidebar metadata panel, Load More, dock, toolbar.
Overlap parsial runtime harness vs verifier contract lama:
- `tools/verify-infopanel-toc-contract.mjs` (P0) untuk guardrail struktur/token TOC + panel.
- `tools/verify-dock-contract.mjs` (P1) untuk kontrak struktur dock/action.
- `tools/verify-loadmore-contract.mjs` (P1) untuk kontrak DOM-safe + rehydrate loadmore.
- `tools/verify-postmeta-contract.mjs` (P0) untuk kontrak sumber metadata panel.

Konsolidasi dilakukan:
- `tools/gate-prod.sh`: eksekusi ganda `verify-rulebooks` dan `verify-authors-dir-contract` dihapus.
- Alasan tertulis di file gate: dua verify tersebut sudah dijalankan oleh `verify:release`.
- Runtime core feature harness masuk jalur QA resmi di P1 (`npm run verify:p1`) sebagai behavioral check utama.

Konsolidasi operasional:
- Tier runner ditambahkan di `package.json` (`verify:p0`, `verify:p1`, `verify:p2`, `audit:min`) agar jalur audit tidak menyebar.

## 4) Verify Status (kept / merged / retired)
Dipertahankan:
- Semua verify existing tetap ada sebagai tool individual.
- `verify-infopanel-toc-contract`, `verify-postmeta-contract`, `verify-dock-contract`, `verify-loadmore-contract` tetap dipertahankan.

Digabung (execution path):
- `verify-rulebooks` + `verify-authors-dir-contract` digabung jalur eksekusinya lewat `verify:release` untuk gate.

Redundant parsial (tidak dipensiunkan):
- `verify-runtime-core-features` overlap perilaku dengan verifier contract lama, tetapi contract verifier tetap dibutuhkan untuk guardrail statis cepat.
- Toolbar belum punya verifier contract statis setara; coverage runtime tetap berada di harness P1.

Diturunkan bobot:
- Tidak ada pada tahap ini; contract verifier lama tetap aktif sesuai tier semula.

Dipensiunkan:
- Tidak ada verify tool yang dipensiunkan pada perubahan ini.

## 5) Docs Core vs Annex
Core (wajib baca maintainer/auditor):
- `docs/MASTER_INDEX.md`
- `docs/DOCUMENTATION.md`
- `docs/release/ASSET_CONTRACT.md`
- `docs/ledger/GG_CAPSULE.md`
- `docs/ci/PIPELINE.md`
- `docs/AGENTS.md`
- `docs/NAMING.md`

Annex (referensi pendukung/riwayat):
- `docs/audit/**`
- `docs/perf/**`
- `docs/sw/**`
- `docs/ui/**`
- `docs/ledger/TASK_*.md`
- `docs/pages/**`
- Catatan ad-hoc lain di `docs/` yang bukan daftar core.

## 6) Audit Pack Minimum
Urutan minimum untuk audit lokal:
1. `npm run verify:p0`
2. `npm run verify:p1`
3. `npm run audit:min` (alias langkah 1+2 untuk audit cepat)
4. `npm run preflight:ship` (representasi gate final ship)

Jika perlu evidence governance/perf:
1. `npm run verify:p2`
2. (opsional live) jalankan subset `tools/verify-live-*.mjs` sesuai kebutuhan audit.
