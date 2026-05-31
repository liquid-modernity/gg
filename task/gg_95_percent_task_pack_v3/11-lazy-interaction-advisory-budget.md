# Task 11 — Lazy Interaction & Advisory Budget

## Objective

Move non-critical interaction systems out of initial boot where safe, while keeping SSR, semantic HTML, schema, accessibility, and essential navigation intact.

Performance budgets are advisory unless strict release mode is explicitly requested.

## Hard Constraints

- Do not lazy-load SSR-critical HTML.
- Do not lazy-load route-critical schema that must be present in HTML.
- Do not break Reader Mode eligibility for post details.
- Do not break sheet/data contracts.
- Do not turn budget warnings into `CONTRACT_FAILURE` during normal development.
- Do not remove UX features purely to satisfy a metric.

## Lazy-Load Candidates

Move behind interaction/route need where safe:

```txt
preview fetch/parser
comments enhancement
discovery filter/search
store discovery enhancements
share poster
saved reading
PWA extras
non-critical analytics
heavy animation helpers
non-critical visual effects
```

## Do Not Lazy-Load

Do not defer if required for first meaningful output:

```txt
critical theme bootstrap
basic route detection
essential shell layout
visible SSR content
canonical links
SEO meta tags
route-critical JSON-LD
basic visible navigation/dock
post detail article content
product detail core content
```

## Route-Level Strategy

### Root `/`

Prioritize:

```txt
SSR listing
semantic HTML
basic navigation/dock
minimal preview trigger binding
```

Lazy after intent:

```txt
preview fetch/render
discovery sheet
saved reading
share poster
```

### Post Detail

Prioritize:

```txt
article content
semantic structure
Article/BlogPosting schema
basic navigation
Reader Mode eligibility
```

Lazy after intent:

```txt
comments enhancement
share poster
saved reading
related interaction enhancements
```

### Landing

Prioritize:

```txt
semantic sections
above-the-fold content
primary CTA
minimal navigation
```

Lazy after intent:

```txt
secondary animation
non-critical interactive demos
heavy media
```

### Store

Prioritize:

```txt
semantic product/catalog structure
initial visible product cards
Product/ItemList schema where valid
canonical public URLs
```

Lazy after intent:

```txt
filters/search/sort enhancement
store preview fetch
heavy images below fold
product comparison widgets
```

## Advisory Budget Reporting

Budget warnings should report:

```txt
route
asset type
current size/cost
recommended action
blocking status: advisory unless strict release mode
```

## Acceptance Criteria

- Essential SSR/schema/navigation remain intact.
- Heavy interactions are lazy where safe.
- Lighthouse/performance warnings remain advisory in development.
- Strict release mode can promote selected budgets to blockers only if explicitly configured.
- No UX feature is removed without a documented replacement.
