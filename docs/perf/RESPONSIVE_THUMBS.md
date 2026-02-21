# RESPONSIVE_THUMBS.md
Last updated: 2026-02-21

## Policy
- Use `srcset` + `sizes` only for known Blogger/Googleusercontent thumbnail URL formats.
- If URL format is not recognized, keep the original `src` only.
- Never force `srcset` on unknown hosts/patterns.

## Safe-only URL patterns
Allowed host check:
- `blogger.googleusercontent.com`
- `googleusercontent.com`

Allowed resize tokens:
- Path segment format:
  - `/sNNN/`
  - `/sNNN-c/`
- Equals suffix format:
  - `=sNNN`
  - `=sNNN-c`

If none of those patterns exist, resize is skipped.

## Width sets
- Listing tiles:
  - `[320, 480, 640, 960, 1280]`
  - `sizes: (max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw`
- Mixed cards:
  - `[240, 360, 480, 720, 960, 1200]`
  - `sizes: (max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw`

## Crop semantics
- Preserve existing crop flag only.
- If original URL has `-c` (`/sNNN-c/` or `=sNNN-c`), resized output keeps `-c`.
- If original URL has no `-c` (`/sNNN/` or `=sNNN`), resized output must never introduce `-c`.

## Why safe-only
- Blogger image URL formats can vary across sources.
- Unsafe rewriting risks broken thumbnails and regressions.
- Guarded rewrite keeps current image behavior for unknown formats while enabling responsive savings on known-safe URLs.
