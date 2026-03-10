# CI/CD Pipeline
Last updated: 2026-03-11

Repo ini main-only. CI adalah gate utama untuk repo consistency. Deploy fokus pada publish + live proof, bukan mengulang seluruh verifikasi lokal/CI.

## Triggers
- CI workflow: `.github/workflows/ci.yml`
  - `push` ke `main`
  - `pull_request`
- Deploy workflow: `.github/workflows/deploy.yml`
  - `workflow_run` saat `CI` sukses di `main`
  - `workflow_dispatch` untuk run manual

## CI (single linear gate)
Urutan:
1. `npm ci`
2. `npm run build`
3. `npm run verify:p0`
4. `npm run verify:p1`
5. `npm run verify:p2`
6. build determinism check (`git diff` harus clean)

Tujuan CI:
- memvalidasi artefak repo dan kontrak runtime yang load-bearing
- menjaga agar commit di `main` tetap reproducible

## Deploy (publish + strict live gate)
Urutan:
1. `npm ci`
2. quick sanity: `npm run verify:release` + `npm run verify:assets`
3. `wrangler deploy --config wrangler.jsonc`
4. `bash tools/gate-release-live.sh`

`gate-release-live.sh` menjalankan:
- `tools/smoke.sh` dalam mode strict live (`SMOKE_ALLOW_OFFLINE_FALLBACK=0`, `SMOKE_LIVE_HTML=1`)
- `node tools/verify-headers.mjs --mode=live`
- `node tools/verify-palette-a11y.mjs --mode=live`

## Local Operator Path
- Daily:
  - `npm run verify:p0`
  - `npm run verify:p1`
- Pre-ship:
  - `npm run preflight:ship`
  - `npm run ship`
- Optional local live smoke:
  - `GG_LOCAL_LIVE_SMOKE=1 bash tools/gate-release.sh`

## Principles
- Tidak ada duplikasi besar CI vs deploy vs ship.
- Verifier adalah support layer; live DOM tetap sumber kebenaran.
- Checks granular/noisy tetap tersedia sebagai tools ad-hoc, tapi tidak memblokir jalur harian.
