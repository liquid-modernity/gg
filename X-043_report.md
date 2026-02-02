# X-043 Report

## wrangler.jsonc routes diff
```
-    { "pattern": "www.pakrpp.com/sw.js", "zone_name": "pakrpp.com" },
-    { "pattern": "www.pakrpp.com/manifest.webmanifest", "zone_name": "pakrpp.com" },
-    { "pattern": "www.pakrpp.com/offline.html", "zone_name": "pakrpp.com" },
+    { "pattern": "www.pakrpp.com/sw.js*", "zone_name": "pakrpp.com" },
+    { "pattern": "www.pakrpp.com/manifest.webmanifest*", "zone_name": "pakrpp.com" },
+    { "pattern": "www.pakrpp.com/offline.html*", "zone_name": "pakrpp.com" },
```

## verify-worker.sh output (after deploy)
```
# paste output here after deploy
```
