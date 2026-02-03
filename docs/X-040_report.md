# X-040 Report

## CI preflight step (excerpt)
```yaml
- name: Preflight static assets
  run: |
    set -e
    if [ ! -f public/sw.js ]; then
      echo "ERROR: public/sw.js missing"
      exit 1
    fi
    if [ ! -f public/_headers ]; then
      echo "ERROR: public/_headers missing"
      exit 1
    fi
    echo "ls -la public | head"
    ls -la public | head
    echo "public/_headers (first 120 lines)"
    sed -n '1,120p' public/_headers
```

## verify-worker.sh output format (example)
```
bash tools/verify-worker.sh
==> https://www.pakrpp.com/assets/dev/main.css?x=1
HTTP/2 200 
cf-cache-status: HIT
cache-control: public, max-age=0, must-revalidate
etag: "ce7775f73b37b1e557f0dafd968c883e"

==> https://www.pakrpp.com/assets/dev/main.js?x=1
HTTP/2 200 
cf-cache-status: HIT
cache-control: public, max-age=0, must-revalidate
etag: "b370f0d6ae0b12a2a0b6bcbeed8192ea"

==> https://www.pakrpp.com/sw.js?x=1
HTTP/2 404 
cache-control: no-cache, no-store, max-age=0, must-revalidate
cf-cache-status: DYNAMIC

==> https://www.pakrpp.com/manifest.webmanifest?x=1
HTTP/2 404 
cache-control: no-cache, no-store, max-age=0, must-revalidate
cf-cache-status: DYNAMIC

==> https://www.pakrpp.com/__gg_worker_ping?x=1
HTTP/2 200 
cache-control: no-store
x-gg-worker: assets
x-gg-worker-version: X-035

==> https://www.pakrpp.com/_headers?x=1
HTTP/2 404 
```

## Pass/fail criteria (sw.js)
- PASS: `https://www.pakrpp.com/sw.js?x=1` returns `HTTP 200`.
- FAIL: any `404/500` or missing `sw.js` indicates the deploy is unhealthy.
