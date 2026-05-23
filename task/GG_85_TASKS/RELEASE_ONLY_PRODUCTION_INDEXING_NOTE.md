# RELEASE-ONLY NOTE — Production Crawling and Indexing Flags

This file is not counted as one of the 13 development tasks.

Keep development crawler blocking in place until release. The final production release should only open indexing after:

- `npm run ci:85` passes.
- Store production image checks pass.
- Rendered JSON-LD is validated.
- Canonicals are stable.
- Sitemap routes are correct.
- No dev/debug UI is visible.
- No healthy route is served by Worker emergency fallback.
- Production headers do not contain `noindex` on public routes.

Do not mix this release toggle with development architecture tasks.
