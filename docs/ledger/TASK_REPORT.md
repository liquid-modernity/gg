TASK_REPORT
Last updated: 2026-02-06

TASK_ID: TASK-0007A
TITLE: UI Module Diet (reduce parse/exec + keep luxury feel)

TASK_SUMMARY
- Split monolithic `modules/ui.js` into a thin orchestrator plus on-demand UI buckets.
- Added lazy poster bucket init on share/poster actions to preserve functionality without forcing load.
- Added budgets + header contract coverage for new bucket files; CRP plan updated.

BUCKET MAP
- `modules/ui.bucket.core.js`: core UI glue, actions, panels, dock, router helpers, post detail core.
- `modules/ui.bucket.listing.js`: listing/feed-only modules (label tree, feed, sitemap, tag hub, prefetch).
- `modules/ui.bucket.post.js`: post/page-only modules (breadcrumbs, readtime, TOC, inline tags).
- `modules/ui.bucket.poster.js`: share sheet + poster engine/canvas/motion.
- `modules/ui.bucket.search.js`: search UI module.

SIZE REPORT
BEFORE (previous release monolith: `public/assets/v/ce57589/modules/ui.js`)
- raw 363062 bytes
- gzip 84552 bytes

AFTER (current release: `public/assets/v/5c59d9a/modules/*.js`)
- ui.js raw 3022 bytes, gzip 1008 bytes
- ui.bucket.core.js raw 197704 bytes, gzip 47311 bytes
- ui.bucket.listing.js raw 63793 bytes, gzip 15691 bytes
- ui.bucket.post.js raw 14181 bytes, gzip 4137 bytes
- ui.bucket.poster.js raw 71220 bytes, gzip 16081 bytes
- ui.bucket.search.js raw 11690 bytes, gzip 3368 bytes

Commands (size probes)
```sh
node -e "const fs=require('fs');const z=require('zlib');const f='public/assets/v/ce57589/modules/ui.js';const b=fs.readFileSync(f);console.log(f,'raw',b.length,'gzip',z.gzipSync(b).length);"
# public/assets/v/ce57589/modules/ui.js raw 363062 gzip 84552

node -e "const fs=require('fs');const z=require('zlib');const base='public/assets/v/5c59d9a/modules/';['ui.js','ui.bucket.core.js','ui.bucket.listing.js','ui.bucket.post.js','ui.bucket.poster.js','ui.bucket.search.js'].forEach(f=>{const b=fs.readFileSync(base+f);console.log(base+f,'raw',b.length,'gzip',z.gzipSync(b).length);});"
# public/assets/v/5c59d9a/modules/ui.js raw 3022 gzip 1008
# public/assets/v/5c59d9a/modules/ui.bucket.core.js raw 197704 gzip 47311
# public/assets/v/5c59d9a/modules/ui.bucket.listing.js raw 63793 gzip 15691
# public/assets/v/5c59d9a/modules/ui.bucket.post.js raw 14181 gzip 4137
# public/assets/v/5c59d9a/modules/ui.bucket.poster.js raw 71220 gzip 16081
# public/assets/v/5c59d9a/modules/ui.bucket.search.js raw 11690 gzip 3368
```

VERIFICATION COMMANDS
- `npm run build`
- `node tools/verify-router-contract.mjs`
- `npm run verify:assets`
- `npm run build:xml`
- `npm run verify:xml`
- `node tools/verify-budgets.mjs`
- `node tools/verify-headers.mjs --mode=config`
- `node tools/verify-inline-css.mjs`
- `node tools/verify-crp.mjs`
- `node tools/verify-ledger.mjs`

NOTES
- Router contract remains enforced; UI load does not block routing.
- Poster/share actions now lazy-load `ui.bucket.poster.js` and init poster modules before opening.

RISKS / ROLLBACK
- Risk: low/medium — a missing bucket could delay a feature; fallback paths remain.
- Rollback: revert this commit; restore monolithic `modules/ui.js` if needed.
