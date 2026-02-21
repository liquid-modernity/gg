# IFRAME_POLICY.md
Last updated: 2026-02-21

## Policy
- YT lite activation must use `https://www.youtube-nocookie.com/embed/<id>`.
- JS-created video iframe must set an accessible `title`.
- JS-created iframe must set `referrerpolicy="strict-origin-when-cross-origin"`.
- JS-created iframe must set explicit `allow` capabilities (minimal set, no autoplay by default).
- Keep intrinsic dimensions as CLS fallback via `GG.services.images.setIntrinsicDims(iframe, 16, 9)`.

## Intent-based preconnect
- Do not preconnect YouTube origins on page load.
- Warm up connections only on user intent:
  - `pointerenter` on `.gg-yt-lite`
  - `focus` on `.gg-yt-lite`
- Preconnect targets:
  - `https://www.youtube-nocookie.com`
  - `https://i.ytimg.com`

## Rationale
- `youtube-nocookie` reduces default tracking surface.
- `title` improves screen reader context when iframe content loads.
- Intent-only preconnect avoids paying network/setup cost for embeds users never activate.
- Intrinsic dimensions + existing aspect-ratio wrappers keep layout stable.
