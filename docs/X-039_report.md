# X-039 Report

## public/_headers
```
/assets/dev/*
  Cache-Control: no-store, max-age=0
  X-GG-Assets: X-039

/assets/v/*
  Cache-Control: public, max-age=31536000, immutable
  X-GG-Assets: X-039

/sw.js
  Cache-Control: no-store
  X-GG-Assets: X-039

/manifest.webmanifest
  Cache-Control: public, max-age=86400
  X-GG-Assets: X-039

/offline.html
  Cache-Control: public, max-age=86400
  X-GG-Assets: X-039

/gg-pwa-icon/*
  Cache-Control: public, max-age=31536000, immutable
  X-GG-Assets: X-039
```

## verify-worker.sh (after deploy)
```
==> https://www.pakrpp.com/assets/dev/main.css?x=1
HTTP/2 200 
cf-cache-status: HIT
cache-control: public, max-age=0, must-revalidate
server: cloudflare
cf-ray: 9c7781d86d64fe0c-SIN

==> https://www.pakrpp.com/assets/dev/main.js?x=1
HTTP/2 200 
cf-cache-status: HIT
cache-control: public, max-age=0, must-revalidate
server: cloudflare
cf-ray: 9c7781d9482efe0c-SIN

==> https://www.pakrpp.com/sw.js?x=1
HTTP/2 404 
cache-control: no-cache, no-store, max-age=0, must-revalidate
server: cloudflare
cf-cache-status: BYPASS
cf-ray: 9c7781da3aa3fe0c-SIN

==> https://www.pakrpp.com/__gg_worker_ping?x=1
HTTP/2 200 
cache-control: no-store
x-gg-worker: assets
x-gg-worker-version: X-035
server: cloudflare
```
