# GAGA RULES OF UIUX
**Status:** Active operational UI/UX support spec  
**Authority:** Subordinate to `gg_master.md` and derived from `gaga_prd_uiux.md`  
**Role:** Device-aware UI/UX behavior, visual rhythm, interaction rules, and refactor acceptance criteria for BLOG GAGA-ish / PakRPP.

---

## 0. Authority, Scope, and Non-Override Rule

### 0.1 Authority
This document translates product-level UI/UX intent into operational rules for implementation and refactor work.

### 0.2 Non-override rule
This document does not override:
- `gg_master.md`
- `gg_rules_of_xml.md`
- `gg_rules_of_css.md`
- `gg_rules_of_js.md`
- `gg_rules_of_worker.md`

If a rule here conflicts with constitutional ownership law, the layer law remains authoritative.

### 0.3 Scope
This document governs:
- device behavior across desktop, tablet, and mobile
- surface behavior across landing, listing, post, page, special, and recovery states
- layout and chrome budgeting
- interaction rules for keyboard, touch, pointer, hover, gesture, scroll, and overlays
- operational card system rules
- typography, spacing, material, icon, badge, and motion rules
- forbidden UX patterns
- acceptance criteria for Codex refactor work

### 0.4 Intended usage
Codex and future operators must use this file as a behavioral contract. This file is not a mood board. It is not a place for aesthetic improvisation. It exists to keep refactors aligned with product intent.

### 0.5 Operational principle
If a UI decision improves one local component but weakens hierarchy, consistency, accessibility, resilience, or device parity, the decision is wrong.

---

## 1. Core UX Principles

### 1.1 One dominant task per surface
Each surface must present one dominant task. Secondary systems may assist. They may not compete as equal protagonists.

### 1.2 Content remains primary
Content, not chrome, is the center of gravity. Chrome may support discovery, reading, and control. Chrome may not overshadow them.

### 1.3 Quiet luxury through restraint
Luxury comes from control, hierarchy, consistency, and calm. It does not come from extra visible systems, decorative motion, or ornamental density.

### 1.4 Keyboard-first on desktop
Desktop must reward keyboard use without making keyboard knowledge the only path to confidence.

### 1.5 Touch-first on tablet and mobile
Tablet and mobile must remain fully understandable and operable without hover assumptions.

### 1.6 Gesture only as enhancement
No primary feature may rely on a hidden gesture as its only practical path.

### 1.7 Tablet is first-class
Tablet may not inherit desktop persistence or mobile simplification blindly.

### 1.8 One visual language
All major surfaces and systems must feel like one product family.

### 1.9 No chrome competition
Multiple visible systems may not compete for equal attention by default.

### 1.10 Performance, accessibility, and resilience are UI quality
A refined-looking UI that is slow, inaccessible, or weak under degraded conditions is not premium.

---

## 2. Device Model

### 2.1 Desktop
Desktop is the editorial stage.

Primary interaction model:
1. keyboard
2. pointer
3. hover as enhancement

Desktop rules:
- persistent rails are allowed only when justified
- content column must remain dominant
- hover may enrich meaning but may not carry critical meaning alone
- contextual systems may appear, but action spines must remain singular and legible

### 2.2 Tablet landscape
Tablet landscape is an adaptive companion mode.

Rules:
- a slim or collapsible rail may remain visible if justified
- secondary systems should prefer slide-over rail, drawer, or sheet rather than full desktop persistence
- touch remains primary even when an external keyboard is present
- reach and posture matter more than desktop symmetry

### 2.3 Tablet portrait
Tablet portrait is touch-first and more constrained.

Rules:
- persistent side systems should collapse by default
- drawers and sheets are preferred over persistent side rails
- command palette should open as centered or top-oriented sheet
- primary actions must remain reachable without grip-breaking travel

### 2.4 Mobile
Mobile is the thumb-first ritual.

Rules:
- one dominant task per screen state
- reduced chrome by default
- secondary systems must use sheet, drawer, or modal patterns rather than desktop-style persistence
- no tiny desktop fragments floating in miniature

### 2.5 Cross-device invariants
Across all devices:
- semantics remain stable
- component identities remain stable
- state logic remains stable
- hierarchy remains recognizable
- degraded-state dignity remains present

---

## 3. Surface Model

### 3.1 Landing
Primary task: impression and conversion.

Rules:
- landing may stage admiration directly
- navigation must remain legible and calm
- landing may not behave like listing feed or control dashboard
- supporting systems remain secondary to narrative and offer clarity

### 3.2 Listing
Primary task: browsing and comparison.

Rules:
- listing must optimize scanning and progression to reading
- listing must not become semi-reading mode by default
- side metadata systems may not dominate while user is still comparing cards
- card actions must stay budgeted

### 3.3 Post
Primary task: reading.

Rules:
- reading column must remain dominant
- TOC, info, comments, and similar systems are auxiliary
- no more than one auxiliary system may dominate at once
- reading flow may not be broken by chrome competition

### 3.4 Page
Primary task: reading or reference.

Rules:
- page structure must remain honest about whether the page is narrative, reference, or action-oriented
- page may use detail-like systems where justified
- page may not inherit listing behavior by accident

### 3.5 Special surfaces
Primary task varies by destination.

Rules:
- tags, sitemap, library, portfolio, and other special pages must each expose one clear dominant task
- no special page may become a dumping ground for unrelated chrome

### 3.6 Recovery surfaces
Includes offline, slow, empty, and failed-discovery states.

Rules:
- recovery surfaces are first-class product surfaces
- product shell identity must remain recognizable
- the condition must be explained clearly
- recovery actions must be obvious
- panic aesthetics are forbidden

---

## 4. Layout and Chrome Budget

### 4.1 No empty rail
A side rail with weak or absent functional purpose is forbidden.

### 4.2 One dominant content column rule
On reading and browsing surfaces, the content column must remain the clear visual and interaction center.

### 4.3 One auxiliary system at a time
On content-primary surfaces, only one auxiliary system may be clearly dominant at once.

Examples of auxiliary systems:
- TOC
- info sheet or panel
- comments panel
- more sheet
- discovery overlay

### 4.4 No duplicate action spine
A surface may not expose two equally prominent action bars without explicit justification.

### 4.5 Sidebar persistence rules
- Desktop: persistent rail allowed when it supports the dominant task
- Tablet landscape: slim persistent rail allowed only when posture and density remain humane
- Tablet portrait: collapsible by default
- Mobile: drawer or sheet only

### 4.6 Transformation rule
Transformation from rail to drawer or sheet must be contextual, not breakpoint-lazy.

### 4.7 Content-first spacing rule
Whitespace must strengthen hierarchy, not create decorative emptiness.

### 4.8 No symmetry fetish
Symmetry alone is not a valid reason for visible layout allocation.

---

## 5. Navigation Model

### 5.1 Global navigation
Global navigation must be lightweight, stable, and obvious.

### 5.2 Contextual navigation
Contextual navigation must serve the dominant task of the current surface and may not duplicate the global layer unnecessarily.

### 5.3 Back behavior
Back actions must behave predictably and not compete visually with the primary content.

### 5.4 Dock role
`gg-dock` is a global utility and navigation trigger surface.

Dock rules:
- keep it lightweight
- do not let it become the universal host of all meaning
- do not let it compete with contextual toolbars by default
- it may trigger other systems, but it may not impersonate them

### 5.5 More sheet role
The more sheet is a utility layer.

Rules:
- it must feel subordinate, not like a foreign product
- it must group secondary destinations and actions coherently
- it may not become a duplicate global navigation stack when one already exists visibly

### 5.6 Navigation visibility by device
- desktop may distribute navigation across header, rails, and dock if hierarchy remains clear
- tablet must reduce visible navigation fragmentation
- mobile must favor a smaller number of obvious navigation entry points

---

## 6. Search, Command Palette, and Global Discovery Model

### 6.1 Component distinction
- `gg-command-palette` = global discovery and command layer
- `gg-search-surface` = local or contextual filtering surface
- `gg-dock` = trigger surface only, not search truth

### 6.2 Single active search rule
Only one active search surface may be visible and interactive at a time.

When `gg-command-palette` opens:
- competing inline search surfaces must collapse, hide, or become inert
- dock may remain visible only as peripheral chrome
- no second active search input may compete for attention

### 6.3 Desktop command palette
Desktop command palette must be:
- centered or top-centered
- clearly separate from dock geometry
- singular in focus
- keyboard-first with touch-safe row behavior

Forbidden:
- dock-morph palette
- bottom-left palette anchored like a utility pod
- multiple active search hosts

### 6.4 Tablet command palette
Tablet command palette must be a centered or top-oriented sheet, tuned for posture and touch reach.

### 6.5 Mobile command palette
Mobile global discovery must use full-screen mode.

Rules:
- full-screen discovery is the default mobile global search model
- the input remains visually dominant
- results scroll within one coherent discovery surface
- no tiny floating or ambiguous partial palette is allowed

### 6.6 Discovery state model
Command palette and discovery must support:
- idle
- querying
- loading
- results
- empty
- error
- closing

Each state must feel product-consistent and not collapse into browser-default awkwardness.

### 6.7 Discovery taxonomy
Global discovery may include:
- posts
- pages
- tags
- authors
- quick actions
- recent items
- suggested destinations

### 6.8 Discovery clarity rule
Global discovery and local filtering must never be conflated.

---

## 7. Keyboard Navigation Model

### 7.1 Keyboard must remain inclusive
Keyboard richness does not excuse focus confusion or semantic weakness.

### 7.2 Global keyboard rules
Required behaviors:
- keyboard paths must remain continuous
- no dead-end tab flows
- focus must remain visible
- overlays and sheets must provide reliable escape paths

### 7.3 Desktop shortcut layer
Desktop may use shortcut power for:
- command palette
- listing traversal
- contextual opening of TOC, info, or comments

Rules:
- shortcuts must have visible fallback paths
- shortcuts may not hijack text entry contexts
- shortcuts may not become the only efficient path to primary actions

### 7.4 Focus management
When an overlay, sheet, drawer, or modal opens:
- focus must move intentionally
- focus must not disappear
- dismissal must return focus logically where relevant

### 7.5 Outline visibility
Visible focus indication is mandatory.

Outline removal without a stronger replacement is forbidden.

---

## 8. Touch and Gesture Model

### 8.1 Touch priority
Touch targets must be comfortably reachable and clearly actionable.

### 8.2 Touch target rule
All interactive controls must maintain a minimum hit area of 44x44px.

Rules:
- adjacent interactive controls should maintain at least 8px clear separation unless they are part of a deliberately grouped control pattern
- visually small controls must still honor the minimum hit area through padding, invisible hit expansion, or equivalent safe interaction treatment
- fragile sizing is forbidden
- touch density may not be tightened merely to preserve a cleaner screenshot

### 8.3 Allowed gestures
Allowed gestures may include:
- swipe or drag to dismiss sheet or drawer
- horizontal swipe on rails where appropriate
- controlled drag behavior on sheet surfaces

### 8.4 Forbidden gestures
Forbidden as primary UX dependency:
- hidden gesture-only navigation
- OS-conflicting edge gesture as required interaction
- decorative pull-to-refresh behavior with weak product justification

### 8.5 Tablet posture rule
Tablet gesture and target placement must account for posture, reach, and grip interruption cost.

### 8.6 Gesture fallback rule
Every primary action reachable by gesture must also be reachable by obvious visible control.

---

## 9. Pointer and Hover Model

### 9.1 Pointer precision
Desktop must feel pointer-precise, not pointer-fragile.

### 9.2 Hover as enhancement
Hover may reveal, clarify, or preview. Hover may not be the sole carrier of critical meaning or primary access.

### 9.3 Click confidence
Primary click targets must feel obvious and stable.

### 9.4 Hover reveal limits
Hover reveals must not create twitchy or accidental UI.

### 9.5 No hover-only critical action
If an action matters, it must remain available without hover through visible or obvious alternative path.

---

## 10. Card System

### 10.1 One visual family, honest variants
PakRPP uses one card language with honest variants rather than unrelated card species.

### 10.2 Card variants
At minimum:
- Editorial Card
- Standard Listing Card
- Compact Rail Card

### 10.3 Shared contracts
All card variants must share:
- hierarchy logic
- action budget discipline
- visual family
- metadata restraint
- state logic

### 10.4 Unity without monolith
One visual card system does not justify one bloated universal card implementation.

Operational rule:
- prefer modular composition
- prefer bounded variants
- reject uncontrolled conditional explosion

### 10.5 Primary click-target rule
Every card must preserve one obvious primary action.

### 10.6 Card action budget
Visible quick actions must remain tightly budgeted.

Rules:
- secondary actions should move into overflow when necessary
- cards may not become action trays
- actions may not visually overshadow title and primary destination meaning

### 10.7 Mixed-media and SSR listing parity
Mixed-media cards and SSR listing cards may differ in emphasis and density, but they may not feel like unrelated systems.

### 10.8 Card content hierarchy
Title and destination meaning outrank metadata and micro-actions.

### 10.9 Card density restraint
Cards may not collapse into UI clutter under the excuse of utility.

---

## 11. Toolbar, Dock, Drawer, Sheet, and Panel Model

### 11.1 Contextual toolbar role
A contextual toolbar belongs to its content context. It may not compete with global dock by default.

### 11.2 No duplicate action bars
Two equally prominent action bars on one surface are forbidden unless explicitly justified and tested.

### 11.3 Drawer rule
Drawers are for secondary navigation, filters, and contextual systems that should not remain permanently visible.

### 11.4 Sheet rule
Sheets are for secondary task layers such as info, comments, utilities, or mobile/global discovery where defined.

### 11.5 Panel slot sharing rule
Info and comments systems should not create parallel permanent side systems where one shared slot or controlled dominance model is enough.

### 11.6 Dominance hierarchy
On content-primary surfaces, contextual content support outranks utility chrome, and utility chrome outranks decorative presence.

---

## 12. Metadata Model

### 12.1 Metadata is secondary
Date, updated time, read time, tags, contributors, and similar metadata must remain secondary to title and content destination.

### 12.2 Listing metadata
Listing metadata supports scanning.

Rules:
- keep concise
- avoid dominance
- preserve browse speed

### 12.3 Detail metadata
Detail metadata supports reference.

Rules:
- group clearly
- keep readable
- do not rival the reading body in emphasis

---

## 13. Typography System

### 13.1 One system, three optical tunings
Desktop, tablet, and mobile use one typographic hierarchy with device-aware optical tuning.

Rules:
- type roles remain semantically stable across devices
- size, leading, and density may adapt by device
- adaptation may not produce three unrelated visual identities

### 13.2 Type roles
Required roles:
- display
- h1
- h2
- h3
- body
- body small
- meta
- eyebrow

No new public-facing text role may be invented casually when one of the above roles already covers the need.

### 13.3 Core scale
Use the following operational ranges as the default optical scale.

| Role | Mobile | Tablet | Desktop |
|---|---:|---:|---:|
| Display | 36–42px | 40–48px | 48–60px |
| H1 | 30–36px | 34–40px | 40–48px |
| H2 | 24–28px | 28–32px | 32–40px |
| H3 | 20–22px | 22–24px | 24–28px |
| Body | 16–17px | 16–18px | 17–18px |
| Body Small | 14–15px | 14–15px | 15–16px |
| Meta | 12–13px | 12–13px | 13–14px |
| Eyebrow | 11–12px | 11–12px | 12–13px |

These are operational ranges, not decorative suggestions.

Implementation rule:
- typography should prefer approved tokens and `clamp()` for fluid sizing where continuous scaling improves cross-viewport behavior
- `clamp()` should be used selectively rather than dogmatically
- display, h1, and major heading roles are strong candidates for fluid sizing
- meta, eyebrow, and tightly controlled utility text may remain token-fixed where stability matters more than fluid scaling

### 13.4 Leading rules
Default line-height:
- Display: 1.02–1.1
- H1: 1.05–1.15
- H2: 1.1–1.2
- H3: 1.15–1.25
- Body: 1.55–1.75
- Body Small: 1.45–1.65
- Meta: 1.35–1.55
- Eyebrow: 1.1–1.3

Body text may not be compressed into fashion-editorial fragility.

### 13.5 Measure rules
Readable line length is mandatory.

Targets:
- long-form reading body: 58–75 characters per line
- compact descriptive text: 40–60 characters per line
- metadata clusters: as short as clarity permits

Reading surfaces may not exceed humane measure under the excuse of spacious luxury.

### 13.6 Tracking and case rules
- Eyebrow text may use uppercase with positive tracking
- Metadata may use neutral to slightly positive tracking
- Headlines should remain neutral or slightly tight rather than artificially spaced
- Body copy should remain optically neutral

Excessive letterspacing as a fake luxury signal is forbidden.

### 13.7 Weight and contrast rules
- Headings must carry authority without looking swollen
- Body text must remain comfortably readable
- Metadata may be quieter, but not so faint that it becomes decorative dust
- Placeholder text may not be mistaken for disabled or unavailable state

### 13.8 Device-specific tuning rules
Desktop:
- editorial presence allowed
- larger hierarchy separation allowed
- metadata must still remain legible

Tablet:
- hierarchy must compress slightly
- touch density and line-wrap behavior must remain humane
- portrait and landscape may not break typographic hierarchy

Mobile:
- body may not fall below readable floor
- display sizes may be dramatic only if they do not destabilize scroll rhythm
- card titles must remain scannable without feeling cramped

### 13.9 Inheritance rules
Cards, panels, sheets, drawers, and discovery surfaces must inherit from the core typographic system rather than improvising private text scales.

### 13.10 Forbidden typographic patterns
Forbidden:
- tiny low-contrast text used as “luxury” styling
- inconsistent meta sizing across equivalent contexts
- giant display type that collapses mobile reading flow
- ad hoc role creation for local visual effect

## 14. Spacing and Density System

### 14.1 One spacing scale
Spacing must be systematized. Use one product spacing scale.

Default scale:
- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px
- 48px
- 64px
- 80px
- 96px

No public-facing component may invent arbitrary spacing values without explicit justification.

Magic-number rule:
- any new margin, padding, gap, inset, or spacing value outside the approved scale is treated as a regression unless it is first promoted into an approved token or documented exception
- raw one-off spacing values such as 17px, 21px, or 26px are forbidden as casual implementation choices

### 14.2 Primary usage bands
Use the scale in three bands:
- micro spacing: 4 / 8 / 12
- component spacing: 12 / 16 / 20 / 24 / 32
- section spacing: 32 / 40 / 48 / 64 / 80 / 96

### 14.3 Inner vs outer rhythm
Section spacing must feel more spacious than component internal spacing.

Rules:
- never let card internals feel as loose as section transitions
- never let section rhythm collapse into component rhythm
- never use giant outer spacing to hide weak component density

### 14.4 Density profiles by device
Desktop:
- highest compositional breathing room
- not the loosest possible arrangement
- premium spaciousness without dead air

Tablet:
- calmer than mobile, tighter than desktop
- preserve touch clarity without desktop emptiness

Mobile:
- tighter by necessity
- still maintain clear hierarchy and touch safety
- no suffocating card stacks

### 14.5 Content density rules
Long-form reading:
- reading body needs calm vertical rhythm
- paragraphs require consistent separation
- support systems must not crowd the reading body

Listing:
- scan efficiency outranks ornamental breathing room
- cards must remain comfortably separated without wasting viewport depth

Panels and sheets:
- density may be slightly tighter than page-level layout
- still require touch-safe and focus-safe spacing

### 14.6 Card spacing rules
Card spacing must follow one logic:
- media-to-title spacing must be consistent by card family
- title-to-meta spacing must remain tighter than card-to-card spacing
- action row spacing must not dominate the card body
- micro-action clusters may not sprawl under weak discipline

### 14.7 Overlay density rules
Discovery surfaces, sheets, and drawers must use denser layouts than full-page sections, but they may not become cramped utility trays.

### 14.8 Alignment discipline
Alignment must be consistent across modules.

Rules:
- edges must line up intentionally
- title blocks, metadata blocks, and action blocks must follow one internal grid logic
- accidental half-step drifts are forbidden

### 14.9 Gap consistency rules
Equivalent relationships should use equivalent gaps.

Examples:
- title-to-meta spacing should not vary randomly between otherwise equivalent cards
- panel header-to-body spacing should not drift by local taste
- section gap changes must reflect hierarchy change, not mood

### 14.10 Forbidden spacing patterns
Forbidden:
- arbitrary one-off spacing values
- giant decorative whitespace hiding weak hierarchy
- cramped touch controls justified by visual tidiness
- inconsistent component density across similar surfaces

## 15. Surface Material System

### 15.1 One material family
Borders, radius, shadows, blur treatment, surface contrast, and elevation must behave as one material system.

Rules:
- every public-facing surface must feel related to the same product family
- no component may invent a private material language without explicit justification
- overlays, sheets, panels, and cards may vary in emphasis, but not in species

### 15.2 Surface classes
PakRPP uses four operational surface classes:
- **Base Surface**: page background and structural canvas
- **Primary Surface**: cards, reading containers, major content shells
- **Elevated Surface**: drawers, sheets, palette shells, utility panels
- **Overlay Surface**: scrims, modal-adjacent layers, strong interruption surfaces

No component may visually impersonate a higher surface class without interaction justification.

### 15.3 Border behavior
Borders must separate, not shout.

Rules:
- border contrast must remain low-to-moderate by default
- borders may increase slightly on interactive or elevated surfaces, but may not become harsh graphic outlines unless the state truly requires it
- repeated nested borders are forbidden when spacing or surface separation can solve the same problem more calmly

### 15.4 Radius hierarchy
Corner softness must follow one hierarchy.

Operational tiers:
- micro controls: 10–14px
- cards and panel items: 14–18px
- drawers, sheets, palette shells, and major elevated surfaces: 20–28px
- pill or capsule forms: use only where component meaning truly supports it

Token rule:
- cards and panel items must consume approved radius tokens rather than hardcoded px values
- elevated shells must consume approved larger-radius tokens rather than ad hoc rounded values
- use existing GG token tiers where available, for example card-tier and elevated-shell tiers, rather than inventing private radius numbers in component code

Rules:
- radius may not fluctuate wildly between neighboring systems
- higher elevation may justify slightly larger radius, but not cartoon softness
- command palette, sheets, and major overlays must not devolve into chains of unrelated bubble geometry

### 15.5 Shadow restraint
Shadows may communicate elevation. They may not become decorative fog.

Rules:
- use one shallow family of soft shadows for most surfaces
- stronger shadow may be used for command palette or high-focus elevated surfaces only when it supports hierarchy
- multiple stacked shadows with no measurable UX value are forbidden
- shadows may not be used to compensate for weak structure or weak contrast discipline

### 15.6 Blur restraint
Blur is a controlled accent, not a default luxury signal.

Rules:
- blur may be used on selected elevated surfaces such as dock or palette shell only if performance cost is justified
- blur may not become the primary mechanism for making a surface feel premium
- blur intensity may not create unreadable translucency or weak foreground separation
- layered blur plus heavy shadow plus dense transparency is forbidden as a default style system

### 15.7 Tonal continuity
Tonal contrast between surfaces must remain inside one family.

Rules:
- dark-on-light and light-on-dark variations may exist, but must still feel like one product
- utility layers may gain tonal emphasis, but may not appear to come from a different brand or operating system
- “alien overlay mode” is forbidden

### 15.8 Surface clarity rule
Users must be able to read hierarchy from material treatment alone.

This means:
- page base must stay quieter than content surfaces
- content surfaces must remain calmer than interruption layers
- elevated surfaces must feel intentionally elevated rather than merely darker, blurrier, or louder

### 15.9 Material consistency across states
Material rules must survive state changes.

Rules:
- hover may intensify a surface subtly, not mutate its identity
- selected state may strengthen contrast, not create a different component species
- loading and error states must remain within the same material family

### 15.10 Forbidden surface material patterns
Forbidden:
- harsh borders used as default luxury styling
- wildly inconsistent radius logic between neighboring systems
- foggy shadow stacks with weak hierarchy value
- blur-heavy shells hiding weak layout or weak contrast
- overlays that visually feel imported from another product

## 16. Icon and Badge System

### 16.1 Icon family consistency
PakRPP must use one icon family or one tightly harmonized icon logic.

Rules:
- no casual mixing of competing icon styles
- icons must remain subordinate to content hierarchy
- icons are meaning carriers, not decorative noise

### 16.2 Icon roles
Icons must be classified by role rather than inserted ad hoc.

Operational roles:
- **Navigation icons**
- **Utility action icons**
- **Status icons**
- **Decorative-support icons** (use sparingly)

Each role must remain visually and semantically disciplined.

### 16.3 Icon sizing by role
Default operational ranges:
- micro/support icon: 14–16px
- standard utility icon: 18–20px
- touch-first utility icon: 20–22px
- emphasis icon or large feature icon: 24–28px

Rules:
- desktop utility icons should not feel oversized
- touch surfaces may slightly increase icon size, but may not inflate icon importance above text
- adjacent systems must not drift into different icon sizing logic without reason

### 16.4 Filled versus outline semantics
Filled and outline treatments must signal state or emphasis meaningfully.

Rules:
- outline is the default neutral utility state unless a component system defines otherwise
- filled state may indicate active, saved, selected, or higher-emphasis status
- filled and outline variants may not be swapped arbitrarily by designer mood

### 16.5 Icon-text hierarchy
Text outranks icon unless the interaction is truly icon-primary.

Rules:
- cards remain title-led, not icon-led
- metadata clusters may include icons, but icons may not dominate line rhythm
- action rows may use icons, but labeling or affordance clarity must remain obvious

### 16.6 Badge role
Badges are metadata aids, not decorative stickers.

Badges may indicate:
- content type
- status
- category
- small priority cues

Badges may not act as ornamental clutter or false prestige labels.

### 16.7 Badge budget
Badge count must remain tightly controlled.

Rules:
- cards should expose no more than two visible badges by default unless the surface meaning absolutely requires more
- secondary badge meanings should collapse before title clarity is compromised
- badge stacks may not replace hierarchy discipline

### 16.8 Badge styling rules
Badges must remain calm and readable.

Rules:
- use restrained contrast
- keep size subordinate to title and primary metadata
- avoid multicolor sticker behavior
- pill forms are allowed only when they remain visually quiet

### 16.9 Micro-UI clutter thresholds
Micro-UI includes badges, icons, counters, and tiny action controls.

Rules:
- micro-UI may assist hierarchy, but may not overtake it
- if a card or panel feels like a tray of small objects rather than a meaningful unit, the system has failed
- micro-UI must be reduced before content is reduced

### 16.10 Forbidden icon and badge patterns
Forbidden:
- mixing unrelated icon families
- oversized icons that compete with titles
- filled icons used randomly without state meaning
- badge piles replacing clear structure
- decorative label clutter masquerading as richness

## 17. Interaction States

### 17.1 State system is mandatory
The UI must consistently express state. Beautiful stillness is not enough. Users must understand what is interactive, active, selected, unavailable, loading, empty, or broken.

### 17.2 Required states
The system must express at least:
- hover
- focus-visible
- active or pressed
- selected
- disabled
- loading
- empty
- error
- success or confirmation where relevant

### 17.3 Hover state
Hover should clarify affordance and hierarchy on pointer-capable devices.

Rules:
- hover may subtly shift background, border, elevation, or opacity
- hover may not radically transform geometry or meaning
- hover must never be required to discover critical content identity

### 17.4 Focus-visible state
Focus-visible is mandatory and non-negotiable.

Rules:
- it must be immediately perceivable
- it must not be weaker than hover
- it must remain usable across cards, buttons, palette rows, drawers, sheets, and interactive lists
- invisible or barely visible focus is forbidden

### 17.5 Pressed or active state
Pressed state confirms tactile contact.

Rules:
- response must feel immediate
- changes may include tone, shadow, translation, or opacity adjustment
- feedback may not feel gummy, laggy, or theatrical

### 17.6 Selected state
Selected state must read more clearly than hover.

Rules:
- selected rows in discovery surfaces must remain obvious while navigating
- selected cards, tabs, or filter items must not rely only on color nuance too subtle to trust
- selected state must remain understandable without pointer presence

### 17.7 Disabled state
Disabled must look unavailable but still legible.

Rules:
- disabled may reduce contrast modestly
- disabled may not become invisible or misleadingly identical to inactive neutral states
- disabled controls must not remain visually tempting if they cannot act

### 17.8 Loading state
Loading must remain within product dignity.

Rules:
- loading may use skeletons, subtle placeholders, or status language
- loading may not cause layout collapse if stable structure can be preserved
- loading indicators may not become decorative spectacle

### 17.9 Empty state
Empty means absence, not failure theater.

Rules:
- explain the absence calmly
- offer next action where useful
- preserve shell identity and hierarchy

### 17.10 Error state
Error must feel truthful and recoverable.

Rules:
- explain the condition clearly
- expose recovery where possible
- do not collapse the surface into generic ugliness
- do not use panic aesthetics

### 17.11 State hierarchy rule
States must have predictable hierarchy.

Example:
- focus-visible outranks hover
- selected outranks hover
- disabled cancels hover theatrics
- loading suspends false confidence

### 17.12 Forbidden state patterns
Forbidden:
- invisible focus
- hover stronger than selected
- disabled states that read like ordinary metadata
- loading indicators that jump layout unnecessarily
- error states that feel unrelated to the product language

## 18. Micro-Interaction and Feedback Model

### 18.1 Feedback role
Feedback confirms action, preserves trust, and improves tactile confidence.

### 18.2 Feedback design principle
Micro-interactions must be useful before they are delightful.

Rules:
- feedback must be immediate enough to reassure
- feedback must be restrained enough not to become noise
- feedback must preserve product calmness

### 18.3 Required feedback zones
Feedback must be designed for at minimum:
- save or bookmark
- share or utility action
- command palette open and close
- drawer and sheet open and close
- selection movement in discovery surfaces
- retry and error acknowledgement
- copy or confirm actions where relevant

### 18.4 Timing rules
Micro-feedback must feel immediate.

Operational guidance:
- pressed feedback should appear essentially at contact time
- open or close feedback for sheets, drawers, and palette must feel snappy rather than floaty
- confirmation feedback may linger briefly, but may not overstay its purpose

### 18.5 Intensity rules
Feedback should feel intelligent, not noisy.

Rules:
- avoid dramatic bounce, flourish, or celebratory excess for ordinary actions
- avoid dead-flat feedback that makes action feel ignored
- use the minimum expressive force required to confirm state change

### 18.6 Save and confirm actions
Save, library, bookmark, and similar confirmations must feel trustworthy.

Rules:
- state change must be obvious
- feedback must not depend on color alone
- icon change, label change, or short-lived confirmation may be combined if calmness is preserved

### 18.7 Selection movement
Discovery surfaces, menus, and structured selection lists must provide obvious feedback as focus or selection moves.

Rules:
- keyboard movement and pointer hover must not feel visually unrelated
- selected item must remain stronger than hover item

### 18.8 Overlay and panel feedback
When palette, sheet, drawer, or modal-like systems open or close:
- the movement must clarify hierarchy
- the state change must feel singular and intentional
- the surface must not appear to “sort of” open or close ambiguously

### 18.9 Error and retry feedback
When something fails:
- error acknowledgment must be clear
- retry affordance must feel real rather than ornamental
- repeated failure must not trigger increasingly noisy UI

### 18.10 Forbidden micro-interaction patterns
Forbidden:
- theatrical bounce for routine controls
- delayed feedback that makes the system feel uncertain
- decorative state noise with little informational value
- inconsistent confirmation logic between similar actions

## 19. Scrolling and Scroll-Context Model

### 19.1 Scroll is a product behavior
Scrolling must feel calm, intentional, and structurally understandable.

### 19.2 Reading scroll
Reading scroll must preserve the dominance of the content column.

Rules:
- chrome must not constantly interrupt reading rhythm
- sticky support systems may assist, but may not harass
- long-form content must not feel trapped inside a cramped internal scroll area when page scroll would be more honest

### 19.3 Browse scroll
Browse scroll must feel efficient and stable.

Rules:
- listing surfaces may not feel jittery because of unstable loading or theatrical chrome shifts
- card rhythm must remain legible through long browse sessions
- load continuation must not break hierarchy abruptly

### 19.4 Nested scroll restraint
Nested scrolling is allowed only when clearly justified.

Rules:
- prefer one dominant scroll context wherever possible
- panels, discovery results, and sheets may scroll internally when necessary
- do not create nested scroll regions simply because layout convenience makes them easy

### 19.5 Scroll locking for overlays and sheets
Overlay-capable systems must manage scroll locking intentionally.

Rules:
- when an overlay should interrupt page context, background scroll must not remain accidentally active
- when closing an interruptive overlay, background scroll position must feel stable and trustworthy
- scroll return may not feel broken or disorienting

### 19.6 Sticky behavior
Sticky elements may support continuity.

Rules:
- use sticky behavior where it clarifies task support such as reading navigation or stable action access
- sticky systems may not multiply until they compete for vertical attention
- sticky behavior may not create oscillating or jumpy layout conditions

### 19.7 Dock behavior on scroll
Dock reaction to scroll must remain restrained.

Rules:
- if dock shifts, hides, or softens on scroll, the behavior must reduce friction rather than create theater
- scroll-linked dock behavior may not feel jittery, indecisive, or hyperactive

### 19.8 Discovery and panel scroll
Command palette, drawers, sheets, and panels may use internal scrolling when required.

Rules:
- internal scroll must be obvious and not mistaken for full-page scroll
- header and dismissal logic must remain clear
- result lists may not feel cramped utility trays

### 19.9 No scroll traps
Scroll contexts may not trap users unintentionally.

Rules:
- users must be able to understand which region is scrolling
- keyboard and touch users may not be trapped in awkward internal scroll states
- recovery from deep overlay scroll positions must remain clear

### 19.10 Forbidden scroll patterns
Forbidden:
- gratuitous nested scroll regions
- sticky systems that dominate rather than assist
- jittery chrome reacting to minor scroll changes
- scroll lock failures that let background and foreground fight each other
- infinite-scroll behavior that destroys orientation without support cues

## 20. Motion and Transition Rhythm

### 20.1 Motion purpose
Motion clarifies hierarchy, continuity, tactility, and state change.

### 20.2 Motion hierarchy
Not all motion has equal importance.

Operational levels:
- **Micro motion**: hover, press, subtle feedback
- **Context motion**: card expansion, state swap, section reveal
- **Overlay motion**: drawers, sheets, palette, modal-class surfaces

The stronger the interruption, the clearer and calmer the motion must become.

### 20.3 Shared easing family
PakRPP uses one dominant easing family so motion feels related across the product.

Primary easing curve:
- `cubic-bezier(0.2, 0, 0, 1)`

Rules:
- this curve is the default for ordinary UI transitions
- exceptions must be rare and purposeful
- timing variation may exist by motion class, but family feeling must remain consistent
- linear easing is forbidden for ordinary position, scale, and spatial UI transitions
- linear easing may be used only for narrowly justified non-spatial or system-progress behaviors

### 20.4 Duration discipline
Durations must feel responsive, not floaty.

Rules:
- micro interactions should feel quick and immediate
- overlays may take slightly longer than micro interactions, but may not feel slow or ceremonial
- long transitions that delay user confidence are forbidden

### 20.5 No motion theater
Motion may not become decorative self-display.

Forbidden:
- oversized bounce
- unnecessary flourish
- “luxury” drift that slows task completion
- layered motion that distracts from hierarchy

### 20.6 Performance-aware motion
Motion must respect performance budgets.

Rules:
- prefer transforms and opacity where motion is needed
- avoid avoidable layout thrash and paint-heavy spectacle
- do not combine blur, shadow animation, and large geometry shifts casually

### 20.7 Reduced motion
Reduced-motion preferences must be respected.

Rules:
- preserve state clarity even when motion is reduced
- interruption surfaces must remain understandable without dramatic transitions
- reduced motion may reduce or simplify animation, but may not destroy hierarchy cues

### 20.8 Motion consistency across systems
Cards, panels, drawers, sheets, palette, and utility feedback must feel like members of one motion language.

### 20.9 Forbidden motion patterns
Forbidden:
- floating, mushy, or indecisive transitions
- motion that announces itself more loudly than the state change it represents
- animation used to disguise poor hierarchy
- product areas that feel like they use different motion dialects

## 21. Accessibility and Resilience

### 21.1 Accessibility is product behavior
Accessibility is not a compliance afterthought. It is part of how PakRPP proves that its elegance is real rather than exclusionary.

Rules:
- primary tasks must remain operable without pointer dependence
- keyboard paths must remain continuous
- focus order must remain intelligible
- semantic meaning may not collapse under visual styling
- degraded states must remain understandable to assistive and non-assistive users alike

### 21.2 Accessibility is not shortcut richness
Keyboard shortcuts do not equal accessibility.

Rules:
- shortcut power may enrich desktop use
- shortcut power may not replace proper focus management, tab order, visible focus, or semantic state communication
- a UI may not describe itself as keyboard-first while producing focus dead-ends or hover-only comprehension

### 21.3 Focus continuity
Focus must move intentionally when the UI changes context.

Rules:
- opening palette, drawer, sheet, dialog, or interruptive panel must place focus in a predictable starting point
- closing interruptive UI must return focus logically where relevant
- focus may not disappear into the document without explanation
- focus jumps that feel accidental are forbidden

### 21.4 Screen-reader dignity
Screen-reader users must encounter a structure that reflects product truth rather than cosmetic illusion.

Rules:
- state changes that matter must be communicable
- landmark and heading structure must remain meaningful
- command palette, drawers, sheets, and panels may not become semantic black holes
- decorative language may not replace truthful structure

### 21.5 Contrast and visibility
Calm styling may not weaken basic visibility.

Rules:
- focus, selected, disabled, loading, empty, and error states must remain distinguishable
- metadata may be quiet, but not illegible
- reduced contrast may not be used as a fake luxury shortcut

### 21.6 Recovery dignity
Recovery is part of the product.

Rules:
- offline, empty, loading, retry, and error states must retain recognizable product shell identity
- recovery language must remain calm, clear, and non-patronizing
- recovery actions must be present where meaningful
- the product may not collapse into generic browser-default ugliness under failure

### 21.7 Weak-condition resilience
The product must behave honestly under weak conditions.

Rules:
- slow network must not create a visually abandoned product
- unavailable results must not masquerade as absence of meaning
- stale or cached content must not falsely imply live certainty
- the UI must prefer truthful continuity over false confidence

### 21.8 Virtual keyboard and viewport safety
Tablet and mobile overlays must remain operable when virtual keyboards or viewport changes occur.

Rules:
- input surfaces must not become trapped off-screen
- dismissal and submit paths must remain reachable
- sticky controls may not collide with keyboard-driven viewport shifts

### 21.9 Accessibility and resilience failure line
If the product feels premium only under ideal conditions and for fully sighted pointer users, it has failed.

## 22. Performance-Aware Luxury

### 22.1 Luxury must obey budgets
UI decisions must respect the product-level budgets defined in `gaga_prd_uiux.md`.

Rules:
- visual polish does not outrank responsiveness
- route-aware performance budgets are not optional targets to “optimize later”
- no new visual behavior may be treated as free until proven cheap enough

### 22.2 Performance is a design filter
Performance must be treated as a design constraint from the beginning, not a cleanup pass.

Rules:
- every new visible system must justify its runtime cost
- every new interaction layer must justify its latency cost
- every new elevated surface must justify its visual and rendering cost

### 22.3 Decorative cost spikes are suspect by default
Blur, shadow, filter, opacity layering, animation, and nested surfaces are suspect unless their value is clear.

Rules:
- ornamental cost without measurable UX gain is invalid
- blur may not compensate for weak structure
- shadow complexity may not compensate for weak hierarchy
- animation may not compensate for weak state clarity

### 22.4 Responsiveness outranks spectacle
If a design choice makes the UI feel slower, heavier, or less trustworthy, the design choice is wrong unless it solves a more important product problem.

### 22.5 Payload restraint
Rules:
- component growth may not assume unlimited JS or CSS payload
- overlays, discovery, and utility systems should remain bounded and justifiable
- product polish must respect route-specific needs rather than ship one giant visual appetite everywhere

### 22.6 Stability is part of speed
A visually unstable fast load is not premium.

Rules:
- avoidable layout shift is forbidden
- loading skeletons or placeholders must preserve structural honesty
- transitions may not disguise unstable layout behavior

### 22.7 Interaction latency discipline
Primary actions must feel responsive within product budgets.

Rules:
- no ordinary action should feel delayed by ornamental UI weight
- feedback must appear soon enough to prevent user doubt
- repeated latency undercuts luxury faster than minor visual roughness

### 22.8 Performance-aware luxury failure line
If the interface looks expensive but feels mechanically wasteful, it is not luxury. It is costume.

## 23. Forbidden Patterns

The following patterns are forbidden unless an explicit, time-boxed exception is documented and approved at product level.

### 23.1 Structural and hierarchy violations
Forbidden:
- empty rails
- duplicate equal-priority action bars
- multiple auxiliary systems competing as equal protagonists on content-primary surfaces
- content losing visual primacy to chrome
- symmetry used as excuse for wasted layout

### 23.2 Discovery and search violations
Forbidden:
- dual active search hosts
- dock morphing into command palette
- command palette geometry that reads like dock spillover
- conflating global discovery with local filtering
- mobile global discovery presented as a tiny floating fragment

### 23.3 Device and posture violations
Forbidden:
- tablet treated as desktop leftovers
- tablet treated as inflated mobile without posture thought
- hover dependency on touch-first devices
- pointer assumptions leaking into mobile critical paths

### 23.4 Card and micro-UI violations
Forbidden:
- card micro-action clutter
- metadata overpowering title and destination meaning
- badge piles replacing hierarchy
- super-component card bloat justified by “system unity”
- mixed-media cards and listing cards drifting into different product languages

### 23.5 State and feedback violations
Forbidden:
- invisible focus
- hover stronger than selected state
- decorative loading theatrics
- error states that abandon product tone
- confirmation logic that changes arbitrarily across similar actions

### 23.6 Material and motion violations
Forbidden:
- alien tonal modes
- blur-heavy shells hiding weak layout
- theatrical motion that slows task completion
- layered visual cost without clear hierarchy value
- multiple motion dialects across product areas

### 23.7 Accessibility and resilience violations
Forbidden:
- shortcut-rich but focus-poor UI
- hover-only critical meaning
- recovery states collapsing into browser-default ugliness
- semantic honesty sacrificed for styling theater
- weak-condition behavior treated as outside product responsibility

### 23.8 Performance violations
Forbidden:
- decorative runtime cost added without budget awareness
- new UI weight justified by “we can optimize later”
- layout instability tolerated because the page still feels “premium” in screenshots

## 24. Acceptance Criteria

### 24.1 Acceptance criteria are enforcement rules
A surface, component, or refactor does not pass because it “looks improved.” It passes only if it preserves hierarchy, device logic, accessibility, resilience, and measurable quality.

### 24.2 Desktop acceptance
Desktop passes only when all conditions below are true:
- keyboard traversal has no dead-end path through primary flows
- focus-visible remains present and obvious
- pointer targets feel stable and not twitch-fragile
- hover reveals enrich but do not gate primary meaning
- command palette is centered or top-centered and clearly distinct from dock geometry
- no more than one auxiliary system dominates a content-primary view at once
- content remains visually primary on reading and browsing surfaces
- no empty rail survives without explicit task value

### 24.3 Tablet acceptance
Tablet passes only when all conditions below are true:
- portrait and landscape each have explicit behavior logic
- no desktop persistence survives by accident where touch-first transformation is required
- reach and posture have clearly influenced control placement
- no major interaction depends on hover
- drawers and sheets feel intentional rather than fallback leftovers
- optional keyboard use does not break touch-first clarity
- command palette appears as an adaptive sheet rather than a desktop fragment

### 24.4 Mobile acceptance
Mobile passes only when all conditions below are true:
- one dominant task is obvious in each screen state
- global discovery uses full-screen mode
- primary actions remain thumb-reachable without grip-breaking effort
- secondary systems use sheet, drawer, or modal logic rather than desktop imitation
- no tiny floating desktop artifact remains
- no critical action depends on hover or precision pointer assumptions
- reading flow remains calm and not over-chromed

### 24.5 Cross-device acceptance
Cross-device passes only when all conditions below are true:
- the same component family still feels like the same family across devices
- semantics, naming, and state logic remain stable
- visual hierarchy remains recognizable
- adaptation feels intentional rather than accidental
- tablet no longer reads as compromised desktop or inflated mobile

### 24.6 Discovery acceptance
Discovery passes only when all conditions below are true:
- only one active search surface exists at a time
- command palette remains clearly distinct from dock and local filtering
- desktop palette is centered or top-centered and singular in focus
- tablet palette is sheet-like and posture-aware
- mobile palette is full-screen
- idle, loading, results, empty, and error states all remain product-consistent
- competing search hosts do not stay visibly alive when global discovery is open

### 24.7 Card system acceptance
Card system passes only when all conditions below are true:
- all card variants still feel like one family
- no super-component bloat is introduced under the excuse of visual consistency
- cards preserve one obvious primary action
- visible quick actions remain within budget
- mixed-media and SSR listing cards differ honestly without drifting into different products
- metadata remains subordinate to title and destination meaning

### 24.8 Accessibility acceptance
Accessibility passes only when all conditions below are true:
- primary tasks are keyboard-operable
- focus order remains logical
- overlays and sheets manage focus intentionally
- focus-visible is never lost
- critical meaning is not hover-only
- degraded and error states remain understandable
- semantic state changes remain communicable
- no shortcut design creates semantic confusion or exclusion

### 24.9 Resilience acceptance
Resilience passes only when all conditions below are true:
- offline, empty, error, and retry states preserve recognizable product shell identity
- recovery actions are clear and reachable
- the UI does not collapse into browser-default ugliness under failure
- weak-state behavior remains calm and editorial rather than panicked or generic
- slow or partial availability does not create false confidence

### 24.10 Performance-aware acceptance
Performance-aware UI passes only when all conditions below are true:
- product-level budgets are not violated by the UI layer
- no decorative blur, shadow, animation, or filter stack creates unjustified cost
- interaction latency remains within budget for primary flows
- avoidable layout shift is prevented
- visible polish does not sabotage responsiveness

### 24.11 Patch acceptance baseline
No refactor passes if it improves one local component while degrading product coherence, device logic, resilience, accessibility, or budget compliance elsewhere.

## 25. Refactor Mapping for Codex

### 25.1 Codex must treat this file as operational law
Codex may refine implementation details, but it may not contradict behavioral intent, product hierarchy, or acceptance criteria in this document.

### 25.2 Required patch declaration
Every meaningful UI patch must declare:
- affected device class
- affected surface class
- affected component or family
- dominant task affected
- behavior changed
- states affected
- regression checks required
- whether PRD-level product decisions are touched

### 25.3 Required patch reasoning
Every patch must answer:
- what user problem is being solved
- why this belongs to the current layer
- how the change preserves hierarchy and device logic
- what tradeoff was introduced, if any

### 25.4 Mandatory regression matrix
Refactors that affect public UI must be checked against at minimum:
- desktop keyboard flow
- desktop pointer and hover behavior
- tablet portrait behavior
- tablet landscape behavior
- mobile touch flow
- command palette behavior
- one degraded or recovery state when relevant

### 25.5 Automatic rejection rules
Reject any patch that:
- increases chrome competition
- introduces dual search truth
- weakens focus visibility
- worsens tablet behavior
- creates hover-only critical meaning
- increases decorative runtime cost without product justification
- hides structural weakness cosmetically
- expands a card into uncontrolled super-component logic
- leaves recovery and failure states weaker than before

### 25.6 Escalation rule
Escalate back to PRD-level decision if a patch changes:
- dominant task of a surface
- mobile discovery mode
- performance budget assumptions
- component family identity
- tablet posture logic
- resilience model

### 25.7 No local optimization fraud
A patch that improves one local component while weakening product coherence is invalid even if the local component looks better in isolation.

### 25.8 Refactor discipline for AI-assisted work
Codex must prefer:
- bounded changes over architecture cosplay
- explicit behavioral improvements over ornamental polish
- product consistency over clever local invention
- reversible refactors over opaque “all-in-one” rewrites unless explicitly requested

## 26. Change Log and Open Decisions

### 26.1 Change log role
This section tracks meaningful UX rule changes so the system does not drift silently.

### 26.2 What must be logged
Log:
- rule changes affecting user-visible behavior
- accepted exceptions to forbidden patterns
- time-boxed temporary bridges
- newly resolved product decisions descended from PRD
- deprecated UX patterns scheduled for removal

### 26.3 Exception discipline
Any exception must state:
- what rule is being violated
- why the exception exists
- what risk it introduces
- when it will be reviewed or removed

### 26.4 No silent exception permanence
An undocumented exception is invalid. A documented exception with no review plan is debt, not policy.

### 26.5 Open decision handling
Open decisions may survive here only if:
- they do not contradict current PRD decisions
- they do not block safe implementation
- they are explicitly tracked and reviewable

### 26.6 End-state rule
This document should become harder to revise casually over time, not softer. Growth in maturity must reduce ambiguity, not increase it.

