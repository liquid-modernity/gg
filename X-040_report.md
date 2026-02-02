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
==> https://www.pakrpp.com/assets/dev/main.css?x=1
HTTP/2 200
cf-cache-status: BYPASS
cache-control: no-store
etag: "<value>"
last-modified: <value>
x-gg-assets: yes
x-gg-worker: assets
x-gg-worker-version: X-035

==> https://www.pakrpp.com/sw.js?x=1
HTTP/2 200
cf-cache-status: BYPASS
cache-control: no-store
etag: "<value>"
last-modified: <value>
x-gg-assets: yes
x-gg-worker: assets
x-gg-worker-version: X-035

==> https://www.pakrpp.com/_headers?x=1
HTTP/2 404
```

## Pass/fail criteria (sw.js)
- PASS: `https://www.pakrpp.com/sw.js?x=1` returns `HTTP 200`.
- FAIL: any `404/500` or missing `sw.js` indicates the deploy is unhealthy.
