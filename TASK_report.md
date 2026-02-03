# TASK_report.md

## TASK SUMMARY
Task ID: X-013
Status: DONE

Changes:
- Set `data-api` for `#gg-feed` to `/feeds/posts/default?alt=json` in DEV/PROD templates.
- Set `data-api` for `#gg-sitemap` to `/sitemap.xml` in DEV/PROD templates.

## TASK PROOF
- `index.dev.xml` and `index.prod.xml` now have populated `data-api` attributes for `#gg-feed` and `#gg-sitemap`.

## FILES TOUCHED
- index.dev.xml
- index.prod.xml
- public/assets/dev/main.js
- TASK_report.md
