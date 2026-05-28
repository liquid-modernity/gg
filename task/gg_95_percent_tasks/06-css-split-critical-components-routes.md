# Task 06 — CSS Split: Critical + Shared Components + Route/Surface CSS

## Objective

Keep one visual rhythm while reducing route-level CSS payload and removing duplicated styling.

This task is not about changing the aesthetic. It is about delivery, ownership, and maintainability.

## Hard Constraints

- Do not rewrite Blog1.
- Do not change Blogger post loop.
- Do not introduce override CSS on top of old CSS.
- Replace duplicated styles with shared component tokens/classes.
- Preserve mobile-first behavior.
- Preserve native app-feel.
- Budget warnings are advisory only.

## Principle

```text
Global style does not mean every route loads every CSS rule.
Global style means shared tokens, rhythm, naming, and component contracts.
```

## Target Structure

Suggested direction:

```text
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

Adapt to the existing build system. Do not create complexity the build cannot support.

## Required Work

### 1. Identify CSS ownership

Classify existing rules into:

```text
critical
token/base
shared component
surface-specific
route-specific
dead/legacy
```

### 2. Keep critical CSS small

Critical CSS should include only what is needed for:

```text
no-flash theme
basic layout shell
above-the-fold skeleton
essential typography
```

Do not put all component CSS into critical.

### 3. Normalize sheet CSS

All sheets should share base sheet tokens:

```text
radius
shadow
backdrop
safe-area
head/footer spacing
handle size
transition timing
```

But origin-specific transforms can differ:

```text
bottom origin: translateY
top origin: translateY negative
```

### 4. Split store CSS carefully

Store has static SEO value and interactive discovery. Separate:

```text
store critical/static grid CSS
store discovery/filter/preview CSS
```

Do not block static product grid rendering on discovery CSS.

### 5. Remove selector duplication

When two surfaces use the same rhythm, use shared component classes/tokens rather than copy-paste rules.

### 6. Avoid route leakage

Landing-only rules should not dominate root/detail/store unless intentionally shared.

Store-only rules should not load as global if avoidable.

## Acceptance Criteria

- Visual rhythm remains consistent.
- Sheet visuals remain consistent.
- Preview top sheet still works.
- Bottom sheets still work.
- Root/detail/landing/store do not visually regress.
- CSS ownership is clearer.
- No Blog1 rewrite.
- No override patch layer added.
- Budget warning does not fail the task.

## Suggested Verification

```bash
npm run build
npm run qa:contract
```

Manual visual smoke:

```text
root listing
post detail
page detail
landing
store
comments sheet
discovery sheet
more sheet
root preview
store preview
```

## Non-Goals

- Do not chase pixel-perfect redesign.
- Do not make Lighthouse score the only success measure.
- Do not remove useful UX only to reduce bytes.
