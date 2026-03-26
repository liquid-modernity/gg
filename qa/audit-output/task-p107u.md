# TASK-P1.07U Audit Summary

- Commit: `0a518eb468ebe4a6a86182f8604d9b2d251e1173`
- Branch: `main`
- CI: PASS
  - Run URL: `https://github.com/liquid-modernity/gg/actions/runs/23290559144`
- Deploy Worker/Assets to Cloudflare: PASS
  - Run URL: `https://github.com/liquid-modernity/gg/actions/runs/23290591309`
- Live smoke: PASS
  - Log: `qa/audit-output/task-p107u-live-smoke.txt`

## Files Changed

- `public/assets/latest/modules/ui.bucket.core.js`
- `public/assets/v/ac33998/modules/ui.bucket.core.js`
- `qa/live-smoke.sh`

## Root Cause Summary

- Smoke was still treating comments as one hybrid lane, so panel-read fixtures could fail on composer-only conditions.
- Closed or non-required compose paths were still allowed to trigger reply/compose behavior in runtime.
- Panel-read browser proof could be polluted by third-party native-composer noise such as Blogger reCAPTCHA loading and report-only CSP messages.

## Contract Summary

### Before

- One browser proof lane mixed panel/thread and composer assertions.
- Standard `0 / 2 / 16` fixtures could fail because of compose/runtime conditions unrelated to panel-read behavior.
- Reply/compose actions could still try to activate on pages where compose should not be part of the panel-read gate.

### After

- `comments-panel` lane is required and validates right-rail panel/thread behavior only.
- `comments-compose` lane is explicit and only runs when open-comment fixtures are configured.
- If open-comment fixtures are absent, compose lane is `skip`, not `pass` and not `fail`.
- Runtime suppresses reply/compose activation when footer composer is not allowed for that root.
- Panel-read runtime errors ignore report-only CSP noise and native Blogger reCAPTCHA noise that does not belong to panel-read gating.

## Fixture Truth Table

| url | fixtureClass | commentsOpen | composerKind | result |
| --- | --- | --- | --- | --- |
| `https://www.pakrpp.com/2026/02/todo.html` | `panel-read` | `true` | `native` | `pass` |
| `https://www.pakrpp.com/2025/10/in-night-we-stand-in-day-we-fight.html` | `panel-read` | `true` | `native` | `pass` |
| `https://www.pakrpp.com/2025/10/tes-2.html` | `panel-read` | `true` | `native` | `pass` |
| `compose.zero` | `composer-open` | `n/a` | `n/a` | `skip: fixture unset` |
| `compose.thread` | `composer-open` | `n/a` | `n/a` | `skip: fixture unset` |

## Screenshots

- `qa/audit-output/screenshots/task-p107u-panel-zero.png`
- `qa/audit-output/screenshots/task-p107u-panel-two.png`
- `qa/audit-output/screenshots/task-p107u-panel-sixteen.png`

## Accepted Native Blogger Limitations

- Native composer/reply contract is not asserted unless dedicated open-comment fixtures are configured.
- Blogger native composer still depends on external platform behavior such as reCAPTCHA and third-party script availability.
- Panel-read fixtures stay strict on panel/thread ownership and rendering, but do not pretend to prove composer behavior they were not chosen to prove.
