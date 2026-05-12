# TASK-UX-LANDING-OUTLINE-SEPARATION-CONTRACT-10 — Split Landing Outline into Its Own `gg-landing-outline` Family Without Reusing `gg-detail-outline`

## Context

The landing page needs a contextual bottom section-navigation surface.

The current direction is correct, but the implementation must not reuse `gg-detail-outline` selectors for landing.

This task exists because using `.gg-detail-outline` classes for landing creates cross-surface coupling:

```txt
article/detail outline changes can accidentally break landing outline
landing outline changes can accidentally break detail outline
state names drift
CSS becomes harder to reason about
```

The landing outline may share **tokens and product philosophy** with `gg-detail-outline`, but it must not share the same CSS class family.

---

## Primary objective

Create a distinct landing contextual outline family:

```txt
gg-landing-outline
```

The landing outline must:

1. be separate from the universal dock
2. be separate from `gg-detail-outline`
3. track current landing section
4. persist near the bottom viewport
5. remain visible when the universal dock hides by scroll
6. stay subordinate when the universal dock is visible
7. hide or retreat cleanly when command/more panels are open
8. remain lightweight, responsive, and transform/opacity-driven

---

## Scope

Inspect and update:

```txt
landing.html
```

You may touch existing shared CSS/JS only if needed for the landing outline contract and if the edit remains surgical.

Do **not** use this task to:

```txt
- redesign the universal dock
- redesign the whole landing page
- rebuild command/more sheets
- create a second dock
- create a second command sheet
- create a second more sheet
- externalize all CSS/JS
- introduce Tailwind or another framework
```

---

## Hard selector separation rule

### Allowed landing outline family

Landing outline markup, CSS, and JS must use this family:

```txt
.gg-landing-outline
.gg-landing-outline__compact
.gg-landing-outline__summary
.gg-landing-outline__current
.gg-landing-outline__progress
.gg-landing-outline__toggle
.gg-landing-outline__tray
.gg-landing-outline__list
.gg-landing-outline__item
.gg-landing-outline__item-button
.gg-landing-outline__dismiss
```

Codex may adjust descendant names if necessary, but every landing outline descendant must begin with:

```txt
gg-landing-outline__
```

### Forbidden landing outline selectors

Landing outline markup must **not** use:

```txt
.gg-detail-outline
.gg-detail-outline__peek
.gg-detail-outline__micro-peek
.gg-detail-outline__tray
.gg-detail-outline__list
.gg-detail-outline__item
.gg-detail-outline__item-button
.gg-detail-outline__toggle
.gg-detail-outline__dismiss
```

This is not a suggestion. It is an acceptance requirement.

### Allowed sharing

Allowed:

```txt
- shared CSS custom properties / design tokens
- shared motion tokens
- shared z-index tokens
- shared radius / surface / shadow tokens
- similar visual philosophy
```

Forbidden:

```txt
- shared detail-outline selectors
- landing outline markup carrying detail-outline classes
- CSS rules that style landing outline primarily through .gg-detail-outline
- JS querying .gg-detail-outline to control landing outline
```

---

## Required markup contract

Landing outline root must look conceptually like this:

```html
<aside
  id="gg-landing-outline"
  class="gg-landing-outline"
  data-gg-landing-outline-state="compact"
  aria-label="Landing sections">
  ...
</aside>
```

Required data attribute:

```txt
data-gg-landing-outline-state="compact|expanded|quieted|hidden"
```

The state model itself is finalized in the separate state-model task. This task must not introduce conflicting state names.

---

## Required section source contract

The outline must use actual landing sections.

Preferred section marker:

```html
<section id="hero" data-gg-landing-section="hero">
<section id="bio" data-gg-landing-section="bio">
<section id="services" data-gg-landing-section="services">
<section id="work" data-gg-landing-section="work">
<section id="approach" data-gg-landing-section="approach">
<section id="contact" data-gg-landing-section="contact">
```

If current landing sections already have different real IDs, use those real IDs and do not invent fake anchors.

Codex must audit the actual landing structure and list the final supported section IDs.

If fewer sections exist, fail gracefully:

```txt
- no broken empty outline
- no placeholder chrome
- no dead buttons
- outline state becomes hidden if the structure is invalid
```

---

## Required behavior contract

### 1. Current-section awareness

Landing outline must track the current section based on viewport reading position.

Preferred implementation:

```txt
IntersectionObserver
```

Avoid scroll-heavy manual section calculations unless necessary.

The active section must update:

```txt
- current section label
- current item state in expanded list
- data-gg-current-section or equivalent hook
```

### 2. Compact persistent state

The compact state must show:

```txt
- current section title
- calm expand affordance
- optional progress cue
```

It must not look like a second dock.

### 3. Expanded state

Expanded state should show:

```txt
- list of landing sections
- current section marker
- tap/click-to-scroll behavior
- dismiss/collapse affordance
```

Expanded must be smaller and calmer than a command sheet.

### 4. Dock coexistence

When dock is visible:

```txt
landing outline = quieted or visually subordinate
universal dock = primary nav
```

When dock hides by scroll:

```txt
landing outline = compact
landing outline becomes the main bottom contextual companion
```

When dock returns near end or upward intent:

```txt
landing outline may remain visible
landing outline must not visually compete with dock
```

### 5. Panel-open behavior

When command/more panel opens:

```txt
landing outline must become hidden or fully non-competing
```

If hidden:

```txt
- aria-hidden="true"
- inert or equivalent non-interactive guard
- pointer-events: none
- no ghost hit targets
```

### 6. Header section-nav dependency removal

Landing must not depend on header section navigation as the primary section-navigation surface.

A lightweight header/topbar may remain for brand/identity, but contextual landing section movement must be owned by `gg-landing-outline`.

---

## Required JavaScript integration

Landing outline must not directly own dock state.

It must listen to the universal dock events:

```js
window.addEventListener("gg:dock-state-change", handler);
window.addEventListener("gg:panel-state-change", handler);
```

Expected mapping:

```txt
dock hidden-by-scroll
-> landing outline compact

dock visible-default / visible-on-upward-intent / visible-near-end / focus-locked
-> landing outline quieted unless user expanded it

panel active true
-> landing outline hidden

panel active false
-> landing outline resumes compact or quieted based on dock state
```

Expanded state must be triggered by explicit user action only.

Scroll must not directly open expanded state.

---

## Required CSS and motion contract

### 1. Transform-only motion

Landing outline motion must use only:

```txt
transform
opacity
```

Forbidden for landing outline state transition animation:

```txt
bottom
top
height
max-height
margin
padding
display
left/right positional animation
layout-affecting animation
```

Use `display` only for initial non-rendered fallback if absolutely necessary, not as an animation mechanism.

### 2. Visual hierarchy

When both dock and landing outline are visible:

```txt
dock = visually primary
landing outline = contextual secondary
```

The outline must stay:

```txt
- smaller
- quieter
- text-led
- lower contrast
- less visually dominant than dock
```

### 3. Z-index contract

Landing outline must not sit above command/more panels.

Recommended hierarchy:

```txt
command/more panels       highest bottom-layer interaction
landing outline           contextual bottom companion
universal dock            primary nav, can retreat/return
page content              base
```

If existing z-index tokens differ, Codex must align the result and explain it.

---

## Required accessibility contract

Landing outline must include:

```txt
- aria-label
- button semantics for toggles
- aria-expanded on the expand/collapse control
- aria-current or equivalent for current section item
- keyboard-accessible section buttons/links
```

When hidden:

```txt
- aria-hidden="true"
- inert if supported or equivalent focus/pointer guard
- no focusable descendants reachable by tab
```

When expanded:

```txt
- Escape key should collapse if consistent with existing product behavior
- selecting a section collapses back to compact/quieted
```

Do not introduce a full focus trap. This outline is not a modal.

---

## Required acceptance proof

Codex must include proof commands or equivalent search output.

Minimum proof:

```bash
grep -n "id=\"gg-landing-outline\"" landing.html
grep -n "class=\"gg-landing-outline" landing.html
grep -n "data-gg-landing-outline-state" landing.html
grep -n "gg-landing-outline__" landing.html
grep -n "data-gg-landing-section" landing.html
grep -n "gg:dock-state-change" landing.html
grep -n "gg:panel-state-change" landing.html
```

Forbidden selector proof:

```bash
grep -n "gg-detail-outline" landing.html
```

If `gg-detail-outline` still appears in `landing.html`, Codex must prove it is not used for the landing outline.  
If it is used by the landing outline, the task is not complete.

Preferred stronger proof:

```bash
grep -n "gg-detail-outline__peek\|gg-detail-outline__tray\|gg-detail-outline__item" landing.html
```

This should return no landing-outline usage.

---

## Manual QA checklist

Codex must describe how to manually verify:

```txt
1. open /landing
2. confirm landing outline appears as compact or quieted
3. scroll through hero/bio/services/work/approach/contact
4. confirm current section label updates
5. tap outline affordance
6. confirm expanded section list opens
7. tap a section
8. confirm smooth scroll to section
9. confirm outline collapses
10. scroll down until dock hides
11. confirm landing outline remains visible/compact
12. scroll upward until dock returns
13. confirm landing outline becomes subordinate/quieted
14. open command panel
15. confirm landing outline hides and is not interactive
16. close command panel
17. confirm landing outline resumes
```

---

## Deliverables required from Codex

Codex output must use this structure:

```txt
1. audit
2. final landing outline contract
3. selector separation summary
4. exact files/sections touched
5. implementation summary
6. current-section logic summary
7. dock/panel coexistence summary
8. motion/performance summary
9. accessibility summary
10. acceptance proof
11. residual risk
```

---

## Residual risk that must be stated honestly

Codex must state any remaining risk related to:

```txt
- viewport tuning
- short landing pages
- small mobile screens
- iOS Safari safe-area overlap
- section ID mismatch
- outline being too subtle in quieted state
- tap target feel
```

---

## Completion definition

This task is complete only if:

```txt
- landing outline uses .gg-landing-outline family
- landing outline does not use .gg-detail-outline classes
- actual landing sections are used
- current section is tracked
- section tap-to-scroll works
- outline remains visible/compact when dock hides by scroll
- outline becomes subordinate/quieted when dock is visible
- outline hides or fully retreats when command/more panels open
- transform/opacity-only motion is used
- hidden state is non-interactive
- no duplicate dock, command panel, or more panel is created
```
