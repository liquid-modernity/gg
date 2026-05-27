Preview reveal + TOC + bottom-handle stable automation

Run from repo root:

cp preview-reveal-toc-handle-stable-auto/fix-preview-reveal-toc-handle-stable.mjs .
node fix-preview-reveal-toc-handle-stable.mjs --run-qa

If QA passes, run:

node fix-preview-reveal-toc-handle-stable.mjs --run-ci

What it does:
- Keeps lifecycle guard-compatible tokens:
  --gg-preview-content-lift: clamp(96px, 18dvh, 220px)
  --gg-preview-store-content-lift: clamp(88px, 16dvh, 196px)
- Adds visual surface reveal tokens:
  --gg-preview-surface-reveal-y: clamp(180px, 26dvh, 240px)
  --gg-preview-store-surface-reveal-y: clamp(170px, 24dvh, 230px)
- Keeps hero 4/5 and viewport-safe max-height.
- Polishes preview TOC.
- Moves preview/footer handles to behave as bottom handles.
- Hides scrollbars without disabling scroll.
