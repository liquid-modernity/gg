# X-041 Report

## CI preflight step (excerpt)
```yaml
- name: Preflight static assets
  run: |
    set -e
    if [ ! -f public/sw.js ]; then
      echo "ERROR: public/sw.js missing"
      exit 1
    fi
    if [ ! -f public/manifest.webmanifest ]; then
      echo "ERROR: public/manifest.webmanifest missing"
      exit 1
    fi
    if [ ! -f public/offline.html ]; then
      echo "ERROR: public/offline.html missing"
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

## Post-deploy curl output (example)
```
==> https://www.pakrpp.com/sw.js
HTTP/2 200
x-gg-assets: X-041

==> https://www.pakrpp.com/manifest.webmanifest
HTTP/2 200
x-gg-assets: X-041

==> https://www.pakrpp.com/offline.html
HTTP/2 200
x-gg-assets: X-041
```
