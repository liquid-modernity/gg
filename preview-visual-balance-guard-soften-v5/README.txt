Preview Visual Balance + Guard Softening v5

Purpose:
- Fix double-lift blank space in root/store preview sheet.
- Keep hero 4/5 and viewport-safe.
- Keep content-lift as the single design lock, but apply it only to body, not surface.
- Keep visual tokens token-only.
- Polish root preview table-of-contents/list styling.
- Soften fragile guards so they check design principles, not exact old literal strings.

From repo root:

cp preview-visual-balance-guard-soften-v5/fix-preview-visual-balance-guard-soften-v5.mjs .
node fix-preview-visual-balance-guard-soften-v5.mjs --run-qa

If focused QA passes:

node fix-preview-visual-balance-guard-soften-v5.mjs --run-ci

Focused QA run by --run-qa:
- npm run gaga:sync-components
- npm run store:build
- npm run gaga:template:pack
- npm run gaga:verify-sheet-lifecycle
- npm run gaga:verify-sheet-runtime-overflow
- npm run gaga:verify-store-modal-preview

Files touched by the script when present:
- src/css/components/gg-visual-tokens.css
- src/css/components/gg-preview-frame.css
- qa/sheet-lifecycle-contract-guard.mjs
- qa/sheet-runtime-overflow-viewport-guard.mjs
- qa/store-modal-preview-reliability-guard.mjs

The script does not touch Worker logic.
