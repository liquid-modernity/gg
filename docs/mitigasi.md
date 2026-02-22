# Mitigasi Insiden Blog1 Crash + Live Gate

Last updated: 2026-02-22

## Ringkasan Problem
Insiden utama yang memblokir deploy adalah marker LIVE berikut:

`Failed to render gadget 'Blog1'. There was an error processing the markup.`

Fakta penting:
- Ini error **Blogger server-side template** (gadget `Blog1`), bukan error Worker/SPA.
- Saat gadget crash, HTML post/listing bisa tidak lengkap (contoh: post blank, listing hanya sebagian, binding JS turunannya gagal).
- Error muncul hanya pada post tertentu (sentinel), sehingga terlihat intermittent jika hanya cek URL umum.

## Akar Masalah Teknis
Akar masalah dominan: **unsafe dereference** pada template Blogger untuk field opsional.

Pattern berisiko yang pernah memicu crash:
- `data:post.labels.first.*`
- `data:post.labels[0].*`
- `data:post.author.authorPhoto.url ?: ...`
- `data:post.lastUpdated.iso8601 ?: ...`
- guard sempit seperti `cond='data:post.author.authorPhoto.url'` tanpa guard parent object.

Dampak langsung:
- `Blog1` abort render.
- Sentinel post gagal memenuhi kontrak `.gg-post`.
- `/blog` dapat kolaps (jumlah postcard SSR turun), lalu fitur `Load more` terlihat rusak karena fondasi DOM awal tidak sehat.

## Mitigasi yang Sudah Diterapkan

### 1) Hardening Template (source of truth)
File:
- `index.prod.xml`
- `index.dev.xml`

Prinsip hardening:
- Hindari `.first` dan `[0]` untuk label; gunakan loop index aman untuk label pertama.
- Hindari nested deref di ternary `?:` untuk properti opsional.
- Gunakan guard parent object eksplisit sebelum akses child.
- Pertahankan fallback konten agar tidak merusak UX saat data optional kosong.

### 2) CI Guardrails (static verifier)
Verifikasi berikut harus selalu PASS sebelum ship:
- `tools/verify-blogger-label-first-index-ban.mjs`
- `tools/verify-blogger-nested-deref-ban.mjs`
- `tools/verify-blogger-label-guards.mjs`
- `tools/verify-blogger-null-deref-guards.mjs`
- `tools/verify-blogger-unsafe-deref.mjs`

Semua sudah di-wire ke `tools/gate-prod.sh`.

### 3) Live Smoke Sentinel (fail fast)
`tools/smoke.sh` sudah diperketat:
- cek marker crash Blog1 di `/blog`
- cek sentinel post default:
  - `/2026/02/automatically-identify-key-words-and.html`
- fail jika sentinel mengandung marker crash Blog1
- fail jika sentinel tidak mengandung marker post `.gg-post`
- fail jika hard refresh `/blog` tidak memenuhi kontrak SSR postcard minimum

### 4) Operator Hint pada Gate Live
`tools/gate-release-live.sh` dan `tools/smoke.sh` menampilkan instruksi eksplisit saat marker Blog1 muncul:

`THIS WILL NOT FIX ITSELF BY WORKERS DEPLOY — YOU MUST PASTE index.prod.xml INTO BLOGGER THEME`

Tujuan: mencegah salah diagnosis (mengulang deploy Worker tanpa memperbaiki template Blogger).

## SOP Supaya Tidak Terulang

### A. Pra-deploy (lokal/CI)
Jalankan berurutan:
1. `npm run gate:prod`
2. Pastikan semua verifier template + budgets PASS.

### B. Saat Release
1. `npm run ship` (jika ada perubahan release assets).
2. Paste `index.prod.xml` terbaru ke Blogger PROD Theme.
3. Save/publish theme sebelum validasi live.

### C. Pasca-deploy (wajib)
1. `bash tools/gate-release-live.sh`
2. Validasi cepat manual:
   - `https://www.pakrpp.com/blog`
   - `https://www.pakrpp.com/2026/02/automatically-identify-key-words-and.html`
3. Pastikan:
   - tidak ada marker `Failed to render gadget 'Blog1'`
   - sentinel punya `.gg-post`
   - `/blog` hard refresh memenuhi minimum postcard SSR

## Triage Cepat Saat Gate Gagal

### Jika error = Blog1 crash marker
Makna: template Blogger crash.
Aksi:
1. periksa ulang `index.prod.xml` yang dipaste (pastikan versi terbaru)
2. paste ulang ke Blogger PROD Theme
3. rerun `bash tools/gate-release-live.sh`

### Jika error = DNS/resolve host (`curl: (6)`)
Makna: gangguan network resolver sementara dari runner/environment, bukan regresi kode otomatis.
Aksi:
1. rerun gate live (retry)
2. konfirmasi endpoint ping:
   - `curl -sSI "https://www.pakrpp.com/__gg_worker_ping?x=$(date +%s)"`
3. jika stabil, jalankan ulang gate live sampai 1 pass penuh end-to-end

## Kebijakan Teknis (Wajib)
1. Jangan akses properti opsional bertingkat tanpa guard parent.
2. Jangan pakai `.first`/`[0]` pada labels di template Blogger.
3. Jangan pakai nested deref pada `?:` untuk nullable field.
4. Setiap perubahan template wajib melewati `npm run gate:prod`.
5. Deploy Worker tidak dianggap selesai sebelum `gate-release-live` PASS.

## Exit Criteria
Kasus dianggap selesai hanya jika semua ini terpenuhi bersamaan:
1. `npm run gate:prod` PASS.
2. `bash tools/gate-release-live.sh` PASS.
3. Sentinel post bebas marker Blog1 crash.
4. Sentinel post mengandung `.gg-post` marker.
5. `/blog` hard refresh memenuhi kontrak SSR postcard minimum.
