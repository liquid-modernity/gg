# PakRPP / Gaga Web App — PRD & Production Description for TestSprite

## 1. Product Summary

PakRPP is a personal editorial web app with three public-facing surfaces:

1. **Home / Identity** — `/landing`  
   A static identity page introducing PakRPP, editorial positioning, rubrics, FAQ, and contact entry points.

2. **Blog / Editorial Archive** — `/`  
   A Blogger-rendered editorial archive for articles, labels, search, listing pagination, post detail pages, page detail pages, native comments, saved articles, preview sheets, related posts, and global navigation.

3. **Yellow Cart Store** — `/store`  
   A static-prerendered affiliate/product-curation surface for editorially selected products. It includes category filtering, product cards, product detail/preview behavior, search/discovery, store routes, and external product links.

The application is currently **still in development**. Many content items, product names, images, links, and product data are intentionally dummy or placeholder data. TestSprite should focus on functional, UI, accessibility, responsive, and navigation bugs, not on judging whether placeholder content is final.

## 2. Target URL

Use the live, staging, or preview URL provided in TestSprite. The canonical production host is expected to be:

```txt
https://www.pakrpp.com
```

Important route truth:

```txt
/landing = Home / identity surface
/        = Blog / editorial archive
/store   = Store / commerce surface
```

Breadcrumb and schema route truth should follow:

```txt
Home (/landing) -> Blog (/) -> current page/post
```

## 3. Development Status and Known Dummy Areas

This build is **not yet final production content**. The following should **not automatically be reported as production bugs** unless they break functionality, layout, or user flow:

- Placeholder product images, including `picsum.photos` style images.
- Dummy or generic product names, prices, descriptions, brands, or marketplace links.
- Sparse Store data; current Store may only contain a small number of products.
- Development robots/noindex behavior when flags are still in development mode.
- Placeholder editorial copy where the page is still visually and functionally usable.
- External social share behavior controlled by third-party platforms.
- WhatsApp, email, Blogger, marketplace, or social links opening external apps/sites.
- Blogger native widgets, comments, captcha, or validation UI appearing only when Blogger requires them.

However, report bugs if dummy/development state causes broken UI, blank screens, inaccessible controls, JavaScript crashes, infinite loading, blocked navigation, broken route rendering, unusable forms, or major layout regressions.

## 4. Primary Users

Primary users are readers, collaborators, and shoppers who visit PakRPP on mobile or desktop to:

- Read editorial notes and articles.
- Browse article categories or labels.
- Search for content.
- Preview articles before opening full posts.
- Save articles locally for later.
- Open related posts.
- Contact PakRPP for collaboration or correction requests.
- Browse curated products in Yellow Cart.
- Filter products by category.
- Open product editorial details or external product links.

## 5. Supported Devices and Browsers

Prioritize testing on:

- Mobile viewport around 360px–430px width.
- Tablet viewport around 768px width.
- Desktop viewport around 1280px–1440px width.
- Modern Chromium, Safari/WebKit, and Firefox behavior where available.

The app is designed as a responsive, mobile-first web experience with bottom dock navigation and sheet-based interactions. It should remain usable with mouse, touch, keyboard, and basic screen-reader semantics.

## 6. Global Navigation Contract

The global bottom dock order should be consistent across major surfaces:

```txt
Home -> Contact -> Search -> Blog -> More
```

Expected behavior:

- **Home** navigates to `/landing` or scrolls to top on the landing surface.
- **Contact** opens the Contact sheet or navigates to the proper contact fallback depending on surface.
- **Search** opens Discovery/Search.
- **Blog** navigates to `/` or scrolls to the blog top/listing when already on blog.
- **More** opens the More sheet.

The dock should not cover important content permanently. Bottom spacing should allow users to read and tap content above the dock.

## 7. Home / Landing Surface: `/landing`

### Purpose

The landing page introduces PakRPP as an editorial/personal-notes product and routes users into Blog, Store, and Contact.

### Expected content and behavior

- Page title should communicate PakRPP identity, e.g. “The Unfiltered Notes.”
- Main sections should include intro, rubrics, FAQ, and contact.
- Rubrics should help users understand content types such as Insight, Perspective, Case Notes, and Lab.
- “Read” or Blog CTAs should navigate to `/`.
- Store navigation should route to `/store`.
- Contact CTAs should scroll to contact section or use safe contact fallback.
- Search/Discovery should open as a sheet or overlay without breaking page scroll.
- More sheet should include navigation, discover, info, and preferences.

### Landing bugs to report

- Main content is hidden, blank, or unreadable.
- Dock buttons do not work.
- Contact CTA leads nowhere or traps the user.
- Search/More sheets cannot be opened or closed.
- Content is clipped behind the dock.
- Keyboard focus is lost after closing a sheet.

## 8. Blog / Editorial Archive Surface: `/`

### Purpose

The root route `/` is the Blog/editorial archive. It must not be treated as Home. It should preserve Blogger SSR semantics and remain useful even if JavaScript fails.

### Expected listing behavior

- Root blog listing renders article rows/cards with readable titles.
- Listing filter/menu should include available modes such as latest, labels/categories, saved, and popular posts where available.
- Unknown label/category icon should safely fall back to an article-style icon.
- Article preview can be opened from a listing item.
- Blog pagination should be available at the tail/bottom of the listing when older/newer entries exist.
- Pagination on the root listing should look like listing pagination, not a post-detail table of contents.

### Saved articles behavior

Saved mode is local-only and may use:

```txt
Hash: #saved
Storage key: gg:saved:v1
```

Expected behavior:

- Users can save an article from preview or article detail.
- Saved state should persist in the same browser through localStorage.
- Opening `#saved` should show saved articles if they exist.
- If there are no saved articles, the empty state should appear near the top of the listing area, not buried at the bottom.
- Empty state copy may say something like: “No saved articles yet. Save articles from previews or article pages to find them here.”

### Popular posts behavior

Popular posts mode may use native Blogger PopularPosts widgets as source data. If Blogger does not render native popular data, the public UI should show a clear unavailable state instead of inventing fake popularity.

### Blog bugs to report

- `/` redirects incorrectly to `/landing`.
- `/` visually claims to be Home instead of Blog/editorial archive.
- Article listing is blank while content exists.
- Listing controls cannot be opened or dismissed.
- Saved article state does not persist locally.
- Empty saved state appears in an obviously wrong location.
- Popular posts mode creates fake-looking content instead of a clear unavailable state when native data is missing.
- Pagination links are missing when older/newer Blogger URLs exist.
- Pagination or filters overlap the dock or become untappable.

## 9. Article Preview Sheet

### Purpose

The preview sheet lets users inspect an article from the listing/search flow before opening the full post.

### Expected behavior

- Preview opens from article listing or search result.
- Preview shows title, metadata, summary/content excerpt, taxonomy/labels where available, and a read/open article CTA.
- Preview should handle loading state gracefully.
- Preview should not show raw dummy summaries or generic site metadata if better article data is available.
- The primary CTA row should remain usable near the sheet footer/bottom area, preferably sticky, so users can open the full article without scrolling back to the top.
- Save/unsave action should be available and update the saved state.
- Sheet can be closed by close button, Escape key, outside/back behavior where supported, and mobile sheet gesture where implemented.
- Focus should return to the triggering control after the sheet closes.

### Preview bugs to report

- Preview opens blank or with wrong article title.
- Preview cannot be closed.
- Preview CTA is missing, unreachable, or located in a confusing non-footer position.
- Save button state does not update.
- Preview scroll position is stale from a previous article.
- Preview content overlaps the CTA row or dock.
- Unhandled console errors occur when opening preview.

## 10. Article Detail / Post Detail Pages

### Purpose

Post detail pages are Blogger-owned SSR pages. They should keep canonical Blogger post URLs, readable article content, native comments when enabled, structured metadata, preview/share/save affordances, and related posts.

### Expected behavior

- Article title, date/metadata, and body content are readable without relying on JavaScript-only substitution.
- Native Blogger comments should remain available when comments are enabled.
- Save/unsave article should work locally.
- Share/copy link actions should work or fail gracefully with user feedback.
- Related posts should appear when enough related candidates exist.
- Detail page pagination and related posts are expected in the article/detail body area.
- Previous/next article controls are optional in body content, but they should not be placed inside a dock/table-of-contents treatment.
- The detail page should not reuse root listing pagination visual treatment incorrectly.

### Detail bugs to report

- Article body is empty or replaced by only shell UI.
- Comments are missing when they should be enabled.
- Related posts section breaks layout or loads unrelated blank cards.
- Detail pagination is placed in the wrong dock/TOC area.
- Share/save/comment buttons are not keyboard accessible.
- Back to Blog navigation is broken.
- Canonical post URL unexpectedly changes to a static route.

## 11. Page Detail Routes

Page detail routes, such as about/privacy/terms/contact pages, are Blogger-owned unless explicitly static like `/landing` and `/store`.

Expected behavior:

- Page content should be readable and match its route purpose.
- Breadcrumb/schema route truth should remain honest.
- Vanity redirects may exist, but the Worker should not fabricate normal page-detail content.

Report bugs if page details render blank, use the wrong route identity, or trap the user in overlays.

## 12. Contact Sheet and Contact Fallback

### Expected behavior

- Contact is accessible from the bottom dock and relevant CTAs.
- Blog contact may open a contact sheet.
- Landing contact may scroll to or expose the landing contact section.
- Store contact may navigate to a safe contact fallback such as `/landing#contact` or `/p/contact.html`.
- Contact sheet may include message intent, WhatsApp, email, and social/share fallback links.
- Social links belong in Contact, not in the More sheet.
- Internal plumbing/debug copy should not be visible to normal users.

The following style of internal text should not appear as visible public copy:

```txt
Ready to send through Blogger contact form plumbing.
Native Blogger ContactForm plumbing detected.
Fallback: open the contact page.
```

Blogger-native validation, captcha, or contact fallback may appear only if required, but it should be presented cleanly and not as developer/debug text.

### Contact bugs to report

- Contact button does nothing.
- Contact sheet opens but cannot close.
- Internal/debug plumbing text is visible.
- WhatsApp/email/social links are broken or malformed.
- More sheet incorrectly owns social links instead of Contact.
- Contact form appears to submit but gives no feedback or traps focus.

## 13. Search / Discovery

### Expected behavior

- Search opens from the bottom dock.
- Global Discovery can search routes, sections, article entries, topics, actions, and saved items where available.
- Store Discovery can search products, categories, and Store routes.
- Empty search state should be clear and not look broken.
- Search results should be tappable/clickable.
- Closing search should restore focus and scroll state.

### Search bugs to report

- Search input cannot receive focus.
- Typing causes JavaScript errors.
- Results are not clickable.
- Empty state appears as a blank screen.
- Search overlay cannot close.
- Search overlay blocks page after closing.

## 14. More Sheet and Preferences

### Expected behavior

More sheet should include:

- Profile card.
- Navigation: Home, Blog, Store, Contact.
- Discover: Search, Sitemap, RSS.
- Info: About, Privacy Policy, Terms of Use, Disclaimer.
- Preferences: Language, Appearance, Reading, Motion.

Expected preference behavior:

- Appearance can toggle light/dark if implemented.
- Reading mode can switch between comfortable/compact/focus if implemented.
- Motion can switch between balanced/reduced if implemented.
- Language can switch between English/Indonesia copy if implemented.
- Preference changes should persist locally when supported.

More sheet should not contain social share links. Those belong in Contact.

### More sheet bugs to report

- More sheet cannot open or close.
- Preference panels trap users.
- Preference changes break layout.
- Icons appear on the wrong side if the row design expects right-side icons.
- Social links appear in More sheet.
- Navigation routes from More are broken.

## 15. Yellow Cart Store: `/store`

### Purpose

Yellow Cart is a curated product/affiliate Store surface. It is static-prerendered and served via Cloudflare/static assets.

### Expected Store routes

```txt
/store
/store/fashion
/store/skincare
/store/workspace
/store/tech
/store/everyday
/store/{category}/page/{n} when pagination exists
```

The fallback public category is expected to be `everyday`, with label such as “Lainnya”. Legacy `/store/etc` should not be generated as a primary public route.

### Expected Store behavior

- `/store` shows Yellow Cart heading and product curation content.
- Product cards display category, title, price when available, short description, and actions.
- Category filters should filter visible products.
- Search opens Store Discovery and searches products/categories/routes.
- Product detail/editorial detail should open or navigate cleanly.
- “Open in Store” or equivalent external product links should open safely.
- Empty category/search states should be clear and not appear broken.
- Store contact should use safe contact fallback and must not fake Blogger ContactForm submission.
- Store should not use root/blog article listing UI as its primary product UI.

### Store dummy content rule

Current Store data may be small and placeholder-heavy. Do not report placeholder image URLs, generic product names, or dummy prices as critical bugs. Report them only as low-priority content notes if they are visibly embarrassing or if the user asks for production-content validation.

### Store bugs to report

- `/store` returns 404 or blank page.
- Store category routes do not resolve.
- Category filters do not change visible products.
- Store Discovery cannot open or search.
- Product cards are not tappable/clickable where they should be.
- Product detail/preview opens the wrong product.
- External links are malformed.
- Product card layout breaks on mobile.
- Store route displays Blog/Home identity instead of Yellow Cart.

## 16. Accessibility Expectations

TestSprite should check for practical accessibility regressions:

- Interactive controls are keyboard reachable.
- Buttons and links have understandable labels.
- Sheets/dialogs expose close controls.
- Focus is not trapped after closing overlays.
- Escape key closes modal/sheet overlays where supported.
- Tap targets are reasonably large on mobile.
- Text contrast should be readable in light/dark modes.
- Page can be used at common mobile widths without horizontal scrolling.
- Skip links should not break navigation.

Report serious accessibility bugs when users cannot operate primary flows.

## 17. Responsive and Visual Expectations

Expected visual behavior:

- Mobile-first layout should be stable at 360px width.
- Bottom dock should stay visible but not block final CTAs or important text.
- Sheets should fit viewport height and allow internal scrolling.
- Sticky preview CTA/footer should remain reachable.
- Listing and Store cards should not overflow horizontally.
- Typography should remain readable.
- Dark/light appearance should not make content invisible.
- Safe-area spacing should work on mobile devices with bottom browser bars/notches.

Report bugs for horizontal overflow, clipped buttons, unreadable text, overlapping sheets, broken sticky elements, or large layout shifts caused by interactions.

## 18. Performance and Stability Expectations

The app uses static assets, Blogger SSR, Cloudflare Worker/static routing, and lazy interaction scripts. TestSprite should report:

- Blank page or hydration failure.
- Uncaught JavaScript errors during primary flows.
- Infinite loading states.
- Major layout shift after opening/closing sheets.
- Broken CSS or missing runtime assets.
- Navigation loops or redirect loops.
- Slow interactions that make controls feel frozen.

Performance scores themselves are advisory during development. Do not treat a Lighthouse score alone as a product bug unless the UX is visibly broken.

## 19. External Integrations and Boundaries

External systems may include:

- Blogger origin for blog listing, post detail, pages, comments, contact widgets, feeds, labels, search, and PopularPosts.
- Cloudflare Worker/static route governance.
- WhatsApp and email links for contact.
- Social share URLs.
- Marketplace/affiliate links.
- Placeholder image hosts during development.

Expected behavior is graceful navigation or fallback. TestSprite should not require successful completion of third-party login, captcha, marketplace purchase, social share posting, or email-client sending.

## 20. Bug Severity Guidance

### Critical

Report as critical if:

- Main route `/`, `/landing`, or `/store` is blank or unusable.
- Primary navigation is broken across the app.
- A modal/sheet traps the user with no exit.
- JavaScript crash prevents reading, browsing, search, or Store use.
- Mobile layout makes main content inaccessible.

### High

Report as high if:

- Article preview cannot open or open article CTA is missing.
- Saved articles do not save or persist locally.
- Store product cards/categories/search do not work.
- Contact is inaccessible from primary surfaces.
- Post detail content or comments are missing unexpectedly.
- Route identity is wrong, e.g. `/` behaves as Home or `/store` behaves as Blog.

### Medium

Report as medium if:

- Empty states are confusing or placed in the wrong area.
- Focus restoration is inconsistent.
- Preference toggles do not persist.
- Related posts are missing when candidates exist.
- CTA row location is inconvenient but still usable.
- Visual overlap affects secondary content.

### Low / Content Note

Report as low/content note if:

- Dummy content looks unfinished.
- Product images are placeholders.
- Product prices/names are generic.
- Copy needs polish but functionality is correct.
- External third-party destination behaves differently than expected.

## 21. Recommended Test Flows

### Flow A — Landing to Blog

1. Open `/landing`.
2. Confirm intro/rubrics/FAQ/contact sections are readable.
3. Click Blog/Read CTA.
4. Confirm navigation goes to `/`.
5. Open Search and More, then close both.
6. Confirm focus and scroll remain usable.

### Flow B — Blog Listing Preview and Save

1. Open `/`.
2. Open an article preview from the listing.
3. Confirm title/content/CTA render.
4. Save the article.
5. Close preview.
6. Open `#saved` mode or Saved filter.
7. Confirm saved article appears.
8. Remove/unsave and confirm empty state appears near top of listing area.

### Flow C — Blog Detail

1. Open a full article/post detail page from preview or listing.
2. Confirm article title and body are readable.
3. Try save/share/comment actions if visible.
4. Confirm related posts area appears or empty state is graceful.
5. Confirm pagination/prev-next controls are in detail body area when present, not inside dock/TOC treatment.
6. Navigate back to Blog.

### Flow D — Search / Discovery

1. Open Search from dock.
2. Type a common query.
3. Confirm results or clear empty state.
4. Open a result.
5. Close Search.
6. Repeat on `/landing`, `/`, and `/store`.

### Flow E — More and Preferences

1. Open More from dock.
2. Navigate to Home, Blog, Store, and Contact entries.
3. Open preference panels.
4. Toggle Appearance, Reading, Motion, and Language where available.
5. Confirm changes are visible and do not break layout.
6. Close More and confirm focus returns.

### Flow F — Store Browse

1. Open `/store`.
2. Confirm Yellow Cart heading and product cards render.
3. Use category filters: Fashion, Skincare, Workspace, Tech, Lainnya/Everyday.
4. Open product editorial/detail action.
5. Open external product link if available.
6. Open Store Search/Discovery and search a product/category.
7. Confirm Store Contact fallback works.

### Flow G — Responsive Regression

1. Repeat key flows at mobile width around 360px.
2. Repeat key flows at tablet width around 768px.
3. Repeat key flows at desktop width around 1280px.
4. Check dock overlap, sheet height, sticky CTA, text wrapping, and horizontal overflow.

## 22. Out of Scope for This Test Run

Do not treat the following as required production pass/fail items unless the user asks for content readiness testing:

- Final editorial quality of all copy.
- Final product catalog completeness.
- Real product inventory, availability, or price accuracy.
- Real marketplace checkout.
- Real social posting completion.
- Final SEO ranking, indexing, AI overview inclusion, or traffic.
- Final production robots/indexing if flags remain in development mode.
- Replacing Blogger native behavior.

## 23. Acceptance Criteria

The build is acceptable for this TestSprite pass if:

- `/landing`, `/`, and `/store` render the correct surfaces.
- Users can navigate between Home, Blog, Store, Contact, Search, and More.
- Article preview opens, displays usable information, has a reachable CTA, and can close.
- Saved article behavior works locally or fails gracefully if localStorage is unavailable.
- Blog detail pages remain readable and preserve Blogger-owned content/comments behavior.
- Store product browsing, filtering, search, and product actions are usable.
- Contact entry points are usable and do not expose internal/debug plumbing copy.
- Sheets and overlays are closable and do not trap focus.
- Mobile layout does not block primary content or CTAs.
- Dummy content remains clearly non-final but does not break UX.

