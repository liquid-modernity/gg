## MASTER ROADMAP: Project "GAGA-ish" (Enterprise PWA on Blogger)
Last updated: 2026-02-05

**Target:** Enterprise Grade PWA | **Stack:** Blogger XML + Cloudflare (Mode B) + Vanilla JS (MVC-Lite)  
**Filosofi:** "Stabilitas sebelum Ekspansi". Jangan membangun fitur "Beyond" di atas fondasi yang rapuh.

---

## 🏛️ PART I: THE CONSTITUTION (Arsitektur & Aturan Main)

Sebelum menulis satu baris kode, pahami aturan ini. Ini adalah hukum yang mengikat seluruh fase.


### 0. Environment Model (Single Domain)
- **Domain tunggal:** `www.pakrpp.com`.
- **DEV:** theme = `index.dev.xml` → assets = `/assets/latest/` → Service Worker **OFF**.
- **PROD:** theme = `index.prod.xml` → assets = `/assets/v/<RELEASE_ID>/` → Service Worker **ON**.
- **Aturan utama:** DEV tidak boleh mengaktifkan SW / caching agresif (sumber “debugging palsu”).

### 1. Arsitektur: MVC-Lite (Single File Monolith)
Karena keterbatasan *context window* AI dan kemudahan maintenance, kita tetap menggunakan **satu file `main.js`**, namun dengan struktur internal yang ketat:
* **`GG.store`**: Sumber kebenaran tunggal (State). Tidak ada variabel liar atau `localStorage` tanpa versi.
* **`GG.services`**: Satu-satunya tempat *side-effects* (Network, Storage, SW, Telemetry).
* **`GG.ui`**: Komponen primitif (Toast, Dialog, Overlay, FocusTrap).
* **`GG.actions`**: Gateway event tunggal (Delegated Events).
* **`GG.modules`**: Logika fitur spesifik (Dock, Library, Poster).

### 2. Aturan Relokasi (The "Do Not Break" Rule)
Saat merapikan kode (Fase 1–3):
1. **Relokasi ≠ Refactor:** Pindahkan kode ke struktur baru tanpa mengubah logika bisnis.
2. **Facade Pattern:** Jika API lama dipindah, buat *wrapper* agar kode lain tidak *error*.
3. **Init Guard:** Gunakan `GG.util.initOnce` untuk mencegah *double-firing* event listeners.

### 3. Infrastruktur Mode B
* **Edge (Cloudflare):** Security Headers (CSP, HSTS), HTML rewrite, SW hosting.
* **Origin (Blogger):** HTML Template, Content Database.
* **Client (Browser):** SPA Logic, Offline Cache.

### 4. Definisi "Enterprise Grade" (untuk proyek ini)
Kalau ini tidak ada, jangan pakai label enterprise:
1. **Release Safety:** versioning aset, cache-busting, rollback cepat.
2. **Observability:** error logging + minimal performance telemetry.
3. **Progressive Enhancement:** konten tetap bisa dibaca tanpa JS; SPA hanya enhancement.
4. **SW Safety:** update flow aman + kill-switch agar user tidak terkunci di bug.
5. **Security Posture:** header security konsisten, dan perubahan CSP/asset tidak bikin deploy tersandera.

### 5. Doktrin SEO-First (Non-negotiable)
* Setiap URL harus punya **title/description/canonical/OG/JSON-LD** yang valid dari server-side (Blogger XML + Worker rewrite).
* Router SPA **tidak boleh** merusak canonical, structured data, atau akses crawler.
* “App feel” boleh, tapi **konten harus tetap hidup** ketika JS gagal, slow device, atau crawler.

### 6. Doktrin Performance-First (Realistis, bukan vanity)
* Target Lighthouse tinggi itu bagus, tapi yang diburu adalah **Core Web Vitals** (LCP/INP/CLS).
* “TBT 0ms” itu best-case di halaman inti, bukan janji absolut di semua halaman.

---

## 🛠️ PART II: EXECUTION PHASES

### PHASE 0: Environment & Tooling
*Menyiapkan lingkungan kerja agar kode bisa dikelola dengan waras.*

- [ ] **Setup Lokal:**
  - [ ] VS Code + Extensions (ESLint, Prettier, Error Lens, Auto Rename Tag).
  - [ ] Git Repository Init (Struktur: `/src/js`, `/src/css`, `/src/xml`).
- [ ] **Setup Cloudflare (Edge):**
  - [ ] Point domain ke Cloudflare.
  - [ ] Setup Worker `gg` untuk Security Headers (CSP, HSTS).
  - [ ] **CRITICAL:** Worker `gg` harus serve static assets via `ASSETS` binding (same-domain).
- [ ] **R-001: Release Safety Baseline (Wajib sebelum SPA):**
  - [ ] Skema versioning aset (`main.js?v=HASH`, `main.css?v=HASH`).
  - [ ] Cache-control policy (edge + browser) yang tidak mengunci user di versi lama.
  - [ ] Prosedur rollback: 1 langkah revert (ubah HASH / revert commit).
- [ ] **O-001: Observability Baseline:**
  - [ ] Endpoint Worker untuk menerima error log (minimal).
  - [ ] Client hook `window.onerror` + `unhandledrejection` kirim ke endpoint.
- [ ] **QA-001: Smoke Test Checklist (manual boleh, tapi wajib):**
  - [ ] Load halaman tanpa JS (disable JS) → konten terbaca.
  - [ ] Navigasi internal (klik link) → halaman benar.
  - [ ] Komentar native Blogger tetap muncul (lazy load boleh).

### PHASE 1: The Great Refactor (Taming the Monolith)
*Tujuan: Membersihkan `main.js` dari "sampah" sintaks dan menegakkan arsitektur MVC-lite.*

- [ ] **T-001: Pure JavaScript Conversion:**
  - [ ] Hapus semua entitas HTML (`&quot;`, `&gt;`) dari `main.js`.
  - [ ] Hapus tag `<script>`, `CDATA` dari dalam file JS.
  - [ ] **Output:** File `.js` valid yang bisa di-linting oleh ESLint.
- [ ] **T-002: Index.xml Cleanup:**
  - [ ] Hapus inline JS dari XML.
  - [ ] Hapus duplikasi boot-loader.
  - [ ] Pastikan hanya ada **satu** entry point: `GG.boot.init()`.
- [ ] **T-003: Architecture Relocation (Tanpa Ubah Logic):**
  - [ ] Kelompokkan kode ke `GG.core`, `GG.store`, `GG.services`.
  - [ ] Implementasi `GG.actions` registry untuk menggantikan event listener yang berserakan.
  - [ ] Pindahkan UI primitif ke `GG.ui.*`.

### PHASE 2: Connectivity & Styling (CSS Taming)
*Tujuan: Memastikan CSS modular dan terikat kontrak yang jelas dengan JS/XML.*

- [ ] **C-001: CSS Structure:**
  - [ ] Rapikan section headers & z-index layering (gunakan variabel `--z-modal`, dll).
- [ ] **X-001: State Contract:**
  - [ ] Audit `data-*` attributes. JS menulis state (`data-gg-state="open"`), CSS hanya membaca.
- [ ] **X-002: Hook Alignment:**
  - [ ] Pastikan elemen UI (Toast, Dialog) ada di `index.xml` (kosong), JS hanya mengisi konten.

### PHASE 3: Core SPA Implementation (Enhancement Mode)
*Tujuan: Mengaktifkan "Otak" aplikasi. SPA adalah enhancement; SEO tetap server-first.*

- [ ] **F-001: Router Engine (History API):**
  - [ ] Implementasi di `GG.core.router`.
  - [ ] Intercept klik internal, handle Back/Forward.
  - [ ] **Wajib:** Scroll restoration manual.
  - [ ] **Wajib:** Fallback → jika route gagal, hard navigate.
- [ ] **F-003: Metadata Discipline (SEO-safe SPA):**
  - [ ] Jangan bergantung pada client untuk canonical/JSON-LD.
  - [ ] Jika ada client-side meta update, itu hanya kosmetik—server tetap sumber kebenaran.
- [ ] **Data Fetching (Centralized):**
  - [ ] Buat `GG.services.api` untuk fetch feed Blogger (JSON).
  - [ ] Implementasi recursive fetch untuk membangun *Search Index*.
- [ ] **Config Migration:**
  - [ ] Pindahkan config hardcoded di JS ke Widget XML (`id='gg-config'`).
  - [ ] JS membaca config ini saat boot.

### PHASE 4: UI/UX & Interaction "Beyond"
*Tujuan: Memberikan rasa "Native App".*

- [ ] **Smart Components:**
  - [ ] **Super Search (Command Palette):** Integrasi Fuse.js + `GG.ui.commandPalette`.
  - [ ] **Share Poster:** Integrasi Canvas API di `GG.modules.poster` + Cloudflare Image Proxy (untuk bypass CORS).
- [ ] **Optimization:**
  - [ ] Implementasi Skeleton UI (ganti loading spinner).
  - [ ] View Transitions API untuk navigasi antar halaman.

### PHASE 5: PWA, Safety, Performance
*Tujuan: Offline capability + performa tinggi tanpa mengorbankan reliability.*

- [ ] **SW-001: Service Worker Safety (Kill-switch + Versioning):**
  - [ ] Cache name versioned (`gg-cache-vX`).
  - [ ] Update flow: skipWaiting + clientsClaim + UI prompt “Update available”.
  - [ ] Kill-switch (remote flag via Worker/JSON) untuk disable SW jika ada bug fatal.
- [ ] **SW-002: Offline Strategy:**
  - [ ] Cache strategy: StaleWhileRevalidate untuk API, CacheFirst untuk Assets.
  - [ ] Offline Page fallback + “Saved Articles” fallback (IDB).
- [ ] **P-001: Performance Budget (Wajib):**
  - [ ] Tentukan budget: LCP/INP/CLS untuk template utama.
  - [ ] Audit third-party: default off, enable jika perlu.
- [ ] **Telemetry & Analytics (Optional, Privacy-aware):**
  - [ ] Pindahkan script pihak ketiga (GA4) ke Partytown/Worker jika dipakai.

---

## 📝 PART III: THE LIVING LEDGER (GG_CAPSULE.md)

Single source of truth per session is `docs/ledger/GG_CAPSULE.md` (NOW/NEXT/LAST_PATCH). Do not embed capsule blocks in `main.js`.
FASE 1: THE MIXED-MEDIA LAYOUT (Re-structure /blog)
Mengubah halaman arsip menjadi etalase kurasi yang dinamis.

1. Persiapan HTML (index.prod.xml)

[ ] Buat Skeleton Container: Ganti grid postingan lama dengan struktur <div id="gg-curated-feed">.

[ ] Definisikan 10 Section: Buat elemen <section> kosong dengan atribut data spesifik:

[ ] data-type="bookish" (Ratio 1:1.48, 8 item).

[ ] data-type="news" (Complex Card, 3 item) — Ulangi untuk Section 2, 5, 7, 9.

[ ] data-type="youtube" (Landscape 16:9, Rail Horizontal).

[ ] data-type="shorts" (Portrait 9:16, Rail Horizontal).

[ ] data-type="podcast" (Square 1:1, Rail Horizontal).

[ ] data-type="instagram" (Grid 4:6).

[ ] data-type="pinterest" (Masonry/Waterfall).

[ ] Label Mapping: Pastikan postingan di Blogger memiliki label sistem (misal: _Hero, _Book, _Video) agar bisa dipanggil ke section yang tepat.

2. Logika "Lazy Rails" (ui.bucket.listing.js)

[ ] Implementasi IntersectionObserver: Tulis fungsi yang hanya memanggil API Blogger (/feeds/posts/summary) ketika section tersebut masuk viewport.

[ ] Render Function: Buat fungsi JS yang menerima JSON Blogger dan merender HTML Card yang berbeda-beda sesuai data-type section.

[ ] CSS Snap Scroll: Terapkan scroll-snap-type: x mandatory pada container Rail agar gesernya mulus.

FASE 2: "WHAT-IF" VOL 1 & 2 (Stability & Empathy)
Membuat aplikasi terasa stabil, pemaaf, dan mengerti kondisi user.

1. Interaksi Dasar (Vol 1)

[ ] Scroll Restoration: Pastikan posisi scroll disimpan di history.state saat navigasi, dan dikembalikan saat user tekan Back.

[ ] Loading State: Aktifkan Skeleton UI (kotak abu-abu) segera saat navigasi dimulai, jangan biarkan layar putih.

[ ] Fat Finger Defense: Pasang event listener pada .gg-overlay (area gelap) untuk menutup modal/sidebar. Perluas area klik tombol kecil dengan CSS padding.

2. Empati Visual & Data (Vol 2)

[ ] Auto-Theme Listener: Pasang listener matchMedia untuk mendeteksi perubahan Dark Mode OS secara real-time dan sesuaikan tema blog.

[ ] Broken Image Handler: Pasang script global onerror pada tag <img> untuk menyembunyikan atau mengganti gambar yang gagal loading agar layout tidak rusak.

[ ] Draft Persistence (Opsional): Jika memungkinkan (atau via form custom), simpan ketikan komentar user ke localStorage untuk mencegah kehilangan data.

FASE 3: "WHAT-IF" VOL 3 (Business & Conversion)
Meningkatkan kecerdasan aplikasi dalam melayani user.

1. Search Intelligence

[ ] Two-Tier Search:

[ ] Tier 1: Filter cepat di client-side (judul/snippet).

[ ] Tier 2: Jika hasil 0 atau user tekan Enter, redirect ke Google Custom Search/Blogger Search (/search?q=...) untuk pencarian konten penuh.

[ ] Zero-Result Handling: Tampilkan pesan yang membantu ("Coba cari di konten?") alih-alih layar kosong.

2. Retention & Attribution

[ ] Clipboard Injection: Tambahkan script yang menyisipkan "Sumber: pakrpp.com/..." saat user menyalin teks >140 karakter.

[ ] Link Hygiene: Script otomatis yang mengubah link eksternal menjadi target="_blank" dan link internal menjadi target="_self" (SPA nav).

[ ] Recirculation: Tampilkan "Next Article" atau "Related Post" saat user mencapai bagian footer artikel.

FASE 4: THE "QUITE LUXURY" POLISH (Visual & Physics)
Sentuhan akhir yang membedakan web app ini dari blog biasa.

1. Atmosfer & Tekstur

[ ] Grain/Noise Overlay: Tambahkan layer SVG Noise halus (opacity rendah) di atas seluruh website via CSS ::before pada body.

[ ] Ambient Glow: Script JS yang mengambil warna dominan dari thumbnail (Book/Podcast) dan menjadikannya glow redup di background section tersebut.

2. Fisika & Transisi

[ ] View Transitions API: Aktifkan API ini agar saat thumbnail diklik, ia "berubah bentuk" (morph) menjadi Header di halaman detail.

[ ] Magnetic Buttons: Tambahkan efek magnet pada tombol Dock/FAB saat kursor mendekat (Desktop only).

[ ] Micro-Haptics: (Mobile only) Berikan getaran halus (navigator.vibrate) saat carousel "mengunci" (snap) di posisi kartu.

[ ] The Eclipse: Gunakan transisi melingkar (clip-path) yang dramatis saat mengganti tema gelap/terang.

FASE 5: AUTOMATION (Ecosystem)
Membiarkan mesin bekerja menjaga kesehatan blog.

[ ] Performance Budget: (Sudah Solved via CI/CD). Pertahankan agar build gagal jika aset terlalu besar.

[ ] Automated Smoke Test: (Sudah Solved). Pastikan script Python/Bash terus berjalan di GitHub Actions untuk memverifikasi deployment.

Instruksi Eksekusi
Anda sekarang bisa memberikan prompt spesifik ke Codex/ChatGPT untuk mengerjakan poin-poin di atas satu per satu (misal: "Kerjakan Fase 1 Poin 2 dulu").

Saran Urutan Pengerjaan:

Fase 1 (Agar tampilan berubah drastis dulu).

Fase 3 (Search & Link Hygiene - fungsionalitas krusial).

Fase 2 (Perbaikan detail UX).

Fase 4 (Kosmetik/Polish terakhir).