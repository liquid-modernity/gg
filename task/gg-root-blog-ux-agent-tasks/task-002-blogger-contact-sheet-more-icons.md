# TASK 002 — Blogger Contact Sheet + More Sheet Right-Icon Contract

## Status

Development only. This task continues after Task 001 is stable.

Do not run old `task-002-reconcile.md` as a separate broad task. This task contains its own focused reconciliation checklist for GitHub Actions green.

## Goal

Implement two global dock improvements:

1. The Contact dock button opens a bottom sheet containing a contact form that uses the official Blogger contact form plumbing where available.
2. The More sheet uses right-side icons and a cleaner grouped layout, matching the provided mockup direction.

Both features must preserve `gg-*` namespace and pass a11y/sheet/nav guards.

## Product Intent

The global dock should behave like an app shell:

- Contact is a first-class action, not buried inside More.
- More is a navigational/preferences sheet with clean rows and icons on the right.
- Static surfaces may use a fallback contact route until a unified contact adapter exists.

## Scope

### Include

- Root Blogger XML contact sheet.
- Official Blogger ContactForm plumbing integration if the ContactForm widget/gadget is present.
- Fallback when Blogger contact plumbing is not present.
- More sheet row layout with icons on the right.
- A11y labels, focus trapping, close behavior, escape/scrim behavior.
- Guard reconciliation for sheet and nav contracts.

### Exclude

- External form provider integration.
- Backend email service.
- Full contact adapter for landing/store static surfaces.
- Editable local dashboard.
- Production deploy.

## Contact Sheet Contract

The global dock Contact button should open:

```html
<div
  id="gg-contact-panel"
  class="gg-sheet gg-sheet--bottom gg-contact-sheet"
  data-gg-panel="contact"
  data-gg-sheet-surface="contact"
  data-gg-state="closed"
  hidden
  inert>
</div>
```

The dock trigger should be a button:

```html
<button
  class="gg-dock__item"
  data-gg-nav="contact"
  data-gg-open="contact"
  aria-controls="gg-contact-panel"
  aria-expanded="false"
  type="button">
  ...
</button>
```

Do not make Contact a normal link on root Blogger if the sheet is available.

## Contact Form UX Direction

Match the mockup direction:

- Sheet title: `Contact`
- Section title: `WRITE MESSAGE`
- Email destination display, e.g. `chat@pakrpp.com`
- Subject input
- Message textarea
- optional captcha/native Blogger requirement area
- sender email input
- send button
- social/share links row

Use `gg-*` classes only:

- `gg-contact-form`
- `gg-contact-form__field`
- `gg-contact-form__textarea`
- `gg-contact-form__submit`
- `gg-contact-form__social`

## Official Blogger Plumbing Requirement

On Blogger root surface, prefer official Blogger ContactForm plumbing.

Acceptable implementation patterns:

1. Include/retain Blogger ContactForm widget in the XML and skin/move it into `gg-contact-panel`.
2. Keep the Blogger ContactForm widget hidden as plumbing and bridge custom controls to its native fields/submit behavior.
3. If native plumbing is unavailable in local/static build, render a guarded fallback with clear state.

Do not fake a successful send.

Required fallback states:

- `available`
- `missing-native-plumbing`
- `submitting`
- `sent`
- `error`

Expose state as:

```html
<form data-gg-contact-state="available">
```

or on the panel root:

```html
<div data-gg-contact-state="missing-native-plumbing">
```

## Static Surface Fallback

For `landing.html` and `store.html`, do not assume Blogger ContactForm exists.

For now, use one of these safe fallbacks:

- link to `/p/contact.html`
- link/open root with `?gg-contact=1`
- mailto fallback if configured

Document the chosen fallback in `SURFACE-CONTRACT.md` or equivalent.

## More Sheet Right-Icon Contract

Change More rows from left-icon style to right-icon style.

Expected row pattern:

```html
<a class="gg-more-list__link" href="/p/about.html">
  <span class="gg-more-row__label">About PakRPP</span>
  <span class="gg-more-row__icon gg-icon" aria-hidden="true">info</span>
</a>
```

Preference row pattern:

```html
<button class="gg-more-list__link gg-more-pref-row" type="button">
  <span class="gg-more-row__label">Language</span>
  <span class="gg-more-row__value">English</span>
  <span class="gg-more-row__icon gg-icon" aria-hidden="true">language</span>
</button>
```

Initial More groups:

- Info
  - About PakRPP
  - Privacy Policy
  - Terms of Use
  - Disclaimer
- Preferences
  - Language
  - Appearance
  - Reading
  - Motion
- Local search
- Footer copyright

Navigation links may remain in More if they are already part of the product contract, but the mockup direction prioritizes Info and Preferences.

## Accessibility Requirements

- All sheet open/close buttons must have accessible names.
- Icons must be `aria-hidden="true"` if decorative.
- Form fields need labels, either visible or visually hidden.
- Contact form submit button must have clear accessible name.
- Sheet must restore focus to Contact dock button after closing.
- `aria-expanded` must update on trigger.
- `inert` and `hidden` must be consistent with current sheet lifecycle contract.
- No duplicate IDs.

## QA/Guard Requirements

Likely touched guards:

- `qa/global-sheet-contract-guard.mjs`
- `qa/nav-more-contract-guard.mjs`
- `qa/sheet-contract-smoke.sh`
- `qa/sheet-lifecycle-contract-guard.mjs`
- `qa/sheet-gesture-close-guard.mjs`
- `qa/a11y-static-guard.mjs`
- `qa/comments-proof-guard.mjs` only if comment/contact plumbing intersects Blogger native code

If `nav-more-contract-guard` assumes left-side icons, update it to the new right-icon contract. Do not remove route/link checks.

## Required Commands

Run after implementation:

```bash
node qa/template-fingerprint.mjs --write
node qa/template-fingerprint.mjs --check
npm run gaga:verify-a11y-static
npm run gaga:verify-global-sheet-contract
npm run gaga:verify-sheet-contract
npm run gaga:verify-sheet-lifecycle
npm run gaga:verify-sheet-gesture-close
npm run gaga:verify-nav-more
npm run gaga:verify-more-global
npm run build
npm run ci:cloudflare
```

Before claiming done:

```bash
npm run ci:qa
```

## GitHub Actions Green Requirement

The implementation must be compatible with:

- `ci.yml` running `npm run ci:cloudflare`
- `deploy-cloudflare.yml` running `npm run ci:cloudflare`, then `npm run deploy:cloudflare:prepared`

Do not add a workflow requirement that depends on local-only contact credentials.

## Acceptance Criteria

- Contact dock opens a bottom contact sheet on root Blogger surface.
- Contact sheet uses official Blogger plumbing where available, with honest fallback state where unavailable.
- More sheet rows show icons on the right.
- Preference rows show value + icon on the right.
- Sheet lifecycle remains consistent.
- A11y guard passes.
- Nav-more guard passes with the new right-icon contract.
- `npm run build` passes.
- `npm run ci:cloudflare` passes.
- `npm run ci:qa` passes or any failure is clearly classified and reconciled.

## Stop Rule

If official Blogger contact plumbing cannot be verified locally, do not invent a backend. Implement a visible fallback state and document what must be verified manually in Blogger preview.
