# X-033 Report

## Diff summary
- Add `X-GG-Worker: assets` proof header on successful asset responses.
- Force `Cache-Control: no-store, max-age=0` (plus `Pragma: no-cache`) for `/assets/dev/*`.
- Add verification script and manual verification notes.

## Expected curl output format (template)
```
==> https://www.pakrpp.com/assets/dev/main.css?x=1
HTTP/2 200
cache-control: no-store, max-age=0
x-gg-worker: assets
cf-ray: <value>
server: <value>

==> https://www.pakrpp.com/assets/dev/main.js?x=1
HTTP/2 200
cache-control: no-store, max-age=0
x-gg-worker: assets
cf-ray: <value>
server: <value>

==> https://www.pakrpp.com/sw.js?x=1
HTTP/2 200
cache-control: no-store
x-gg-worker: assets
cf-ray: <value>
server: <value>
```

## PASS checklist
- `/assets/dev/main.css` shows `X-GG-Worker: assets` and `Cache-Control: no-store, max-age=0`.
- `/assets/dev/main.js` shows `X-GG-Worker: assets` and `Cache-Control: no-store, max-age=0`.
- `/sw.js` shows `X-GG-Worker: assets` and `Cache-Control: no-store`.
