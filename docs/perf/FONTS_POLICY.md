# FONTS_POLICY.md
Last updated: 2026-02-22

## Active Fonts
- UI text uses system stack (`ui-sans-serif`, `system-ui`, `Segoe UI`, `Roboto`, `Arial`).
- Icon font uses `Material Symbols Rounded` via `@font-face` in `public/assets/latest/main.css`.

## Critical Preload Contract
- Preload only critical above-the-fold font file(s), max 2.
- Current preload (1 file):
  - `https://fonts.gstatic.com/s/materialsymbolsrounded/v317/syl7-zNym6YjUruM-QrEh7-nyTnjDwKNJ_190FjpZIvDmUSVOK7BDB_Qb9vUSzq3wzLK-P0J-V_Zs-obHph2-jOcZTKPq8a9A5M.woff2`
- Preload must use:
  - `rel="preload" as="font" type="font/woff2" crossorigin`

## Font Display Policy
- Every `@font-face` must set `font-display: swap` or `font-display: optional`.
- Current setting: `font-display: swap` for `Material Symbols Rounded`.

## Why Only 1-2 Preloads
- Too many font preloads competes with CSS/JS/image critical requests and can worsen LCP/INP.
- Only preload fonts that are visible immediately on first viewport render.

## CLS Validation
- Compare before/after in Lighthouse mobile for HOME, LISTING, POST:
  - CLS
  - LCP
  - INP/TBT
- Manual check:
  - hard refresh, watch first paint and icon rendering
  - ensure no noticeable text/icon reflow during early paint
