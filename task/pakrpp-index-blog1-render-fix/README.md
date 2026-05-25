# PAKRPP Blog1 render fix

This patch removes the dynamic root ItemList JSON-LD block that used a filtered `data:posts` collection inside Blog1.

Why:
- Live Blogger rendered `Failed to render gadget 'Blog1'` on `/`.
- The risky block used `b:with value='data:posts filter (...)'`, `data:schemaPosts.length`, and a loop over the derived collection.
- Static guards can pass this, but Blogger runtime can still reject the expression and fail the entire Blog1 gadget.

What changed:
- Replaced the dynamic root ItemList schema with a safer static root Blog + BreadcrumbList JSON-LD block.
- Did not change post row rendering.
- Did not change Store filtering in the listing loop.
- Did not change route truth: `/landing = Home`, `/ = Blog`.

After applying in repo:
1. Run `node qa/template-fingerprint.mjs --write` if your template fingerprint guard requires it.
2. Run `git diff --check`.
3. Run `npm run gaga:template:pack`.
4. Run `npm run ci:cloudflare`.
5. Deploy and recheck `/` for absence of `Failed to render gadget 'Blog1'`.

If root renders but Store posts still appear, the next defect is Store taxonomy/detection, not Worker and not this Blog1 render crash.
