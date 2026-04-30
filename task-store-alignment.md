TASK: Update /store implementation and QA smoke tests to the final Store surface contract.

Problem:
`npm run gaga:verify-worker` fails with:
FAIL: /store blog dock href is not /

This failure is caused by the old Store QA contract still expecting a Blog dock item on /store. That is obsolete.

Final Store dock contract is:
- Store    → /store
- Contact  → /store#contact
- Discover → opens Store Discovery command sheet
- Saved    → opens Saved sheet / saved local picks
- More     → opens More sheet

Blog must NOT be a primary dock item on /store anymore.
Blog must live inside More sheet.

Do not restore Blog to the dock just to satisfy the old smoke test.

Files likely involved:
- store.html
- qa/live-smoke-worker.sh
- any QA helpers that inspect /store dock links
- any docs/contracts embedded in store.html
- possibly worker diagnostics if route metadata exposes old dock expectations

Required changes:

1. Update store.html to final Store surface contract

Ensure the canonical /store HTML has:
- no `.store-topbar`
- no topbar search input
- no refresh button in the main topbar
- hero reduced to:
  - H1: Yellow Cart
  - summary: Kurasi produk pilihan.
  - disclosure: Affiliate links may be used: Harga dan ketersediaan mengikuti marketplace.
- no sticky top `.store-filter` as page nav
- filter moved to dock-attached tray similar to gg-detail-outline
- grid card media aspect ratio 4:5
- `.store-card__media` border-radius: 10px
- no `.store-card__quick`
- preview opens from top
- preview top sheet has footer handle
- no visible preview close button
- no `Read the article` CTA
- marketplace/ecommerce buttons are primary
- Saved feature exists and uses localStorage
- Discovery is a command center with search + quick intents + live result rows
- More sheet contains:
  - Blog → /
  - Home → /landing
  - Language EN/ID
  - Theme System/Light/Dark
  - Social/footer/legal text

2. Update dock HTML contract

Expected dock items on /store:

Store:
  selector can be [data-store-dock="store"] or text Store
  href="/store"
  aria-current="page"

Contact:
  selector can be [data-store-dock="contact"] or text Contact
  href="/store#contact"

Discover:
  selector can be [data-store-dock="discover"] or text Discover
  button, not link
  opens #store-discovery-sheet

Saved:
  selector can be [data-store-dock="saved"] or text Saved
  button, not link
  opens #store-saved-sheet

More:
  selector can be [data-store-dock="more"] or text More
  button, not link
  opens #store-more-sheet

Remove any QA assumption that /store dock contains Blog.

3. Update More sheet requirements

More sheet must contain a Blog link:
- visible label: Blog
- href="/"

More sheet must contain a Home link:
- visible label: Home
- href="/landing"

So the old smoke requirement:
"/store blog dock href is /"
must become:
"/store More sheet contains Blog href /"

4. Update qa/live-smoke-worker.sh

Find any checks equivalent to:
- /store blog dock href is not /
- STORE_BLOG_DOCK
- blog dock href
- .gg-dock__item[href="/"] on /store
- expected Store dock includes Blog

Replace them with the final contract:

Required /store live smoke checks:
- /store returns 200
- canonical is https://www.pakrpp.com/store
- H1 is Yellow Cart
- dock Store href is /store
- dock Contact href is /store#contact
- dock Discover exists and is a button
- dock Saved exists and is a button
- dock More exists and is a button
- dock Blog is NOT required
- More sheet contains Blog href /
- More sheet contains Home href /landing
- Discovery sheet exists
- Saved sheet exists
- Store grid exists
- Store card media keeps 4:5
- preview sheet opens from top
- marketplace links use target=_blank and rel includes sponsored nofollow noopener noreferrer

5. Do not weaken route checks

Keep these route checks:
- /store returns 200
- /store.html redirects to /store
- /yellowcart redirects to /store
- /yellowcart.html redirects to /store
- /yellowcard redirects to /store
- /yellowcard.html redirects to /store
- / remains Blog
- /landing remains Home

6. Update embedded Store contract / QA matrix

In store.html, update STORE_SURFACE_CONTRACT and STORE_QA_MATRIX so they no longer say:
- Search opens from dock
- Blog dock href is /
- Read the article exists
- close buttons dismiss active sheets

They should say:
- Discover opens command center
- Saved opens local saved picks
- Blog is available in More
- Preview has footer handle and no visible close button
- Marketplace CTAs are primary

7. Run verification

Run:
npm run gaga:verify-worker

If it still fails, print the failing assertion and the exact selector used by qa/live-smoke-worker.sh.

Also run:
grep -R "blog dock\\|Blog dock\\|store blog\\|/store blog\\|Read the article\\|store-topbar\\|store-card__quick" qa store.html worker.js sw.js .

Acceptance:
- Deploy must not require Blog as a dock item on /store.
- /store dock final is Store / Contact / Discover / Saved / More.
- Blog exists inside More sheet.
- No regression to /, /landing, route redirects, service worker, or Worker-first asset routing.