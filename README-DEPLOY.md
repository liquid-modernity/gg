# gg-cdn-pakrpp – Cloudflare Worker CDN for PakRPP

Repo ini menyiapkan Worker yang hanya melayani asset dan file PWA untuk domain `www.pakrpp.com` (zone `pakrpp.com`). Halaman Blogger tetap berasal dari origin Blogger; hanya path tertentu yang diarahkan ke Worker.

## Struktur
- Worker: `src/worker.js`
- Konfigurasi: `wrangler.toml`
- Static assets: `public/`
- Workflow: `.github/workflows/deploy.yml`

## Prasyarat Cloudflare
1. DNS `www.pakrpp.com` harus proxied (ikon awan oranye) di Cloudflare DNS.
2. Buat API Token dengan izin minimal:
   - **Workers Scripts: Edit**
   - **Workers Routes: Edit**
   - **Zone: Read** (hanya untuk zone `pakrpp.com`)

## Setup GitHub Secret
- Buat secret repo `CLOUDFLARE_API_TOKEN` berisi token di atas.

## Deploy via GitHub Actions
- Trigger otomatis: push ke branch `main` atau manual `workflow_dispatch`.
- Workflow memanggil `cloudflare/wrangler-action@v3` dengan perintah `deploy` memakai `wrangler.toml` di repo.

## Verifikasi setelah deploy
Buka tiga endpoint ini dan pastikan 200 OK serta header `Cache-Control` sesuai:
- https://www.pakrpp.com/assets/dev/main.js (seharusnya `no-cache, max-age=0, must-revalidate`)
- https://www.pakrpp.com/assets/v/20260127-1/main.js (seharusnya `public, max-age=31536000, immutable`)
- https://www.pakrpp.com/sw.js (seharusnya `no-cache, max-age=0, must-revalidate`)

Tambahan pengecekan (opsional):
- https://www.pakrpp.com/manifest.webmanifest (`public, max-age=86400`)
- https://www.pakrpp.com/offline.html (`public, max-age=86400`)
- https://www.pakrpp.com/gg-pwa-icon/icon-192.png (`public, max-age=31536000, immutable`)

## Alur iterasi cepat (dev)
1. Di Blogger, loader CSS/JS arahkan ke `/assets/dev/main.css` dan `/assets/dev/main.js`.
2. Setiap push ke `main` akan men-deploy file dev (tanpa cache) sehingga perubahan langsung terlihat.

## Alur rilis
1. Salin asset dev ke folder versi baru, contoh:
   - `cp public/assets/dev/main.css public/assets/v/20260201-1/main.css`
   - `cp public/assets/dev/main.js public/assets/v/20260201-1/main.js`
2. Update loader Blogger sekali ke versi baru: `/assets/v/20260201-1/main.css` & `/assets/v/20260201-1/main.js`.
3. Commit & push ke `main` untuk deploy.

## Catatan/TODO
- Ikon PWA saat ini disalin dari folder lokal `gg-pwa-icon/` (files: `icon-192.png`, `icon-512.png`). Ganti dengan ikon final jika diperlukan.
- Service worker masih placeholder (tidak intercept fetch). Aktifkan cache/offline logic nanti bila Blogger sudah siap.
