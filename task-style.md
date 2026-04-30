TASK: Apple HIG Alignment Pass for BLOG GAGA Blogger CSS

File:
- index.xml

Primary editing area:
- Only edit CSS inside <b:skin><![CDATA[ ... ]]></b:skin>
- You may edit the Material Symbols Google Fonts <link> in <head> only if needed to support variable icon weights.
- Do not change Blogger b:widget, b:section, b:if, route logic, JSON-LD, JavaScript contracts, Worker logic, canonical URLs, template fingerprint logic, or SSR route truth.

Goal:
Refine the existing BLOG GAGA CSS so the interface feels closer to Apple Human Interface Guidelines while preserving the current Quiet Luxury / editorial / Blogger PWA identity. The target is not to imitate iOS literally, but to improve Apple-like principles: clarity, deference, depth, adaptive appearance, safe touch targets, reduced motion, and calm iconography.

Non-goals:
- Do not replace Material Symbols with another icon library.
- Do not redesign the layout.
- Do not increase visual bulk on iPhone-sized screens.
- Do not remove the dock, sheets, preview sheet, detail toolbar, or detail outline.
- Do not introduce external JavaScript.
- Do not add large CSS frameworks.
- Do not create last-minute override spaghetti. Use existing tokens and systematic selectors.

Current issues to fix:
1. Touch target inconsistency:
   - Some interactive tokens are below 44px:
     --gg-entry-row-action-min-height: 40px;
     --gg-discovery-tab-height: 38px;
     --gg-search-empty-primary-min-height: 36px;
     --gg-comment-action-min-height: 28px;
     --gg-detail-outline-micro-min-height: 34px / 36px in media query.
   - Raise hit targets to at least 44px without making the visual UI feel bulky.

2. Material Symbols are too Google/Material-heavy:
   - Current .gg-icon uses font-size: 22px and wght 500.
   - Make icons visually quieter, thinner, and more Apple-like while still using Material Symbols.

3. Missing reduced-motion support:
   - Add @media (prefers-reduced-motion: reduce).
   - Disable or dramatically reduce sheet, dock, outline, progress, hover, press, and scroll animations.

4. Missing dark mode token layer:
   - Add color-scheme support.
   - Add @media (prefers-color-scheme: dark) tokens.
   - Preserve current warm editorial palette in light mode.
   - Dark mode should be calm, not pure black, and should preserve hierarchy.

5. Missing high-contrast / forced-colors hardening:
   - Add @media (prefers-contrast: more) if appropriate.
   - Add @media (forced-colors: active) fallback for borders, outlines, and interactive controls.

6. Backdrop-filter dependency:
   - Existing dock, toolbar, outline, sheet scrim, and panels use blur.
   - Add @supports fallback so surfaces remain readable when backdrop-filter is unsupported.

7. Interface deference:
   - Avoid making dock + detail outline + toolbar visually compete with content.
   - Keep active states calm and surface-based, not icon-heavy.
   - Do not use filled icons for active state.

Implementation requirements:

A. Update Material Symbols font request if needed.
Current head link loads Material Symbols with fixed weight. Change it to support lighter weights and grade variation:
- Use variable ranges for opsz, wght, FILL, and GRAD.
- Keep existing icon_names subset unless there is a syntax issue.
- Preserve XML escaping with &amp;.

Suggested form:
https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&amp;icon_names=calendar_add_on,chevron_right,comment,explore,home_app_logo,keyboard_arrow_down,keyboard_arrow_up,menu,newsmode&amp;display=block

B. Add/adjust root tokens.
Inside :root, add systematic tokens for:
- color-scheme
- icon size/weight/grade
- minimum tap target
- focus ring
- backdrop fallback surfaces
- dark mode compatible shadow/line/surface tokens if needed.

Recommended baseline:
:root {
  color-scheme: light;
  --gg-hit-min: 44px;
  --gg-icon-size: 20px;
  --gg-icon-size-compact: 19px;
  --gg-icon-weight: 300;
  --gg-icon-grade: -25;
  --gg-icon-weight-active: 400;
  --gg-icon-grade-active: 0;
  --gg-focus-ring: 2px solid var(--gg-accent);
}

C. Fix hit target tokens.
Set these to at least var(--gg-hit-min):
- --gg-entry-row-action-min-height
- --gg-discovery-tab-height
- --gg-search-empty-primary-min-height
- --gg-comment-action-min-height
- --gg-detail-outline-micro-min-height

Also ensure these selectors have at least 44px effective hit area:
- .gg-entry-row__action
- .gg-discovery-tab
- .gg-discovery-context__action
- .gg-discovery-context__archive
- .gg-discovery-topic-group__toggle
- .gg-discovery-topic__apply
- .gg-discovery-topic__archive
- .gg-comments .comment-actions a
- .gg-comments a.comment-reply
- .gg-comments .comment-delete
- .gg-detail-outline__peek
- .gg-detail-outline__item-button

Important:
- Do not make the visual control look huge.
- Use min-height and invisible padding.
- Keep font sizes restrained.

D. Make Material Symbols quieter.
Replace .gg-icon with a thinner, smaller configuration:
- font-size: var(--gg-icon-size)
- font-weight: 400
- font-variation-settings:
  'FILL' 0,
  'wght' var(--gg-icon-weight),
  'GRAD' var(--gg-icon-grade),
  'opsz' 24;

Add active state:
- [aria-current='page'] .gg-icon
- [aria-pressed='true'] .gg-icon
- .gg-is-active .gg-icon

Active state should:
- Keep FILL 0
- Raise weight only to 400
- Use GRAD 0
- Never use FILL 1 by default.

E. Add dark mode.
Add @media (prefers-color-scheme: dark) with token overrides only.
Do not duplicate large selector blocks.
Suggested dark tone:
- page: near #111013 / #141216
- panel: #1c1a1e
- article: rgba(255,255,255,.06)
- quiet/interative surfaces: low opacity white
- ink: #f5f1f3
- ink-soft: #c8bec4 or similar
- divider: rgba(255,255,255,.14)
- accent: #fff or warm off-white
- panel scrim: stronger black rgba
- shadows: lower or more diffuse

Also set:
:root { color-scheme: light; }
@media (prefers-color-scheme: dark) {
  :root { color-scheme: dark; }
}

F. Add reduced motion.
Add:
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

But be careful:
- Do not break open/closed sheet states.
- Keep transform state logic intact.
- If needed, override only transition-duration rather than transform.

G. Add backdrop-filter fallback.
Current CSS uses backdrop-filter on:
- .gg-detail-toolbar
- .gg-detail-outline
- .gg-dock
- .gg-sheet__scrim
Likely more may exist.

Add:
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .gg-detail-toolbar,
  .gg-detail-outline,
  .gg-dock {
    background: var(--gg-surface-panel);
  }

  .gg-sheet__scrim {
    background: rgba(22, 17, 20, .38);
  }
}

Also add -webkit-backdrop-filter wherever backdrop-filter is used:
- Keep same blur value.
- Do not remove existing backdrop-filter.

H. Improve focus and accessibility states.
Existing focus-visible exists. Keep it.
Make it tokenized:
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: var(--gg-focus-ring);
  outline-offset: 2px;
}

Add textarea/select only if present or harmless.
Do not remove existing skip-navigation.

I. Add high contrast / forced colors support.
Add:
@media (prefers-contrast: more) {
  :root {
    --gg-divider: rgba(32, 26, 28, .26);
    --gg-divider-strong: rgba(32, 26, 28, .36);
    --gg-border-interactive: rgba(32, 26, 28, .42);
  }
}

Add dark-mode compatible variant if needed.

Add:
@media (forced-colors: active) {
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid CanvasText;
  }

  .gg-dock,
  .gg-detail-toolbar,
  .gg-detail-outline,
  .gg-sheet__panel,
  .gg-discovery-tab,
  .gg-loadmore,
  .gg-preview__cta {
    border: 1px solid CanvasText;
    forced-color-adjust: auto;
  }
}

J. Preserve mobile density.
On max-width 480px:
- Keep dock item labels small but readable.
- Do not increase icon above 20px.
- If needed, reduce horizontal padding, not min-height.
- Do not reduce min-height below 44px.

Suggested:
@media (max-width: 480px) {
  :root {
    --gg-toolbar-item-pad-x: 6px;
    --gg-toolbar-item-size: 11px;
    --gg-icon-size: 19px;
  }
}

K. Validate detail outline does not become second dock.
Keep the existing contract:
- detail outline hides while panels are active.
- micro-peek remains visually quiet.
- It must not visually overpower the main dock.
- Do not change JS thresholds unless required.
- CSS may reduce opacity/surface strength if visually too heavy.

Acceptance criteria:
1. No interactive control has effective hit height below 44px on mobile.
2. Visual density remains compact on iPhone width.
3. Material Symbols remain installed but look thinner and calmer.
4. No default FILL 1 active icons.
5. Light mode looks materially unchanged except more refined.
6. Dark mode is readable and calm.
7. Reduced motion preference disables nonessential animation.
8. Backdrop-filter unsupported browsers still show readable panels/dock/sheets.
9. Keyboard focus remains visible.
10. Blogger template remains valid XML.
11. No route behavior changes.
12. No JS contract changes unless absolutely necessary.
13. Existing dock, sheets, preview, comments, listing, and article views still render.
14. No new external dependencies.

Suggested QA commands after patch:
- npm run gaga:template:status
- npm run gaga:template:proof
- npm run gaga:verify-template
- If available, run the live smoke script used in this project.

Manual QA routes:
- /
- /blog
- /?view=blog
- /landing
- /landing/
- /?view=landing
- One post detail page
- One static page
- Search empty state
- 404 state if available

Manual viewport QA:
- iPhone SE width
- iPhone 15/16 width
- iPad portrait
- Desktop wide

Manual accessibility QA:
- Keyboard tab through dock, toolbar, search sheet, comments, preview CTA.
- Enable reduced motion in OS/browser and verify sheets/dock do not animate aggressively.
- Emulate dark mode.
- Emulate forced colors if available.
- Check that article reading is not visually dominated by dock + outline.

Deliverable:
- Commit-style summary of what changed.
- List of exact CSS sections modified.
- Mention if any requested item could not be safely completed.