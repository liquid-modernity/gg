Preview Final Green v6
======================

Purpose:
- Fix preview hero visual balance after the 4/5 hero work.
- Remove blank-space/double-lift regression.
- Keep hero dominant without pushing content down with huge empty whitespace.
- Move preview handle/affordance to the bottom of the sheet flow.
- Polish root preview TOC rhythm.
- Soften only the fragile visual-preview guards from exact old-string checks to behavior checks.

Run from repo root:

  cp preview-final-green-v6/fix-preview-final-green-v6.mjs .
  node fix-preview-final-green-v6.mjs --run-qa

If focused QA passes, run:

  node fix-preview-final-green-v6.mjs --run-ci

Final visual contract:
- --gg-preview-hero-aspect: 4 / 5
- --gg-preview-hero-max-height: min(72dvh, 760px)
- --gg-preview-content-lift: clamp(20px, 4dvh, 56px)
- --gg-preview-store-content-lift: clamp(20px, 4dvh, 56px)

What it edits:
- src/css/components/gg-visual-tokens.css
- src/css/components/gg-preview-frame.css
- src/css/modules/visual-tokens.css
- src/css/modules/preview-frame.css
- qa/sheet-lifecycle-contract-guard.mjs, if present
- qa/sheet-runtime-overflow-viewport-guard.mjs, if present
- qa/store-modal-preview-reliability-guard.mjs, if present

Focused QA run by --run-qa:
- npm run gaga:sync-components
- npm run store:build
- npm run gaga:template:pack
- npm run gaga:verify-sheet-lifecycle
- npm run gaga:verify-sheet-runtime-overflow
- npm run gaga:verify-store-modal-preview

Notes:
- Do not run earlier v2/v3/v5 scripts after this.
- This script intentionally does not change Worker behavior.
- This script keeps visual tokens token-only and puts preview layout ownership in gg-preview-frame.
