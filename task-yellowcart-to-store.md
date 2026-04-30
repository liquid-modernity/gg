TASK: Promote Yellow Cart static page from legacy /yellowcart to canonical /store, while preserving legacy redirects and aligning the Store surface with the existing GG route/panel/dock vocabulary.

Context:
- I have a new store.html content that should become the canonical Store page.
- Public canonical route must be /store.
- Public title must remain “Yellow Cart · PakRPP”.
- Navigation label is “Store”, not “Home”.
- The page is a premium editorial affiliate store, not a marketplace clone.
- Products come from Blogger posts with label Store.
- Legacy yellowcart/yellowcard paths must redirect to /store.

Files likely involved:
- public/yellowcart.html or yellowcart.html
- public/store.html or store.html
- worker.js
- sw.js
- wrangler.jsonc
- any route/QA scripts that grep or smoke-test static routes

Hard requirements:

1. Static asset/file placement
- Create a canonical static asset named store.html using the new Store page content.
- If I already pasted the new content into yellowcart.html, duplicate/move that final content into store.html.
- Do not leave /store depending on yellowcart.html as the primary asset.
- yellowcart.html may remain only as a legacy fallback file, but the Worker must redirect /yellowcart.html to /store before assets are served.
- If keeping yellowcart.html, make sure it is not the canonical source of truth.

2. HTML metadata in store.html
Ensure store.html contains:
- <title>Yellow Cart · PakRPP</title>
- canonical href="https://www.pakrpp.com/store"
- robots index,follow
- CollectionPage schema:
  - name: "Yellow Cart"
  - url: "https://www.pakrpp.com/store"
  - description: premium curated affiliate/product store language
- No canonical /yellowcart.
- No public “yellowcard” vocabulary in title, schema, aria labels, footer, fallback copy, or visible UI.

3. Product feed/data source
- Primary feed label must be Store:
  /feeds/posts/default/-/Store?alt=json&max-results=50
- Support legacy yellowcard only as an internal fallback, not public UI.
- Parser must accept:
  script.gg-store-data
  script[type="application/json"].gg-store-data
  .gg-store-data[type="application/json"]
- Optional backward compatibility may accept:
  script.gg-yellowcard-data
  script[type="application/json"].gg-yellowcard-data
  .gg-yellowcard-data[type="application/json"]
- Category extraction rule:
  - Ignore system labels: Store, yellowcart, yellowcard.
  - Public categories: Fashion, Skincare, Workspace, Tech, Etc.
  - Default category: Curated or Etc, not Yellowcart.
- Hashtags are not the system architecture.

4. Store grid
- Card aspect ratio must remain 4:5.
- Mobile: 2 columns.
- Tablet / desktop narrow: 3 columns.
- Wide desktop: optional 4 columns only when card width remains premium, not cramped.
- Do not make 4 columns the default too early.
- Keep visual density premium/editorial, not marketplace-bazaar.

Suggested CSS behavior:
- repeat(2, minmax(0, 1fr)) by default.
- repeat(3, minmax(0, 1fr)) from around 720px.
- optional repeat(4, minmax(240px, 1fr)) only from wide desktop around 1180px+.
- aspect-ratio: 4 / 5 on card media.

5. Preview top sheet
- Product preview must open as a top sheet, not bottom sheet.
- Preview is a content surface.
- Search/Discovery and More are utility sheets.
- When preview top sheet is active:
  - Category eyebrow, product title, and light meta must appear as overlay text on the hero image.
  - Dock must become hidden and inert.
  - Body scroll behind sheet must lock.
  - Focus must move into the sheet.
  - Escape closes the sheet.
  - Scrim click closes the sheet.
  - Focus returns to the triggering card.
- Do not add formal “Contents”/TOC inside preview unless it is very lightweight. Preferred preview hierarchy:
  1. Hero image/carousel with overlay text
  2. Editorial summary
  3. Price
  4. Marketplace CTA row
  5. Read the article
  6. Optional product notes

6. Dock behavior
Dock items must be:
- Store → /store
- Contact → /store#contact
- Search → opens Store Discovery sheet
- Blog → /
- More → opens More sheet

Important:
- Do not label /store as “Home”.
- Home remains reserved for /landing in the main site vocabulary.
- Blog remains /.
- Store is /store.

Dock state:
- Main store browsing: dock visible by default, hidden-by-scroll allowed.
- Near-bottom may restore dock only when no sheet is active.
- Preview active always beats dock.
- Panel active always beats near-bottom restore.
- Discovery/More active must lock or recess dock according to existing GG sheet grammar.

7. Store Discovery sheet
Search dock item opens a Discovery sheet, not a native Blogger search page.
Discovery sheet must include:
- Search input
- Public filters:
  All
  Fashion
  Skincare
  Workspace
  Tech
  Etc
- Result count
- Clear/reset behavior

Filter logic:
- All = all Store posts.
- Fashion = Store + Fashion.
- Skincare = Store + Skincare.
- Workspace = Store + Workspace.
- Tech = Store + Tech.
- Etc = uncategorized/other.
- Store must not appear as a public filter chip.

8. Contact section
- Add or preserve a full viewport section:
  <section id="contact">
- Contact dock item goes to /store#contact.
- If a sheet is active and the user taps Contact:
  - close active sheet first
  - then smooth-scroll to #contact
- #contact should be Store-specific:
  - affiliate disclosure
  - collaboration inquiries
  - product submission/recommendation
  - correction request/contact CTA
- Use min-height: 100svh, not plain 100vh where possible.

9. More sheet
More sheet must minimally contain:
- Language switcher:
  EN
  ID
- Appearance/theme switcher:
  System
  Light
  Dark
- Footer:
  X
  FB
  WA
  Copyright/legal text

Behavior:
- Persist language in same localStorage key as main GG system if available.
- Persist theme in same localStorage key as main GG system if available.
- System theme must remove explicit html[data-gg-theme].
- Light/Dark must set html[data-gg-theme].
- Use same quiet visual grammar as the main / More sheet.
- Do not turn More into a sitemap.

10. Marketplace links
- Shopee/Tokopedia/TikTok links must use official HTTPS URLs.
- Each marketplace link:
  target="_blank"
  rel="sponsored nofollow noopener noreferrer"
- Do not use brittle custom app schemes.
- Native app opening is best-effort through OS/browser marketplace app-link behavior.
- Web marketplace page is fallback.
- Current Store page state should remain intact after opening a marketplace tab.

11. Worker route migration
In worker.js, replace the yellowcart route vocabulary with Store-first vocabulary.

Expected constants:
- STORE_PUBLIC_PATH = "/store"
- STORE_INTERNAL_PATH = "/store.html"
- YELLOWCART_LEGACY_PUBLIC_PATH = "/yellowcart"
- YELLOWCART_LEGACY_INTERNAL_PATH = "/yellowcart.html"
- YELLOWCARD_LEGACY_PUBLIC_PATH = "/yellowcard"
- YELLOWCARD_LEGACY_INTERNAL_PATH = "/yellowcard.html"

Static asset map:
- Map /store → /store.html.
- Do not map /yellowcart as the canonical public route anymore.

Redirects:
- /store.html → /store
- /yellowcart → /store
- /yellowcart.html → /store
- /yellowcard → /store
- /yellowcard.html → /store
- Preserve query string where safe.
- Use 301 in production-equivalent behavior.

Worker functions:
- Rename yellowcartRedirect() to storeRedirect() or storeRouteRedirect().
- classifyRoute() should classify /store and /store.html as "store".
- Legacy yellowcart/yellowcard paths may classify as "store" only for diagnostics/redirect reasons.
- Update routeRobotsTag/cache/content-type logic from "yellowcart" to "store".
- Update diagnostics payloads:
  routes.store.public = "/store"
  routes.store.asset = "/store.html"
  routes.store.redirects includes all yellowcart/yellowcard legacy paths and /store.html.
- Update /__gg/routes:
  indexInProduction includes /store.
  alwaysRedirected maps legacy paths to /store.
- Rename diagnostic reason:
  yellowcart-route-normalization → store-route-normalization.
- Keep /landing and / root behavior unchanged.

12. Cloudflare Assets / wrangler
- Ensure wrangler.jsonc has assets.run_worker_first = true.
- This is non-negotiable because exact static asset hits like /yellowcart.html must not bypass Worker redirects.
- Do not weaken existing Worker-first static routing.

13. Service worker / PWA
In sw.js:
- Add /store to page precache only if it passes existing HTML quality gate.
- If install logic special-cases "/" and "/landing" for page cache, include "/store" in the same page-cache branch.
- Do not precache legacy /yellowcart or /yellowcard paths.
- Optional: cache Store feed only if it does not stale the catalogue too aggressively.
- Bump release/fingerprint/version according to the repo’s existing convention so old SW cache does not keep stale yellowcart route content.

14. QA / smoke checks
Add or update checks so the following pass:

Route checks:
- /store returns 200.
- /store canonical is https://www.pakrpp.com/store.
- /store.html redirects to /store.
- /yellowcart redirects to /store.
- /yellowcart.html redirects to /store.
- /yellowcard redirects to /store.
- /yellowcard.html redirects to /store.
- / remains Blog.
- /landing remains Home.

Store UI checks:
- H1 is Yellow Cart.
- Dock current item is Store.
- Store dock item href is /store.
- Contact dock item href is /store#contact.
- Blog dock item href is /.
- Search opens Store Discovery sheet.
- More opens More sheet.
- More has EN/ID and System/Light/Dark.
- Store grid cards keep 4:5 aspect ratio.
- Mobile grid has 2 columns.
- Tablet/narrow desktop grid has 3 columns.
- Wide desktop may have 4 columns only at premium width.
- Preview opens from top.
- Preview hero has overlay category/title/meta.
- Preview active hides/inerts dock.
- Escape closes preview.
- Scrim closes preview.
- Focus returns to triggering card.
- Marketplace links open in new tab with sponsored/nofollow/noopener/noreferrer.
- No visible UI uses “yellowcard”.
- “yellowcart” only appears in legacy compatibility comments/redirects if needed.

Suggested commands:
- grep -R "yellowcard\\|yellowcart\\|Yellowcart\\|Yellow Card" .
- grep -R "/store\\|STORE_PUBLIC_PATH\\|storeRedirect" worker.js
- npm run gaga:template:status
- npm run gaga:template:proof
- npm run gaga:verify-template
- npm run build
- wrangler deploy --dry-run if available
- local smoke/curl checks if repo has scripts

Acceptance criteria:
- /store is the only canonical public Store route.
- All yellowcart/yellowcard routes are legacy redirects.
- Store page uses label Store as primary feed.
- Store page still supports legacy yellowcard feed/data only as fallback.
- Store UI feels like a premium editorial affiliate surface.
- No regression to /, /landing, Blog1, PWA, service worker, or main GG panel behavior.