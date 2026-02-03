# CLUSTERING_TODO.md: Project "GAGA-ish" (pakrpp.com)
**Target:** Enterprise Grade PWA on Blogger | **Stack:** Blogger XML + Cloudflare Workers + GitHub Pages + Vanilla JS (ES6+)

Dokumen ini adalah panduan langkah demi langkah (step-by-step) untuk Vibe Coder & AI Agent. Kerjakan secara berurutan. Jangan melompat ke fase berikutnya sebelum fase saat ini selesai (checked).

---Namespace GG.*, Prefix .gg-*, Single Source of Truth

## 🖥️ Phase 0: Environment & Tooling Setup
*Tujuan: Menyiapkan lingkungan kerja Vibe Coder yang efisien agar CODEX fokus ke logika.*

- [ ] **VS Code Extensions (Wajib Install):**
    - [ ] **Auto Rename Tag**: Agar edit HTML/XML tidak berantakan.
    - [ ] **Prettier - Code formatter**: Standarisasi format kode otomatis.
    - [ ] **Error Lens**: Highlight error langsung di baris kode (bukan cuma di terminal).
    - [ ] **Indent-Rainbow**: Visualisasi indentasi (penting untuk struktur XML Blogger yang dalam).
    - [ ] **ESLint**: Menjaga kualitas JS (Best Practice).
- [ ] **Git Repository Init:**
    - [ ] Buat repo di GitHub (Private/Public).
    - [ ] Setup struktur folder lokal:
      ```text
      /src
        /js
          /modules (memecah logic)
          main.js (entry point)
        /css
          main.css
        /xml
          theme.xml (template blogger)
      /dist (hasil build)
      .github/workflows (CI/CD actions)
      ```

---

## 🏗️ Phase 1: Infrastructure & The "Edge"
*Tujuan: Menyiapkan fondasi serverless dan hosting aset agar tidak bergantung pada server Google yang lambat/terbatas.*

- [ ] **Cloudflare Setup (DNS & Workers):**
    - [ ] Point domain `pakrpp.com` ke Cloudflare.
    - [ ] Aktifkan **Cloudflare Workers** (Free Plan).
    - [ ] Buat Worker: `gg-proxy-worker`.
    - [ ] **Worker Logic 1 (HTMLRewriter):** Setup logic untuk inject Security Headers (CSP, HSTS) & Dynamic Meta Tags (OG Image).
    - [ ] **Worker Logic 2 (Image Proxy):** Setup endpoint untuk bypass CORS (solusi *Tainted Canvas* untuk fitur Share Poster).
    - [ ] **Worker Logic 3 (Sanitizer):** Auto-remove parameter `?m=1` dan canonical handling.
- [ ] **GitHub Pages / Assets Host:**
    - [ ] Setup branch `gh-pages` atau folder `/docs` untuk hosting file JS/CSS/Fonts (sebagai CDN pribadi).

---

## 🧱 Phase 2: The "Clean Slate" XML & Design System
*Tujuan: Memindahkan markup dari JS ke XML (Server Side) dan sentralisasi konfigurasi.*

- [ ] **Blogger XML cleanup:**
    - [ ] Hapus semua widget default Blogger yang memblokir render (CSS bundle bawaan, JS bundle bawaan).
    - [ ] Gunakan tag `<b:skin>` hanya untuk **Critical CSS** (App Shell, Layout Grid, Skeleton UI) agar *First Paint* instan.
- [ ] **Centralized Configuration (No Hardcoded JS):**
    - [ ] Buat Widget HTML khusus di Layout Blogger (`id='gg-config'`).
    - [ ] Isi konten widget dengan JSON:
      ```json
      {
        "authorMap": { ... },
        "labelColors": { ... },
        "posterTemplates": { ... }
      }
      ```
    - [ ] Pastikan JS nanti membaca elemen ini, bukan object hardcoded di file `.js`.
- [ ] **Z-Index Strategy (CSS Variables):**
    - [ ] Definisi layer di `:root`:
      ```css
      --z-back: -1;
      --z-normal: 1;
      --z-sticky: 100;
      --z-drawer: 200; (Bottom Sheet)
      --z-modal: 300; (Super Search)
      --z-toast: 400;
      --z-max: 9999;
      ```
    - [ ] Larang penggunaan angka manual (misal: `z-index: 999`) di file CSS komponen.
- [ ] **HTML Templating:**
    - [ ] Buat tag `<template id="tmpl-post-card">`, `<template id="tmpl-share-modal">` di dalam XML. Jangan inject string HTML via JS (`innerHTML += '<div>...</div>'`).

---

## 🧠 Phase 3: The "Brain" (Core SPA Logic)
*Tujuan: Mengubah Blogspot menjadi Single Page Application (SPA) yang robust.*

- [ ] **Router Engine (History API):**
    - [ ] Intercept semua klik link internal (`<a>`).
    - [ ] Implementasi `history.pushState` dan `window.onpopstate`.
    - [ ] Handle **Scroll Restoration** manual (simpan posisi Y di `history.state`).
- [ ] **Data Fetching (The "Beyond" Logic):**
    - [ ] Implementasi **Recursive Fetching**: Loop request API sampai semua post (>50) terambil untuk *Super Search Index*.
    - [ ] Implementasi **Pagination Tree**: Load post parsial (10 item) saat user scroll (*Infinite Scroll*).
- [ ] **DOM Re-hydration:**
    - [ ] Buat utility `GG.util.parseHTML`.
    - [ ] **PENTING:** Setelah `DOMParser` jalan, scan ulang elemen `<script>` (embed Twitter/Insta), clone elemennya, dan inject ulang agar tereksekusi (mengatasi isu *Blindspot DOMParser*).
- [ ] **Google Analytics Bridge:**
    - [ ] Trigger event GA4 manual (`page_view`) setiap kali rute SPA berubah.

---

## 🎨 Phase 4: UI/UX & Native Feel (Interaction)
*Tujuan: Menciptakan ilusi aplikasi native (App-like experience).*

- [ ] **Loading State (No Spinners):**
    - [ ] Implementasi **Skeleton UI** (Shimmer) yang aktif sebelum data JSON tiba.
    - [ ] Integrasi **NProgress** (Top loading bar tipis).
- [ ] **View Transitions API:**
    - [ ] Bungkus fungsi render DOM dengan `document.startViewTransition(() => { ... })`.
    - [ ] Definisi CSS `view-transition-name` untuk elemen Hero Image dan Judul (efek *morphing*).
- [ ] **Mobile Centric (Thumb Zone):**
    - [ ] **Bottom Sheet Engine:** Ubah semua modal (Search, Share) jadi panel bawah di layar mobile (<768px).
    - [ ] **Safe Area Insets:** Tambahkan `padding-top: env(safe-area-inset-top)` di header dan `padding-bottom: env(safe-area-inset-bottom)` di dock/nav.
    - [ ] **Touch Action:** Tambahkan CSS `touch-action: manipulation` untuk hapus delay 300ms.
    - [ ] **Haptics:** Panggil `navigator.vibrate()` pada interaksi tombol penting.
- [ ] **Medium-Zoom:**
    - [ ] Integrasi library `medium-zoom` untuk gambar artikel.

---

## 🚀 Phase 5: Advanced "Beyond" Features
*Tujuan: Fitur unik yang membedakan blog ini dari 99% situs lain.*

- [ ] **Super Search (Omnibar):**
    - [ ] Setup **Fuse.js**.
    - [ ] Setup **IDB-Keyval** (IndexedDB) untuk menyimpan index konten secara offline (ganti LocalStorage).
    - [ ] UI: Tampilan Command Palette (Ctrl/Cmd + K).
- [ ] **Share Poster (Canvas Generator):**
    - [ ] Panggil **Cloudflare Image Proxy** (dari Phase 1) untuk fetch gambar thumbnail (bypass CORS).
    - [ ] Gunakan HTML5 Canvas API untuk menggambar Poster (Judul + Author + QR Code).
    - [ ] Implementasi `navigator.share()` dengan **File Object** (bukan URL) agar langsung masuk Instagram Story/WA Status.
- [ ] **Native Comments (Sanitized):**
    - [ ] Fetch komentar via JSON.
    - [ ] **WAJIB:** Sanitasi konten komentar dengan **DOMPurify** sebelum render (Anti XSS).

---

## ⚡ Phase 6: Extreme Performance & PWA
*Tujuan: Skor Lighthouse 100, TBT 0ms, dan Offline Capability.*

- [ ] **Partytown (Off-Main-Thread):**
    - [ ] Pindahkan script Google Analytics, Adsense (jika ada), dan GTM ke Partytown (Web Worker).
- [ ] **Speculation Rules API:**
    - [ ] Inject script JSON `<script type="speculationrules">` untuk *prerender* halaman saat hover.
- [ ] **Image Optimization:**
    - [ ] Implementasi `GG.util.resizeImage` untuk rewrite URL gambar Blogger (`/s72-c/` -> `/w800-h600-p/`).
    - [ ] Setup Worker untuk negosiasi konten (Serve **AVIF** jika browser support).
- [ ] **PWA & Offline:**
    - [ ] Generate Service Worker (`sw.js`) menggunakan **Workbox**.
    - [ ] Cache strategy: *StaleWhileRevalidate* untuk API, *CacheFirst* untuk Font/CSS.
    - [ ] Custom Offline Page: Baca artikel dari IDB-Keyval saat tidak ada internet.

---

## 🛡️ Phase 7: DevOps & Security (Production Ready)
*Tujuan: Workflow otomatis dan keamanan tingkat bank.*

- [ ] **GitHub Actions (CI/CD):**
    - [ ] Buat workflow `.yaml` untuk:
        - [ ] Linting (ESLint).
        - [ ] Bundling & Minification (Esbuild/Terser).
        - [ ] Deploy ke branch `gh-pages`.
- [ ] **Font Subsetting:**
    - [ ] Proses font (Inter/Roboto) menggunakan `glyphhanger` atau `pyftsubset`.
    - [ ] Hapus glyph yang tidak terpakai, convert ke WOFF2, host di GitHub.
- [ ] **Keyboard Shortcuts (Tinykeys):**
    - [ ] Binding tombol `/`, `Esc`, `j`, `k` ke fungsi navigasi.
- [ ] **Security Final Check:**
    - [ ] Pastikan Cloudflare Worker menyuntikkan header CSP dengan hash script yang valid.

---

## 📊 Phase 8: Monitoring & Touch-up
- [ ] Integrasi **Microsoft Clarity** (via Partytown) untuk Heatmap & Session Recording.
- [ ] Validasi **Structured Data** (Schema.org) untuk `BreadcrumbList` dan `Article`.
- [ ] Tes skor Lighthouse (Mobile & Desktop). Target: 4x100.

---

**Catatan untuk AI Agent (CODEX):**
Saat mengeksekusi kode, selalu rujuk dokumen ini untuk konteks arsitektur. Jangan gunakan solusi *quick fix* (seperti `setTimeout` sembarangan atau `z-index: 99999`) yang melanggar prinsip "Enterprise Grade".