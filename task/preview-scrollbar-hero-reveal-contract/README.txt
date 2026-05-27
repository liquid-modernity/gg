PREVIEW HERO REVEAL + GLOBAL HIDDEN SCROLLBAR CONTRACT

Purpose:
- Keep the 4/5 preview hero visually dominant on first open.
- Push preview body content downward so users first see the thumbnail/hero and can scroll to content.
- Hide visible scrollbars globally without disabling scrolling.

Files included:
- src/css/components/gg-preview-frame.css
- src/css/modules/preview-frame.css
- src/css/components/gg-visual-tokens.css
- src/css/modules/visual-tokens.css
- src/css/components/gg-sheet-core.css
- src/css/modules/sheets.css

Contract:
- .gg-preview__hero / .store-preview__hero keep aspect-ratio: var(--gg-preview-hero-aspect).
- .gg-preview__body / .store-preview__body use positive margin-top, not negative lift.
- content lift tokens are intentionally larger to make the hero appear first.
- Scrollbars are hidden with scrollbar-width:none and ::-webkit-scrollbar rules.
- Do not add overflow:hidden to the scroll owner. Scrolling must remain overflow-y:auto.

After copy, run:
npm run gaga:sync-components
npm run store:build
npm run gaga:template:pack
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-store-modal-preview
npm run ci:cloudflare

Important:
If CI still fails saying hero must use aspect-ratio:auto, your qa/sheet-lifecycle-contract-guard.mjs is still the old guard. Use the reconciled 4/5 guard from the previous final-preview-4x5-contract-bundle.
