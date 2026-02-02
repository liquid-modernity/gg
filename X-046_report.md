# X-046 Report

## Summary
- DEV mode is not offline-reliable by design (network-only for `/assets/dev/*`).
- RELEASE assets (`/assets/v/*`) are cache-first + immutable for offline reliability.
- Navigation is network-first with `/offline.html` fallback.
- SW updates are user-controlled via “Update tersedia” confirm and `SKIP_WAITING` message.

## SW update flow test
1) Open site (with `?ggdebug=1` if you want console logs).
2) Change `VERSION` in `public/sw.js` to a new value.
3) Reload: update found → confirm prompt → activates → page reloads on `controllerchange`.

## Verify commands
- `curl -I https://www.pakrpp.com/sw.js` (expect `Cache-Control: no-store`)
- `curl -I https://www.pakrpp.com/assets/v/<file>` (expect `immutable`)
- `bash tools/verify-worker.sh` (confirm headers and cache status)
