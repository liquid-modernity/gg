# X-050 Report

## Summary
- Added env constants: `ENV`, `ASSET_BASE`, `IS_DEV` and exposed `GG_ASSET` helper.
- PWA init is fully disabled when `GG_ENV.mode === "dev"` (no manifest/SW registration).
- Asset loader now uses `GG_ENV.assetBase` for `assets/main.js` when provided.
- Debug overlay remains unchanged.

## Notes
- `GG_ASSET(path)` prefixes `GG_ENV.assetBase` when present, otherwise uses the original URL.
- Dev mode will never register SW, even with `?pwa=1`.
