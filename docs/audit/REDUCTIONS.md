# REDUCTIONS — Target 100/0ms Trade-offs
Last updated: 2026-02-14

**Context**
Target “100/0ms” on pages with Blogger native comments is unrealistic because comment scripts are third-party and network-bound. The list below describes what must be reduced or deferred if that target is enforced.

**Reduction List (Optional or Forced)**
- Remove or defer landing hero video (`#ggHeroVideo`) to reduce CPU/GPU, bandwidth, and LCP volatility. (Evidence: index.prod.xml:L320-L325, public/assets/latest/modules/ui.bucket.listing.js:L10-L19)
- Self-host or remove Google Fonts (Material Symbols) to avoid third-party render-blocking CSS. (Evidence: index.prod.xml:L146-L149)
- Remove `instant.page` prefetch to avoid extra JS cost on low-end devices. (Evidence: public/assets/latest/boot.js:L77-L85)
- Reduce search index size (`max-results=500` -> smaller) or disable client-side full index on low memory. (Evidence: public/assets/latest/modules/ui.bucket.search.js:L150)
- Downgrade poster generation to text-only or placeholder if cover image is external (avoid proxy + canvas cost). (Evidence: public/assets/latest/modules/ui.bucket.poster.js:L765-L785, src/worker.js:L348-L356)
- Limit or lazy-load sitemap/labelTree heavy UI on listing pages (DOM size + JS cost). (Evidence: public/assets/latest/modules/ui.bucket.listing.js:L28-L88)
- Keep comments native but collapse by default and load on user intent (to keep Blogger compliance). (Constraint: must keep native comments)
- Prefer static, cached HTML where possible; avoid SPA transitions on very low-end devices (fallback to hard nav). (Evidence: public/assets/latest/core.js:L688-L721)
