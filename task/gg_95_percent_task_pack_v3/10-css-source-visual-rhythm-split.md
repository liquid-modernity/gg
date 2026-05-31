# Task 10 — CSS Source & Visual Rhythm Split

## Objective

Clarify CSS ownership, remove obvious duplicate/patch layers, keep one visual rhythm, and make route/surface CSS easier to maintain without micromanaging design.

## Hard Constraints

- Do not introduce override CSS on top of old CSS.
- Do not enforce overly strict selector naming, spacing, token, color, radius, or declaration-order rules.
- Do not make normal manual edits in `src/css` difficult.
- Do not require every component to have a separate CSS file.
- Do not manually patch generated CSS.
- Do not break mobile-first/native-app feel.

## Principle

```txt
Global style does not mean every route loads every rule.
Global visual rhythm means shared tokens, rhythm, component contracts, and surface adapters.
```

## Suggested Ownership Model

Adapt to existing build system; do not create unnecessary complexity.

```txt
src/css/
  critical.css
  tokens.css
  base.css
  components/
    sheet.css
    dock.css
    card.css
    buttons.css
    forms.css
  surfaces/
    preview.css
    comments.css
    discovery.css
    more.css
  routes/
    root.css
    detail.css
    landing.css
    store.css
```

This is a direction, not a mandatory file explosion.

## Required Work

### 1. Classify CSS Ownership

Classify existing CSS into:

```txt
critical
tokens/base
shared component
surface-specific
route-specific
generated
dead/legacy
forbidden patch/override
```

### 2. Keep Mandatory Guards Lightweight

Fail only on architecture-level issues:

```txt
generated CSS edited manually
source CSS missing from declared build path
obvious duplicate override/patch files
forbidden emergency CSS layers
missing required CSS module registration
clearly unused large CSS artifacts
```

### 3. Make Detailed Style Checks Advisory

Advisory only:

```txt
token consistency
visual rhythm drift
selector naming
component spacing
zero duplication ideal
CSS optimization opportunities
non-critical size warnings
```

### 4. Remove Patch Layers by Source Rewrite

When a duplicate/override layer exists, do not add another override. Fix the source-of-truth CSS and rebuild.

## Acceptance Criteria

- Source-of-truth CSS is clear.
- Generated CSS path is clear.
- Required CSS modules are registered/wired.
- Obvious duplicate patch layers are removed.
- Store/root/landing surfaces preserve one visual rhythm.
- Manual editing in source CSS remains practical.
- Advisory style warnings do not block normal CI.
