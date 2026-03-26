# TASK-P1.07V Audit Summary

- Commit: `f8c8dc457f104f60691e9be203228af6f511c1ce`
- Branch: `main`
- CI: PASS
  - Run URL: `https://github.com/liquid-modernity/gg/actions/runs/23292639448`
- Deploy Worker/Assets to Cloudflare: PASS
  - Run URL: `https://github.com/liquid-modernity/gg/actions/runs/23292667711`
- Live smoke: PASS
  - Log: `qa/audit-output/task-p107v-live-smoke.txt`

## Files Changed

- `public/assets/latest/main.css`
- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/main.css`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`

## Visual System Summary

- Comments rail now uses the same restrained monochrome family as the editorial side panels instead of the older utility-heavy rail treatment.
- Visible timestamps are now relative in the rail UI, while the full localized absolute datetime remains in `title` and `aria-label`.
- `More` is treated as a top-right utility action, separated from the primary bottom action row.
- Reply context and deleted-state presentation were reduced into quieter micro-meta elements instead of bulky pills or oversized helper UI.
- Footer compose dock keeps the native Blogger host intact, but the shell is visually compressed to fit the 240px rail more cleanly.

## Relative Time Note

- Relative time is hydrated client-side from the Blogger `showComment` permalink timestamp when present.
- If that timestamp is absent, runtime falls back to parsing the visible absolute datetime text.
- Relative labels refresh on a timed interval and also rehydrate on site language changes.

## Before / After Screenshots

- Before full:
  - `qa/audit-output/screenshots/task-p107v-before-zero.png`
  - `qa/audit-output/screenshots/task-p107v-before-two.png`
  - `qa/audit-output/screenshots/task-p107v-before-sixteen.png`
- Before panel focus:
  - `qa/audit-output/screenshots/task-p107v-before-panel-zero.png`
  - `qa/audit-output/screenshots/task-p107v-before-panel-two.png`
  - `qa/audit-output/screenshots/task-p107v-before-panel-sixteen.png`
- After full:
  - `qa/audit-output/screenshots/task-p107v-after-zero.png`
  - `qa/audit-output/screenshots/task-p107v-after-two.png`
  - `qa/audit-output/screenshots/task-p107v-after-sixteen.png`

## Fixture Truth Table

| url | fixtureClass | commentsOpen | composerKind | result |
| --- | --- | --- | --- | --- |
| `https://www.pakrpp.com/2026/02/todo.html` | `panel-read` | `true` | `native` | `pass` |
| `https://www.pakrpp.com/2025/10/in-night-we-stand-in-day-we-fight.html` | `panel-read` | `true` | `native` | `pass` |
| `https://www.pakrpp.com/2025/10/tes-2.html` | `panel-read` | `true` | `native` | `pass` |
| `compose.zero` | `composer-open` | `n/a` | `n/a` | `skip: fixture unset` |
| `compose.thread` | `composer-open` | `n/a` | `n/a` | `skip: fixture unset` |

## Remaining Accepted Native Blogger Limitations

- Rail layout remains an enhancement layer over Blogger native comment markup, not a full replacement of the backend HTML model.
- Relative time quality is best when `showComment` exists in the permalink, which is true for the audited fixtures.
- Dedicated open-comment compose fixtures remain unset, so compose-lane proof is still explicit `skip`, not fake `pass`.
