# IMAGE_POLICY.md
Last updated: 2026-02-21

## LCP policy
- Do not lazy-load the first likely above-the-fold image.
- Use `fetchpriority="high"` for only one image per surface.
- Keep secondary above-the-fold candidate at `loading="eager"` with `fetchpriority="auto"`.
- Keep the rest `loading="lazy"` with `fetchpriority="auto"`.

## Listing contract
- Tile #1: `loading="eager"` + `fetchpriority="high"`.
- Tile #2: `loading="eager"` + `fetchpriority="auto"`.
- Tile #3+ : `loading="lazy"` + `fetchpriority="auto"`.
- Tile images must set:
  - `decoding="async"`
  - `sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 25vw"`

## Mixed contract
- Default card thumb policy: `decoding="async"` + `loading="lazy"`.
- Conservative first-thumb boost is allowed:
  - one thumb can use `loading="eager"` with `fetchpriority="auto"`.
- Do not use `fetchpriority="high"` by default in mixed to avoid competing with listing LCP.

## Why
- `fetchpriority="high"` should be limited to the single strongest LCP candidate.
- LCP candidates should not be lazy-loaded.
- `decoding="async"` keeps image decode work off the critical rendering path for JS-inserted images.
