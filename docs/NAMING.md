# GAGA-ish NAMING.md (Operational Rules)
Last updated: 2026-02-21

Dokumen ini adalah **satu-satunya** aturan operasional penamaan, kontrak hook, dan boundary arsitektur untuk www.pakrpp.com.
Dokumen lain (termasuk GagaCodexGroundrules.docx) adalah **konsep/legacy** dan tidak boleh mengalahkan dokumen ini.

---

## 0) Prinsip keras (non-negotiable)
1) Hook adalah kontrak: selector, token, data-attr, event, storage key, icon ID -> harus konsisten dan dapat diaudit.
2) Jangan invent hook baru tanpa mengikuti aturan naming ini.
3) Legacy boleh ada, tapi diperlakukan sebagai utang: diberi label legacy + rencana migrasi.

---

## 1) Blogger XML Template = Thin Shell (wajib)
Di template Blogger XML:
- **BOLEH**:
  1) Critical CSS di dalam `<b:skin>`
  2) External scripts: `<script defer='defer' src='…'/>`
  3) Markup skeleton + hooks (id/class/data-attr) untuk UI
  4) Native Blogger Comments widget (black box, lihat Protected Zone)

- **DILARANG**:
  - Inline `<script>` apa pun
  - CSS non-critical di luar `<b:skin>`
  - Menyisipkan fitur/logic JS atau modul CSS di template

Konsekuensi:
- Semua CSS non-critical dan semua JS behavior wajib berada di **asset pipeline** (file versioned).

---

## 2) Prefix & Namespace (wajib)
### 2.1 JavaScript namespace
- Global namespace tunggal: `window.GG`
- Dilarang membuat global baru di luar `GG.*`

### 2.2 CSS Classes (BEM)
- Prefix wajib: `.gg-`
- Block: `.gg-[component]`
- Element: `.gg-[component]__[element]`
- Modifier: `.gg-[component]--[modifier]`

Contoh:
- `.gg-post-card`
- `.gg-post-card__meta`
- `.gg-post-card--featured`

### 2.3 State Class (single system)
Standar project ini:
- State: `.gg-is-[state]`

Contoh:
- `.gg-is-open`
- `.gg-is-loading`
- `.gg-is-active`

Catatan:
- Class generik seperti `.active`, `.selected`, `.focused` dianggap legacy. Jangan dipakai untuk hook baru.

### 2.4 IDs
- Pakai seperlunya. Default: class + data-attr.
- Jika butuh ID: `#gg-[kebab-case]`

Contoh:
- `#gg-main`
- `#gg-search-panel`

### 2.5 Data attributes (internal hooks)
- Prefix wajib: `data-gg-`
- Bentuk yang disarankan:
  - `data-gg-action="kebab-case"`
  - `data-gg-state="kebab-case"`
  - `data-gg-slot="kebab-case"`
  - `data-gg-variant="kebab-case"`

### 2.6 CSS Custom Properties (tokens)
- Prefix wajib: `--gg-`
- Token harus konsisten dan tidak “nyelip” sembarangan.
- Kategori yang disarankan:
  - `--gg-color-*`
  - `--gg-font-*`, `--gg-text-size-*`
  - `--gg-space-*`
  - `--gg-radius-*`
  - `--gg-shadow-*`
  - `--gg-dur-*`, `--gg-ease-*`
  - `--gg-content-max-width`, `--gg-thumb-ratio`

---

## 3) JS: Larangan HTML/CSS di dalam JS (wajib)
Tujuan: mencegah spaghetti UI rendering dan menjaga komponen modular.

### 3.1 Dilarang
- UI dibuat dengan string HTML:
  - `innerHTML = "..."`, `insertAdjacentHTML(...)`, template literal berisi `<...>`
- Inject CSS:
  - membuat `<style>`, `style.textContent = "..."`, CSS-in-JS

### 3.2 Diperbolehkan (cara yang benar)
- Toggle class state (`.gg-is-*`) dan set `data-gg-*`
- Cloning dari `<template>` yang didefinisikan di `.xml`:
  - `<template id="gg-tpl-...">...</template>`
  - JS hanya `cloneNode(true)` + attach
- Inline style hanya untuk set CSS variables:
  - `el.style.setProperty('--gg-x', value)`

### 3.3 Migrasi aman (jika ada legacy)
1) Buat markup skeleton/hook atau `<template>` di `.xml`
2) Pindahkan CSS ke file CSS pipeline (mis. main.css)
3) Refactor JS: dari “render string” -> “clone template/toggle state/set CSS var”
4) Baru hapus legacy setelah verifikasi lulus

---

## 4) Events & Storage (wajib)
### 4.1 Events (GIP internal)
- Format: `gg:[kebab-case]`
  - contoh: `gg:boot`, `gg:nav-open`, `gg:search-submit`

### 4.2 Storage keys
- Prefix wajib: `gg:`
- Contoh:
  - `gg:prefs`
  - `gg:cache:v1`
  - `gg:vault:v1`

---

## 5) Icon System (Dual System)
Default: **Google Material 3 icons** untuk mayoritas ikon UI.

Custom SVG sprite `gg-ic-*` hanya untuk:
1) GAGA Social Media Icon SVG
2) GAGA Logo SVG
3) Ikon khusus yang tidak tersedia/ tidak cocok di Google M3 icon set

Custom sprite rule:
- Prefix: `gg-ic-`
- Pola: `gg-ic-[name]-[variant]`
- Variant yang disarankan: `line` (idle), `solid` (active)

A11y:
- Icon-only control wajib `aria-label` atau teks tersembunyi
- Ikon dekoratif: `aria-hidden="true"`

---

## 6) Native Blogger Comments: Protected Zone (Non-negotiable)
Native comment system Blogger adalah **black box**. Target: UI boleh dipoles, tapi behavior tidak boleh rusak/off.

Allowed
- Add/rename ONLY wrappers owned by GAGA-ish (e.g., `.gg-comments`, `.gg-comments__*`)
- Style comments ONLY via wrapper scoping:
  - `.gg-comments :where(...) { ... }`
- Add non-invasive UX polish around the widget (titles, spacing, anchors)

Forbidden
- Renaming/removing any internal IDs/classes/attributes produced by Blogger comment widget
- Any JS that rewrites comment DOM (innerHTML/insertAdjacentHTML/moving nodes)
- Intercepting submit/reply/login flows with custom handlers
- Injecting CSS rules from JS into the comment widget

### Comments Smoke Checklist (mandatory if touched)
- Comments section renders on a post page
- Comment form is visible and focusable (keyboard)
- Reply UI (if enabled) still appears
- No clipping/overflow hides actions/form
- No console errors related to comments

---

## 7) Regex Quick Reference
- CSS class (BEM): `^gg-[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--(?:[a-z0-9]+(?:-[a-z0-9]+)*))?$`
- State class: `^gg-is-[a-z0-9]+(?:-[a-z0-9]+)*$`
- ID: `^gg-[a-z0-9]+(?:-[a-z0-9]+)*$`
- data attr: `^data-gg-[a-z0-9]+(?:-[a-z0-9]+)*$`
- token: `^--gg-[a-z0-9]+(?:-[a-z0-9]+)*$`
- event: `^gg:[a-z0-9]+(?:-[a-z0-9]+)*$`
- storage: `^gg:[a-z0-9]+(?:-[a-z0-9]+)*(?::v[0-9]+)?$`
