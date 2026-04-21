# PakRPP Blogger Route Matrix

## Tujuan
Dokumen ini menetapkan keputusan arsitektur URL untuk **www.pakrpp.com** yang dibangun di atas Blogger dengan lapisan custom front-end dan Cloudflare Worker. Fokus dokumen ini bukan kosmetik, tetapi disiplin struktur: **mana route yang harus dipertahankan sebagai canonical public surface, mana yang hanya utilitas Blogger, mana yang perlu noindex, dan mana yang harus dinormalisasi melalui Worker**.

Tujuan strategisnya ada dua:

1. Menjaga **crawlability, indexability, dan discoverability** untuk SEO, GEO, SEA, dan AI discovery.
2. Mengurangi fingerprint Blogger yang tidak perlu pada permukaan publik tanpa merusak fondasi distribusi konten.

---

## Prinsip Utama

### 1. Jangan menyamarkan mesin dengan cara merusak plumbing
Blogger boleh tetap menjadi mesin publikasi. Yang harus dikendalikan adalah **permukaan publik**, bukan dengan mematikan feed, sitemap, atau permalink inti, tetapi dengan **canonical discipline**, **route normalization**, dan **surface governance**.

### 2. Yang penting adalah URL canonical yang stabil
URL post detail dan halaman statis adalah aset utama. Route listing, search, label, dan parameter tampilan tidak boleh mengambil peran sebagai pilar arsitektur SEO.

### 3. Worker dipakai sebagai alat bedah, bukan topeng
Cloudflare Worker boleh dipakai untuk:

- redirect apex ke `www`
- redirect HTTP ke HTTPS
- vanity alias route
- URL normalization
- cache/header hygiene

Cloudflare Worker **tidak** boleh dijadikan mesin untuk mem-proxy semua HTML post demi menyembunyikan bahwa backend-nya Blogger.

### 4. Search dan label pages boleh hidup, tetapi jangan menjadi pusat indeks
Search pages dan label pages berguna untuk UX dan discovery internal. Namun keduanya bukan URL target ranking utama.

---

## Status Verifikasi Live pada PakRPP

Route berikut sudah terbukti live pada `www.pakrpp.com` dan menjadi dasar keputusan di dokumen ini:

- homepage root `/`
- post permalink pola tanggal `/YYYY/MM/slug.html`
- static pages `/p/*.html`
- label pages `/search/label/[LABEL]`
- parameter mobile `?m=1`

Karena itu, dokumen ini bersifat operasional dan relevan untuk kondisi situs saat ini, bukan asumsi abstrak.

---

## Matriks Route PakRPP

| Route / Pola | Status | Keputusan | Aksi Teknis | Catatan Strategis |
|---|---|---|---|---|
| `/` | Index | **KEEP** | Pertahankan sebagai root canonical surface | Ini wajah utama brand dan titik masuk discovery |
| `/YYYY/MM/slug.html` | Index | **KEEP as canonical** | Jangan rewrite struktur inti | Ini aset SEO utama untuk konten editorial |
| `/p/*.html` | Index selektif | **KEEP** | Boleh diberi vanity alias via Worker | Cocok untuk halaman evergreen seperti About, Contact, Privacy, Sitemap manusia |
| `/search/label/[LABEL]` | Noindex, follow | **KEEP for UX** | Biarkan hidup, tambahkan noindex pada archive/search surface | Berguna untuk navigasi, tetapi jangan menjadi halaman ranking utama |
| `/search?q=[QUERY]` | Noindex, follow | **KEEP functional** | Biarkan berfungsi untuk pencarian internal, jangan promosikan ke indeks | Search results page bukan aset SEO inti |
| `?m=1` | Tidak boleh menjadi URL indeks utama | **NORMALIZE** | Redirect atau canonicalize ke URL bersih setelah parity test | Ini fingerprint Blogger yang tidak perlu dibiarkan liar |
| `?m=0` | Tidak boleh menjadi URL indeks utama | **NORMALIZE** | Redirect atau canonicalize ke URL bersih | Bukan aset konten, hanya parameter tampilan |
| `/feeds/posts/default` | Utility crawlable | **KEEP** | Jangan matikan kecuali ada alasan produk yang kuat | Feed membantu distribusi dan pembaruan konten |
| `/feeds/posts/default?alt=rss` | Utility crawlable | **KEEP** | Biarkan hidup | Variasi feed resmi Blogger |
| `/feeds/comments/default` | Utility crawlable | **KEEP** | Biarkan hidup bila sistem komentar native masih dipakai | Ini plumbing komentar, bukan surface branding |
| `/feeds/comments/default?alt=rss` | Utility crawlable | **KEEP** | Biarkan hidup | Variasi feed komentar |
| `/feeds/posts/default/-/[LABEL]` | Utility crawlable | **KEEP** | Biarkan hidup | Feed kategori/label berguna sebagai lapisan distribusi |
| `/feeds/posts/default/-/[LABEL]?alt=rss` | Utility crawlable | **KEEP** | Biarkan hidup | Variasi RSS untuk label |
| `/feeds/<POST_ID>/comments/default` | Utility crawlable | **KEEP** | Biarkan hidup | Feed komentar per post |
| `/feeds/<POST_ID>/comments/default?alt=rss` | Utility crawlable | **KEEP** | Biarkan hidup | Variasi RSS komentar per post |
| `/sitemap.xml` | Utility crawlable | **KEEP and submit** | Pastikan tetap tersedia dan disubmit ke Search Console | Sitemap membantu crawling, tetapi bukan pengganti internal linking |
| `/view` | Legacy / optional | **DO NOT PROMOTE** | Jika aktif, noindex atau redirect; jika tidak aktif, biarkan mati | Dynamic Views memberi bau Blogger lawas |
| `/view/classic` | Legacy / optional | **DO NOT PROMOTE** | Sama seperti di atas | Jangan dijadikan surface publik utama |
| `/view/flipcard` | Legacy / optional | **DO NOT PROMOTE** | Sama seperti di atas | Legacy surface |
| `/view/magazine` | Legacy / optional | **DO NOT PROMOTE** | Sama seperti di atas | Legacy surface |
| `/view/mosaic` | Legacy / optional | **DO NOT PROMOTE** | Sama seperti di atas | Legacy surface |
| `/view/sidebar` | Legacy / optional | **DO NOT PROMOTE** | Sama seperti di atas | Legacy surface |
| `/view/snapshot` | Legacy / optional | **DO NOT PROMOTE** | Sama seperti di atas | Legacy surface |
| `/view/timeslide` | Legacy / optional | **DO NOT PROMOTE** | Sama seperti di atas | Legacy surface |

---

## Keputusan Arsitektur Final

### Route yang harus dipertahankan sebagai surface utama
Route berikut adalah canonical public surface dan tidak boleh diperlakukan sebagai artefak yang disembunyikan:

- `/`
- `/YYYY/MM/slug.html`
- `/p/*.html`

Ini adalah lapisan URL yang harus mendapat prioritas dalam:

- internal linking
- canonical consistency
- sitemap coverage
- navigasi publik
- distribusi authority

### Route yang harus tetap hidup tetapi tidak dijadikan target indeks utama
Route berikut boleh hidup untuk UX atau utilitas sistem, tetapi tidak boleh menjadi pusat arsitektur SEO:

- `/search/label/[LABEL]`
- `/search?q=[QUERY]`
- seluruh family `/feeds/...`
- `/sitemap.xml`

### Route yang harus dinormalisasi
Route berikut harus dikendalikan agar tidak menghasilkan duplikasi atau fingerprint yang tidak perlu:

- `?m=1`
- `?m=0`

Normalisasi bisa dilakukan dengan dua opsi:

1. **301 redirect** ke URL bersih jika parity aman.
2. **Canonicalization** ke URL bersih bila redirect penuh belum aman.

Prioritas terbaik adalah redirect bersih setelah dipastikan tidak memicu mismatch rendering, comment breakage, atau surface drift.

### Route legacy yang tidak boleh dipromosikan
Route berikut tidak boleh dijadikan bagian dari navigasi resmi atau strategi indeks:

- `/view`
- `/view/classic`
- `/view/flipcard`
- `/view/magazine`
- `/view/mosaic`
- `/view/sidebar`
- `/view/snapshot`
- `/view/timeslide`

Jika ternyata masih aktif, perlakukan sebagai legacy surface. Jangan didorong ke sitemap, jangan dijadikan menu, dan jangan dijadikan canonical target.

---

## Rekomendasi Worker untuk PakRPP

### Worker boleh mengerjakan ini

#### 1. Canonical host enforcement
- `http://` → `https://`
- apex domain → `https://www.pakrpp.com`

#### 2. Vanity route aliases
Contoh:

- `/about` → `/p/about.html`
- `/authors` → `/p/authors.html`
- `/privacy` → `/p/privacy-policy.html`
- `/sitemap` → `/p/sitemap.html`
- `/contact` → `/p/contact.html`

#### 3. Query normalization
- hilangkan `?m=1`
- hilangkan `?m=0`
- pertahankan query yang memang dibutuhkan fitur internal tertentu

#### 4. Cache and header hygiene
- header kontrol cache untuk asset dan HTML
- header keamanan yang kompatibel dengan Blogger + custom front-end
- pengurangan noise teknis tanpa mengganggu render inti

### Worker tidak boleh mengerjakan ini

#### 1. Mem-proxy semua HTML post agar tampak bukan Blogger
Ini berisiko merusak caching, komentar, parity, dan konsistensi canonical.

#### 2. Mengubah permalink inti post
Struktur `/YYYY/MM/slug.html` boleh terasa Blogger, tetapi stabilitas URL lebih penting daripada gengsi visual.

#### 3. Menyembunyikan feed atau sitemap
Feed dan sitemap adalah plumbing discovery. Menonaktifkannya demi estetika adalah keputusan lemah.

#### 4. Mengganti semua navigasi menjadi JS-only tanpa `<a href>` crawlable
Kalau bot tidak bisa merayapi link dengan baik, Anda merusak discovery hanya demi sensasi SPA.

---

## Policy Indexing yang Disarankan

### Index
- `/`
- `/YYYY/MM/slug.html`
- `/p/*.html` yang penting secara publik

### Noindex, follow
- `/search/label/*`
- `/search?q=*`
- archive/search surfaces lain yang serupa

### Normalize / canonicalize
- semua URL dengan `?m=1`
- semua URL dengan `?m=0`

### Keep as crawlable utility
- `/feeds/...`
- `/sitemap.xml`

### Legacy, jangan dipromosikan
- `/view/*`

---

## Prioritas Implementasi

### Prioritas 1 — yang paling berdampak
1. Pastikan canonical host hanya `https://www.pakrpp.com`.
2. Pastikan post detail dan static pages menjadi target internal linking utama.
3. Terapkan kebijakan **noindex, follow** pada archive/search surfaces.
4. Audit dan normalkan `?m=1` serta `?m=0`.

### Prioritas 2 — penguatan surface publik
5. Tambahkan vanity routes untuk halaman statis penting.
6. Pastikan sitemap XML aktif dan terdaftar di Search Console.
7. Pertahankan feeds tetap hidup sebagai plumbing distribusi.

### Prioritas 3 — pembersihan fingerprint Blogger yang tidak penting
8. Verifikasi apakah `/view/*` masih aktif.
9. Jika aktif, cegah agar tidak menjadi surface yang dipromosikan.
10. Pastikan tidak ada menu, breadcrumbs, atau internal references yang mendorong legacy views.

---

## Hal yang Harus Dipertahankan Meski Terasa “Masih Blogger”

Ini bagian yang sering disabotase oleh ego desain. Jangan diutak-atik secara bodoh:

- permalink post yang stabil
- static pages yang stabil
- sitemap XML
- feed system
- crawlable internal links
- canonical host discipline

Situs yang terlihat mewah tetapi kehilangan plumbing discovery adalah situs yang sedang berdandan di ruang kosong.

---

## Putusan Akhir

PakRPP **tidak perlu keluar total dari ekosistem Blogger pada level mesin**. Yang perlu dilakukan adalah **mengontrol permukaan publik dan disiplin route**. Blogger boleh tetap menjadi backend. Yang tidak boleh adalah membiarkan URL surfaces liar, parameter mobile bocor, dan listing/search pages mengambil peran yang tidak semestinya.

Strategi yang benar adalah ini:

- pertahankan URL canonical inti
- kendalikan label/search/indexing policy
- normalkan parameter tampilan
- gunakan Worker untuk kebersihan route, bukan untuk kosmetik berlebihan
- jangan matikan plumbing discovery hanya demi gengsi visual

Itu pendekatan yang paling waras untuk membuat PakRPP terasa premium, tidak mentah-Blogger, tetapi tetap kuat untuk SEO, GEO, SEA, dan AI discovery.
