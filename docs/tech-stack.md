# TECH_STACK.md: Project "GAGA-ish" Technical Manual
Last updated: 2026-02-05
**Role:** The "How-To" & "Toolbox" for Vibe Coder & AI Agent.  
**Authority:** Subservient to `roadmap.md`. Consult this file for implementation details, library choices, and strict architectural rules.

---

## 🛠️ SECTION 1: THE VIBE CODER WORKFLOW (SOP)
*Rules of engagement derived from `roadmap.md`.*

### 1.1 The "Living Ledger" Protocol
* **Single Source of Truth:** Use `docs/ledger/GG_CAPSULE.md` for NOW/NEXT/LAST_PATCH.
* **The Loop:**
  1. Read Capsule -> Identify `NEXT_TASK`.
  2. Execute **ONE** task only.
  3. Update Capsule (`LAST_PATCH`, `NEXT_TASK`).
  4. Generate `docs/ledger/TASK_REPORT.md`.


### 1.1.1 Environment Model (Single Domain)
- **Domain:** `www.pakrpp.com`.
- **DEV:** pasang `index.dev.xml` → assets `/assets/latest/` → SW **OFF** (hindari cache lock).
- **PROD:** pasang `index.prod.xml` → assets `/assets/v/<RELEASE_ID>/` → SW **ON**.

### 1.2 Strict Coding Constraints
* **Pure JS Only:** `main.js` must be valid ES6+. No `<script>` tags, no `CDATA`, no `&quot;` entities.
* **Relocation Rule:** When moving code to MVC, **do not refactor logic** simultaneously. Use facades/wrappers.
* **Zero Regressions:** Existing Blogger widgets (including native comments) must not break.
* **Safety First:** No visual changes during JS refactor phases unless explicitly requested.

### 1.3 Development Tools (VS Code)
* Extensions: ESLint, Prettier, Error Lens, Auto Rename Tag.
* Formatting: Indentation = 2 spaces. No trailing whitespace.

### 1.4 Protected Code Zones
The following Blogger XML tags MUST NEVER be deleted or modified as they control layout and widget functionality:
- `<b:include data='blog' name='all-head-content'/>`
- `<b:section ...>` and `<b:widget ...>`
- `<b:skin>...</b:skin>` (unless moving to external CSS)
- Standard Blogger comment includes
- `BLOG_CMT_createIframe` script blocks

---

## 🏛️ SECTION 2: ARCHITECTURE (MVC-Lite)
*The structural blueprint for `main.js`.*

### 2.1 Layer Separation
We avoid a "Spaghetti Monolith" by enforcing these internal namespaces:
1. **`GG.store` (The Brain):** Single Source of Truth (state only).
2. **`GG.services` (The Hands):** ONLY place for side-effects (Network, Storage, SW, Telemetry).
3. **`GG.ui` (The Face):** Dumb UI primitives controlled by state.
4. **`GG.actions` (The Nerves):** Central event delegation registry.
5. **`GG.modules` (The Features):** High-level feature logic.

### 2.2 Connectivity (XML ↔ JS ↔ CSS)
* **Config Injection:** Do NOT hardcode config in JS. Use XML Widgets:
  `<div id="gg-config" data-json='{"authorMap":{...}, "labels":{...}}'></div>`
* **Z-Index Strategy:** Use CSS variables (`--z-modal`, `--z-toast`) in `:root`. No magic numbers.
* **State Contract:** JS writes `data-gg-state` values; CSS reads with `[data-gg-state~="..."]`. Standard States: active, open, loading, error, success, hidden.

---

## ⚡ SECTION 3: THE INFRASTRUCTURE (Cloudflare Mode B)
*Enterprise-like control using Free Tier tools.*

### 3.1 Cloudflare Workers (`gg`)
We place Cloudflare in front of Blogger to overcome platform limitations:
* **Security Headers:** HSTS, CSP (hash-based), X-Frame-Options, Permissions-Policy.
* **HTMLRewriter:**
  * Dynamic OG image injection (Worker image generator).
  * Canonical sanitization (remove `?m=1`).
  * Lazy-load native comments script (rename `src` -> `data-src`) to avoid main-thread blocking.
* **Image Proxy:** CORS bypass for Canvas/Poster + Accept-based AVIF/WebP negotiation.

### 3.2 Worker Static Assets (same-domain)
Host `main.js`, `main.css`, fonts (WOFF2), `manifest.webmanifest`, and `offline.html` via the Worker `ASSETS` binding on `www.pakrpp.com`.

---

## 🚀 SECTION 4: THE "BEYOND" FEATURES (Implementation Specs)

### 4.1 Super Search (Command Palette)
* Engine: Fuse.js (client fuzzy search).
* Storage: IDB-Keyval.
* UI: Ctrl+K palette, bottom sheet on mobile.
* Security: sanitize results (DOMPurify) before render.

### 4.2 Native Feel & Mobile Centric
* Navigation: History API + manual scroll restoration.
* Transitions: View Transitions API.
* Loading: Skeleton UI + NProgress (no spinners).
* Touch: bottom sheets, safe-area insets, and gestures (prefer vanilla touch events; avoid heavy deps).

### 4.3 Share Poster (Canvas)
Fetch metadata -> fetch image via Worker Proxy -> draw -> export -> `navigator.share({ files })`.

### 4.4 Offline Library
Save full article JSON to IDB; render “Saved Articles” page from IDB when offline.

---

## 🏎️ SECTION 5: EXTREME PERFORMANCE (High Lighthouse + Strong CWV)
*Optimization tactics.*

### 5.1 Main Thread Hygiene
* Partytown: move third-party (GTM/GA4/etc) to worker **if used**.
* Target: **near-zero long tasks on core templates** (best-case can be 0ms TBT, but do not promise it everywhere).
* Speculation Rules API: native prerender where safe.

### 5.2 Asset Optimization
* Fonts: subsetting -> WOFF2 -> `font-display: swap`.
* Images: serve AVIF/WebP based on Accept; lazy-load; avoid layout shift.

### 5.3 PWA (Workbox)
* Service Worker generated via Workbox:
  * StaleWhileRevalidate for API/feeds.
  * CacheFirst for fonts/CSS/shell.
* Offline fallback page.

---

## 🧯 SECTION 6: PRODUCTION READINESS (Non-negotiable)
Ini yang membedakan “keren di laptop” vs “aman di produksi”.

### 6.1 Progressive Enhancement (SEO-safe)
* Konten harus tetap terbaca tanpa JS.
* SPA router = enhancement: jika route gagal → hard navigate.
* Canonical/JSON-LD harus benar dari server-side (Blogger XML + Worker rewrite).

### 6.2 Service Worker Safety
* Cache versioning (`gg-cache-vX`).
* Update flow aman (skipWaiting + clientsClaim + notifikasi update).
* Kill-switch remote flag untuk disable SW saat incident.

### 6.3 Release & Rollback Discipline
* Asset versioning wajib (query hash atau filename hash).
* Automated bump (tanpa CI/CD): jalankan `./scripts/gg bump` untuk update `GG_ASSET_VER` + `?v=` di `index.dev.xml` dan `index.prod.xml` setiap major JS/CSS change.
* “Rollback in 1 step”: revert hash / revert deploy.
* Jangan ubah banyak hal tanpa checklist smoke test.

### 6.4 Observability Minimal
* Capture `window.onerror` + `unhandledrejection`.
* Kirim JSON ke Worker endpoint `/api/telemetry` via `sendBeacon` (fallback: `fetch` keepalive).
* Simpan ringkas: route, user agent, version hash, stack trace.

### 6.5 Performance Budget
* Tetapkan budget per template:
  * LCP target
  * INP target
  * CLS target
* Third-party default off; enable jika ada alasan bisnis yang jelas.
