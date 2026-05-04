### TASK-UX-UNIVERSAL-DOCK-SCROLL-CONTRACT-01 — Make GG Dock Universal Across index.xml and landing.html, with Scroll-Aware Hide/Return and Contextual Bottom Outline Priority

**Context**
The project now wants a single universal bottom navigation system shared by:
- Blogger surfaces in `index.xml`
- static `/landing` surface in `landing.html`

This is **not** just a nav bar task.
This is a **universal dock package** task.

The universal package includes:
1. primary dock
2. command/discovery sheet
3. more sheet
4. shared behavior contract
5. shared style contract
6. shared active-state logic

At the same time, the product now wants a stronger bottom-layer hierarchy:

- the **primary dock** is universal
- the **detail outline / landing TOC** is contextual
- when reading/scanning downward, the dock should gracefully get out of the way
- the contextual outline remains at the bottom of the viewport
- the dock must return naturally when user intent or page position calls for it

---

## Primary objective

Create a **Universal Dock Contract** and implement the supporting logic so that:

1. dock behavior and appearance are **1:1** between `index.xml` and `landing.html`
2. dock is treated as a **shared package**, not two drifting copies
3. contextual bottom navigation (`gg-detail-outline` / landing outline) has priority during downward reading mode
4. dock uses **scroll-aware visibility**
5. dock returns naturally:
   - on meaningful upward intent
   - near the top zone
   - near the end/bottom zone

---

# Non-negotiable product decisions

## A. Universal primary dock
The following must be treated as one shared product contract:

- `#gg-dock`
- `#gg-command-panel`
- `#gg-more-panel`

The universal contract covers:
- item order
- labels
- icons
- hover/focus/current treatment
- spacing/radius/surface
- open/close behavior
- keyboard behavior
- active-state mapping
- copy keys

Do **not** treat only `<nav>` as the dock.
The command and more sheets are part of the same universal package.

## B. Contextual bottom navigation stays separate
Do **not** overload the universal dock with section-level page navigation.

The contextual secondary layer must stay separate:
- post/page detail uses `gg-detail-outline`
- landing uses a landing outline / landing TOC family

These contextual layers must live **above the dock layer in hierarchy**, but not replace the dock.

## C. Landing header navigation is no longer needed
The landing page should not rely on a separate header section-nav as the primary section-navigation surface.
The section-navigation role should move to a contextual bottom outline family, parallel to detail outline behavior.

---

# Required dock visibility behavior

Implement scroll-aware dock visibility with the following state model.

## Dock states
At minimum, the system must support these effective states:

1. `visible-default`
2. `hidden-by-scroll`
3. `visible-on-upward-intent`
4. `visible-near-end`

You may use fewer internal state names if behavior is identical, but the resulting UX must match this model.

## Behavior rules

### 1. Top zone
When the user is near the top of the page:
- dock must be visible
- hidden-by-scroll state must reset

### 2. Downward reading mode
When the user scrolls downward with meaningful intent:
- dock must slide down and leave the viewport
- contextual outline/TOC remains visible at bottom
- dock must not jitter on tiny scroll deltas

### 3. Upward intent
When the user scrolls upward with meaningful intent:
- dock must reappear without requiring the user to reach the top
- reappearance must feel calm and native

### 4. Near-end zone
When the user approaches the bottom/end of the page:
- dock must reappear naturally even if the user is still scrolling downward
- do **not** wait until the literal last pixel of the page
- use a bottom proximity zone, not exact-bottom-only logic

### 5. Panel-open override
If command sheet or more sheet is open:
- scroll-driven dock visibility must pause/freeze
- panel state wins over scroll state
- no hide/show fighting while panel is open

### 6. Focus safety
If keyboard focus is inside the dock:
- dock must remain visible
- scroll logic must not hide it mid-focus

### 7. Reduced motion
If user prefers reduced motion:
- keep behavior logic
- reduce/soften animation duration and complexity

---

# Motion and implementation rules

## Motion requirements
Dock motion must feel:
- quiet
- native
- restrained
- luxurious
- not theatrical

The dock should feel like it **withdraws** and **returns**, not like it performs.

## Animation rules
Use:
- `transform`-based motion for dock visibility
- optional subtle opacity support only if needed
- no height animation
- no layout-thrashing animation
- no `display` animation hacks
- no bouncing or overshooting

## Threshold rules
Dock hide/show must use intention thresholds:
- do not respond to tiny wheel/touch deltas
- no flicker on micro scroll changes
- no nervous show/hide loops

---

# Universal style rules

The dock in `landing.html` must match the dock in `index.xml` as the same product family:

- same icon family
- same icon names
- same dock tones
- same border/surface/shadow language
- same radius/padding rhythm
- same label size and weight
- same safe-area handling
- same sheet family look
- same command/more interaction tone

Do **not** create a second visual dialect for landing dock.

If the landing page needs custom styling, that styling must not break 1:1 dock identity.

---

# Required structural decisions

## 1. Universal package ownership
You must clearly define which parts belong to the universal dock package:
- dock nav
- command panel
- more panel
- shared behavior logic
- shared style logic

## 2. Contextual outline ownership
You must clearly define which parts belong to contextual outlines:
- detail outline
- landing outline

## 3. Layer hierarchy
The implementation must respect this hierarchy:

- contextual outline is the persistent bottom reading companion
- dock is the universal primary navigation layer
- dock can retreat during reading mode
- dock can return on upward intent / top zone / near-end zone

---

# Landing-specific requirement

Introduce a contextual landing outline family that behaves in the same design spirit as `gg-detail-outline`, but is specific to landing sections.

Minimum expectations:
- current section awareness
- compact persistent state
- expanded list state optional
- aligned with bottom hierarchy
- does not replace the universal dock
- survives while dock is hidden-by-scroll

Landing sections to support should be based on actual landing structure, such as:
- hero
- bio
- services
- work
- approach
- contact

Use the real section ids/classes in implementation.

---

# What must NOT happen

Do not:
- fork the dock into a separate landing-only dock system
- create a second command sheet for landing
- create a second more sheet for landing
- make dock return only when the user reaches the very top
- make dock return only at the exact last pixel of the page
- hide contextual outline together with dock during downward reading mode
- cause layout jumps when dock hides or returns
- create ownership wars between panel state and scroll state

---

# File scope expectations

You should inspect and update the relevant parts of:
- `index.xml`
- `landing.html`

You may also touch the supporting shared style/controller source if the current repo structure already supports it.

But do **not** use this task to force a full CSS/JS externalization refactor.
That is not the goal of this task.

This task is about:
- universal contract
- behavior alignment
- bottom-layer hierarchy
- scroll-aware motion

Not full asset extraction.

---

# Deliverables required

## A. Universal Dock Contract summary
State exactly:
- what belongs to the shared dock package
- what belongs to contextual outline families
- what behavior is universal
- what behavior is contextual

## B. Implementation summary
State:
- what was changed in `index.xml`
- what was changed in `landing.html`
- what shared logic was reused or aligned
- how 1:1 parity was achieved

## C. Scroll visibility summary
State:
- top zone behavior
- downward hide behavior
- upward re-show behavior
- near-end re-show behavior
- panel-open override behavior

## D. Motion summary
State:
- what CSS properties animate
- what thresholds/guards prevent jitter
- how reduced-motion is respected

## E. Residual risk
State honestly:
- what still needs live touch-device verification
- what may need tuning on very short pages
- what may need tuning on extremely long landing pages

---

# Acceptance criteria

The task is complete only if:

- dock package is treated as one universal contract
- dock behavior is 1:1 across `index.xml` and `landing.html`
- landing no longer depends on a separate header section-nav as primary section navigation
- contextual landing outline exists or is fully specified and wired
- dock hides on meaningful downward scroll
- contextual outline remains visible while dock hides
- dock reappears on meaningful upward scroll
- dock also reappears in a bottom proximity zone near the end of the page
- dock remains visible in top zone
- panel state overrides scroll visibility
- no jittery micro-scroll behavior is introduced
- motion remains quiet-luxury and native-feeling

---

# Output format I want

1. audit
2. universal dock contract
3. exact files/sections touched
4. implementation summary
5. scroll-visibility summary
6. motion summary
7. residual risk