# TASK-P1.07Z Audit Summary

- Commits:
  - `ad6774586e9fa6a4be7ff51a94098572b74b19cf`
  - `5747a99dfbe4ee2617f4b23cc5960a114644e2a0`
- Branch: `main`
- CI: PASS
  - Run URL: `https://github.com/liquid-modernity/gg/actions/runs/23314857513`
- Deploy Worker/Assets to Cloudflare: PASS
  - Run URL: `https://github.com/liquid-modernity/gg/actions/runs/23314892913`
- Live smoke: PASS
  - Log: `qa/audit-output/task-p107z-live-smoke.txt`

## Files Changed

- `public/assets/latest/main.css`
- `public/assets/v/ac33998/main.css`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`
- `.github/workflows/deploy.yml`

## Sticky Stabilization Root Cause And Fix

- Root cause: the compact comments rail still had an older desktop `position: fixed` ownership layer in the base CSS, while newer overrides tried to make it feel layout-bound with sticky behavior. That mixed model made the rail feel like it changed allegiance depending on the cascade.
- Fix: desktop ownership is now aligned to one sticky model in the sidebar column, while the narrow-layout overlay path remains explicit inside the mobile media query only.
- Internal sticky behavior was preserved: sticky head, scrollable body, and sticky footer dock remain intact.

## Inline Meta Row Treatment

- Author and relative timestamp now sit in the same inline meta row where width allows.
- Author remains visually primary, timestamp is quieter and secondary, and absolute datetime remains available via the link `title` and aria path.
- The layout still allows safe fallback wrapping instead of hard clipping.

## Utility Menu Sizing

- Utility popover width was increased slightly so `Copy link` and `Delete comment` stay on one line.
- Menu item padding and type stayed compact so the popover remains tool-like rather than dialog-heavy.

## Popover Collision Handling

- A tiny runtime placement pass now measures the utility popover against the active comments panel viewport.
- If opening upward would collide with the sticky header/top boundary, the popover flips downward with `data-gg-placement="down"`.
- Live proof on the 2-comment fixture:
  - placement: `down`
  - popover top: `811`
  - sticky header bottom: `781`
  - `Copy link` / `Delete comment` each remained single-line (`clientHeight === scrollHeight === 22`, `white-space: nowrap`)

## Nested Indent Adjustment

- Nested reply indentation was reduced again to return more usable width to actual comment text.
- The thread rail line was softened further to reduce the old forum-widget feel without losing reply structure.

## Screenshot Artifacts

- Before:
  - `qa/audit-output/screenshots/task-p107z-before-zero.png`
  - `qa/audit-output/screenshots/task-p107z-before-two.png`
  - `qa/audit-output/screenshots/task-p107z-before-sixteen.png`
- After:
  - `qa/audit-output/screenshots/task-p107z-after-zero.png`
  - `qa/audit-output/screenshots/task-p107z-after-two.png`
  - `qa/audit-output/screenshots/task-p107z-after-sixteen.png`

## Live Smoke Summary

- `LIVE SMOKE RESULT: PASS`
- Panel-read fixtures:
  - `/2026/02/todo.html` -> pass
  - `/2025/10/in-night-we-stand-in-day-we-fight.html` -> pass
  - `/2025/10/tes-2.html` -> pass
- Compose lane:
  - `compose.zero` -> `skip: fixture unset`
  - `compose.thread` -> `skip: fixture unset`

## Tiny JS Hooks Added

- Utility menu placement measurement for `up` vs `down` inside the active comments panel viewport.

## Remaining Accepted Native Blogger Limitations

- The rail still enhances Blogger-native comment markup rather than replacing backend HTML.
- Open-comment compose fixtures remain unset, so compose-lane verification stays explicit `skip`, not fake `pass`.
- Native Blogger iframe internals remain treated as cross-origin UI; only the host shell, dock, and runtime-owned rail behavior were refined.
