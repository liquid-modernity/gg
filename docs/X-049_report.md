# X-049 Report

## Asset URLs (pinned)
- CSS: https://cdn.jsdelivr.net/gh/liquid-modernity/gg@bb9d16b884e6f2093a0e16b5f7c4d092e91e34c7/public/assets/dev/main.css
- JS:  https://cdn.jsdelivr.net/gh/liquid-modernity/gg@bb9d16b884e6f2093a0e16b5f7c4d092e91e34c7/public/assets/dev/main.js

## Template changes
- `robots` meta is present with `noindex,nofollow` (staging is not indexed).
- Added `window.GG_ENV = { mode:"dev", assetBase:"https://cdn.jsdelivr.net/gh/liquid-modernity/gg@<COMMIT>/public" }` before asset links.
- Replaced CSS/JS to absolute jsDelivr pinned URLs.
- Removed manifest link (no PWA on staging).

## Manual check
- Open the staging blogspot and confirm Network shows `main.css` and `main.js` from `cdn.jsdelivr.net` with the pinned commit hash.
