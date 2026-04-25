### TASK-UX-LANDING-OUTLINE-CONTRACT-01 — Add Contextual Bottom Landing Outline Above Universal Dock, Without Forking Dock System

**Context**
The universal dock task is broader and covers shared primary navigation.

This task is intentionally narrower:
it focuses only on the **landing-specific contextual bottom outline** layer.

Goal:
Landing needs a contextual section-navigation surface that behaves in the same design spirit as `gg-detail-outline`, while the universal dock remains the primary navigation layer.

This outline must:
- live near the bottom viewport
- remain visible while dock hides on downward reading mode
- not replace dock
- not become a second primary nav
- not depend on header nav as the main section-navigation mechanism

---

## Primary objective

Introduce a **landing-specific contextual outline family** for `landing.html` that:

1. tracks current landing section
2. persists near the bottom viewport
3. remains visible when the dock hides on downward scroll
4. works as the contextual reading/navigation companion for landing
5. follows the same product philosophy as `gg-detail-outline`
6. does not fork the universal dock system

---

# Non-negotiable product decisions

## A. This is contextual nav, not primary nav
The landing outline is **not** a replacement for the universal dock.

The dock still owns:
- Home
- Contact
- Search
- Blog
- More

The landing outline owns:
- current landing section awareness
- section-to-section movement inside landing

## B. Landing header section-nav is not the primary section-navigation surface
If a lightweight topbar exists for brand/identity, fine.
But the actual section-navigation contract for landing should be owned by the contextual bottom outline.

## C. The outline must stay small and calm
It should feel like:
- a reading companion
- a structural guide
- a contextual locator

It must not feel like:
- a second dock
- a bottom tab bar clone
- a large floating menu competing with the dock

---

# Required scope

This task is only about the landing outline family and its behavior.

Do **not** use this task to:
- redesign the universal dock
- refactor the entire landing page
- externalize all CSS/JS
- rebuild command/more sheets
- redesign the header
- fork copy systems

---

# Required landing sections

The outline must support actual landing sections such as:
- hero
- bio
- services
- work
- approach
- contact

Use the real section ids already present in `landing.html`.

---

# Required behavior contract

## 1. Current-section awareness
The landing outline must know which section is currently active based on viewport reading position.

It must keep the current section state in sync as the user scrolls.

## 2. Compact persistent state
At minimum, the outline must have a compact persistent state that shows:
- current section title
- optional progress cue or affordance
- a clear but calm expand affordance if expanded mode exists

## 3. Expanded state
Preferred:
- expanded list of landing sections
- tap a section -> scroll to that section
- current section clearly marked
- section list remains text-led and calm

If expanded mode is introduced, it must not feel like a loud drawer or full sheet.

## 4. Downward reading mode behavior
When the user scrolls down and the universal dock hides:
- landing outline remains visible
- landing outline becomes the main bottom contextual layer

## 5. Upward / top / near-end coexistence
When dock reappears:
- landing outline may remain visible
- but it must remain visually subordinate to the dock
- no bottom-layer competition or visual war

## 6. Panel-open behavior
If universal dock sheets open:
- landing outline should collapse or visually quiet itself
- it must not compete with command/more sheets

## 7. Sparse-content fallback
If landing has poor or incomplete section structure:
- outline should fail gracefully
- no broken empty chrome
- no noisy placeholder clutter

---

# Visual and motion rules

## Visual rules
The landing outline must feel:
- quiet
- text-led
- editorial
- premium
- minimal

It must visually relate to `gg-detail-outline`, but not copy it blindly if landing needs slight contextual adaptation.

## Motion rules
Use restrained motion only:
- transform/opacity if needed
- no bounce
- no loud transitions
- no full-sheet theatrics

The outline should feel like it is:
- attached
- stable
- intelligent
- never needy

## Hierarchy rules
When both are visible:
- universal dock = primary nav
- landing outline = contextual secondary nav

The outline must never visually overpower the dock.

---

# Structural rules

## 1. Separate family
Use a distinct landing outline family name, not detail-outline selectors reused carelessly.

Preferred naming style:
- `gg-landing-outline`
- related descendants under that family

## 2. Do not duplicate dock selectors
Do not implement landing outline by mutating or hijacking dock classes.

## 3. Shared philosophy, not shared confusion
It may borrow structural logic from detail outline, but it must remain a landing-specific family.

---

# Implementation expectations

Inspect and update:
- `landing.html`

You may also touch small supporting shared logic if needed, but keep this task landing-outline scoped.

Do not let this task balloon into a universal system rewrite.

---

# Deliverables required

## A. Audit
State:
- current landing section structure
- whether landing currently has any contextual section-navigation
- where the hierarchy/noise problem is today

## B. Final outline contract
State:
- compact state
- expanded state if added
- current-section logic
- dock coexistence behavior
- panel-open behavior

## C. Exact files/sections touched
State:
- exact areas changed in `landing.html`
- any helper logic touched

## D. Implementation summary
State:
- markup added
- CSS family added/updated
- JS/controller logic added/updated
- how current section is determined
- how tap-to-scroll works

## E. Hierarchy summary
State:
- how landing outline behaves when dock is visible
- how it behaves when dock hides by scroll
- how it behaves near the end of page
- how it behaves when a panel opens

## F. Residual risk
State honestly:
- viewport tuning risk
- very short page risk
- gesture/tap feel risk
- overlap risk on small screens

---

# Acceptance criteria

The task is complete only if:

- landing has a contextual bottom outline family
- the family is distinct from dock
- current landing section is tracked correctly
- outline remains visible while dock hides on downward reading mode
- outline remains subordinate when dock is visible
- outline does not compete with command/more sheets
- section tap-to-scroll works
- the experience feels aligned with `gg-detail-outline` in spirit
- the result stays quiet-luxury, minimal, and mobile-friendly

---

# Output format I want

1. audit
2. final landing outline contract
3. exact files/sections touched
4. implementation summary
5. hierarchy summary
6. residual risk