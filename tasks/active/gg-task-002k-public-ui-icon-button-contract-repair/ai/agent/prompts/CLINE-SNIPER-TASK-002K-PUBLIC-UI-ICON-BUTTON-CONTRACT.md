# TASK-002K — Public UI Icon/Button Contract Repair

You are working in the GG vNext repo. Execute this task in sniper mode.

## Context

Production deploy works and runtime assets are now delivered, but public UI still shows raw icon names / native buttons:

- `ARROW_BACK_IOS_NEW`, `IOS_SHARE`, `BOOKMARK_BORDER` visible as text
- `...`, `Saved`, `Open full article`, `Details` render as native/default buttons in places
- Some icons disappear after public softcode loader runs

Known causes from audit:

1. `src/modules/public-softcode/public-softcode.js` uses `el.textContent = ...`, which destroys child markup when `data-copy` / `data-gg-copy` is placed on composite button/link that contains `.gg-icon`.
2. `apps/blog/index.xml` Google Material Symbols subset is missing some icons used in markup, especially `arrow_back_ios_new` and `ios_share`.
3. Public icon contract should be `.gg-icon`; do not make `material-symbols-*` a required public markup contract.
4. Some button styles still exist only in `legacy-donor/gg-app.dev.css` and are missing from source modules, especially preview CTA / save / comment-more buttons.
5. Checks do not prevent composite `data-copy` from destroying icons.

## Goal

Repair public UI icon/button contract without broad refactor.

## Allowed files

Prefer edits only in:

- `apps/blog/index.xml`
- `apps/store/store.html` only if necessary
- `apps/landing/landing.html` only if necessary
- `src/modules/public-softcode/public-softcode.js`
- `src/modules/base/base.css` or relevant module CSS already used for global/button/icon styles
- `src/modules/preview-frame/preview-frame.css`
- `src/modules/comments/comments.css` or relevant comment/more module CSS if present
- `checks/public-ui-contract.check.mjs` new
- `package.json`
- `scripts/task002k-acceptance.sh`
- `tasks/active/TASK-002K-PUBLIC-UI-ICON-BUTTON-CONTRACT-REPAIR.md`

Do not edit `dist/**` or `.cloudflare-build/**` manually.

## Hard boundaries

Do NOT:

- implement Blogger OAuth
- install Tailwind/shadcn/Tiptap/React
- split legacy JS bridge
- restructure store app categories
- rewrite full Blogger XML
- replace all HTML/CSS/JS broadly
- use `material-symbols-rounded` or `material-symbols-outlined` as the canonical public contract
- remove fallback text
- hardcode API keys, Blogger IDs, tokens, or secrets

## Required implementation

### 1. Make `.gg-icon` the canonical icon contract

Public markup should work with:

```html
<span class="gg-icon" data-gg-icon="arrow_back_ios_new" aria-hidden="true"></span>
```

and may temporarily support legacy text content:

```html
<span class="gg-icon" aria-hidden="true">arrow_back_ios_new</span>
```

CSS should bind `.gg-icon` to Material Symbols font internally. Vendor classes such as `material-symbols-rounded` / `material-symbols-outlined` should not be required in public markup. If removing vendor class is safe, remove it from touched markup.

Ensure `.gg-icon` resists text-transform from parent:

```css
.gg-icon {
  font-family: "Material Symbols Rounded", "Material Symbols Outlined", sans-serif;
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  direction: ltr;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}
.gg-icon[data-gg-icon]::before { content: attr(data-gg-icon); }
```

Adapt to existing CSS conventions. Do not duplicate conflicting definitions if `.gg-icon` already exists; patch the existing rule.

### 2. Fix public softcode loader so it does not destroy composite button/link markup

In `public-softcode`, do not blindly `textContent` a node when that node contains `.gg-icon`, `[data-gg-icon]`, or meaningful child elements.

Preferred behavior:

- If target element has child label target `[data-copy-label]` or `[data-gg-copy-label]`, update that child only.
- Else if target contains `.gg-icon` or `[data-gg-icon]`, skip the element and leave fallback intact.
- Else update textContent safely.

Add support for label-level attributes if useful:

```html
<span data-gg-copy-label="listing.details">Details</span>
```

Keep support for both `[data-copy]` and `[data-gg-copy]`.

### 3. Move copy markers off composite controls where safe

In `apps/blog/index.xml`, patch only the known dangerous cases where `data-gg-copy` is on a button/link containing icons:

- listing details button
- saved action save button
- preview open article link/button

Move marker to the text/label span, not the parent composite button/link. Preserve fallback text and icons.

Example:

```html
<button class="...">
  <span data-gg-copy="listing.details">Details</span>
  <span class="gg-icon" data-gg-icon="top_panel_open" aria-hidden="true"></span>
</button>
```

### 4. Complete Blog icon font subset

In `apps/blog/index.xml`, ensure Google Material Symbols icon subset includes all icons used in Blog UI, at minimum:

- `arrow_back_ios_new`
- `ios_share`
- `bookmark_border`
- `add_comment`
- `calendar_add_on`
- `explore`
- `menu`
- `top_panel_open`
- `keyboard_arrow_down`
- `home_app_logo`

Do not add external dependencies.

### 5. Migrate missing button styles from legacy donor into source modules

Find needed styles from `legacy-donor/gg-app.dev.css` and add only the minimum source CSS for:

- `.gg-preview__cta-row`
- `.gg-preview__save`
- `.gg-preview__cta`
- `.gg-comment-more__button`

Put them in the closest source module CSS, likely:

- `src/modules/preview-frame/preview-frame.css`
- `src/modules/comments/comments.css` or equivalent

Do not paste huge CSS blocks. Add minimal rules that make the buttons non-native, aligned, and consistent with Gaga design system.

### 6. Add `checks/public-ui-contract.check.mjs`

Create a check that validates:

- `.gg-icon` CSS exists and includes `font-family` and `text-transform: none`.
- `apps/blog/index.xml` font subset includes `arrow_back_ios_new` and `ios_share`.
- `data-copy` / `data-gg-copy` is not placed on a composite element that contains `.gg-icon` in Blog/Store/Landing. If the check is hard to parse XML/HTML perfectly, use pragmatic regex with helpful errors.
- Touched vendor icon classes are not required. Warn/fail if new `material-symbols-` classes are added to public markup; existing untouched occurrences may be tolerated only if removing all would be too broad.
- CSS includes rules for `.gg-preview__save`, `.gg-preview__cta`, and `.gg-comment-more__button`.

Add npm script:

```json
"check:public-ui": "node checks/public-ui-contract.check.mjs"
```

### 7. Create acceptance script

Create `scripts/task002k-acceptance.sh` that runs:

```bash
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run console:check
npm run studio:check
npm run deploy:dry
```

Also verify `.cloudflare-build/public/__gg/assets/css/gg-app.min.css` and `.cloudflare-build/public/__gg/assets/js/gg-app.dev.js` exist after build.

### 8. Create task note

Create `tasks/active/TASK-002K-PUBLIC-UI-ICON-BUTTON-CONTRACT-REPAIR.md` documenting:

- root cause
- files changed
- implemented scope
- non-goals
- acceptance commands

## Final acceptance command

Run exactly:

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002k-acceptance.sh
```

Report:

- Files changed
- Whether all commands passed
- Any remaining raw icon/button issues
