TASK: Fix /store Core Web Vitals regression: FCP/LCP/Speed Index ~22s and CLS 0.606.

Context:
Current Lighthouse metrics are severe:
- FCP: 21.9s
- LCP: 22.7s
- CLS: 0.606
- Speed Index: 21.9s
- TBT: 0ms

Interpretation:
JavaScript blocking is not the main problem. The page is painting too late and shifting heavily after dynamic content loads.

Do NOT change:
- /store route/canonical
- dock vocabulary
- i18n system
- template rendering architecture
- Worker routes
- semantic/SEO plans
- marketplace CTA hierarchy

Goal:
Make the static shell paint immediately, prevent layout shift, and keep product hydration progressive.

A. Add immediate paint shell

Ensure the following are visible from initial HTML before feed fetch:
- Yellow Cart hero
- summary/disclosure
- meta row loading text
- category/context placeholder if present
- skeleton grid

Do not hide the shell behind JS state.

B. Add skeleton grid with reserved 4:5 layout

Add static skeleton markup in body:

<section class="store-grid store-grid--skeleton" id="store-grid-skeleton" aria-hidden="true">
  8 skeleton cards minimum
</section>

Each skeleton card must reserve:
- 4:5 aspect ratio
- same grid columns as real grid
- same gap
- no layout jump when replaced

CSS:
- .store-card--skeleton .store-card__media has aspect-ratio: 4 / 5
- use calm shimmer or no animation
- respect prefers-reduced-motion

When products render:
- hide skeleton
- render real grid
- do not shift meta/hero/dock

C. Reduce initial product render

Change:
VISIBLE_INITIAL from 24 to responsive smaller initial count.

Suggested:
- default mobile: 8
- tablet/desktop: 12
- step: 8 or 12

Implementation:
function initialVisibleLimit() {
  return window.matchMedia('(min-width: 720px)').matches ? 12 : 8;
}

Use this on initial load and resize if safe.

D. Improve image priority

When binding card images:
- first 2 visible card images: loading="eager", fetchPriority="high"
- next few visible images: loading="eager" or lazy depending viewport
- below initial viewport: loading="lazy"

Do not preload all product images.

E. Async-load Material Symbols

Current Google Material Symbols stylesheet in head can block first paint.

Change icon font loading so it does not block FCP:
Option 1:
- preload stylesheet
- onload rel='stylesheet'
- noscript fallback stylesheet

Example:
<link rel="preload" as="style" href="..." onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>

Option 2:
- self-host/subset Material Symbols later
- ensure text labels are usable before icons load

Acceptance:
- Text shell paints even if icon font is delayed.
- No FOIT-like blank shell due to icon CSS.

F. Guard against CLS from dynamic semantic sections

Any new category/semantic/SEO sections must reserve space or render stable initial placeholders.

Rules:
- Do not insert large content above grid after first paint without reserved space.
- Category context should exist in initial HTML.
- Semantic product layer should render below grid or reserve space.

G. Add web-vitals debug helper for local QA

Optional but useful:
Add a dev-only lightweight PerformanceObserver behind a flag:
- ?debugVitals=1
- logs LCP element
- logs CLS shift sources
- logs first paint timings

Do not ship noisy logs by default.

H. QA updates

Update qa/store-artifact-smoke.sh to check:
- store-grid-skeleton exists
- skeleton cards reserve aspect-ratio 4/5
- VISIBLE_INITIAL is not hardcoded to 24
- initialVisibleLimit exists
- Material Symbols is not loaded as render-blocking stylesheet
- no display:none or hidden on hero/store shell
- category context, if added, is initially present
- prefers-reduced-motion respected for skeleton animation

I. Manual tests

Run Lighthouse mobile after deploy and compare:
- FCP < 2s target
- LCP < 2.5s target
- CLS < 0.1 target
- Speed Index < 3.4s target
- TBT remains low

Also inspect Lighthouse:
- LCP element
- Layout shift culprits
- Render-blocking resources
- Network waterfall

Final acceptance:
- /store paints shell quickly without waiting for feed.
- Feed hydration does not cause visible layout jump.
- Icons do not block first paint.
- Initial product render is smaller and progressive.
- CLS drops below 0.1.