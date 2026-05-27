Preview reveal guard-lock migration

Purpose:
- Change the locked guard values instead of introducing a new surface reveal token.
- Keep the visual contract in the existing tokens:
  --gg-preview-hero-max-height
  --gg-preview-content-lift
  --gg-preview-store-content-lift

Run from repo root:

cp preview-reveal-change-guard-lock-auto/fix-preview-reveal-change-guard-lock.mjs .
node fix-preview-reveal-change-guard-lock.mjs --run-qa

If QA passes:

node fix-preview-reveal-change-guard-lock.mjs --run-ci

Contract:
- --gg-preview-hero-aspect: 4 / 5
- --gg-preview-hero-max-height: min(72dvh, 760px)
- --gg-preview-content-lift: clamp(380px, 59dvh, 540px)
- --gg-preview-store-content-lift: clamp(360px, 56dvh, 520px)
- No new --gg-preview-surface-reveal-y token.

This is a source/guard migration script, not a runtime override.
