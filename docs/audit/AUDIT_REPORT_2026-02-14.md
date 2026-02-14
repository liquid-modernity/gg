# AUDIT_REPORT_2026-02-14
Last updated: 2026-02-14
Release ID: 697775d
Asset Ver (CSS/JS query): 20260203160035
Scope: repo snapshot /Users/macbookpromid2012/Documents/BLOG-MIGRASI CDN DAN PWA/gg

**ARSITEKTUR**
- Alur utama request: Browser -> Cloudflare Worker -> Blogger HTML/XML -> Client JS (boot.js -> main.js -> core.js + modules) -> Service Worker -> Static Assets. Evidence: src/worker.js, index.prod.xml, public/assets/latest/boot.js, public/assets/latest/main.js, public/assets/latest/core.js, public/sw.js.
- Worker bertindak sebagai reverse proxy + asset server: melayani `/assets/*`, `/sw.js`, `/manifest.webmanifest`, `/offline.html`, `/gg-flags.json`, `/api/telemetry`, `/api/proxy`, `/api/csp-report`, dan HTML rewrite untuk kanonikal + schema pada `/blog`. Evidence: src/worker.js.
- Template Blogger DEV vs PROD: DEV menyetel `gg:mode=dev` dan asset dari `/assets/latest/*` (PWA dimatikan + SW cleanup inline). PROD menyetel asset pinned `/assets/v/697775d/*` + manifest + boot loader. Evidence: index.dev.xml, index.prod.xml.
- Client JS: `boot.js` menunda load `main.js` sampai idle/interaction; `main.js` memuat `core.js` yang menangani router, render, telemetry, API, dan loader module `GG.boot.loadModule`. Evidence: public/assets/latest/boot.js, public/assets/latest/main.js, public/assets/latest/core.js.
- Kontrak DOM (template hooks): modul membutuhkan `#gg-main`, `#gg-dialog`, `#gg-share-sheet`, `data-gg-home-root`, `data-gg-home-layer`, dan `#gg-config` untuk konfigurasi JSON. Evidence: index.prod.xml, public/assets/latest/modules/ui.bucket.core.js.
- Service Worker: cache-first untuk `/assets/v/*` + ikon; network-only untuk `/assets/latest/*`; stale-while-revalidate untuk manifest dan offline; fallback offline hanya untuk navigation. Evidence: public/sw.js.
- Data layer: listing & search memakai Blogger JSON feed (`/feeds/posts/default`/`summary`), search memakai Fuse.js + idb-keyval, poster memakai `/api/proxy` untuk gambar. Evidence: public/assets/latest/core.js, public/assets/latest/modules/ui.bucket.search.js, public/assets/latest/modules/ui.bucket.poster.js, src/worker.js.
- Dependensi eksternal: Google Fonts, instant.page, Fuse.js, idb-keyval, Google PageSpeed API (poster). Evidence: index.prod.xml, public/assets/latest/boot.js, public/assets/latest/modules/ui.bucket.search.js, public/assets/latest/modules/ui.bucket.poster.js.

**ORKESTRASI**
- Build/release: `npm run build` menjalankan `tools/release.js` yang butuh git clean, menghitung release id, menyalin `public/assets/latest` ke `public/assets/v/<id>`, memperbarui `public/sw.js`, `src/worker.js`, `index.prod.xml`, dan `docs/ledger/GG_CAPSULE.md`. Evidence: tools/release.js.
- CI: `.github/workflows/ci.yml` berjalan pada push/pull_request, mewajibkan `package-lock.json`, menjalankan build + verifiers + determinism check, lalu memicu deploy workflow. Evidence: .github/workflows/ci.yml.
- Deploy: `.github/workflows/deploy.yml` adalah `workflow_dispatch` (dipicu CI), verifikasi CI sukses, preflight build + verifiers, audit route Cloudflare, deploy via wrangler, lalu smoke test headers + pinned assets + live HTML. Evidence: .github/workflows/deploy.yml.
- Konfigurasi Worker: `wrangler.jsonc` mengikat `public/` sebagai ASSETS, route hanya `www.pakrpp.com/*` (apex bergantung pada redirect di Cloudflare). Evidence: wrangler.jsonc, docs/ledger/GG_CAPSULE.md.
- Manual gate: Blogger template tetap manual paste (dev/prod) sehingga perilaku runtime sangat tergantung pada XML yang terakhir ditempel. Evidence: index.dev.xml, index.prod.xml.
- Flags: `public/__gg/flags.json` dipublikasikan menjadi `/gg-flags.json` untuk toggle SW dan CSP report-only. Evidence: public/__gg/flags.json, src/worker.js, public/sw.js, public/assets/latest/modules/pwa.js.
- PWA gating: `GG.core.ensureWorker` ping `/__gg_worker_ping` (timeout 1200ms) sebelum inisialisasi SW, jadi status Worker menentukan PWA + /blog alias. Evidence: public/assets/latest/core.js, public/assets/latest/modules/pwa.js, src/worker.js.

**BUG**
- Risiko paste XML salah (DEV vs PROD) dapat mematikan PWA atau memicu 404 asset pinned; dev men-set `gg:mode=dev` + `/assets/latest/*` sedangkan prod men-set `/assets/v/697775d/*`. Dampak: PWA tidak aktif atau UI blank karena asset 404. Kondisi: XML salah ditempel ke Blogger. Evidence: index.dev.xml, index.prod.xml.
- Worker hanya ter-route untuk `www.pakrpp.com/*` (apex tidak terikat); jika redirect apex gagal atau request tidak melalui www, Worker bypass dan `/assets/v/*` + `/blog` rewrite rusak. Dampak: asset 404 + canonicalization hilang. Evidence: wrangler.jsonc, .github/workflows/deploy.yml (route audit hanya www).
- `ensureWorker` timeout 1200ms dapat salah mendeteksi Worker “off” pada jaringan lambat, sehingga `/blog` alias dan SW/PWA dimatikan. Dampak: PWA tidak register + canonical `/blog` tidak dinormalkan. Evidence: public/assets/latest/core.js, public/assets/latest/modules/pwa.js.
- Modul search bergantung pada CDN pihak ketiga (Fuse.js di jsdelivr + idb-keyval di unpkg). Dampak: search gagal jika CDN diblok/timeout; UI search tidak siap. Evidence: public/assets/latest/modules/ui.bucket.search.js.
- Poster memakai `/api/proxy` dengan allowlist host (blogspot/googleusercontent). Dampak: cover image eksternal ditolak 403 sehingga poster gagal/gambar kosong. Evidence: src/worker.js, public/assets/latest/modules/ui.bucket.poster.js.
- Router SPA tidak mengecualikan `/feeds/*`; jika ada link ke feed, router akan mencoba fetch+render HTML lalu fallback ke hard nav. Dampak: double fetch/UX delay. Evidence: public/assets/latest/core.js.

**MITIGASI/REKOMENDASI/PROGRESSIVE ENHANCEMENT**
- Tambah guardrail manual paste: tampilkan badge environment + release id di DOM dan log mismatch antara `/assets/v/<id>` dan `X-GG-Worker-Version` agar salah paste terdeteksi cepat. Target: mengurangi “blank page” akibat XML salah.
- Kurangi ketergantungan CDN eksternal: self-host `instant.page`, `fuse.js`, dan `idb-keyval` di `/assets/latest` untuk stabilitas offline dan CSP yang lebih ketat.
- Perbaiki deteksi Worker: tambahkan retry/backoff atau gunakan timeout lebih longgar sebelum mematikan PWA; simpan status terakhir untuk menghindari false-negative di jaringan lambat.
- Poster fallback: jika `/api/proxy` menolak cover, render poster tanpa cover atau gunakan gambar default agar tombol share tetap berguna.
- Tingkatkan kontrak template: pastikan `#gg-main`, `#gg-dialog`, `#gg-share-sheet`, `#gg-config` diverifikasi di CI (tools/verify-template-contract) agar DOM-hook regressions tidak lolos.
- Progressive enhancement: pastikan semua anchor punya `href` final, dan fallback hard navigation tetap cepat (skeleton tidak menghalangi) saat router gagal.
- Offline resiliency: sisipkan fallback HTML minimal di SW untuk kasus `/offline.html` gagal di-fetch, sehingga offline UX tetap konsisten.
