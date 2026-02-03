# X-010 Report — Single Init Gateway + Selector Map

## Summary
- [ ] Semua module init hanya lewat `GG.boot.init()` → `GG.boot.onReady()` → `GG.app.init()`.
- [ ] Auto-init liar (DOMContentLoaded/readyState/IIFE) dihapus atau dipindah ke plan.
- [ ] Missing host `#gg-postinfo` dikill (deprecated).
- [ ] `shareMotion` didedupe jadi satu modul.

## What changed (high level)
- Added: `GG.boot.onReady(fn)` (single DOM-ready gateway).
- Added: `GG.app.plan` (module init registry).
- Refactor: module init dipanggil lewat plan + `safeInit()` + `initOnce`.
- Removed: deprecated PostInfo module (`#gg-postinfo`).
- Fixed: duplicate `shareMotion` + stray init wiring.

## Selector → Module → HTML Host Map
| Module | Selector | Host | Source |
|---|---|---|---|
| homeState | `main[data-gg-surface="home"]` | `<main class="gg-main" data-gg-surface="home">` | template |
| Panels | `.gg-blog-wrap` | wrapper layout | template |
| InfoPanel | `.gg-info-panel[data-gg-panel="info"]` | right sidebar info panel | template |
| heroVideo | `#ggHeroVideo` | landing hero video | template |
| labelTree | `.gg-labeltree[data-gg-module="labeltree"]` | label tree widget | template |
| toc | `#gg-toc` / `.gg-toc` | TOC container | template |
| feed | `#gg-feed[data-api]` | feed root (embedded HTML) | content-injected |
| sitemap | `#gg-sitemap` | sitemap root (embedded HTML) | content-injected |
| shareSheet | `#gg-share-sheet` | share sheet | template |
| posterEngine | `#pc-poster-sheet` | poster sheet | template |
| langSwitcher | `.gg-lang-switcher` | language switch UI | template |
| ... | ... | ... | ... |

> Lengkapi tabel ini untuk semua item di `GG.app.plan`.

## Manual test checklist
### DEV — devpakrpp.blogspot.com
- [ ] Home: labeltree load & toggle OK
- [ ] Home: hero video observer OK (tidak error)
- [ ] Post: TOC generate OK
- [ ] Post: shortcodes render OK (youtube/accordion/alert)
- [ ] Share: share sheet open OK, tidak double motion
- [ ] Lang switcher: toggle + pilih bahasa OK, tidak double listener
- [ ] `?ggdebug=1`: semua module status OK, tidak ada error spam

### PROD — www.pakrpp.com (setelah release baru)
- [ ] PWA tetap register SW (bukan DEV mode)
- [ ] assets v/<TAG> loaded dengan cache immutable
- [ ] tidak ada regressions di halaman post

## Notes / risks
- Jika ada modul yang sebelumnya “kebetulan jalan” karena auto-init, sekarang wajib terdaftar di plan.
- Untuk host content-injected (feed/sitemap), modul harus safe no-op dan tanpa polling interval.
