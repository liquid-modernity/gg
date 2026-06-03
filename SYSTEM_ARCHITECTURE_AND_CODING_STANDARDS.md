# SYSTEM ARCHITECTURE & CODING STANDARDS

> This document defines the architecture, coding standards, repository structure, performance principles, accessibility requirements, and AI-agent working rules for this codebase.
>
> The goal is not merely to make the project look clean. The goal is to make the system predictable, maintainable, crawlable, accessible, fast, SEO/GEO/AEO-ready, and easy for both humans and AI code agents to understand without guessing.

---

## 0. Core Intent

This codebase must be built as a stable, HTML-first, registry-driven, progressively enhanced public web system.

The system must avoid fragile one-off patches, scattered behavior, duplicated markup, duplicated CSS, duplicated route logic, and JavaScript-only rendering for primary content.

The expected output is:

- crawlable HTML fallback
- semantic HTML
- centralized source of truth
- registry-driven route and content contracts
- JSON-LD and structured metadata
- accessibility-first interface behavior
- mobile-first native app-like experience
- consistent global visual rhythm
- easy microcopy, icon, layout, and route configuration
- centralized controller JavaScript
- clean repository structure
- clear source/generated boundaries
- no manual patching of generated files
- high PageSpeed, Lighthouse, and Core Web Vitals readiness
- strong SEO, GEO/AEO, and AI-search discoverability

---

## 1. Rendering, Content Structure, and Discoverability

Use an HTML-first architecture with progressive enhancement.

Do not rely on a pure Single-Page Application lifecycle or JavaScript-only rendering for primary content, navigation, metadata, structured data, or public route output.

Every public route must provide meaningful crawlable HTML fallback before JavaScript enhancement.

JavaScript may improve interaction, routing feel, filtering, animation, and app-like behavior, but it must not be the only source of indexable content.

Use semantic HTML wherever practical.

Prioritize:

- readable document structure
- clear heading hierarchy
- accessible landmarks
- proper links
- meaningful buttons
- valid forms
- crawlable content
- content that remains understandable when scripts fail

Use registry-driven content and route contracts.

Public pages must be generated from centralized registries rather than duplicated hardcoded fragments across `/`, `/landing`, `/store`, or future routes.

Implement structured data using JSON-LD where appropriate.

The following must be centrally controlled:

- metadata
- canonical URLs
- Open Graph tags
- Twitter/X cards
- robots directives
- schema output
- route titles
- route descriptions
- public discovery content

The target outcome is strong SEO, GEO/AEO, and AI-search discoverability through crawlable content, clear structure, reliable metadata, and non-duplicative information architecture.

---

## 2. Source of Truth and Refactoring Discipline

Maintain a single source of truth for:

- behavior
- routing
- surface configuration
- microcopy
- icons
- layout parameters
- metadata
- schema data
- discovery content
- navigation
- public hooks
- route contracts

When fixing bugs, layout issues, performance issues, accessibility issues, or inconsistencies, do not stack overrides, patches, or one-off exceptions.

Rewrite the underlying contract by removing duplication and consolidating the behavior at its proper source.

“Rewrite” does not mean destroying the existing system.

“Rewrite” means:

- remove duplicate logic
- remove obsolete branches
- remove conflicting CSS
- remove scattered behavior
- remove duplicate HTML fragments
- replace inconsistent implementations with one clear contract

Delete unused source HTML, CSS, and JavaScript only after verifying that removal does not break:

- public routes
- build output
- tests
- accessibility
- SEO metadata
- structured data
- generated artifacts
- fallback HTML
- route-specific adapters

Generated files must not be manually patched.

Update the source registry, controller, template, adapter, or build script, then regenerate outputs.

Manual patching of generated output is invalid unless the user explicitly requests an emergency manual fix.

---

## 3. JavaScript Behavior Standards

Use a centralized controller JavaScript architecture.

Behavior must be:

- predictable
- route-aware
- surface-aware
- minimal
- accessible
- progressive-enhancement friendly
- easy to inspect
- easy to test
- easy for AI agents to modify without guessing

Avoid page-specific behavior forks unless they are implemented through approved adapters.

Surface differences between `/`, `/landing`, `/store`, and future routes must be handled through explicit configuration, not scattered conditional hacks.

The controller must expose stable public hooks and contracts for AI code agents and non-technical maintainers.

The following must remain consistent:

- data attributes
- registry keys
- route names
- component roles
- public hook names
- adapter names
- event names
- state names

No feature should require editing multiple disconnected files unless the architecture explicitly demands it.

Avoid:

- inline scripts for route behavior
- duplicated event listeners
- hidden global state
- route-specific controller copies
- behavior embedded inside markup
- behavior embedded inside CSS naming hacks
- feature logic stored in generated output

JavaScript must enhance the HTML. It must not become the only reason the page works.

---

## 4. CSS and Visual System Standards

Use one global visual rhythm across all public surfaces.

Maintain consistent:

- spacing
- typography
- border radius
- elevation
- icon scale
- motion
- interaction patterns
- density
- layout rhythm
- component proportion

Use a global stylesheet contract with context-aware adapters.

Do not solve local visual problems by adding override layers on top of override layers.

Use centralized design tokens for:

- color
- spacing
- typography
- radius
- shadow/elevation
- motion
- z-index
- layout density
- interaction states

The visual direction is:

- quiet luxury
- restrained minimalism
- Apple-inspired clarity
- native app-like polish
- premium but not theatrical
- elegant but not bloated
- calm but not empty

The interface must feel premium without becoming decorative, heavy, slow, or over-designed.

Avoid:

- random page-level CSS files
- emergency override files
- unused selectors
- duplicate component styling
- route-specific visual drift
- excessive shadows
- excessive animations
- excessive gradients
- layout hacks hidden inside CSS

CSS must express a system, not a pile of corrections.

---

## 5. Accessibility and Mobile-First Experience

Design mobile-first.

All primary flows must work on:

- small screens
- touch input
- keyboard navigation
- screen readers
- reduced-motion preferences
- slow devices
- slow networks

Follow WCAG 2.2 AA as the practical accessibility target.

Accessibility is not decoration. It is part of the interface contract.

Required accessibility standards:

- valid labels for form controls
- meaningful button names
- accessible links
- correct heading hierarchy
- visible focus states
- logical keyboard order
- sufficient contrast
- reduced motion support
- correct ARIA only when needed
- no fake interactive elements
- no clickable non-semantic divs when native elements are appropriate
- no hidden keyboard traps
- no focus loss after modal/sheet interactions
- no inaccessible icon-only controls

Use a Touch Target ≠ Visual Target system where needed.

Minimal icons and microcopy may remain visually compact, but the actual clickable/focusable target must meet accessibility requirements.

Interactive targets should provide at least 24 × 24 CSS pixels as a minimum baseline, with larger practical hit areas where the interface density allows.

Use transparent hit areas through the actual interactive element or its pseudo-elements without breaking:

- focus behavior
- pointer behavior
- screen-reader semantics
- layout rhythm
- visual minimalism

Focus states, labels, ARIA attributes, keyboard order, contrast, reduced motion, and semantic roles must be treated as first-class interface requirements.

---

## 6. Performance and Maintainability

Prioritize:

- lightweight source code
- minimal client-side runtime
- stable HTML fallback
- predictable asset loading
- minimal dependencies
- static generation where possible
- simple route contracts
- clean build output
- low main-thread cost

Avoid:

- unused CSS
- unused JavaScript
- duplicate HTML fragments
- unnecessary dependencies
- decorative scripts
- fragile micro-optimizations
- JavaScript-heavy rendering for static content
- bloated third-party embeds
- excessive DOM size
- client-side work that can be done at build time

Performance targets must be pursued through architectural simplicity, not Lighthouse tricks.

The codebase must remain easy for AI code agents and non-technical maintainers to:

- inspect
- understand
- modify
- verify
- extend
- debug
- test
- regenerate

If a change makes the system harder to understand, it must justify that complexity with clear user value.

---

## 7. Route Stability

The routes `/`, `/landing`, and `/store` must share stable global contracts for:

- behavior
- styling
- accessibility
- metadata
- structured data
- public API conventions
- design tokens
- controller hooks
- route registry entries

The root and landing surfaces may share discovery and shell logic where appropriate.

The store surface must remain isolated where its behavior, data, or business logic differs.

Route-specific adapters are allowed.

Route-specific hacks are not allowed.

A route-specific adapter must be:

- explicit
- named clearly
- documented
- connected to a registry or config
- limited to real route differences
- free from duplicated global logic

No route may silently fork the global visual system, controller behavior, metadata rules, or accessibility baseline.

---

## 8. Authentication and Entry Logic

If authentication or gated entry is required, keep the entry flow minimal and low-friction.

For lightweight onboarding or early-stage access, prefer a straightforward email-only entry pattern unless security requirements demand stronger authentication.

Do not introduce complex authentication flows unless explicitly justified by product requirements.

Avoid adding:

- magic links
- full account systems
- sessions
- passwords
- OAuth
- external identity providers
- multi-step onboarding
- unnecessary verification gates

Security complexity must be proportional to product risk.

If the product only needs lightweight access, do not build enterprise authentication theater.

---

## 9. Performance, PageSpeed, and Core Web Vitals Standards

The codebase must be optimized for high PageSpeed Insights and Lighthouse performance scores without sacrificing:

- semantic HTML
- accessibility
- SEO
- structured data
- maintainability
- route stability
- source-of-truth discipline

Use performance budgets for every public route.

Keep JavaScript minimal.

Avoid unnecessary dependencies.

Prevent long main-thread tasks.

Avoid client-side work that can be handled by:

- static HTML
- CSS
- build-time generation
- registry output
- precomputed JSON
- simple progressive enhancement

Optimize Core Web Vitals as first-class requirements.

### 9.1 LCP

Ensure the largest above-the-fold content is discoverable early in the initial HTML.

Do not lazy-load the LCP image.

Use:

- explicit image dimensions
- efficient image formats
- responsive image sizing
- preload only when justified
- `fetchpriority="high"` only for the true LCP asset when appropriate

Avoid:

- hiding hero content behind JavaScript
- injecting the LCP element late
- lazy-loading the hero image
- using oversized images scaled down through CSS
- loading critical images from unstable third-party sources

### 9.2 INP and TBT

Keep JavaScript execution small.

Defer non-critical scripts.

Avoid expensive event handlers.

Avoid hydration-heavy patterns.

Split non-critical behavior from core interaction logic.

Avoid:

- large global listeners
- repeated DOM queries in loops
- expensive scroll handlers
- unnecessary animation listeners
- blocking third-party scripts
- client-side rendering for static content

### 9.3 CLS

Always reserve space for:

- images
- embeds
- cards
- banners
- fonts
- dynamic components
- ads
- drawers
- sheets
- modals
- async content

No layout-shifting content may be injected without predefined dimensions, containment, or reserved space.

### 9.4 Lazy Loading

Use lazy loading only for non-critical below-the-fold assets.

Add `loading="lazy"` to below-the-fold images and iframes.

Add `decoding="async"` to non-critical images.

Do not lazy-load:

- hero images
- primary thumbnails above the fold
- logo assets required for first paint
- the expected LCP element
- critical UI icons required for first interaction

Lazy loading is a tool, not a religion.

Applying lazy loading blindly can damage LCP.

### 9.5 Images

Images must be served in optimized formats and sizes.

Use:

- responsive `srcset`
- correct `sizes`
- explicit `width`
- explicit `height`
- compressed assets
- modern formats where appropriate
- source asset optimization before deployment

Avoid:

- huge original images scaled down through CSS
- missing dimensions
- uncompressed screenshots
- decorative images that add no user value
- repeated image variants without purpose

### 9.6 CSS Performance

CSS must be performance-aware.

Keep critical layout CSS lightweight.

Avoid unused CSS.

Avoid excessive:

- animations
- filters
- shadows
- gradients
- layout-triggering transitions
- deeply nested selectors

Prefer transform and opacity for motion.

Respect `prefers-reduced-motion`.

Do not use CSS as a dumping ground for emergency patches.

### 9.7 Fonts

Fonts must be performance-aware.

Minimize custom font usage.

Use `font-display: swap` or an equivalent strategy.

Avoid unnecessary font weights and styles.

Prevent font loading from causing layout shifts.

Use system fonts where they serve the product direction.

Do not sacrifice performance for decorative typography unless the brand requirement is explicit.

### 9.8 Third-Party Scripts

Third-party scripts must be treated as performance liabilities.

No analytics, embeds, widgets, ads, chat scripts, or external libraries may be added without clear justification.

Load third-party scripts:

- lazily
- conditionally
- after user interaction
- only on routes that need them
- only after the primary page experience is stable

Do not allow third-party scripts to block rendering or degrade Core Web Vitals.

### 9.9 Caching and Delivery

Caching and delivery must be optimized.

Use long-lived cache headers for static assets where possible.

Version or fingerprint assets when needed.

Avoid cache-busting patterns that force unnecessary reloads.

Keep HTML fresh while allowing CSS, JS, images, and fonts to be cached efficiently.

### 9.10 Performance Regression Checklist

Every major change must be checked against:

- LCP regression
- CLS regression
- TBT/INP regression
- unused CSS
- unused JavaScript
- render-blocking resources
- oversized images
- excessive DOM size
- accessibility failures
- SEO metadata breakage
- structured-data breakage
- route fallback breakage
- third-party script bloat

Do not optimize for Lighthouse by tricks.

Optimize the architecture so Lighthouse, Core Web Vitals, SEO, accessibility, and maintainability improve together.

---

## 10. Repository Structure and File Ownership Standards

The repository must use a clear, predictable, and human-readable folder structure.

Every folder must have:

- a defined purpose
- an ownership boundary
- an editing rule
- a source/generated classification
- clear relationship to build output
- clear relationship to tests or QA guards

Separate source files from generated files.

Source files are editable.

Generated files must never be manually patched.

Recommended structure:

```txt
/src
  /config
    Site-wide configuration, route definitions, feature flags, metadata defaults, and environment-safe constants.

  /registries
    Central source of truth for routes, navigation, discovery content, microcopy, icons, schema data, and surface configuration.

  /templates
    HTML templates and layout shells used to generate public pages.

  /surfaces
    Route-specific adapters for `/`, `/landing`, `/store`, and other public surfaces.
    Surface folders may adapt behavior and layout, but must not duplicate global logic.

  /styles
    Global CSS contract, design tokens, base styles, accessibility utilities, and surface adapters.
    No random page-level override files are allowed.

  /scripts
    Centralized controller JS, behavior modules, utilities, and approved surface adapters.
    No scattered inline behavior or one-off page scripts unless explicitly justified.

  /schema
    JSON-LD builders, structured data templates, metadata helpers, and validation fixtures.

  /assets
    Source assets before optimization, including icons, images, fonts, and static media.

  /content
    Editable content data, copy, labels, page text, and structured content inputs.

/build
  Build scripts, generators, asset optimization scripts, and publishing utilities.

/dist
  Generated output only.
  Files in this folder must not be manually edited.

/tests
  Unit, integration, accessibility, route, metadata, and regression tests.

/qa
  Guard scripts, source-of-truth checks, unused-code checks, Lighthouse/PageSpeed checks, and release validation.

/docs
  Architecture notes, source-of-truth documentation, route contracts, coding standards, and maintainer guides.

/archive
  Deprecated reference files only.
  Archived files must never be imported by active source code.
```

The structure may be adapted to project constraints, but the source/generated boundary must remain strict.

If the repo uses Blogger, Cloudflare Workers, GitHub Actions, or static publishing outputs, generated publish files must still be traceable back to `/src`, `/build`, or approved source folders.

---

## 11. Naming, Discovery, and AI-Agent Readability

Folder and file names must describe their responsibility clearly.

Avoid vague names such as:

- `misc`
- `new`
- `final`
- `fix`
- `fixed`
- `test2`
- `backup`
- `old`
- `old-working`
- `copy`
- `latest`
- `real-final`
- `temporary`
- `try`
- `experiment` unless intentionally isolated

Use consistent naming conventions:

- kebab-case for files and folders
- camelCase for JavaScript variables and functions
- PascalCase only for class-like constructors or component factories
- UPPER_SNAKE_CASE only for constants that are intentionally global or immutable

Every major folder must contain a short `README.md` explaining:

- what belongs in the folder
- what must not be placed there
- which files are source-of-truth
- which files are generated
- which scripts or tests validate the folder
- which common mistakes must be avoided

AI code agents must modify the source-of-truth file first, not the visible symptom file.

Before creating a new file, the agent must check whether an existing registry, adapter, template, controller, token, schema builder, or build script already owns that responsibility.

No duplicate folder responsibilities are allowed.

If two folders appear to own the same concern, consolidate them before adding new behavior.

A file should be discoverable by responsibility.

A human or AI agent should be able to infer the file purpose from:

- folder path
- file name
- exported function names
- registry keys
- README notes
- test references

If understanding a file requires tribal knowledge, the repo structure has failed.

---

## 12. Source vs Generated Boundary

The repository must enforce a strict source/generated boundary.

Editable source files include:

- `/src/**`
- `/build/**`
- `/tests/**`
- `/qa/**`
- `/docs/**`

Generated or publish-ready files include:

- `/dist/**`
- generated Blogger template outputs
- generated store pages
- generated JSON feeds
- generated sitemap outputs
- generated metadata outputs
- generated route pages
- generated build reports

Generated files must include a comment or marker when possible:

```html
<!-- GENERATED FILE. DO NOT EDIT DIRECTLY. UPDATE /src INSTEAD. -->
```

For generated JSON files, use an equivalent metadata field when possible:

```json
{
  "_generated": true,
  "_doNotEdit": "Update source files in /src and regenerate this output."
}
```

Any fix applied directly to a generated file is invalid unless the user explicitly requests an emergency manual patch.

A proper fix must update the source of truth, then regenerate the output.

The build process must make it clear which files are generated and which files are manually maintained.

The repo must prevent accidental confusion between:

- source templates and generated HTML
- source data and generated JSON
- source CSS and bundled CSS
- source JS and published JS
- test fixtures and production content
- archive files and active source files

---

## 13. AI Code Agent Operating Rules

Before modifying code, the AI code agent must identify:

- the route affected
- the source-of-truth file
- the generated output affected
- the registry or adapter involved
- the tests or QA guards that should validate the change
- whether the change touches HTML, CSS, JS, schema, metadata, accessibility, performance, or build output

The agent must not create new architecture when an existing contract can be extended.

The agent must not add overrides before checking whether the root cause is:

- duplicated registry data
- broken adapter logic
- stale generated output
- missing design token
- incorrect template
- incorrect route config
- missing accessibility contract
- incorrect build script
- old archive code being imported
- unused CSS/JS still being referenced

The agent must prefer:

1. source-of-truth fix
2. registry/config fix
3. template fix
4. adapter fix
5. controller fix
6. token/system fix
7. test/guard update
8. regeneration

The agent must avoid:

- patching symptoms
- adding route-specific hacks
- creating duplicate controllers
- creating duplicate CSS files
- editing generated files directly
- bypassing registries
- hiding content behind JavaScript
- using visual-only accessibility fixes
- adding third-party scripts without justification
- adding files with unclear ownership
- leaving unused code behind

Every change should leave the repo simpler, not more tangled.

---

## 14. Acceptance Checklist for Major Changes

A major change is acceptable only if the following are true:

### Architecture

- The source of truth is clear.
- No duplicate contract was added.
- No generated file was manually patched.
- No route-specific hack was introduced.
- New behavior is registry-driven or adapter-driven where appropriate.

### HTML and SEO

- Public content remains crawlable.
- HTML fallback still works.
- Semantic structure is preserved.
- Metadata is correct.
- JSON-LD remains valid where applicable.
- Canonical and robots directives are not broken.

### CSS

- Global visual rhythm is preserved.
- No unnecessary override layer was added.
- Tokens were used where appropriate.
- Route-specific styling is isolated through approved adapters.
- Unused CSS was not introduced.

### JavaScript

- Centralized controller architecture is preserved.
- No duplicate behavior module was added.
- No unnecessary dependency was added.
- No critical content depends only on JavaScript.
- Event handling remains efficient and accessible.

### Accessibility

- Keyboard navigation works.
- Focus states are visible.
- Labels and ARIA are correct.
- Touch targets are sufficient.
- Reduced motion is respected.
- Screen-reader semantics are not broken.

### Performance

- LCP is not delayed.
- LCP image is not lazy-loaded.
- CLS is not introduced.
- JS cost remains controlled.
- Third-party scripts are justified.
- Images are sized and optimized.
- Fonts do not cause avoidable layout shift.
- No Lighthouse tricks were used.

### Repository Structure

- File ownership is clear.
- Naming is readable.
- Source/generated boundary is respected.
- New files are placed in the correct folder.
- README or docs are updated when folder responsibility changes.
- Archive files are not imported by active source code.

---

## 15. Non-Negotiable Hard Constraints

The following are hard constraints:

1. Do not patch generated files unless explicitly requested as an emergency manual fix.
2. Do not add override layers to solve problems caused by broken contracts.
3. Do not duplicate route logic across `/`, `/landing`, and `/store`.
4. Do not create a second controller for behavior already owned by the central controller.
5. Do not hide primary content behind JavaScript-only rendering.
6. Do not lazy-load the LCP image.
7. Do not introduce unused CSS, JS, HTML, or dead source files.
8. Do not add third-party scripts without justification.
9. Do not create vague folders or files with unclear responsibility.
10. Do not sacrifice accessibility for visual minimalism.
11. Do not sacrifice SEO/discoverability for app-like behavior.
12. Do not sacrifice maintainability for fake Lighthouse optimization.
13. Do not confuse “rewrite” with destroying the system.
14. Do not confuse “minimalism” with missing structure.
15. Do not confuse “AI-agent friendly” with over-commented messy code.

---

## 16. Definition of Done

A task is done only when:

- the source-of-truth file has been updated
- generated outputs are regenerated when needed
- no generated output is manually patched
- public routes still work
- HTML fallback remains meaningful
- metadata and schema remain valid
- accessibility is preserved
- performance risk is checked
- unused code is removed safely
- folder ownership remains clear
- no duplicate contracts are introduced
- docs or README files are updated when architecture changes
- the change can be understood by a human or AI agent without guessing

The final system must be simple enough to maintain, strict enough to prevent entropy, and structured enough for AI code agents to modify safely.

---
