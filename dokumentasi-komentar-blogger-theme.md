# Dokumentasi Sistem Komentar — Blogger Theme

> File sumber: `theme-9117325794999434036__20_.xml`
> Scope: semua `b:includable`, markup, dan konfigurasi yang berkaitan dengan
> **comment**, **comments**, **threaded comment**, dan **iframe komentar**.

---

## Daftar Isi

1. [Arsitektur Umum](#1-arsitektur-umum)
2. [i18n — String Keys Komentar](#2-i18n--string-keys-komentar)
3. [Panel Registry — Konfigurasi Panel Comments](#3-panel-registry--konfigurasi-panel-comments)
4. [Alur Render Komentar — Diagram](#4-alur-render-komentar--diagram)
5. [Includable: commentsLink (Widget Blog.1 — GAGA)](#5-includable-commentslink-widget-blog1--gaga)
6. [Includable: commentsLink (Widget Blog.2 — Post Widget)](#6-includable-commentslink-widget-blog2--post-widget)
7. [Includable: commentsLinkIframe](#7-includable-commentslinkirframe)
8. [Includable: postCommentsLink](#8-includable-postcommentslink)
9. [Includable: commentAuthorAvatar](#9-includable-commentauthoravatar)
10. [Includable: commentDeleteIcon](#10-includable-commentdeleteicon)
11. [Includable: commentForm](#11-includable-commentform)
12. [Includable: commentFormIframeSrc](#12-includable-commentformifraramesrc)
13. [Includable: commentItem](#13-includable-commentitem)
14. [Includable: commentList](#14-includable-commentlist)
15. [Includable: commentPicker & comments (stub)](#15-includable-commentpicker--comments-stub)
16. [Includable: commentsTitle](#16-includable-commentstitle)
17. [Includable: iframeComments (legacy stub)](#17-includable-iframecomments-legacy-stub)
18. [Includable: threadedCommentForm ⭐](#18-includable-threadedcommentform-)
19. [Includable: threadedCommentJs](#19-includable-threadedcommentjs)
20. [Includable: threadedComments ⭐](#20-includable-threadedcomments-)
21. [Panel Container: #ggPanelComments](#21-panel-container-ggpanelcomments)
22. [Tombol Toggle Komentar di Post Toolbar](#22-tombol-toggle-komentar-di-post-toolbar)
23. [Info Panel (gg-epanel) — Baris Komentar](#23-info-panel-gg-epanel--baris-komentar)
24. [Post Card — Jumlah Komentar](#24-post-card--jumlah-komentar)
25. [bylineByName — Routing ke Comments](#25-bylinebyname--routing-ke-comments)
26. [postCommentsAndAd](#26-postcommentsandad)
27. [nativePassthrough — Pesan Blogger Asli](#27-nativepassthrough--pesan-blogger-asli)
28. [Ringkasan Data Attributes `data-gg-*`](#28-ringkasan-data-attributes-data-gg-)

---

## 1. Arsitektur Umum

Sistem komentar di theme ini menggunakan **dua lapis arsitektur**:

```
┌───────────────────────────────────────────────────────┐
│  LAYER 1: Blogger Native (server-side)                │
│  · data:post.commentHtml      → HTML komentar         │
│  · data:post.embedCommentForm → apakah form di-embed  │
│  · data:post.commentFormIframeSrc → URL iframe form   │
│  · data:post.cmtfpIframe      → iframe CMTFP          │
│  · data:post.appRpcRelayPath  → relay path JS         │
└───────────────────────────────────────────────────────┘
                        ↓ dirender ke dalam
┌───────────────────────────────────────────────────────┐
│  LAYER 2: GG Enhanced Panel (client-side JS)          │
│  · #ggPanelComments           → panel slide-in        │
│  · data-gg-panel='comments'   → dikontrol JS GG       │
│  · data-gg-owner / data-gg-slot → slot system         │
│  · threadedComments           → section utama         │
└───────────────────────────────────────────────────────┘
```

Komentar **tidak dirender langsung di dalam badan post**, melainkan dimasukkan ke dalam panel `#ggPanelComments` yang merupakan drawer/side-panel yang dikontrol oleh JavaScript GG (theme engine kustom).

---

## 2. i18n — String Keys Komentar

Theme mendukung dua locale: **English (`en`)** dan **Indonesia (`id`)**.
Semua string di-define dalam blok JSON di dalam `<b:messages>`.

### English Strings (baris ~144–307)

| Key | Value |
|-----|-------|
| `dock.comments` | `"Comments"` |
| `post.action.comments` | `"Comments"` |
| `post.action.toggleComments` | `"Toggle comments panel"` |
| `comments.panel.title` | `"Comments"` |
| `comments.panel.toggle` | `"Toggle comments panel"` |
| `comments.action.add` | `"Add comment"` |
| `comments.action.reply` | `"Reply"` |
| `comments.action.copyLink` | `"Copy link"` |
| `comments.action.delete` | `"Delete comment"` |
| `comments.action.more` | `"More actions"` |
| `comments.action.permalink` | `"Comment link"` |
| `comments.replyingTo` | `"Replying to"` |
| `comments.parentComment` | `"parent comment"` |
| `comments.replyTo` | `"Reply to {name}"` |
| `comments.replies.show` | `"View replies ({count})"` |
| `comments.replies.hide` | `"Hide replies ({count})"` |
| `comments.toolbar.width.sidebar` | `"Sidebar (240px)"` |
| `comments.toolbar.width.wide` | `"Wide (440px)"` |
| `comments.toolbar.width.toggleToSidebar` | `"Switch to sidebar width (240px)"` |
| `comments.toolbar.width.toggleToWide` | `"Switch to wide width (440px)"` |
| `comments.toolbar.sort.newest` | `"Newest comments"` |
| `comments.toolbar.sort.oldest` | `"Oldest comments"` |
| `comments.toolbar.sort.toggleToNewest` | `"Sort comments by newest"` |
| `comments.toolbar.sort.toggleToOldest` | `"Sort comments by oldest"` |
| `comments.empty.title` | `"No comments yet"` |
| `comments.empty.body` | `"Be the first to add one."` |
| `comments.count.one` | `"1 Comment"` |
| `comments.count.many` | `"{count} Comments"` |
| `comments.count.short.one` | `"1 Cmt"` |
| `comments.count.short.many` | `"{count} Cmts"` |
| `comments.status.copying` | `"Copying comment link..."` |
| `comments.status.copied` | `"Comment link copied"` |
| `comments.status.deleting` | `"Deleting comment..."` |
| `comments.status.deleted` | `"Comment deleted"` |
| `comments.status.failed` | `"Comment action failed"` |
| `toast.comments.deleted` | `"Comment deleted"` |

### Indonesia Strings (baris ~397–560)

| Key | Value |
|-----|-------|
| `dock.comments` | `"Komentar"` |
| `post.action.comments` | `"Komentar"` |
| `post.action.toggleComments` | `"Buka atau tutup panel komentar"` |
| `comments.panel.title` | `"Komentar"` |
| `comments.panel.toggle` | `"Buka atau tutup panel komentar"` |
| `comments.action.add` | `"Tambah komentar"` |
| `comments.action.reply` | `"Balas"` |
| `comments.action.copyLink` | `"Salin tautan"` |
| `comments.action.delete` | `"Hapus komentar"` |
| `comments.action.more` | `"Aksi lainnya"` |
| `comments.action.permalink` | `"Tautan komentar"` |
| `comments.replyingTo` | `"Membalas"` |
| `comments.parentComment` | `"komentar induk"` |
| `comments.replyTo` | `"Balas ke {name}"` |
| `comments.replies.show` | `"Lihat balasan ({count})"` |
| `comments.replies.hide` | `"Sembunyikan balasan ({count})"` |
| `comments.toolbar.width.wide` | `"Lebar (440px)"` |
| `comments.toolbar.width.toggleToSidebar` | `"Ubah ke lebar sidebar (240px)"` |
| `comments.toolbar.width.toggleToWide` | `"Ubah ke lebar 440px"` |
| `comments.toolbar.sort.newest` | `"Komentar terbaru"` |
| `comments.toolbar.sort.oldest` | `"Komentar terlama"` |
| `comments.empty.title` | `"Belum ada komentar"` |
| `comments.empty.body` | `"Jadilah yang pertama menambahkan komentar."` |
| `comments.count.one` | `"1 Komentar"` |
| `comments.count.many` | `"{count} Komentar"` |
| `comments.status.copying` | `"Menyalin tautan komentar..."` |
| `comments.status.copied` | `"Tautan komentar disalin"` |
| `comments.status.deleting` | `"Menghapus komentar..."` |
| `comments.status.deleted` | `"Komentar dihapus"` |
| `comments.status.failed` | `"Aksi komentar gagal"` |
| `toast.comments.deleted` | `"Komentar dihapus"` |

### Overrides — Tipe Data untuk String Komentar (baris ~748–779)

```json
"comments.panel.toggle":        { "type": "aria",         "maxLength": { "en": 40, "id": 48 } }
"post.action.toggleComments":   { "type": "aria",         "maxLength": { "en": 40, "id": 48 } }
"comments.count.one":           { "type": "counter",      "interpolation": false }
"comments.count.many":          { "type": "counter",      "interpolation": true, "requiredPlaceholders": ["count"] }
"comments.count.short.one":     { "type": "counter-short","interpolation": false }
"comments.count.short.many":    { "type": "counter-short","interpolation": true, "requiredPlaceholders": ["count"] }
```

**Catatan:** String `aria` dibatasi panjang karakternya karena digunakan sebagai `aria-label`.
String `counter` dan `counter-short` adalah dua varian label jumlah: panjang dan pendek.

---

## 3. Panel Registry — Konfigurasi Panel Comments

Panel `comments` didaftarkan di blok konfigurasi JSON GG (baris ~666–671):

```json
"comments": {
  "owner":     "registry",
  "surface":   ["post", "listing"],
  "primitive": "comments",
  "type":      "mixed"
}
```

| Field | Nilai | Penjelasan |
|-------|-------|------------|
| `owner` | `"registry"` | Dikontrol oleh registry GG (bukan individual widget) |
| `surface` | `["post", "listing"]` | Aktif di halaman post detail dan halaman listing |
| `primitive` | `"comments"` | Tipe panel khusus komentar (bukan generic `panel`) |
| `type` | `"mixed"` | Panel campuran (bisa floating/side/embedded) |

---

## 4. Alur Render Komentar — Diagram

```
User buka halaman post
        │
        ▼
<article class="gg-post"> [postDetail]
        │
        ├──► Post Toolbar
        │         └──► <button data-gg-postbar="comments">
        │                    [toggle #ggPanelComments]
        │
        ├──► <div class="gg-post__comments-anchor"
        │         data-gg-comments-owner="panel" hidden/>
        │         [anchor untuk scroll, tersembunyi]
        │
        └──► #ggPanelComments [Panel]
                  │  hidden="" inert="" (awalnya tertutup)
                  │
                  └──► threadedComments [section#comments]
                            │
                            ├──► Header (judul + toolbar sort/width)
                            │
                            ├──► .gg-comments__list #cmt2-holder
                            │         ├──► [kosong] → div.gg-cmt-empty
                            │         └──► data:post.commentHtml
                            │              [HTML komentar dari Blogger]
                            │
                            └──► Footer
                                      ├──► [allowNewComments] → "Add comment" CTA
                                      └──► #gg-composer-slot
                                                └──► [embedCommentForm] →
                                                     threadedCommentForm
                                                          └──► <iframe#comment-editor>
```

---

## 5. Includable: `commentsLink` (Widget Blog.1 — GAGA)

**Baris:** 2191–2216
**Widget:** Blog widget pertama (byline area post listing)

```xml
<b:includable id='commentsLink'>
  <!-- GAGA commentsLink -->
  <b:if cond='data:post.allowComments'>
    <a aria-label='Comments'
       class='gg-post__meta-item gg-post__meta-item--comments item item--comments meta-comments'
       expr:data-count='data:post.numberOfComments'
       expr:href='(data:post.url ? data:post.url
                 : (data:view.url ? data:view.url
                 : data:blog.homepageUrl)) + "#comments"'>

      <span aria-hidden='true' class='material-symbols-rounded'>comment</span>

      <span class='meta-count'>
        <b:if cond='data:post.numberOfComments &gt; 0'>
          <b:if cond='data:post.numberOfComments == 1'>
            1 <span class='meta-comments__short'>Cmt</span>
               <span class='meta-comments__long'>Comment</span>
          <b:else/>
            <data:post.numberOfComments/>
            <span class='meta-comments__short'>Cmts</span>
            <span class='meta-comments__long'>Comments</span>
          </b:if>
        <b:else/>
          <data:messages.postAComment/>
        </b:if>
      </span>
    </a>
  </b:if>
</b:includable>
```

### Logika

1. **Guard `allowComments`** — hanya render jika komentar diizinkan untuk post tersebut.
2. **URL link** dibuat dengan prioritas: `post.url` → `view.url` → `blog.homepageUrl`, lalu ditambah `#comments` sebagai anchor.
3. **`data-count`** — jumlah komentar di-set sebagai data attribute (dipakai JS untuk badge).
4. **Cabang tampilan label:**
   - `numberOfComments > 0` → tampilkan angka
     - `== 1` → `"1 Cmt"` / `"1 Comment"` (dua span: short & long)
     - `> 1`  → `"N Cmts"` / `"N Comments"`
   - `== 0` → tampilkan `data:messages.postAComment` (teks ajakan komentar)
5. **Dua span short/long** digunakan untuk responsive: CSS menyembunyikan salah satu berdasarkan lebar layar.
6. **Ikon** `comment` dari Material Symbols dengan `aria-hidden="true"` (dekoratif).

---

## 6. Includable: `commentsLink` (Widget Blog.2 — Post Widget)

**Baris:** 2597–2608
**Widget:** Blog widget kedua (post detail, dipakai di `postCommentsLink`)

```xml
<b:includable id='commentsLink'>
  <b:if cond='data:post.allowComments'>
    <a class='gg-post__meta-item meta-comments'
       expr:href='(data:post.url ? data:post.url
                 : (data:view.url ? data:view.url
                 : data:blog.homepageUrl)) + "#comments"'>
      <span aria-hidden='true' class='ms'>comment</span>
      <b:if cond='data:post.numberOfComments &gt; 0'>
        <data:post.numberOfComments/>
      <b:else/>
        <data:messages.postAComment/>
      </b:if>
    </a>
  </b:if>
</b:includable>
```

### Perbedaan vs Blog.1

| Aspek | Blog.1 (GAGA) | Blog.2 |
|-------|---------------|--------|
| `aria-label` | Ada `aria-label='Comments'` | Tidak ada |
| `data-count` | Ada | Tidak ada |
| Kelas ikon | `material-symbols-rounded` | `ms` (shorthand) |
| Label singkat/panjang | Dua `<span>` short & long | Hanya angka saja |
| Kelas link | Lebih lengkap (item, item--comments) | Lebih minimal |

Blog.2 adalah versi lebih sederhana, dipakai sebagai fallback di `postCommentsLink` pada konteks tertentu.

---

## 7. Includable: `commentsLinkIframe`

**Baris:** 2217–2219 (Blog.1) dan 2609–2611 (Blog.2)

```xml
<b:includable id='commentsLinkIframe'>
  <!-- G+ comments, no longer available.
       The includable is retained for backwards-compatibility. -->
</b:includable>
```

### Catatan

Includable ini adalah **sisa dari era Google+ Comments** yang sudah dihentikan.
Isinya **kosong**, hanya komentar HTML. Dipertahankan agar tidak terjadi error
pada template lama yang memanggil `commentsLinkIframe`.

---

## 8. Includable: `postCommentsLink`

**Baris:** 2299–2303 (Blog.1) dan 2913–2919 (Blog.2)

**Blog.1:**
```xml
<b:includable id='postCommentsLink'>
  <span class='byline post-comment-link container'>
    <b:include cond='data:post.commentSource != 1' name='commentsLink'/>
  </span>
</b:includable>
```

**Blog.2:**
```xml
<b:includable id='postCommentsLink'>
  <b:if cond='data:view.isMultipleItems'>
    <span class='byline post-comment-link container'>
      <b:include cond='data:post.commentSource != 1' name='commentsLink'/>
    </span>
  </b:if>
</b:includable>
```

### Logika

- **`commentSource != 1`** — angka `1` berarti komentar dari Google+.
  Karena G+ sudah mati, kondisi ini memastikan link komentar hanya muncul
  untuk sistem komentar Blogger native (bukan G+).
- **Blog.2 menambahkan guard `view.isMultipleItems`** — link komentar di Blog.2
  hanya muncul di halaman listing (banyak post), bukan di halaman post tunggal
  (karena di post tunggal, komentar ada di panel `#ggPanelComments`).
- Includable ini dipanggil dari `bylineByName` saat `byline.name == 'comments'`.

---

## 9. Includable: `commentAuthorAvatar`

**Baris:** 2529–2533

```xml
<b:includable id='commentAuthorAvatar'>
  <div class='avatar-image-container gg-cmt2__avatar'>
    <img alt=''
         class='author-avatar'
         decoding='async'
         expr:src='data:comment.authorAvatarSrc'
         height='35' width='35'/>
  </div>
</b:includable>
```

### Logika

- Dipanggil secara kondisional dari `commentItem` hanya jika
  `data:blog.enabledCommentProfileImages` bernilai true.
- `decoding="async"` digunakan untuk lazy decoding gambar agar tidak
  memblokir render utama.
- Avatar berukuran tetap 35×35 px.
- `alt=""` kosong karena gambar bersifat dekoratif (nama author sudah ada di teks).

---

## 10. Includable: `commentDeleteIcon`

**Baris:** 2534–2546

```xml
<b:includable id='commentDeleteIcon' var='comment'>
  <span aria-hidden='true'
        data-gg-native-action='item-control'
        data-gg-state='hidden'
        expr:class='"item-control " + data:comment.adminClass'
        hidden='hidden'>

    <b:if cond='data:showCmtPopup'>
      <!-- Mode popup: tampilkan tombol "more" -->
      <div class='goog-toggle-button' data-gg-native-action='more'>
        <div class='goog-inline-block comment-action-icon'/>
      </div>
    <b:else/>
      <!-- Mode simple: tampilkan link hapus langsung -->
      <a aria-hidden='true'
         class='comment-delete'
         data-gg-native-action='delete'
         expr:href='data:comment.deleteUrl'
         expr:title='data:messages.deleteComment'
         tabindex='-1'>
        <img alt='' decoding='async' height='13'
             src='https://resources.blogblog.com/img/icon_delete13.gif'
             width='13'/>
      </a>
    </b:if>
  </span>
</b:includable>
```

### Logika

1. **Selalu hidden di awal** (`hidden="hidden"`, `data-gg-state='hidden'`) —
   JS GG yang akan menampilkan icon ini hanya untuk admin/author.
2. **`data:comment.adminClass`** — class dinamis dari Blogger yang berisi
   kelas kontrol admin (seperti `blog-admin`). Di-merge dengan `item-control`.
3. **Dua mode berdasarkan `data:showCmtPopup`:**
   - **`true` (popup mode)** — tampilkan tombol "more" (`goog-toggle-button`)
     yang akan membuka dropdown dengan opsi lanjutan.
   - **`false` (simple mode)** — tampilkan link delete langsung dengan
     ikon GIF legacy dari Blogger (`icon_delete13.gif`).
4. **`data-gg-native-action`** — digunakan oleh JS GG untuk intercepting aksi:
   - `item-control` = kontainer kontrol item
   - `more` = buka menu more
   - `delete` = aksi hapus komentar

---

## 11. Includable: `commentForm`

**Baris:** 2547–2549

```xml
<b:includable id='commentForm' var='post'>
  <!-- Composer is structurally owned by #ggPanelComments. -->
</b:includable>
```

### Catatan

**Stub kosong.** Di theme generasi sebelumnya, `commentForm` berisi form HTML
komentar. Di theme ini, seluruh komposer dipindah ke dalam `#ggPanelComments`
(via `threadedCommentForm`). Includable ini dipertahankan untuk kompatibilitas
dengan kode Blogger yang mungkin memanggil `commentForm`.

---

## 12. Includable: `commentFormIframeSrc`

**Baris:** 2550–2552

```xml
<b:includable id='commentFormIframeSrc' var='post'>
  <a expr:href='data:post.commentFormIframeSrc' id='comment-editor-src'/>
</b:includable>
```

### Logika

- Membuat sebuah elemen `<a>` tersembunyi dengan `id="comment-editor-src"`.
- `data:post.commentFormIframeSrc` adalah URL resmi Blogger untuk form komentar
  dalam bentuk iframe.
- Elemen ini digunakan oleh JavaScript Blogger native (`BLOG_CMT_createIframe`)
  untuk membaca URL dan menyuntikkannya sebagai `src` ke dalam `<iframe#comment-editor>`.
- Teknik ini (anchor sebagai sumber URL) digunakan karena URL iframe komentar
  bersifat dinamis dan perlu di-escape dengan benar oleh Blogger.

---

## 13. Includable: `commentItem`

**Baris:** 2553–2583

```xml
<b:includable id='commentItem' var='comment'>
  <div class='comment' expr:id='"c" + data:comment.id'>

    <!-- Avatar (kondisional) -->
    <b:include cond='data:blog.enabledCommentProfileImages'
               name='commentAuthorAvatar'/>

    <div class='comment-block'>

      <!-- Nama Author -->
      <div class='comment-author'>
        <b:if cond='data:comment.authorUrl'>
          <b:message name='messages.authorSaidWithLink'>
            <b:param expr:value='data:comment.author'   name='authorName'/>
            <b:param expr:value='data:comment.authorUrl' name='authorUrl'/>
          </b:message>
        <b:else/>
          <b:message name='messages.authorSaid'>
            <b:param expr:value='data:comment.author' name='authorName'/>
          </b:message>
        </b:if>
      </div>

      <!-- Isi Komentar -->
      <div expr:class='"comment-body" + (data:comment.isDeleted ? " deleted" : "")'>
        <data:comment.body/>
      </div>

      <!-- Footer: timestamp + delete icon -->
      <div class='comment-footer'>
        <span class='comment-timestamp'>
          <a expr:href='data:comment.url' title='comment permalink'>
            <data:comment.timestamp/>
          </a>
          <b:include data='comment' name='commentDeleteIcon'/>
        </span>
      </div>
    </div>

  </div>
</b:includable>
```

### Logika

1. **ID unik** setiap komentar: `"c" + data:comment.id` → misal `c8471234567`.
2. **Avatar kondisional** berdasarkan `blog.enabledCommentProfileImages`.
3. **Nama author dua varian:**
   - Jika punya URL profil → `messages.authorSaidWithLink` (nama jadi link).
   - Jika tidak → `messages.authorSaid` (nama plain text).
4. **Body komentar** menambahkan class `deleted` jika `isDeleted == true`,
   sehingga CSS bisa menampilkan styling khusus (misal: teks coret/abu-abu).
5. **Timestamp** adalah link ke permalink komentar (`comment.url`).
6. **`commentDeleteIcon`** di-pass dengan `data='comment'` (konteks komentar saat ini).

---

## 14. Includable: `commentList`

**Baris:** 2584–2590

```xml
<b:includable id='commentList' var='comments'>
  <div id='comments-block'>
    <b:loop values='data:comments' var='comment'>
      <b:include data='comment' name='commentItem'/>
    </b:loop>
  </div>
</b:includable>
```

### Logika

- Menerima variabel `comments` (array/list objek komentar).
- Me-loop setiap komentar dan me-render `commentItem`.
- Dipakai oleh Blogger untuk rendering **komentar flat** (non-threaded, legacy).
- Di theme ini, komentar sebenarnya dirender via `data:post.commentHtml`
  di dalam `threadedComments`, bukan lewat `commentList`. Includable ini
  tetap ada untuk kompatibilitas.

---

## 15. Includable: `commentPicker` & `comments` (stub)

**Baris:** 2591–2596

```xml
<b:includable id='commentPicker' var='post'>
  <!-- Comments surface is panel-owned via #ggPanelComments. -->
</b:includable>

<b:includable id='comments' var='post'>
  <!-- Comments surface is panel-owned via #ggPanelComments. -->
</b:includable>
```

Dua includable ini adalah **stub** — dikosongkan karena fungsionalitasnya
sudah diambil alih oleh `#ggPanelComments`. Blogger memanggil `comments` dan
`commentPicker` sebagai bagian dari siklus render widget, tapi di theme ini
keduanya sengaja dikosongkan.

---

## 16. Includable: `commentsTitle`

**Baris:** 2612–2614

```xml
<b:includable id='commentsTitle'>
  <h3 class='title'><data:messages.comments/></h3>
</b:includable>
```

Heading sederhana untuk judul seksi komentar. Menggunakan pesan i18n
`data:messages.comments` (yang menampilkan "Comments" atau "Komentar").
Di theme ini jarang dipakai secara langsung karena heading komentar
sudah dihandle di dalam `threadedComments`.

---

## 17. Includable: `iframeComments` (legacy stub)

**Baris:** 2692–2694

```xml
<b:includable id='iframeComments' var='post'>
  <!-- G+ comments, no longer available.
       The includable is retained for backwards-compatibility. -->
</b:includable>
```

Sama seperti `commentsLinkIframe` — ini adalah sisa dari sistem komentar
Google+ berbasis iframe yang sudah dihentikan. **Dikosongkan**, hanya ada
sebagai stub untuk mencegah error pada tema lama.

---

## 18. Includable: `threadedCommentForm` ⭐

**Baris:** 3386–3394

```xml
<b:includable id='threadedCommentForm' var='post'>
  <div class='comment-form'
       data-gg-native-plumbing='composer'
       data-gg-owner='native-hidden'
       id='top-ce'>

    <a name='comment-form'/>

    <!-- Sumber URL iframe (dibaca oleh BLOG_CMT_createIframe) -->
    <b:include data='post' name='commentFormIframeSrc'/>

    <!-- Iframe form komentar Blogger -->
    <iframe
      allowtransparency='allowtransparency'
      class='blogger-iframe-colorize blogger-comment-from-post'
      expr:height='data:cmtIframeInitialHeight ?: "90px"'
      frameborder='0'
      id='comment-editor'
      name='comment-editor'
      src=''
      width='100%'/>

    <!-- CMTFP iframe (anti-XSRF Blogger) -->
    <data:post.cmtfpIframe/>

    <!-- Script inisialisasi -->
    <script type='text/javascript'>
      BLOG_CMT_createIframe('<data:post.appRpcRelayPath/>');
    </script>

  </div>
</b:includable>
```

### Logika

1. **`data-gg-native-plumbing='composer'`** — menandai div ini sebagai
   area komposer komentar native Blogger.
2. **`data-gg-owner='native-hidden'`** — awalnya hidden, JS GG yang mengontrol
   visibilitasnya ketika user klik "Add comment".
3. **`<a name='comment-form'/>`** — anchor HTML lama untuk navigasi ke form.
4. **`commentFormIframeSrc`** — menempatkan `<a id="comment-editor-src">` yang
   berisi URL form komentar.
5. **`<iframe id="comment-editor">`** — iframe utama form komentar Blogger.
   - `src=''` — dimulai kosong, diisi oleh JavaScript.
   - `height` — dinamis: `data:cmtIframeInitialHeight` jika ada, fallback `90px`.
   - Class `blogger-iframe-colorize` — class Blogger untuk penyesuaian warna iframe.
   - Class `blogger-comment-from-post` — penanda iframe berasal dari post page.
6. **`data:post.cmtfpIframe`** — elemen anti-XSRF yang diinject oleh Blogger
   (Cross-site Request Forgery Protection untuk form komentar).
7. **`BLOG_CMT_createIframe(relayPath)`** — fungsi JavaScript Blogger native
   yang membaca `#comment-editor-src`, lalu men-set `src` pada `<iframe#comment-editor>`,
   dan memasang relay path untuk komunikasi lintas-domain (iframe ↔ halaman utama).

### Alur Kerja Iframe

```
1. DOM load
2. BLOG_CMT_createIframe(relayPath) dipanggil
3. Baca href dari <a id="comment-editor-src">
4. Set <iframe#comment-editor src="{commentFormIframeSrc}">
5. Blogger loads form komentar di dalam iframe
6. Komunikasi 2 arah via postMessage + relay path
7. Saat submit → Blogger native handle submit lintas-domain
```

---

## 19. Includable: `threadedCommentJs`

**Baris:** 3395–3398

```xml
<b:includable id='threadedCommentJs' var='post'>
  <!-- 1) Blogger native threaded engine (WAJIB) -->
</b:includable>
```

**Stub dengan komentar penting.** Komentar "WAJIB" di sini adalah pengingat
bahwa script Blogger native untuk threaded comments harus ada. Di theme ini,
script tersebut sudah diload secara otomatis oleh Blogger (bukan lewat includable),
sehingga includable ini dikosongkan. Jangan hapus includable ini karena beberapa
versi Blogger masih memanggilnya.

---

## 20. Includable: `threadedComments` ⭐

**Baris:** 3399–3463

Ini adalah **includable utama** sistem komentar. Dirender di dalam `#ggPanelComments`.

```xml
<b:includable id='threadedComments' var='post'>
  <section
    class='gg-comments comments2 threaded'
    data-gg-comment-contract='single-visible-owner'
    data-gg-visible-owner='enhanced-footer'
    expr:data-embed='data:post.embedCommentForm'
    expr:data-num-comments='data:post.numberOfComments'
    id='comments'>

    <!-- Anchor navigasi -->
    <a name='comments'/>

    <!-- Spacer atas (aria-hidden, untuk layout) -->
    <div aria-hidden='true' class='gg-comments__head-spacer'/>

    <!-- ─── HEADER ─── -->
    <header class='gg-comments__head'>

      <!-- Judul -->
      <div class='gg-comments__title'>
        <span aria-hidden='true' class='ms'>comment</span>
        <h3 class='gg-comments__h'>
          <b:if cond='data:post.numberOfComments == 1'>
            1 Comment
          <b:else/>
            <data:post.numberOfComments/> Comments
          </b:if>
        </h3>
      </div>

      <!-- Toolbar: tombol sort & width -->
      <div class='gg-comments__sortslot' data-gg-comments-sort-slot='1'>
        <div class='cmt2-head-tools'>

          <!-- Tombol toggle lebar panel (sidebar 240px ↔ wide 440px) -->
          <button
            aria-label='Switch to wide width (440px)'
            aria-pressed='false'
            class='cmt2-head-btn cmt2-head-btn--width'
            data-gg-comment-action='panel-width'
            data-gg-copy='comments.toolbar.width.sidebar'
            title='Sidebar (240px)'
            type='button'>
            <span aria-hidden='true' class='ms'>open_in_full</span>
            <span class='gg-visually-hidden'>Sidebar (240px)</span>
          </button>

          <!-- Tombol toggle urutan komentar (newest ↔ oldest) -->
          <button
            aria-label='Sort comments by oldest'
            aria-pressed='false'
            class='cmt2-head-btn cmt2-head-btn--sort'
            data-gg-comment-action='sort-order'
            data-gg-copy='comments.toolbar.sort.newest'
            title='Newest comments'
            type='button'>
            <span aria-hidden='true' class='ms'>arrow_downward</span>
            <span class='gg-visually-hidden'>Newest comments</span>
          </button>

        </div>
      </div>
    </header>

    <!-- ─── CONTENT (LIST KOMENTAR) ─── -->
    <div class='gg-comments__content comments-content'>
      <div class='gg-comments__list' data-gg-owner='enhanced-thread' id='cmt2-holder'>

        <!-- State kosong -->
        <b:if cond='data:post.numberOfComments == 0'>
          <div class='gg-cmt-empty'>
            <strong data-gg-copy='comments.empty.title'>No comments yet</strong>
            <span   data-gg-copy='comments.empty.body'>Be the first to add one.</span>
          </div>
        </b:if>

        <!-- HTML komentar dari Blogger (sudah threaded) -->
        <data:post.commentHtml/>

      </div>
    </div>

    <!-- Spacer bawah -->
    <div aria-hidden='true' class='gg-comments__footer-spacer'/>

    <!-- ─── FOOTER ─── -->
    <div class='gg-comments__footer'
         data-gg-add-owner='footer-cta'
         data-gg-composer-owner='footer'
         data-gg-open='0'
         expr:data-gg-has-cta='data:post.allowNewComments ? "1" : "0"'>

      <div class='gg-comments__footer-inner'>

        <!-- CTA "Add comment" (jika komentar baru diizinkan) -->
        <b:if cond='data:post.allowNewComments'>
          <div class='gg-comments__footer-cta' id='gg-top-continue'>
            <a
              aria-controls='gg-composer-slot'
              aria-expanded='false'
              class='comment-reply'
              data-gg-copy='comments.action.add'
              data-gg-footer-cta='1'
              href='javascript:;'
              rel='nofollow'
              role='button'>Add comment</a>
          </div>
        </b:if>

        <div class='gg-comments__footer-main'>

          <!-- Pesan "komentar ditutup" jika tidak ada komentar baru -->
          <b:if cond='!data:post.allowNewComments'>
            <div class='gg-comments__footer-note'>
              <data:post.noNewCommentsText/>
            </div>
          </b:if>

          <!-- Slot reply (untuk tombol Balas yang dimunculkan JS) -->
          <div class='gg-comments__addslot'
               data-gg-reply-owner='footer'
               id='gg-addslot'/>

          <!-- Slot composer (form komentar baru) -->
          <div class='gg-comments__composerslot'
               data-gg-composer-slot='1'
               data-gg-owner='enhanced-footer'
               id='gg-composer-slot'>

            <b:if cond='data:post.embedCommentForm and data:post.allowNewComments'>
              <b:include data='post' name='threadedCommentForm'/>
            </b:if>

          </div>

        </div>
      </div>
    </div>

  </section>
</b:includable>
```

### Penjelasan Atribut Data Kunci

| Atribut | Nilai | Fungsi |
|---------|-------|--------|
| `data-gg-comment-contract` | `single-visible-owner` | Hanya satu "owner" (area) yang boleh menampilkan komentar |
| `data-gg-visible-owner` | `enhanced-footer` | Owner yang aktif/visible adalah footer enhanced |
| `data-embed` | `data:post.embedCommentForm` | Boolean: apakah form langsung di-embed |
| `data-num-comments` | `data:post.numberOfComments` | Jumlah komentar (dipakai JS) |
| `data-gg-comments-sort-slot` | `1` | Slot toolbar sort (diisi komponen JS) |
| `data-gg-comment-action` | `panel-width` / `sort-order` | Aksi yang ditangani JS |
| `data-gg-copy` | key i18n | Teks tombol diambil dari i18n system |
| `data-gg-owner` | `enhanced-thread` | Thread list dikontrol JS enhanced |
| `data-gg-add-owner` | `footer-cta` | Area CTA "add" dikontrol JS |
| `data-gg-composer-owner` | `footer` | Composer dikontrol di footer |
| `data-gg-has-cta` | `"1"` / `"0"` | Apakah CTA "Add comment" ditampilkan |
| `data-gg-composer-slot` | `1` | Slot untuk composer |
| `data-gg-reply-owner` | `footer` | Slot reply dikontrol di footer |
| `data-gg-footer-cta` | `1` | Tandai sebagai tombol CTA utama footer |

### Logika Kondisional

```
data:post.embedCommentForm == true
  └─► AND data:post.allowNewComments == true
        └─► render threadedCommentForm (iframe editor)
              └─► BLOG_CMT_createIframe() aktif

data:post.allowNewComments == false
  └─► tampilkan data:post.noNewCommentsText
      (komentar ditutup)

data:post.numberOfComments == 0
  └─► tampilkan .gg-cmt-empty placeholder
```

---

## 21. Panel Container: `#ggPanelComments`

**Baris:** 3212–3218 (di dalam `postDetail`)

```xml
<b:if cond='data:view.isPost or (data:view.isPage and not data:ggIsSpecialApp)'>
  <div class='gg-comments-panel'
       data-gg-panel='comments'
       hidden=''
       id='ggPanelComments'
       inert=''
       tabindex='-1'>
    <div class='gg-comments-panel__body' data-gg-slot='comments'>
      <b:include data='post' name='threadedComments'/>
    </div>
  </div>
</b:if>
```

### Logika

1. **Hanya dirender di halaman post atau page** (bukan di listing/homepage).
   - Untuk special app page, panel ini tidak dirender.
2. **`hidden=""`** — tersembunyi secara default (HTML attribute, bukan CSS).
3. **`inert=""`** — elemen beserta kontennya tidak interaktif saat tersembunyi
   (keyboard trap prevention). Ini adalah fitur HTML modern yang memastikan
   user tidak bisa tab ke panel yang sedang tertutup.
4. **`tabindex="-1"`** — panel bisa difocus secara programatik oleh JS
   (saat dibuka), tapi tidak masuk dalam tab order normal.
5. **`data-gg-panel='comments'`** — identifier untuk JS GG agar tahu
   ini adalah panel komentar.
6. **`data-gg-slot='comments'`** — slot content untuk sistem slot GG.
7. `threadedComments` dirender di dalamnya secara server-side (SSR).

### Anchor Komentar

**Baris:** 3208
```xml
<div aria-hidden='true'
     class='gg-post__comments-anchor'
     data-gg-comments-owner='panel'
     hidden='hidden'/>
```

Div kosong ini adalah **anchor tersembunyi** yang digunakan JS GG untuk
menentukan posisi scroll saat link `#comments` diklik. Karena panel komentar
bersifat drawer (bukan di dalam flow normal), anchor ini membantu transisi
dari klik link ke pembukaan panel.

---

## 22. Tombol Toggle Komentar di Post Toolbar

**Baris:** 2952–2957 (di dalam `postDetail`)

```xml
<button
  aria-controls='ggPanelComments'
  aria-expanded='false'
  aria-label='Toggle comments panel'
  class='gg-post__tool'
  data-gg-copy-aria='post.action.toggleComments'
  data-gg-postbar='comments'
  type='button'>

  <span aria-hidden='true' class='gg-icon material-symbols-rounded'>forum</span>

  <b:if cond='data:post.numberOfComments &gt; 0'>
    <span aria-hidden='true' class='gg-post__tool-badge'>
      <data:post.numberOfComments/>
    </span>
  </b:if>

</button>
```

### Logika

| Atribut | Nilai | Fungsi |
|---------|-------|--------|
| `aria-controls` | `ggPanelComments` | Terhubung ke panel (ARIA) |
| `aria-expanded` | `false` → `true` (diubah JS) | Status buka/tutup panel |
| `data-gg-postbar` | `comments` | Identifier untuk JS postbar |
| `data-gg-copy-aria` | `post.action.toggleComments` | Teks `aria-label` diambil dari i18n |

- **Badge** jumlah komentar hanya muncul jika `numberOfComments > 0`.
- Ikon menggunakan `forum` (Material Symbols) — berbeda dengan ikon `comment`
  di meta link. `forum` menggambarkan percakapan, lebih sesuai untuk tombol.

---

## 23. Info Panel (gg-epanel) — Baris Komentar

**Baris:** 3955–3963 (info panel, tersembunyi)

```xml
<div class='gg-epanel__row' data-row='comments' hidden='hidden'>
  <span aria-hidden='true' class='gg-icon gg-epanel__icon'/>
  <div class='gg-epanel__cell'>
    <dt class='gg-epanel__label'/>
    <dd class='gg-epanel__value'>
      <span data-s='comments'/>
    </dd>
  </div>
</div>
```

Dan di editorial panel listing (**baris 4016**):

```xml
<span data-gg-marker='panel-listing-comments'
      data-row='comments'
      data-s='comments'/>
```

### Catatan

Ini adalah baris komentar di "info panel" (panel informasi post). Awalnya
`hidden`, JS GG mengisi nilai `data-s='comments'` dan menampilkan baris ini
jika ada data komentar. `data-s` adalah shorthand untuk "data source" —
nilainya diisi oleh JavaScript dari data post.

---

## 24. Post Card — Jumlah Komentar

**Baris:** 2851–2852 (di dalam post card di listing)

```xml
<span class='gg-post-card__meta-item gg-post-card__meta-item--comments'>
  <data:post.numberOfComments/> Comments
</span>
```

Dan di toolbar post card (**baris 2867–2871**):

```xml
<a class='gg-post-card__tool'
   data-gg-copy-title='post.action.comments'
   expr:href='(data:post.url ? data:post.url
             : (data:view.url ? data:view.url
             : data:blog.homepageUrl)) + "#comments"'
   title='Comments'>
  <span aria-hidden='true' class='gg-icon material-symbols-rounded'>comment</span>
  <span class='gg-visually-hidden' data-gg-copy='post.action.comments'>Comments</span>
  <span aria-hidden='true' class='gg-post-card__badge'>
    <data:post.numberOfComments/>
  </span>
</a>
```

### Catatan

Di post card (listing), komentar ditampilkan sebagai:
1. **Meta item** — teks sederhana `N Comments` di bawah excerpt.
2. **Tool button** — tombol di toolbar card yang mengarah ke `#comments` post.
   - `data-gg-copy` dan `data-gg-copy-title` menarik teks dari i18n.
   - Badge jumlah komentar ditampilkan.
   - Ini adalah link navigasi (bukan toggle panel), karena konteksnya adalah
     halaman listing yang langsung membawa user ke halaman post.

---

## 25. `bylineByName` — Routing ke Comments

**Baris:** 2168–2185

```xml
<b:includable id='bylineByName' var='byline'>
  <b:switch var='data:byline.name'>
    ...
    <b:case value='comments'/>
      <b:include cond='data:post.allowComments' name='postCommentsLink'/>
    ...
  </b:switch>
</b:includable>
```

Ini adalah **router byline**. Ketika konfigurasi byline blog mengandung
item dengan `name='comments'`, includable ini akan merender `postCommentsLink`
— dengan syarat `allowComments` bernilai true.

Konfigurasi byline itu sendiri ditentukan di widget settings Blogger
(footer-1 / header-1 regions).

---

## 26. `postCommentsAndAd`

**Baris:** 2897–2912

```xml
<b:includable id='postCommentsAndAd' var='post'>
  <article class='post-outer-container'>
    <div class='post-outer'>
      <b:include data='post' name='post'/>
    </div>
    <!-- Comments are rendered in #ggPanelComments. -->
    <b:include cond='data:view.isPost and data:post.includeAd'
               data='post' name='inlineAd'/>
  </article>
  <b:include cond='data:view.isMultipleItems and data:post.includeAd'
             data='post' name='inlineAd'/>
</b:includable>
```

**Komentar tidak dirender di sini.** Baris komentar dalam kode ini adalah
komentar HTML (`<!-- Comments are rendered in #ggPanelComments. -->`) yang
menjelaskan bahwa tampilan komentar sudah dipindah ke panel. Includable ini
hanya berisi post body dan iklan.

---

## 27. `nativePassthrough` — Pesan Blogger Asli

**Baris:** 797–801

```json
"nativePassthrough": {
  "blogger": [
    "data:messages.postAComment",
    "data:messages.deleteComment"
  ]
}
```

Dua pesan ini dikategorikan sebagai **passthrough ke Blogger native**,
artinya nilainya diambil langsung dari Blogger (bukan dari i18n JSON theme).
Ini karena:
- `postAComment` — teks "Post a Comment" / "Beri Komentar" sudah disediakan Blogger.
- `deleteComment` — teks "Delete Comment" untuk konfirmasi hapus juga dari Blogger.

Theme tidak meng-override nilai ini, melainkan meneruskan/menerima nilai yang
sudah diset di level platform Blogger.

---

## 28. Ringkasan Data Attributes `data-gg-*`

Berikut semua `data-gg-*` attribute yang berkaitan dengan komentar:

| Attribute | Nilai | Lokasi | Fungsi |
|-----------|-------|--------|--------|
| `data-gg-panel` | `comments` | `#ggPanelComments` | Identifier panel komentar untuk JS |
| `data-gg-slot` | `comments` | `.gg-comments-panel__body` | Slot konten komentar |
| `data-gg-postbar` | `comments` | Tombol toolbar | Identifier tombol toggle panel |
| `data-gg-comment-contract` | `single-visible-owner` | `section#comments` | Kontrak visibilitas |
| `data-gg-visible-owner` | `enhanced-footer` | `section#comments` | Owner yang aktif |
| `data-gg-comment-action` | `panel-width` / `sort-order` | Tombol toolbar comments | Aksi yang dihandle JS |
| `data-gg-comments-sort-slot` | `1` | `.gg-comments__sortslot` | Slot toolbar sort |
| `data-gg-owner` | `enhanced-thread` / `enhanced-footer` / `native-hidden` | Berbagai slot | Pemilik/kontroler slot |
| `data-gg-composer-slot` | `1` | `#gg-composer-slot` | Slot untuk form composer |
| `data-gg-reply-owner` | `footer` | `#gg-addslot` | Kontroler slot reply |
| `data-gg-add-owner` | `footer-cta` | `.gg-comments__footer` | Kontroler CTA add |
| `data-gg-composer-owner` | `footer` | `.gg-comments__footer` | Kontroler composer |
| `data-gg-has-cta` | `"1"` / `"0"` | `.gg-comments__footer` | Ada/tidak CTA add comment |
| `data-gg-footer-cta` | `1` | Link "Add comment" | Tandai sebagai tombol CTA footer |
| `data-gg-copy` | key i18n | Berbagai elemen | Teks diisi dari i18n system |
| `data-gg-copy-aria` | key i18n | Tombol | `aria-label` diisi dari i18n |
| `data-gg-copy-title` | key i18n | Link | `title` diisi dari i18n |
| `data-gg-native-action` | `item-control` / `more` / `delete` | `commentDeleteIcon` | Aksi native Blogger |
| `data-gg-native-plumbing` | `composer` | `.comment-form` | Penanda area komposer native |
| `data-gg-state` | `hidden` | `.item-control` | State awal (tersembunyi) |
| `data-gg-comments-owner` | `panel` | `.gg-post__comments-anchor` | Anchor milik panel |
| `data-gg-marker` | `panel-listing-comments` | Editorial panel | Marker untuk JS listing |

---

*Dokumentasi ini mencakup 4427 baris XML theme. Dibuat berdasarkan analisis
statis seluruh kode komentar yang ada di file.*
