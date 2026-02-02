# X-038 Report

## public/_headers (current)
```
/assets/dev/*
  Cache-Control: no-store, max-age=0

/assets/v/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  X-GG-Worker: assets

/sw.js
  Cache-Control: no-store

/manifest.webmanifest
  Cache-Control: public, max-age=86400

/offline.html
  Cache-Control: public, max-age=86400

/gg-pwa-icon/*
  Cache-Control: public, max-age=31536000, immutable
```

## ls -la public/sw.js
```
-rw-r--r--  1 macbookpromid2012  staff  3308 Jan 31 18:24 public/sw.js
```

## verify-worker.sh (after deploy)
```
# paste output here after deploy
```
