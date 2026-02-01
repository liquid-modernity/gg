# X-034 Report

## Diff summary
- Add header stamp helper for all responses with `X-GG-Worker` and `X-GG-Worker-Version`.
- Ensure early 404/502 responses are stamped.
- Special-case `/sw.js` missing in ASSETS with a stamped 404 body.
- Update verify script to print the new version header.

## Expected verify-worker output (Worker active)
```
==> https://www.pakrpp.com/assets/dev/main.css?x=1
HTTP/2 200
cache-control: no-store, max-age=0
x-gg-worker: assets
x-gg-worker-version: 2026-02-01
cf-ray: <value>

==> https://www.pakrpp.com/assets/dev/main.js?x=1
HTTP/2 200
cache-control: no-store, max-age=0
x-gg-worker: assets
x-gg-worker-version: 2026-02-01
cf-ray: <value>

==> https://www.pakrpp.com/sw.js?x=1
HTTP/2 200
cache-control: no-store
x-gg-worker: assets
x-gg-worker-version: 2026-02-01
cf-ray: <value>

# If sw.js is missing in ASSETS, expect:
# HTTP/2 404 (still includes X-GG-Worker headers)
```
