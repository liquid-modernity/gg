# Mixed‑Media Layout Spec — Quiet Luxury (pakrpp.com/blog)

You want /blog to feel like a premium media front page **without** turning it into a noisy portal. The hard truth:
**10+ section types will look chaotic unless they share one visual language and one loading contract.**
So this spec forces: one component system, predictable rhythm, strict performance budgets, and SSR-safe behavior.

---

## 1) Non‑Negotiables (Quiet Luxury + PWA discipline)

### Visual
- One typography system, one spacing rhythm, one border/shadow style.
- Variants differ by **ratio + arrangement**, not by random colors/ornaments.
- Section headers are quiet: small overline label + title + “See all”.

### Performance
- Above-the-fold: **≤ 1 feed fetch** (or 0 if you prebundle).
- Below-the-fold: lazy-load via `IntersectionObserver`, concurrency max **2**.
- Never hide SSR content (`visibility:hidden`) to show skeletons. Skeleton must be overlay.
- No CLS: reserve image aspect-ratio boxes; don’t insert variable-height media late.

### SEO
- Do **not** rely on mixed-media JS content for indexing.
- Treat it as engagement UX. Primary crawlable content remains Blog1 listing/postcards.
- All injected items are real `<a href>` links (so bots/users can follow).

---

## 2) Data Model (what each section declares)

Each section is a “slot” with strict attributes:

```html
<section class="gg-mixed" id="gg-mixed-bookish"
  data-gg-mixed="1"
  data-type="bookish"
  data-label="Bookish"
  data-max="8"
  data-order="published"
  data-thumb="auto">
  <header class="gg-mixed__hd">
    <div class="gg-mixed__kicker">BOOKISH</div>
    <h2 class="gg-mixed__title">Bookish</h2>
    <a class="gg-mixed__more" href="/search/label/Bookish">See all</a>
  </header>
  <div class="gg-mixed__bd">
    <div class="gg-mixed__grid" data-role="grid"></div>
    <div class="gg-mixed__skeleton" data-role="skeleton" aria-hidden="true"></div>
    <div class="gg-mixed__error" data-role="error" hidden></div>
  </div>
</section>
```

Attributes:
- `data-type`: one of: `bookish | youtubeish | shortish | newsish | podcastish | instagramish | popular | pinterestish`
- `data-label`: Blogger label to query
- `data-max`: item count
- `data-order`: `published` (default). Note: Blogger feeds don’t truly support “popular by views” without extra infra.
- `data-thumb`: `auto | force | off`

---

## 3) Feed Strategy (don’t sabotage yourself)

### Option A (recommended): **1–2 fetch, then client-side group by label**
- Fetch `/feeds/posts/summary?alt=json&max-results=60` once.
- Group entries by their `category` labels.
- Fill each section by slicing the grouped arrays.
- Pros: fastest, simplest, lowest failure surface.
- Cons: if you need deep back-catalog per label, you’ll run out.

### Option B (acceptable): per-label fetch **only when section enters viewport**
- For each section: fetch `/feeds/posts/summary?alt=json&max-results=N&q=label:LABEL`
- Pros: accurate per label.
- Cons: network spam, slow feeling, more flake.

**Quiet luxury choice:** Option A above fold + Option B only for rare sections.

---

## 4) JS Wiring Contract (no framework, no new deps)

Create a small module, e.g. `GG.mixed` (or `GG.modules.mixedFeed`) with:
- `init(root=document)` to discover `[data-gg-mixed="1"]` slots
- `observe(slot)` with `IntersectionObserver`
- `load(slot)` fetch+render with caching
- in-memory cache key: `label|max|order|q`
- optional persistence: `sessionStorage` (small), or your existing `GG.store` if it’s stable.

Pseudo‑flow:
1. On boot, initialize observer.
2. For the first 1–2 sections above fold: call `load()` immediately.
3. All others: lazy-load when `slot` is near viewport (`rootMargin: "800px 0px"`).
4. Render:
   - build `DocumentFragment`
   - set `grid.replaceChildren(fragment)`
   - hide skeleton
5. On error: show quiet error + “Retry”.

**Critical:** set `slot.dataset.ggLoaded="1"` so router re-renders don’t refetch.

---

## 5) Card Kit (one family, many layouts)

### Core card markup
```html
<a class="gg-card gg-card--{variant}" href="...">
  <span class="gg-card__media" aria-hidden="true">
    <img ... loading="lazy" decoding="async" />
  </span>
  <span class="gg-card__meta">
    <span class="gg-card__kicker">Label</span>
    <span class="gg-card__title">Title…</span>
    <span class="gg-card__sub">date • 2 min</span>
  </span>
</a>
```

### Aspect ratio rules
- Bookish: 1 : 1.48 (portrait)
- Youtubeish: 16 : 9
- Shortish: 9 : 16
- Podcastish: 1 : 1
- Instagramish: 2 : 3 (your “4:6”)
- Popular: 1 : 1.48 (but smaller)

### Quiet luxury styling rules
- Minimal borders, subtle radius consistent with GG tokens
- No heavy shadows; use “glass” sparingly
- Titles max 2 lines; no screaming uppercase except small kicker

---

## 6) Layout per type (what it looks like)

### A) BOOKISH (8 items, ratio 1:1.48)
- Grid: desktop 4 cols; small desktop 3; tablet 2; mobile 2 (or 1 if too tight)
- Each card: media top, title below.

### B) YOUTUBEISH (rail horizontal, 16:9)
- Horizontal scroll with `scroll-snap-type:x mandatory`
- Each item fixed width (e.g. 320–420px) and snaps.
- Optional play glyph as CSS mask (subtle).

### C) YOUTUBE SHORTISH (rail horizontal, 9:16)
- Same as youtubeish, but narrower (e.g. 180–240px).

### D) NEWSISH 1–4 (complex 3 items)
- 1 lead + 2 supporting:
  - Lead: wide card (16:9 or 3:2) occupying 2 columns
  - Supporting: stacked list with tiny thumbnails
- Must use one template for all 4 sections to avoid visual fragmentation.

### E) PODCASTISH (square rail, 1:1)
- Horizontal rail, square covers, calm typography.

### F) INSTAGRAMISH (grid 2:3)
- Grid: 3–4 cols desktop, 2 cols mobile
- Tight spacing, but still breathable.

### G) POPULAR POST (16 items, show thumb)
- Grid: 4 cols desktop, 3 small desktop, 2 tablet, 2 mobile
- Smaller title style, emphasis on scan.

### H) PINTERESTISH (masonry/waterfall)
Brutal truth: Masonry is a CLS machine if you’re not careful.
If you insist:
- Use CSS columns (`column-count`) + fixed aspect ratio cards to reduce reflow.
- Or drop true masonry and fake it with uniform cards (preferred for luxury/perf).

---

## 7) CSS Placement (critical vs main.css)

### Critical CSS (XML)
Only:
- Section container spacing + header typography base
- `.gg-mixed__grid` display type (grid/rail) so first paint doesn’t jump
- `.gg-card__media` aspect ratio boxes (so images don’t cause CLS)

### main.css
Everything else:
- Card visuals, hover states, rail scroll snap, skeleton shimmer (subtle)

---

## 8) Accessibility (don’t fake luxury)
- Rails must be keyboard-scrollable; focus visible on cards.
- Provide “Skip section” links if needed (optional).
- `aria-label` on section “See all”.
- Don’t trap scroll.

---

## 9) Acceptance Tests (you can automate)
- No network calls for below-fold sections until they near viewport.
- Grid/rail layout does not change when data arrives (no CLS).
- `/blog` first paint: postcards + at least first mixed section are stable.
- Lighthouse: CLS near 0, no layout shift spikes on navigation.

---

## 10) Implementation Order (fastest path)
1) Scaffold markup for all sections in XML (but render only 2–3 initially).
2) Build the card kit + 2 layouts: `bookish` grid + `youtubeish` rail.
3) Add `newsish` complex 3-item template.
4) Expand to other types.
5) Add Popular + (optional) Pinterestish last.

If you build Pinterestish early, you’ll waste time fighting layout shift.
