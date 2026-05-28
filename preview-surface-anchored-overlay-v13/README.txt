preview-surface-anchored-overlay-v13

Use from repo root:

cp preview-surface-anchored-overlay-v13/fix-preview-surface-anchored-overlay-v13.mjs .
node fix-preview-surface-anchored-overlay-v13.mjs --run-qa

If focused QA passes:
node fix-preview-surface-anchored-overlay-v13.mjs --run-ci

This version fixes guard generation escaping and aligns source ownership: tokens in visual-tokens, layout in preview-frame.
