# Blogger Template Manual Release Checklist

Source of truth:
- `index.prod.xml`

When manual Blogger publish is required:
- Whenever `node qa/template-fingerprint.mjs --value` changes.
- Whenever SSR/template markup changes in `index.prod.xml` (route/head/shell rows/panel markup).

Manual publish action (Blogger):
1. Open Blogger Admin for `www.pakrpp.com`.
2. Go to `Theme` -> `Edit HTML`.
3. Replace template HTML with repo `index.prod.xml`.
4. Save/publish the template.

Mandatory post-publish verification (public production):
1. `npm run gaga:template:status -- https://www.pakrpp.com`
2. `npm run gaga:verify-template`

Release is complete only if:
- Template status reports `state=MATCH`.
- Live smoke passes with release state `blogger_template_parity_verified`.
- `/` and `/landing` canonical/surface checks pass.
- `/blog` redirects to `/` (legacy redirect only).
- Empty editorial shell/rows are not visible in SSR output.

If verification fails:
- Treat release as incomplete.
- Keep state as `Worker/assets deployed; Blogger template publish still required` or `Blogger template drift detected`.
