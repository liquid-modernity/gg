# TASK-NAV-001 — Unify Dock and More Sheet IA Across Landing, Blog, and Store

## Status

Development task.

Threaded comments are frozen. Do not modify threaded comment behavior, Blogger native comment plumbing, reply targeting, composer movement, `parentID`, `View replies`, replies sheet, or comments proof logic.

## Context

`/landing`, `/`, and `/store` are one product system.

Current issue:
- `/landing`, `/`, and `/store` use different dock / More sheet structures.
- `/landing` still behaves like a separate static page.
- `/store` has a different commerce-oriented More sheet rhythm.
- `/` has the more mature visual grammar.
- The public-facing route truth is not fully reflected in the UI.
- The label “Landing” appears or is implied in places where the user-facing label should be “Home” / “Beranda”.
- On `/landing`, the dock `Home` action currently behaves like page reload/navigation. It should scroll to top.

Goal:
Unify dock behavior, More sheet information architecture, copy registry, and visual rhythm across `/landing`, `/`, `/store`, post detail, and page detail, while preserving route-specific behavior.

## Route Truth

Public IA must follow this truth:

- `/landing` = Home / Beranda
- `/` = Blog
- `/store` = Store
- `/landing#contact` = Contact / Kontak

Do not expose the label `Landing` in public UI.

## Non-Negotiables

- Do not change threaded comments behavior.
- Do not change Blogger native comment plumbing.
- Do not change `GG.commentsProof()` semantics except if adding unrelated nav proof fields.
- Do not change route truth.
- Do not change development robots/indexing policy.
- Do not introduce Worker canonical rewrites in this task.
- Do not redesign the whole dock.
- Do not add heavy new runtime dependencies.
- Keep the site development-safe.
- Keep template proof, copy registry guard, and comments proof passing.

## Required Global Dock Contract

Use the same primary dock rhythm across:

- `/landing`
- `/`
- `/store`
- post detail pages
- static page detail pages

Dock order:

```txt
Home | Contact | Search | Blog | More

Localized labels:

EN:

Home | Contact | Search | Blog | More

ID:

Beranda | Kontak | Cari | Blog | Lainnya

If icon-only dock is used, labels must still exist as accessible labels / aria labels.

Required Dock Behavior
On /landing
Home scrolls to top.
Contact scrolls to #contact.
Search opens Discovery/Search sheet.
Blog navigates to /.
More opens More sheet.

Important:
Home on /landing must not reload the page and must not re-navigate to /landing.

On /
Home navigates to /landing.
Contact navigates to /landing#contact.
Search opens Discovery/Search sheet.
Blog scrolls to top.
More opens More sheet.

Important:
Blog on / must not reload the page.

On /store
Home navigates to /landing.
Contact navigates to /landing#contact.
Search opens Discovery/Search sheet unless a dedicated store search is already available and intentionally wired.
Blog navigates to /.
More opens More sheet.
On post detail pages
Home navigates to /landing.
Contact navigates to /landing#contact.
Search opens Discovery/Search sheet.
Blog navigates to /.
More opens More sheet.
On static page detail pages
Home navigates to /landing.
Contact navigates to /landing#contact.
Search opens Discovery/Search sheet.
Blog navigates to /.
More opens More sheet.
Required More Sheet IA

The More sheet must use one unified structure across /landing, /, /store, post detail, and page detail.

The More sheet may have route-aware notes, but the core IA must remain the same.

EN More Sheet

Title:

More

Sections:

NAVIGATION
Home
Blog
Store
Contact

DISCOVER
Search
Sitemap
RSS

INFO
About PakRPP
Privacy Policy
Terms of Use
Disclaimer

LANGUAGE
English
Indonesia

APPEARANCE
System
Light
Dark

Share site
X
FB
WA

Copyright © 2026 PakRPP. All rights reserved.
ID More Sheet

Title:

Lainnya

Sections:

NAVIGASI
Beranda
Blog
Store
Kontak

JELAJAH
Cari
Peta situs
RSS

INFO
Tentang PakRPP
Kebijakan Privasi
Syarat Penggunaan
Disclaimer

BAHASA
English
Indonesia

TAMPILAN
Sistem
Terang
Gelap

Bagikan situs
X
FB
WA

Hak Cipta © 2026 PakRPP. Semua hak dilindungi.
More Sheet Layout Guidance

Use a calm native-app-like hierarchy.

Recommended structure:

Sheet handle
Centered title
NAVIGATION as primary bridge
DISCOVER as utility/discovery layer
INFO as quiet trust/legal layer
LANGUAGE segmented control
APPEARANCE segmented control
Share row
Optional route-specific note
Copyright

Do not place legal/info links above NAVIGATION or DISCOVER.

Do not make legal/info links look like primary CTAs.

INFO section must be visually lower priority than NAVIGATION.

Navigation Section Layout

Preferred layout:

NAVIGATION can use a 2-column button grid on mobile/tablet/desktop.
Home / Blog / Store / Contact should have equal visual treatment.
Active route may be visually indicated, but must not become visually loud.

Example:

NAVIGATION
[ Home   ] [ Blog    ]
[ Store  ] [ Contact ]

ID:

NAVIGASI
[ Beranda ] [ Blog   ]
[ Store   ] [ Kontak ]
Discover Section Layout

DISCOVER should be quieter than NAVIGATION.

Items:

Search / Cari
Sitemap / Peta situs
RSS

Recommended layout:

quiet list rows, or
compact pill/list rows, depending on existing / More sheet rhythm.

Do not make RSS visually dominant.

Info / Legal Section

Add an INFO section across all routes.

EN
INFO
About PakRPP
Privacy Policy
Terms of Use
Disclaimer
ID
INFO
Tentang PakRPP
Kebijakan Privasi
Syarat Penggunaan
Disclaimer

Recommended route targets:

About PakRPP       -> /p/about.html
Privacy Policy     -> /p/privacy-policy.html
Terms of Use       -> /p/terms-of-use.html
Disclaimer         -> /p/disclaimer.html

If these pages do not exist yet:

wire route constants only, or
use existing Blogger page URLs if available,
do not invent Worker canonical rewrites in this task.

Use Terms of Use, not Terms & Conditions.

Reason:
PakRPP is not a full checkout marketplace. Terms of Use is cleaner, lighter, and more appropriate for editorial/product/affiliate surfaces.

Store-Specific Commerce Note

On /store only, include a small quiet commerce note near the footer, before copyright.

EN:

Some outbound links may be affiliate links. Prices and availability may change.

ID:

Beberapa tautan keluar dapat bersifat afiliasi. Harga dan ketersediaan dapat berubah.

Do not show this commerce note globally unless the current surface contains commerce/affiliate links.

The note must be visually quiet and must not look like an alert.

Language Section

LANGUAGE / BAHASA must use the same segmented-control rhythm across /landing, /, and /store.

Labels:

EN context:

English
Indonesia

ID context:

English
Indonesia

Do not use EN and ID if the current / More sheet standard uses full labels. Choose one standard and apply it everywhere.

Preferred:

English | Indonesia
Appearance Section

APPEARANCE / TAMPILAN must use the same segmented-control rhythm across /landing, /, and /store.

EN:

System
Light
Dark

ID:

Sistem
Terang
Gelap

The selected state must be visually consistent across all routes.

Footer / Share Section

Use the same footer rhythm across /landing, /, and /store.

EN:

Share site
X
FB
WA
Copyright © 2026 PakRPP. All rights reserved.

ID:

Bagikan situs
X
FB
WA
Hak Cipta © 2026 PakRPP. Semua hak dilindungi.

Share icons/buttons must be quiet and consistent.

Do not make share buttons look like primary navigation.

Visual Contract

The More sheet on /landing, /, and /store must share:

same sheet width target;
same --gg-panel-width behavior;
same max-width rhythm;
same handle;
same centered title treatment;
same section heading style;
same divider rhythm;
same button radius;
same segmented-control style;
same active state treatment;
same footer/social rhythm;
same bottom safe-area spacing;
same mobile/tablet/desktop rhythm.

Use the current / dock and More sheet visual rhythm as the baseline unless a more centralized token already exists.

Preferred width target:

--gg-panel-width: 600px;

Do not create separate visual systems for landing, blog, and store.

Copy Registry Requirements

All visible labels must be registry-driven where registry infrastructure exists.

Add or normalize keys.

Core Nav
nav.home
nav.blog
nav.store
nav.contact
nav.search
nav.more
More Sheet
more.title
more.section.navigation
more.section.discover
more.section.info
more.section.language
more.section.appearance
more.shareSite
more.commerceNote
Discover
more.search
more.sitemap
more.rss
Info / Legal
more.about
more.privacy
more.terms
more.disclaimer
Appearance
appearance.system
appearance.light
appearance.dark
Language
language.english
language.indonesia
Footer
footer.copyright

Do not hardcode visible EN/ID strings directly in runtime source if registry support exists.

Required EN Copy
{
  "nav.home": "Home",
  "nav.blog": "Blog",
  "nav.store": "Store",
  "nav.contact": "Contact",
  "nav.search": "Search",
  "nav.more": "More",

  "more.title": "More",
  "more.section.navigation": "Navigation",
  "more.section.discover": "Discover",
  "more.section.info": "Info",
  "more.section.language": "Language",
  "more.section.appearance": "Appearance",
  "more.search": "Search",
  "more.sitemap": "Sitemap",
  "more.rss": "RSS",
  "more.about": "About PakRPP",
  "more.privacy": "Privacy Policy",
  "more.terms": "Terms of Use",
  "more.disclaimer": "Disclaimer",
  "more.shareSite": "Share site",
  "more.commerceNote": "Some outbound links may be affiliate links. Prices and availability may change.",

  "appearance.system": "System",
  "appearance.light": "Light",
  "appearance.dark": "Dark",

  "language.english": "English",
  "language.indonesia": "Indonesia",

  "footer.copyright": "Copyright © 2026 PakRPP. All rights reserved."
}
Required ID Copy
{
  "nav.home": "Beranda",
  "nav.blog": "Blog",
  "nav.store": "Store",
  "nav.contact": "Kontak",
  "nav.search": "Cari",
  "nav.more": "Lainnya",

  "more.title": "Lainnya",
  "more.section.navigation": "Navigasi",
  "more.section.discover": "Jelajah",
  "more.section.info": "Info",
  "more.section.language": "Bahasa",
  "more.section.appearance": "Tampilan",
  "more.search": "Cari",
  "more.sitemap": "Peta situs",
  "more.rss": "RSS",
  "more.about": "Tentang PakRPP",
  "more.privacy": "Kebijakan Privasi",
  "more.terms": "Syarat Penggunaan",
  "more.disclaimer": "Disclaimer",
  "more.shareSite": "Bagikan situs",
  "more.commerceNote": "Beberapa tautan keluar dapat bersifat afiliasi. Harga dan ketersediaan dapat berubah.",

  "appearance.system": "Sistem",
  "appearance.light": "Terang",
  "appearance.dark": "Gelap",

  "language.english": "English",
  "language.indonesia": "Indonesia",

  "footer.copyright": "Hak Cipta © 2026 PakRPP. Semua hak dilindungi."
}
Interaction Requirements
Scroll-to-top behavior

For current-route primary item:

On /landing, clicking/tapping Home scrolls to top.
On /, clicking/tapping Blog scrolls to top.

Use smooth scroll only if it respects reduced motion.

Required behavior:

prefers-reduced-motion: reduce -> instant scroll or minimal motion
normal mode -> smooth scroll allowed

Do not reload the page.

Do not change URL unnecessarily.

Contact behavior

From /landing:

scroll to #contact.

From all other routes:

navigate to /landing#contact.

If landing is already loaded and hash navigation is used, ensure final scroll lands correctly after page load.

Search behavior

Search must open the existing Discovery/Search sheet.

Do not build a new search system in this task.

If /store has a dedicated store search already implemented and intentionally wired, it may open that. Otherwise use global Discovery/Search.

Active State

Active state must reflect current route:

/landing active = Home
/ active = Blog
/store may not have a dock primary item, but Store must be active in More sheet Navigation if active states exist there.
post detail active = Blog
static page detail active may be neutral or Blog depending on existing route classification.

Do not over-highlight.

Accessibility Requirements
More sheet title must be announced correctly.
Buttons/links must have accessible labels.
Icon-only dock items must have aria-label.
Current route item may use aria-current="page" where semantically correct.
Sheet close/dismiss behavior must remain keyboard accessible.
Segmented controls must expose selected state.
Focus trap behavior must not regress if already implemented.
Escape/back behavior must not regress.
Reduced motion must be respected for scroll-to-top.
Files Likely In Scope

Actual filenames may vary. Inspect repository before editing.

Likely areas:

index.xml
landing.html
store.html
template/index.original.xml
template/partials/*
registry/copy/gg-copy-en.json
registry/copy/gg-copy-id.json
gg-copy-en.json
gg-copy-id.json
src/js/*
src/css/*
tools/template-pack.mjs
qa/*

Do not edit unrelated threaded comment source except if a shared copy/nav registry file requires harmless key additions.

QA / Proof Requirements

Run:

npm run gaga:template:pack
npm run gaga:template:proof
npm run gaga:verify-comments-proof
node qa/copy-registry-guard.mjs

If a nav/more proof script exists, run it.

If no nav/more proof exists, add a lightweight static proof script.

Recommended new script:

qa/nav-more-contract-guard.mjs

Recommended npm alias:

npm run gaga:verify-nav-more

The guard should check at minimum:

public UI copy does not expose Landing;
EN/ID copy keys exist;
More sheet includes NAVIGATION / DISCOVER / INFO / LANGUAGE / APPEARANCE keys;
Store route exists in More sheet copy/config;
legal/info keys exist;
commerce note key exists;
publish artifact does not regress to dev CSS if current architecture already prevents it;
threaded comments proof still passes separately.
Manual Proof Matrix

Manually verify:

Routes:

/landing
/
/store
one post detail page
one static page detail page

Viewports:

mobile 390
tablet 768
desktop 1280

Required manual proof:

/landing
Dock visual rhythm matches /.
More sheet visual rhythm matches /.
Dock Home scrolls to top and does not reload.
Dock Contact scrolls to #contact.
Dock Search opens Discovery/Search.
Dock Blog navigates to /.
More sheet does not show Landing.
More sheet includes Store.
More sheet includes INFO links.
/
Dock visual rhythm remains canonical.
Dock Blog scrolls to top and does not reload.
Dock Home navigates to /landing.
Dock Contact navigates to /landing#contact.
More sheet includes Home, Blog, Store, Contact.
More sheet includes Search, Sitemap, RSS.
More sheet includes About, Privacy Policy, Terms of Use, Disclaimer.
/store
Dock visual rhythm matches /.
More sheet visual rhythm matches /.
More sheet includes Home, Blog, Store, Contact.
Store appears as current/active in More sheet if active state exists.
Commerce note appears.
Commerce note is quiet.
Commerce note does not appear globally on non-commerce routes.
Post detail
Dock visual rhythm matches /.
Home navigates to /landing.
Contact navigates to /landing#contact.
Blog navigates to /.
Search opens Discovery/Search.
Threaded comments still pass.
Static page detail
Dock visual rhythm matches /.
More sheet uses the same IA.
INFO/legal pages do not create broken self-navigation loops.
Acceptance Criteria

Task is accepted only if:

/landing, /, and /store share one dock visual rhythm.
/landing, /, and /store share one More sheet IA.
Public UI does not expose Landing.
Home on /landing scrolls to top, not reload.
Blog on / scrolls to top, not reload.
Store is available from More sheet globally.
About, Privacy Policy, Terms of Use, and Disclaimer are available from More sheet globally.
/store only shows the commerce note.
Copy is registry-driven.
EN/ID root copy files remain correctly mapped.
No threaded comment behavior changes.
All required proof commands pass.
Required Final Report

When complete, report:

TASK-NAV-001 completed.

Changed:
- Unified dock rhythm across routes: YES/NO
- Unified More sheet IA: YES/NO
- Removed public Landing label: YES/NO
- Added INFO/legal section: YES/NO
- Added Store bridge: YES/NO
- Added store-only commerce note: YES/NO
- Home on /landing scrolls to top: YES/NO
- Blog on / scrolls to top: YES/NO
- Copy registry updated: YES/NO
- Threaded comments behavior changed: NO

Verification:
- npm run gaga:template:pack: PASS/FAIL
- npm run gaga:template:proof: PASS/FAIL
- npm run gaga:verify-comments-proof: PASS/FAIL
- node qa/copy-registry-guard.mjs: PASS/FAIL
- nav/more proof if available: PASS/FAIL

Manual proof:
- /landing mobile/tablet/desktop: PASS/FAIL
- / mobile/tablet/desktop: PASS/FAIL
- /store mobile/tablet/desktop: PASS/FAIL
- post detail mobile/tablet/desktop: PASS/FAIL
- static page detail mobile/tablet/desktop: PASS/FAIL

Notes:
- Any unresolved route/legal page placeholders.
- Any intentionally deferred Worker canonical rewrite.
- Any intentionally deferred store-specific search behavior.
Out of Scope

Do not handle these in this task:

Store category pages.
Discovery redesign.
PWA install prompt.
Lighthouse gate.
Native Blogger comments lazy loading.
Worker canonical route rewrite for legal pages.
New admin/control plane.
Full footer redesign.
New visual identity.
New icon system.
New search backend.

This is the correct next task. It is narrow enough for Codex, but it closes the real UX inconsistency instead of pretending the issue is only “copy”.