# TASK-002K — Public UI Icon/Button Contract Repair

## Goal

Fix remaining public UI icon/button rendering issues after TASK-002I restored asset delivery.

## Root causes

- Public softcode loader may destroy icon child markup by setting `textContent` on composite controls.
- Blog icon font subset is missing icons used by toolbar buttons.
- Public markup should standardize on `.gg-icon`; Material Symbols vendor classes are implementation detail.
- Some preview/comment button styles still only exist in legacy donor CSS.

## Non-goals

- No Blogger OAuth.
- No Tailwind/shadcn/Tiptap/React.
- No store app category restructure.
- No legacy JS bridge split.
- No broad full-template rewrite.

## Acceptance

```bash
npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run console:check && npm run studio:check && npm run deploy:dry && bash scripts/task002k-acceptance.sh
```
