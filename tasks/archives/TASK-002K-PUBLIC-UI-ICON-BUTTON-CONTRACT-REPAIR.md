# TASK-002K — Public UI Icon/Button Contract Repair

## Root Cause

1. **Public softcode loader destroyed composite markup**: `public-softcode.js` used `el.textContent = ...` which wiped child elements when `data-copy`/`data-gg-copy` was placed on composite buttons/links containing `.gg-icon` spans.

2. **Vendor icon classes leaked into public markup contract**: Some markup required `material-symbols-rounded` or `material-symbols-outlined` classes, making the public contract fragile.

3. **Missing button styles**: `.gg-preview__save`, `.gg-preview__cta`, and `.gg-comment-more__button` styles only existed in `legacy-donor/gg-app.dev.css` and were not available in source modules.

4. **No check prevented regression**: No automated check validated the public UI contract.

## Files Changed

- `src/modules/preview-frame/preview-frame.css` — Added `.gg-preview__cta-row`, `.gg-preview__save`, `.gg-preview__cta` CSS rules
- `src/modules/comments/comments.css` — Added `.gg-comment-more__button` CSS rule
- `checks/public-ui-contract.check.mjs` — New check validating icon contract, font subset, copy markers, vendor classes, and button styles
- `scripts/task002k-acceptance.sh` — New acceptance script running full build + check pipeline
- `package.json` — Added `check:public-ui` npm script

## Implemented Scope

### Already in place (verified, no changes needed)

- `.gg-icon` canonical contract in `src/modules/shell/shell.css` with `font-family`, `text-transform: none`, `line-height: 1`
- `[data-gg-icon]::before { content: attr(data-gg-icon); }` for icon rendering
- Public softcode guard in `public-softcode.js` — skips elements containing `.gg-icon` or `[data-gg-icon]`
- Blog font subset includes all required icons: `arrow_back_ios_new`, `ios_share`, `bookmark_border`, `add_comment`, `calendar_add_on`, `explore`, `menu`, `top_panel_open`, `keyboard_arrow_down`, `home_app_logo`
- Copy markers already on label spans, not composite controls

### Added this task

- `.gg-preview__cta-row`, `.gg-preview__save`, `.gg-preview__cta` styles in `preview-frame.css`
- `.gg-comment-more__button` style in `comments.css`
- `checks/public-ui-contract.check.mjs` — validates all icon/button contract requirements
- `check:public-ui` npm script
- Acceptance script

## Non-Goals

- No Blogger OAuth implementation
- No Tailwind/shadcn/Tiptap/React installation
- No legacy JS bridge split
- No store category restructuring
- No full Blogger XML rewrite
- No broad HTML/CSS/JS replacement
- No hardcoded API keys or secrets

## Acceptance Commands

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002k-acceptance.sh
```

Or run acceptance script alone:

```bash
bash scripts/task002k-acceptance.sh