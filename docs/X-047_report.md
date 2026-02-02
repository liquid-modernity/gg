# X-047 Report — Stabilize Bootstrap

## What changed
- Added `GG_ENV` support and diagnostics (`GG_DIAG`) with error capture.
- Inserted `<script>window.GG_ENV = { mode: "dev", assets: "X-047" };</script>` before the main.css link in `index.xml`.
- Added `safeInit(name, fn)` to isolate module crashes and continue boot.
- Disabled SW registration by default in DEV; can be forced with `?pwa=1` or `localStorage.gg_pwa_force=1`.
- Added debug overlay when `?ggdebug=1` to show env, surface, homeState, module status, and last error.
- Added `tools/verify-blog-route.sh` for quick DOM markers check on `/blog`.

## How to test
1) DEV SW gating:
   - Visit site normally: SW should NOT register in dev mode.
   - Visit with `?pwa=1` or set `localStorage.gg_pwa_force=1`: SW should register.

2) SafeInit + Diagnostics:
   - Open page with `?ggdebug=1` and confirm overlay appears bottom-left.
   - Force a module error (temporary throw) and verify other modules still init and error shows in overlay.

3) Home markers on /blog:
   - Run `bash tools/verify-blog-route.sh`.

## Notes
- `index.xml` update pending: not found in repo. Provide path to apply the head marker.
