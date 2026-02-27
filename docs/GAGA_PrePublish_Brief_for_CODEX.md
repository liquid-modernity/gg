# STRATEGIC BRIEF: Pre-Publish Readiness — pakrpp.com
**Untuk:** CODEX Agent  
**Dari:** Owner (via Audit Claude)  
**Tanggal:** 2026-02-25  
**Status proyek:** Developing — belum publish. Tujuan brief ini adalah menyempurnakan semua gap sebelum go-live.

> **Cara membaca dokumen ini:**  
> Setiap tugas sudah memiliki ID yang selaras dengan NEXT_TASKS yang ada di repo. Kerjakan **satu tugas per run** sesuai protokol GG_RUN. Urutan di dokumen ini adalah urutan prioritas yang disetujui owner.

---

## BAGIAN 1 — MENGAPA URUTAN INI?

Sebelum publish, ada urutan logis yang harus dihormati:

```
Keamanan & Stabilitas Sistem
        ↓
Reliability di Kondisi Jaringan Buruk (SEA context)
        ↓
UX yang Benar-Benar Native & Tanpa Bug
        ↓
Polish & Aksesibilitas
```

Jangan lompat ke UX sebelum keamanan sistem stabil. Bug di CSP atau Worker ping bisa merusak seluruh pengalaman user, tidak peduli seberapa bagus animasinya.

---

## BAGIAN 2 — TUGAS-TUGAS (Urutan Eksekusi)

---

### TUGAS 1: P0-01 — Pagar Pengaman DEV vs PROD
**Kenapa ini pertama:** Satu kesalahan paste `index.dev.xml` ke slot PROD di Blogger bisa membuat seluruh `pakrpp.com` hilang dari Google dalam 24-48 jam. Ini bukan skenario hipotetikal — ini risiko yang terbuka setiap kali ada deploy.

**Apa yang harus dicapai:**
- Sistem harus bisa mendeteksi secara otomatis apabila template yang salah (DEV) terpasang di lingkungan produksi.
- Deteksi harus muncul dalam 1 detik setelah halaman dimuat — berupa banner peringatan yang jelas dan tidak bisa diabaikan.
- Event telemetri harus dikirim ke endpoint Worker setiap kali mismatch terdeteksi.
- Mekanisme deteksi berbasis fingerprint statis di XML + validasi di runtime JS.

**Batasan penting:**
- Fingerprint harus ada di kedua template (DEV dan PROD) dengan nilai berbeda.
- Validasi runtime tidak boleh mengganggu pengalaman user normal di PROD.
- Ikuti kontrak: hanya `data-gg-*` attribute untuk state, ID format `#gg-*`.

**Acceptance test:** Paste `index.dev.xml` ke slot PROD Blogger → muat halaman → banner muncul dalam 1 detik + event terkirim ke telemetri.

---

### TUGAS 2: P0-02 — Worker Ping yang Tahan Jaringan Buruk
**Kenapa ini kedua:** Mayoritas target pembaca pakrpp.com ada di Indonesia/SEA, banyak yang menggunakan jaringan 3G atau tidak stabil. Saat ini, jika ping ke `__gg_worker_ping` timeout dalam 1200ms (sangat mungkin di 3G), dua hal penting langsung mati: (1) PWA/Service Worker tidak aktif, (2) URL `/blog` tidak berfungsi dengan benar. Dua hal ini adalah fondasi dari "native app feel" yang dikejar.

**Apa yang harus dicapai:**
- Ganti timeout tunggal 1200ms dengan sistem retry bertahap: coba 1 → tunggu sebentar → coba 2 → tunggu lebih lama → coba 3.
- Jika ping pernah berhasil sebelumnya, simpan hasilnya (last-known-good) dengan masa berlaku tertentu. Gunakan ini sebagai fallback ketika semua retry gagal, daripada langsung mematikan Worker detection.
- Batas waktu keseluruhan (semua retry) tidak boleh melebihi 5 detik.
- Tidak ada regresi pada pengalaman fast network — user dengan jaringan bagus tidak boleh merasakan perbedaan.

**Acceptance test:** Throttle DevTools ke Slow 3G → drop ping pertama secara manual → pastikan `env.worker` tetap `true` dan Service Worker tetap terdaftar.

---

### TUGAS 3: P0-04 — Self-Host Library Eksternal (Fuse.js, idb-keyval, instant.page)
**Kenapa ini ketiga (bukan belakangan):** Tiga library ini saat ini dimuat dari CDN pihak ketiga (`jsdelivr.net`, `unpkg.com`, `instant.page`). Ini masalah berlapis:
1. **Keamanan:** Kode dari CDN asing bisa diubah tanpa sepengetahuan kita (supply chain attack).
2. **Reliability:** Jika CDN down, fitur search mati secara diam-diam tanpa error yang jelas ke user.
3. **CSP:** Selama library masih dari CDN asing, tidak mungkin menerapkan CSP yang ketat (tugas berikutnya bergantung pada ini).

Ini harus diselesaikan sebelum CSP enforcement karena sequence-nya terkunci: self-host dulu → baru bisa enforce CSP.

**Apa yang harus dicapai:**
- Salin ketiga library ke dalam `public/assets/latest/` dan perbarui semua import.
- Setelah selesai, tidak ada satu pun request di DevTools Network yang mengarah ke `jsdelivr.net`, `unpkg.com`, atau `instant.page`.
- Verifikasi di smoke test bahwa fitur search, bookmark/offline, dan prefetch masih bekerja.

**Batasan penting:**
- Gunakan versi yang spesifik (pin version) — jangan `@latest`.
- Tambahkan versi yang dipasang ke dalam dokumentasi di `docs/tech-stack.md`.

---

### TUGAS 4: P1-02 — CSP Enforcement Bertahap
**Kenapa ini keempat:** Tanpa CSP yang aktif, situs tidak punya perlindungan XSS. Ini terutama penting karena ada fitur Canvas Poster yang memuat gambar dari luar dan ada search yang menyimpan data ke IDB. Tapi CSP tidak bisa langsung "diaktifkan penuh" — harus bertahap agar tidak memecahkan fitur yang sudah ada.

**Kenapa harus setelah Tugas 3:** CSP yang ketat membutuhkan semua asset dari same-origin. Selama masih ada CDN eksternal, CSP tidak bisa diperketat.

**Apa yang harus dicapai:**
- Mulai dari halaman dengan risiko paling rendah: halaman listing (daftar artikel).
- Aktifkan CSP dalam mode enforce (bukan report-only) untuk halaman listing dulu.
- Policy harus lulus tanpa satu pun console violation di halaman listing.
- Setelah listing bersih, dokumentasikan surface mana yang masih butuh `unsafe-inline` dan kenapa — buat roadmap untuk menghilangkan satu per satu.
- Jangan ubah halaman post atau home dulu — fokus listing saja.

**Acceptance test:** Buka halaman `/blog` (listing) → buka DevTools Console → tidak ada satu pun error CSP.

---

### TUGAS 5: P2-02 — SW Update Tanpa `confirm()` Dialog
**Kenapa ini kelima (masuk UX):** Ini adalah kontradiksi paling nyata dengan tujuan "native app feel". Tidak ada satu pun aplikasi native yang ketika ada update menampilkan kotak dialog sistem bertulisan "Update tersedia, reload?". Ini terasa seperti website lama, bukan aplikasi.

**Apa yang harus dicapai:**
- Hapus `confirm()` dialog dari alur update Service Worker.
- Gantikan dengan toast notification yang sudah ada di sistem (`#gg-toast` dan `data-gg-module='toast'`) — komponen ini sudah ada, tinggal digunakan.
- Toast harus menampilkan pesan singkat ("Versi baru tersedia") dengan satu tombol aksi ("Perbarui").
- Tap/klik tombol → halaman reload → versi baru aktif.
- Jika user mengabaikan toast, tidak ada yang terjadi — update menunggu sampai user reload sendiri.

**Batasan penting:** Jangan ubah logika SW update itu sendiri (skipWaiting, clientsClaim) — hanya ganti cara notifikasinya ke user.

---

### TUGAS 6: P1-05 — Focus Management Setelah Navigasi SPA
**Kenapa ini penting untuk UX:** Ini adalah gap yang tidak terlihat di layar tapi sangat terasa bagi user yang navigasi dengan keyboard (termasuk pengguna screen reader dan motor-impaired users). Saat ini setelah klik link dan halaman berganti via SPA, focus keyboard tetap di posisi lama — link yang baru saja diklik. User yang navigasi dengan keyboard harus Tab berkali-kali sebelum sampai ke konten baru.

**Apa yang harus dicapai:**
- Setelah setiap soft navigation berhasil (SPA page swap), pindahkan focus ke elemen `#gg-main`.
- Umumkan pergantian halaman ke screen reader menggunakan `aria-live` region yang sudah ada (`gg-sr-announcer`).
- Pastikan skip link ("Lewati ke konten utama") tetap berfungsi setelah navigasi.
- Tidak ada visual jump atau scroll yang tidak diinginkan — focus harus pindah secara halus.

**Acceptance test:** Buka halaman, tekan Tab beberapa kali, klik link artikel, tekan Tab sekali → focus sudah ada di dalam area konten artikel, bukan di elemen navigasi.

---

### TUGAS 7: P1-06 — Hormati Preferensi `prefers-reduced-motion`
**Kenapa ini penting:** Ada subset user yang secara medis terganggu oleh gerakan di layar (vestibular disorders). Browser/OS mereka sudah mengirim sinyal "kurangi animasi" — tapi saat ini sinyal ini diabaikan untuk dua hal utama: hero video autoplay dan view transitions SPA.

**Apa yang harus dicapai:**

**Untuk hero video:**
- Cek `window.matchMedia('(prefers-reduced-motion: reduce)')` sebelum autoplay video.
- Jika `reduce` aktif: jangan autoplay, tampilkan poster/thumbnail statis sebagai gantinya.
- Jika `reduce` tidak aktif: perilaku saat ini tetap (autoplay normal).

**Untuk view transitions SPA:**
- Jika `reduce` aktif: skip view transition API, lakukan swap konten secara langsung tanpa animasi.
- Jika `reduce` tidak aktif: perilaku saat ini tetap.

**Acceptance test:** Di macOS/Windows, aktifkan "Reduce motion" di System Preferences/Accessibility Settings → buka halaman listing → hero video tidak autoplay → klik artikel → tidak ada animasi transition.

---

### TUGAS 8: Aksesibilitas Kritis di Template XML
**Kenapa ini terakhir di daftar ini:** Ini adalah perbaikan di level template (`index.prod.xml`) yang membutuhkan bump release dan paste manual ke Blogger. Karena melibatkan paste manual, sebaiknya dikumpulkan dalam satu rilis bersama tugas lain yang juga membutuhkan template change — bukan satu per satu.

**Yang harus diperbaiki dalam satu rilis template:**

**8a. Fix `aria-hidden` + `aria-modal` conflict:**
- Di `.gg-dialog` dan `.gg-share-sheet__panel`: hapus `aria-hidden="true"` dari elemen yang juga memiliki `aria-modal="true"`.
- State hidden/visible harus dikontrol oleh `hidden` attribute atau `data-gg-state`, bukan `aria-hidden` di level dialog.

**8b. Fix Add Comment button:**
- Ganti `<a class='comment-reply' href='javascript:;'>Add comment</a>` dengan `<button class='comment-reply' type='button' data-gg-footer-cta='1'>Add comment</button>`.

**8c. Selaraskan class ikon:**
- Temukan semua kemunculan `class='ms'` yang digunakan sebagai ikon (bukan sebagai label) di area comments.
- Ganti dengan `class='gg-icon material-symbols-rounded'` agar konsisten dengan seluruh sistem ikon.

**8d. Fix Share sheet tablist ARIA:**
- Tambahkan `role='tab'` ke setiap `.gg-share-sheet__mode-btn`.
- Pastikan `aria-selected` sudah ada (sudah ada, tinggal tambah `role`).

**Acceptance test setelah paste template:** Buka share sheet → Tab → focus berjalan dalam dialog → Escape → focus kembali ke trigger. Buka halaman post → tambah komentar button bisa diakses via keyboard.

---

## BAGIAN 3 — APA YANG TIDAK DIKERJAKAN (DAN KENAPA)

Beberapa hal sengaja tidak dimasukkan ke sprint ini agar fokus terjaga:

| Item | Alasan Ditunda |
|---|---|
| Duplikasi sidebar widget (HTML17-21 vs HTML22-26) | Refactor struktural besar, risiko regresi tinggi. Masuk sprint tersendiri setelah publish. |
| Manifest `scope` + `id` | Low impact sebelum publish, bisa dikerjakan setelah install PWA mulai diuji. |
| `hreflang` tags | Tidak relevan sampai ada konten multi-bahasa. |
| Schema `dateModified` + `description` | Dampak SEO baru terasa setelah publish dan terindeks — bukan blocker publish. |
| P1-03 HTML caching SPA | Baik untuk dilakukan tapi tidak memblokir launch. |

---

## BAGIAN 4 — DEFINISI "LAYAK PUBLISH"

Setelah semua 8 tugas di atas selesai, sistem dianggap layak publish apabila:

- [ ] Tidak ada risiko deindex (Tugas 1 selesai dan ditest)
- [ ] PWA dan `/blog` stabil di Slow 3G (Tugas 2 ditest dengan throttling)
- [ ] Tidak ada request ke CDN asing saat runtime (Tugas 3 diverifikasi di Network tab)
- [ ] CSP listing page bersih (Tugas 4 diverifikasi di Console)
- [ ] SW update tidak menggunakan `confirm()` (Tugas 5 bisa dilihat langsung)
- [ ] Focus berpindah ke konten setelah navigasi (Tugas 6 ditest dengan keyboard)
- [ ] Hero video tidak autoplay di reduced-motion (Tugas 7 ditest dengan OS setting)
- [ ] Dialog dan share sheet bisa diakses keyboard (Tugas 8 ditest manual)
- [ ] `npm run gate:prod` → semua PASS
- [ ] Template XML versi terbaru sudah di-paste ke Blogger PROD

---

## BAGIAN 5 — CATATAN UNTUK OWNER (ANDA)

**Satu hal yang tidak bisa dikerjakan oleh CODEX:** Paste template XML ke Blogger dashboard. Ini selalu manual. Pastikan Anda melakukan ini setelah Tugas 8 selesai dan diverifikasi di DEV terlebih dahulu.

**Urutan di Blogger sebelum publish:**
1. CODEX selesaikan Tugas 1–7 (semua di JS/CSS/Worker, tidak butuh paste)
2. CODEX selesaikan Tugas 8 + jalankan `npm run gate:prod`
3. **Anda** paste `index.prod.xml` terbaru ke Blogger PROD
4. Verifikasi fingerprint PROD muncul benar di halaman live
5. Publish

**Satu metrik yang perlu Anda pantau secara personal setelah publish:** Google Search Console → Coverage. Pastikan tidak ada halaman yang tiba-tiba masuk kategori "Excluded: noindex". Jika itu terjadi, segera revert template.

---

*Dokumen ini adalah turunan dari audit `index_prod.xml` + `gg-audit-8537c4d.zip` yang dilakukan 2026-02-25. Revisi dokumen ini hanya jika ada perubahan arsitektur signifikan atau temuan baru dari pengujian live.*
