# KONTRAK 1 — Store Commerce Surface

## 1. Tujuan Kontrak

Kontrak ini menetapkan `/store` dan `/store/<kategori>` sebagai **commerce surface** untuk Yellow Cart: halaman kurasi produk yang ringan, statis, dapat dirayapi mesin pencari, AI-discoverable, dan tetap terasa seperti aplikasi native melalui progressive enhancement.

Commerce surface **bukan marketplace penuh** dan **bukan blog listing**. Commerce surface adalah halaman kurasi produk yang mengutamakan:

1. Penemuan produk secara cepat.
2. Navigasi kategori yang jelas.
3. CTA marketplace yang pendek jalurnya.
4. Konten HTML yang tetap crawlable tanpa JavaScript.
5. Schema, sitemap, dan internal linking yang sehat.
6. Performa ringan, cacheable, dan smooth.

---

## 2. Prinsip Arsitektur

### 2.1 Static-first, enhanced by JavaScript

`/store` dan `/store/<kategori>` harus tetap berguna tanpa JavaScript.

HTML awal wajib memuat:

- Judul halaman.
- Deskripsi halaman.
- Disclosure afiliasi.
- Searchbar shell.
- Link kategori asli.
- Product grid awal.
- Link detail produk.
- Link marketplace utama bila tersedia.
- Breadcrumb.
- JSON-LD schema.

JavaScript hanya berfungsi sebagai enhancement untuk:

- Search lokal.
- Action sheet `Cek harga`.
- Preview sheet.
- Save.
- Copy link.
- Smooth transition.
- Store discovery sheet.
- Lazy-load manifest.

Larangan:

- Jangan membuat `/store` sebagai blank HTML yang bergantung penuh pada JS.
- Jangan membuat produk hanya muncul setelah JS aktif.
- Jangan menyembunyikan navigasi kategori di komponen JS-only.

---

## 3. Route Contract

### 3.1 Route utama

```text
/store
```

Fungsi:

- Yellow Cart hub.
- Menampilkan semua produk valid berlabel `Store`.
- Menampilkan Best Picks / Pinned products.
- Menampilkan navigasi kategori.
- Menampilkan FAQ/disclosure ringkas.
- Menjadi entry point utama untuk commerce surface.

### 3.2 Route kategori

```text
/store/workspace
/store/tech
/store/fashion
/store/skincare
/store/everyday
```

Fungsi:

- Collection page statis untuk masing-masing kategori.
- Menampilkan produk berlabel `Store` + label kategori terkait.
- Memiliki heading, deskripsi, breadcrumb, ItemList schema, dan product grid sendiri.
- Tidak mengulang semua section `/store` secara penuh.

### 3.3 Route detail produk

```text
/2026/05/<product-slug>.html
```

Fungsi:

- Tetap memakai URL Blogger post.
- Jika post memiliki label `Store`, halaman detail harus masuk **store-context mode**.
- Detail produk tidak boleh terasa seperti artikel blog biasa.
- Breadcrumb, CTA, related products, dan outline harus mengikuti konteks Yellow Cart.

---

## 4. Taxonomy Contract

### 4.1 Label wajib

Setiap produk Yellow Cart wajib memiliki label induk:

```text
Store
```

Label ini adalah flag utama untuk menentukan bahwa post adalah produk commerce surface.

### 4.2 Label kategori

Gunakan label kategori eksplisit tanpa simbol khusus:

```text
Store Workspace
Store Tech
Store Fashion
Store Skincare
Store Everyday
Store Best Picks
```

Contoh produk `Desk Tray Organizer`:

```text
Store
Store Workspace
```

Contoh produk kabel:

```text
Store
Store Tech
```

### 4.3 Larangan format label

Jangan gunakan:

```text
Store:Workspace
Store/Workspace
StoreWorkspace
Workspace saja
```

Alasan:

- Blogger label adalah string datar, bukan taxonomy engine.
- Simbol `:` dan `/` menambah risiko parsing, encoding, dan drift.
- Label generik seperti `Workspace` dapat bentrok dengan label blog biasa.

---

## 5. Store Taxonomy Registry

Semua kategori Store harus dikontrol dari satu registry pusat.

Contoh kontrak registry:

```js
const GG_STORE_TAXONOMY = {
  rootLabel: "Store",
  categories: [
    {
      id: "workspace",
      label: "Store Workspace",
      title: "Workspace",
      path: "/store/workspace",
      description: "Organizer, setup meja, kabel, dan perlengkapan kerja harian."
    },
    {
      id: "tech",
      label: "Store Tech",
      title: "Tech",
      path: "/store/tech",
      description: "Aksesori gadget dan perangkat praktis untuk kebutuhan digital."
    },
    {
      id: "fashion",
      label: "Store Fashion",
      title: "Fashion",
      path: "/store/fashion",
      description: "Produk gaya pakai harian yang praktis dan mudah dipadankan."
    },
    {
      id: "skincare",
      label: "Store Skincare",
      title: "Skincare",
      path: "/store/skincare",
      description: "Produk perawatan diri yang dikurasi secara hati-hati."
    },
    {
      id: "everyday",
      label: "Store Everyday",
      title: "Kebutuhan Harian",
      path: "/store/everyday",
      description: "Produk praktis untuk kebutuhan harian."
    }
  ]
};
```

Registry ini menjadi satu-satunya sumber kebenaran untuk:

- Category chips.
- Category pages generator.
- Store outline.
- Store discovery sheet.
- Breadcrumb.
- Related products.
- Schema ItemList.
- Filtering.
- Exclusion rules.
- Store sitemap generation.

Larangan:

- Jangan hardcode daftar kategori di banyak file.
- Jangan membuat daftar kategori terpisah di XML, JS, Worker, CSS, dan build script.
- Jangan mengubah kategori tanpa memperbarui registry pusat.

---

## 6. `/store` Page Structure

Struktur ideal `/store`:

```text
1. Header
   - Yellow Cart
   - Subtitle ringkas
   - Affiliate disclosure pill

2. Primary Tools
   - Searchbar: Cari produk atau kategori
   - Category chips:
     Semua / Best Picks / Workspace / Tech / Fashion / Skincare / Kebutuhan Harian

3. Main Content
   - Best Picks / Pinned products
   - Product grid

4. Secondary Content
   - Category gateway
   - Mini FAQ / disclosure

5. Persistent UI
   - Universal Dock
   - Store Context Outline attached above dock
```

---

## 7. `/store/<kategori>` Page Structure

Struktur ideal halaman kategori:

```text
1. Category Header
   - Link kembali: Semua Kurasi
   - Nama kategori
   - Deskripsi kategori
   - Breadcrumb

2. Primary Tools
   - Searchbar contextual: Cari produk <kategori>
   - Category chips dengan kategori aktif

3. Main Content
   - Product grid kategori

4. Secondary Content
   - Related categories
   - Optional category FAQ

5. Persistent UI
   - Universal Dock
   - Store Category Outline attached above dock
```

Halaman kategori tidak boleh hanya menjadi filter JS atas `/store`. Setiap kategori harus punya URL statis yang dapat dirayapi.

---

## 8. Category Navigation Contract

Navigasi dari `/store` ke kategori wajib tersedia di:

1. Category chips di atas produk.
2. Category gateway section.
3. Store outline saat expanded.
4. Store discovery sheet.

Category chips harus berupa link asli:

```html
<a href="/store" aria-current="page">Semua</a>
<a href="/store/workspace">Workspace</a>
<a href="/store/tech">Tech</a>
<a href="/store/fashion">Fashion</a>
```

Navigasi dari kategori kembali ke `/store` wajib tersedia di:

1. Breadcrumb.
2. Chip `Semua`.
3. Link `← Semua Kurasi`.
4. Outline expanded.

---

## 9. Search Contract

### 9.1 Searchbar halaman

Searchbar di halaman adalah pencarian cepat dan lokal.

Di `/store`:

```text
Cari produk atau kategori
```

Di `/store/fashion`:

```text
Cari produk fashion
```

Fungsi:

- Search cepat dalam konteks halaman.
- Filter/suggestion lokal.
- Harus tetap ada sebagai shell HTML.

### 9.2 Dock Search

Dock Search membuka discovery sheet context-aware.

Di `/store` dan `/store/*`, Dock Search harus menjadi **Store Discovery Sheet**.

Isi ideal:

- Input pencarian produk.
- Kategori Store.
- Best Picks.
- Recent products.
- Saved products.
- Toggle opsional: cari juga di Blog.

Dock Search tidak boleh membuka Blog Discovery umum saat user berada di `/store` atau `/store/*`.

---

## 10. Outline Contract

Outline yang attached above dock di commerce surface bukan table of contents artikel.

Di `/store`, outline berfungsi sebagai **Store Context Bar**:

Collapsed:

```text
Semua · 21 produk
```

Expanded:

```text
Semua Kurasi
Best Picks
Workspace
Tech
Fashion
Skincare
Kebutuhan Harian
```

Di `/store/fashion`, outline berfungsi sebagai **Category Context Bar**:

Collapsed:

```text
Fashion · 5 produk
```

Expanded:

```text
Semua Kurasi
Fashion Best Picks
Produk Terbaru
Kategori Terkait
```

Perbedaan dengan category chips:

- Category chips = navigasi utama di atas halaman.
- Outline = remote/context bar saat user sudah scroll jauh dan dock aktif.

Larangan:

- Jangan membuat outline menduplikasi chips tanpa konteks.
- Jangan memakai outline artikel untuk commerce surface.
- Jangan menampilkan count `0 produk` ketika grid sudah berisi produk.

---

## 11. Product Card Contract

Product card harus cepat dibaca dan cepat diklik.

Setiap card wajib memiliki:

- 1 gambar utama.
- Category label.
- Nama produk.
- Harga/kisaran harga.
- 1 CTA utama: `Cek harga`.

Default product card tidak menggunakan carousel.

Carousel hanya boleh muncul di:

- Preview sheet.
- Detail produk.
- Card tertentu secara sangat terbatas, jika benar-benar dibutuhkan dan lazy-loaded.

CTA behavior:

```text
Jika hanya 1 marketplace tersedia:
  Cek harga langsung membuka marketplace.

Jika 2–3 marketplace tersedia:
  Cek harga membuka mini action sheet.
```

Mini action sheet:

```text
Nama produk
Harga

Cek harga di:
- Shopee
- Tokopedia
- TikTok Shop

Utility:
- Copy link
- Save
```

Larangan:

- Jangan menaruh Shopee / Tokopedia / TikTok / Copy / Save permanen di setiap card.
- Jangan membuat card terlalu editorial.
- Jangan menyembunyikan marketplace CTA hanya di preview sheet.

---

## 12. Preview Sheet Contract

Preview sheet adalah lapisan editorial, bukan jalur wajib menuju marketplace.

Isi ideal:

- Carousel/foto produk.
- Nama produk.
- Harga.
- Why picked.
- Best for.
- Caveat.
- Notes.
- Marketplace buttons.
- Copy link.
- Save.
- Link baca detail.

Preview sheet boleh lebih kaya, tetapi tidak boleh menjadi satu-satunya jalan untuk cek harga.

---

## 13. FAQ Contract

`/store` boleh memiliki FAQ accordion kecil di bawah halaman.

FAQ maksimal 3–5 item.

Isi contoh:

```text
Apakah harga selalu sama?
Harga dan stok mengikuti marketplace.

Apakah tautan di Yellow Cart adalah tautan afiliasi?
Sebagian tautan dapat berupa tautan afiliasi.

Apakah produk dijual langsung oleh PAKRPP?
Tidak. Yellow Cart mengarahkan ke marketplace pihak ketiga.

Bagaimana produk dikurasi?
Produk dipilih berdasarkan fungsi, harga, kegunaan, dan relevansi kategori.
```

FAQ tidak boleh mengganggu area produk utama.

---

## 14. Schema Contract

`/store` wajib memiliki:

- `WebPage` atau `CollectionPage`.
- `ItemList` untuk daftar produk.
- `BreadcrumbList`.

`/store/<kategori>` wajib memiliki:

- `CollectionPage`.
- `ItemList` kategori.
- `BreadcrumbList`.

Detail produk berlabel `Store` wajib memiliki:

- `Product` jika data produk cukup.
- `Offer` jika marketplace/harga tersedia.
- `BreadcrumbList` dengan konteks Yellow Cart.
- Article/editorial schema tambahan bila konten detail berbentuk ulasan/kurasi.

---

## 15. CSS/JS Contract

Jangan inline semua CSS/JS ke setiap HTML.

### Inline hanya untuk:

- Critical CSS kecil untuk above-the-fold.
- Theme/no-flash bootstrap kecil.
- JSON-LD schema.
- Page data kecil jika diperlukan.

### External shared assets:

```text
/assets/store/store.css
/assets/store/store.js
/assets/store/store-search.js      optional lazy
/assets/store/store-preview.js     optional lazy
/assets/store/store-actions.js     optional lazy
/assets/store/manifest.json
```

Semua halaman kategori menggunakan shared `store.css` dan `store.js`.

Halaman kategori hanya boleh memiliki critical CSS kecil dan data/schema kategori sendiri.

Larangan:

- Jangan menduplikasi full CSS di setiap category HTML.
- Jangan menduplikasi full JS di setiap category HTML.
- Jangan membuat asset per kategori kecuali benar-benar ada kebutuhan berbeda.

---

## 16. Performance Contract

Commerce surface wajib ringan.

Target:

```text
LCP < 2.5 s
TBT < 150 ms
Initial payload serendah mungkin
Initial visible images <= 6
JS enhancement defer/lazy
```

Strategi:

- Static prerender product grid awal.
- Lazy-load preview/action/search enhancement.
- Pakai gambar produk nyata dan teroptimasi.
- Hindari full Material Symbols variable font bila tidak perlu.
- Gunakan cacheable external CSS/JS.
- Prefetch category pages secara selektif.

---

## 17. PWA / SPA-like Contract

`/store` boleh terasa seperti SPA/PWA native app, tetapi tidak boleh menjadi SPA-only.

Model yang benar:

```text
MPA secara dokumen
SPA-like secara pengalaman
PWA secara caching dan interaction
```

Route tetap nyata:

```text
/store
/store/fashion
/store/tech
/store/workspace
/2026/05/product-slug.html
```

Enhancement boleh:

- Intercept link internal store.
- Fetch category HTML.
- Swap main store region.
- Update URL.
- Preserve dock/outline.
- Prefetch manifest.
- Cache category pages.

Fallback wajib:

- Jika JS gagal, semua link tetap berjalan sebagai navigasi normal.
- HTML tetap crawlable dan usable.

---

# KONTRAK 2 — Index XML Separation: Blog `/` Diputus dari Store

## 1. Tujuan Kontrak

Kontrak ini menetapkan pemisahan tegas antara Blog surface dan Store commerce surface.

Produk berlabel `Store` tidak boleh muncul sebagai artikel blog biasa di:

```text
/
/landing
Blog Discovery umum
Blog related posts umum
```

Namun produk berlabel `Store` tetap harus muncul dan terindeks melalui:

```text
/store
/store/<kategori>
Store sitemap
Schema ItemList/Product
Store Discovery
Related products
Product detail URL
```

Prinsip utama:

```text
Pisahkan dari Blog surface, bukan sembunyikan dari search engine.
```

---

## 2. Store Product Detection Contract

`index.xml` harus dapat mendeteksi apakah sebuah post adalah produk Yellow Cart.

Deteksi utama:

```text
Post memiliki label Store
```

Deteksi pendukung:

```text
Post memiliki <script type="application/json" class="gg-store-data">...</script>
```

Jika salah satu valid, post diperlakukan sebagai Store product post.

Prioritas:

1. Label `Store` adalah flag routing/surface utama.
2. `gg-store-data` adalah sumber data produk dan schema.
3. Label kategori `Store Workspace`, `Store Tech`, dst. menentukan kategori.

---

## 3. `index.xml` Detail Branch Contract

Di post detail, `index.xml` harus membedakan dua mode:

### 3.1 Blog article mode

Untuk post tanpa label `Store`.

Breadcrumb:

```text
Home > Blog > Judul Artikel
```

Surface:

- Article/editorial layout.
- Blog comments/related posts sesuai aturan blog.
- Blog outline jika ada.
- Blog Discovery context.

### 3.2 Store product detail mode

Untuk post dengan label `Store`.

Breadcrumb:

```text
Home > Yellow Cart > <Kategori> > Nama Produk
```

Surface:

- Product editorial detail.
- Commerce CTA.
- Store context bar.
- Related products.
- Store outline.
- Store Discovery context.
- Product/Offer schema bila data cukup.

URL tetap URL Blogger post:

```text
/2026/05/<product-slug>.html
```

Tetapi pengalaman dan konteks harus menjadi Yellow Cart, bukan Blog biasa.

---

## 4. Blog Listing Exclusion Contract

Produk berlabel `Store` tidak boleh muncul di root blog listing `/`.

Root blog listing hanya menampilkan post editorial/blog non-Store.

Larangan:

- Jangan menampilkan `Store` product post di daftar artikel terbaru `/`.
- Jangan mencampur produk affiliate dengan artikel editorial.
- Jangan membiarkan label `Store` terbaca sebagai label blog biasa di UI utama.

Jika Blogger feed/listing tidak bisa difilter sempurna dari server/XML, gunakan progressive cleanup dengan prinsip:

1. XML gating lebih diutamakan.
2. Build/static feed lebih diutamakan.
3. JS cleanup hanya fallback visual, bukan sumber kebenaran utama.

---

## 5. Landing Exclusion Contract

Produk berlabel `Store` tidak boleh muncul otomatis di `/landing` sebagai latest post/feed editorial.

Landing boleh menampilkan Yellow Cart hanya jika berupa section khusus dan disengaja:

```text
Yellow Cart Picks
3 produk pilihan
Lihat semua di /store
```

Section tersebut harus curated, bukan feed blog otomatis.

Larangan:

- Jangan membiarkan produk Store bocor ke landing latest posts.
- Jangan mencampur produk dengan narasi landing utama tanpa konteks Yellow Cart.

---

## 6. Blog Discovery Exclusion Contract

Blog Discovery umum tidak boleh menampilkan produk berlabel `Store` sebagai hasil blog biasa.

Saat user berada di:

```text
/
/landing
post blog biasa
```

Discovery harus menampilkan:

- Artikel blog.
- Label blog.
- Arsip.
- Halaman editorial.

Produk Store harus dikecualikan dari hasil utama.

Produk Store hanya boleh muncul jika ada opsi eksplisit seperti:

```text
Cari juga di Yellow Cart
```

atau tab khusus:

```text
Produk
```

Namun default Blog Discovery tidak boleh mencampur produk Store.

---

## 7. Store Discovery Inclusion Contract

Saat user berada di:

```text
/store
/store/*
Store product detail
```

Dock Search harus membuka Store Discovery context.

Store Discovery harus menampilkan:

- Produk.
- Kategori Store.
- Best Picks.
- Saved products.
- Recently viewed products.
- Optional: cari juga di Blog.

Blog articles tidak boleh mendominasi Store Discovery.

---

## 8. Related Content Contract

### 8.1 Blog related posts

Di blog article mode, related posts tidak boleh menampilkan produk Store.

### 8.2 Store related products

Di store product detail mode, related content harus berupa produk terkait.

Prioritas related products:

1. Kategori Store yang sama.
2. Label `Store Best Picks` atau pinned jika relevan.
3. Produk dengan tag/kebutuhan serupa dari `gg-store-data`.
4. Produk terbaru dari Store jika data terkait terbatas.

Related products harus mengarah ke detail produk atau marketplace/action sheet sesuai kontrak store.

---

## 9. Sitemap and Indexability Contract

Walaupun produk Store dikecualikan dari `/` dan `/landing`, produk Store tetap harus indexable.

Produk Store harus ditemukan melalui:

- `/store` ItemList.
- `/store/<kategori>` ItemList.
- Store sitemap/static route list.
- Product detail URL.
- Breadcrumb.
- Related products.
- Schema.

Larangan:

- Jangan menambahkan `noindex` pada produk Store production.
- Jangan memblokir `/store` atau `/store/<kategori>` dari crawler production.
- Jangan bergantung pada `/` sebagai satu-satunya jalur internal link untuk post produk.

---

## 10. Schema Separation Contract

### 10.1 Blog pages

Blog pages menggunakan schema editorial:

- `Blog` / `CollectionPage` untuk listing blog.
- `BlogPosting` atau `Article` untuk artikel.
- Breadcrumb Blog.

Produk Store tidak boleh masuk ItemList blog.

### 10.2 Store pages

Store pages menggunakan schema commerce/collection:

- `CollectionPage`.
- `ItemList`.
- `BreadcrumbList`.

### 10.3 Store product detail

Store product detail menggunakan:

- `Product` jika data cukup.
- `Offer` jika harga/marketplace tersedia.
- `Article` atau editorial support bila konten berbentuk kurasi/ulasan.
- Breadcrumb Yellow Cart.

---

## 11. Breadcrumb Contract

### 11.1 Blog article

```text
Home (/landing) > Blog (/) > Judul Artikel
```

### 11.2 Store hub

```text
Home (/landing) > Yellow Cart (/store)
```

### 11.3 Store category

```text
Home (/landing) > Yellow Cart (/store) > Fashion (/store/fashion)
```

### 11.4 Store product detail

```text
Home (/landing) > Yellow Cart (/store) > Workspace (/store/workspace) > Desk Tray Organizer
```

Larangan:

- Jangan menampilkan Store product detail sebagai `Home > Blog > Produk`.
- Jangan menampilkan kategori Store sebagai label blog biasa.

---

## 12. Dock Contract Across Surfaces

Universal Dock tetap konsisten:

```text
Beranda  → /landing
Kontak   → /landing#contact
Cari     → context-aware discovery
Blog     → /
Lainnya  → global More sheet
```

Namun `Cari` harus context-aware:

- Di Blog surface: Blog Discovery.
- Di Store surface: Store Discovery.
- Di Store product detail: Store/Product Discovery.

Dock tidak boleh menjadi satu-satunya cara user kembali ke Store dari product detail. Store product detail wajib punya link/konteks sendiri untuk kembali ke `/store` atau kategori.

---

## 13. Product Detail Store Context Contract

Jika post detail memiliki label `Store`, halaman wajib menampilkan store-context affordance.

Minimal:

```text
← Yellow Cart
Kategori aktif
CTA Cek harga
Related products
```

Ideal:

```text
← Yellow Cart / Workspace
Desk Tray Organizer
Rp129.000
Cek harga
Save
Copy link
Why picked
Best for
Caveat
Related Workspace products
```

User tidak boleh merasa terlempar ke blog biasa setelah masuk dari `/store`.

---

## 14. Worker Contract

Worker tidak boleh menjadi pembuat utama UI Store atau Blog separation.

Worker boleh menangani:

- Route policy.
- Cache policy.
- Header policy.
- Canonical cleanup.
- Emergency fallback.
- Static asset serving.

Worker tidak boleh menjadi sumber utama untuk:

- Menentukan taxonomy Store.
- Menulis UI product card normal.
- Mengganti SSR XML sehat.
- Membuat Blog/Store separation sebagai satu-satunya layer.

Sumber kebenaran utama tetap:

1. Blogger label + `index.xml` untuk detail surface detection.
2. Store taxonomy registry untuk kategori.
3. Static build artifacts untuk `/store` dan `/store/<kategori>`.
4. Schema/sitemap untuk discoverability.

---

## 15. Blogger Label Route Redirect Contract

Blogger native label archive routes for Store labels must not become the public commerce surface.

Examples:

```text
/search/label/Store
/search/label/Store%20Workspace
/search/label/Store%20Tech
/search/label/Store%20Fashion
/search/label/Store%20Skincare
/search/label/Store%20Everyday
```

These routes should be treated as legacy/native Blogger archive routes and redirected to the canonical Store surface.

Canonical redirects:

```text
/search/label/Store              → /store
/search/label/Store%20Workspace  → /store/workspace
/search/label/Store%20Tech       → /store/tech
/search/label/Store%20Fashion    → /store/fashion
/search/label/Store%20Skincare   → /store/skincare
/search/label/Store%20Everyday   → /store/everyday
```

Redirect type:

```text
301 in production if stable
302 during development/testing if taxonomy is still changing
```

Important rule:

```text
/search/label/Store%20* is not a real wildcard route in Blogger URL semantics.
```

Do not implement a literal redirect for `/search/label/Store%20*` as if `*` were a valid wildcard URL. Instead, implement pattern matching at Worker/build-route-policy level for known configured Store category labels from the Store taxonomy registry.

The redirect source list must be generated from the Store taxonomy registry, not hardcoded manually in multiple places.

Configuration requirement:

There must be exactly one editable Store taxonomy/route registry that controls Store labels, Store category slugs, canonical Store paths, and Blogger label redirect sources.

Changing Store taxonomy must only require editing this registry, then running the build/generate step. No manual edits should be required in XML, Worker redirect lists, Store category chips, Store outline, Store Discovery, sitemap, schema, or related-product logic.

Example registry shape:

```js
const GG_STORE_TAXONOMY = {
  root: {
    label: "Store",
    path: "/store",
    bloggerLabelPath: "/search/label/Store"
  },
  categories: [
    {
      id: "fashion",
      title: "Fashion",
      label: "Store Fashion",
      slug: "fashion",
      path: "/store/fashion",
      bloggerLabelPath: "/search/label/Store%20Fashion"
    },
    {
      id: "tech",
      title: "Tech",
      label: "Store Tech",
      slug: "tech",
      path: "/store/tech",
      bloggerLabelPath: "/search/label/Store%20Tech"
    }
  ]
};
```

The generator must derive these outputs from the registry:

```text
/search/label/Store              → /store
/search/label/Store%20Fashion    → /store/fashion
/search/label/Store%20Tech       → /store/tech
```

Adding a new category must only require adding one registry object. Removing a category must only require deleting or disabling one registry object. Renaming a category must preserve the old redirect as a legacy alias if the previous route may already be indexed.

Rules:

- Native Blogger Store label archive pages must not be exposed as canonical public Store pages.
- Store label archive routes should not appear in visible navigation.
- Store label archive routes should not be linked from category chips, Store outline, Store Discovery, schema, sitemap, or related products.
- Store category chips must link to `/store/<kategori>`, not `/search/label/<Store Label>`.
- Store schema and sitemap must use `/store` and `/store/<kategori>` canonical URLs.
- If a Store label route cannot be redirected in a given environment, it must at minimum include canonical metadata pointing to the matching `/store` or `/store/<kategori>` route.

This belongs to Contract 2 because it protects the separation between Blogger native label archives and the Store commerce surface.

---

## 16. Implementation Priority

Implementasi tidak boleh dilakukan sebagai satu task raksasa.

Prioritas:

### P0 — Label namespace and registry

- Tetapkan label `Store` sebagai flag utama.
- Tetapkan label kategori `Store Workspace`, `Store Tech`, dst.
- Buat registry pusat taxonomy Store.

### P1 — Blog/landing exclusion

- Produk berlabel `Store` tidak muncul di `/`.
- Produk berlabel `Store` tidak muncul otomatis di `/landing`.
- Produk berlabel `Store` tidak muncul di Blog Discovery umum.

### P2 — Store category navigation

- Category chips link ke `/store/<kategori>`.
- Category pages static, crawlable, schema-valid.
- Outline menjadi Store Context Bar.

### P3 — Product detail store-context mode

- `index.xml` mendeteksi label `Store`.
- Breadcrumb berubah ke Yellow Cart.
- CTA commerce muncul.
- Related products muncul.
- Blog surface tidak bocor.

### P4 — Store Discovery context

- Dock Search menjadi Store Discovery di `/store`, `/store/*`, dan Store product detail.
- Blog Discovery tetap bersih dari produk Store.

### P5 — SPA/PWA enhancement

- Prefetch category pages.
- Smooth transition.
- Preserve dock/outline.
- Lazy-load action/preview/search enhancements.

---

## 16. Acceptance Criteria

### 16.1 Blog `/`

- Tidak ada post berlabel `Store` di listing `/`.
- Blog listing hanya menampilkan post editorial/blog.
- Blog schema tidak memasukkan produk Store.

### 16.2 Landing `/landing`

- Tidak ada produk Store yang bocor otomatis ke latest/editorial feed.
- Jika ada Yellow Cart section, section tersebut curated dan mengarah ke `/store`.

### 16.3 Store `/store`

- Produk berlabel `Store` muncul.
- Category chips muncul sebagai link asli.
- Product grid ada di HTML awal.
- Schema ItemList valid.
- Disclosure afiliasi ada.

### 16.4 Store category `/store/<kategori>`

- Hanya produk kategori terkait yang muncul.
- Ada link kembali ke `/store`.
- Breadcrumb valid.
- Schema ItemList kategori valid.

### 16.5 Store product detail

- URL tetap Blogger post.
- Jika label `Store` terdeteksi, breadcrumb memakai Yellow Cart.
- CTA commerce tersedia.
- Related products bukan blog posts umum.
- Dock Search memakai Store Discovery.

### 16.6 Discovery

- Blog Discovery tidak mencampur produk Store secara default.
- Store Discovery menampilkan produk dan kategori Store.

### 16.7 SEO/indexability

- `/store` indexable.
- `/store/<kategori>` indexable.
- Product detail Store indexable.
- Tidak ada production `noindex` untuk Store route.
- Produk Store ditemukan melalui internal links, sitemap, schema, dan related products.

