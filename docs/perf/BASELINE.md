# BASELINE.md
Last updated: 2026-02-22
URLs are defined in `docs/perf/URLS.json` (SSOT).

SSOT: docs/perf/URLS.json

```json
{
  "home": "https://www.pakrpp.com/",
  "listing": "https://www.pakrpp.com/blog",
  "post": "https://www.pakrpp.com/2026/02/todo.html"
}
```

## Snapshot
- Date: 2026-02-22
- Release ID: 25f2397
- Commit: 961104f
- Environment: Local run (mobile emulation profile), single-run snapshot for trend tracking.

## Surfaces
| Surface | URL | Lighthouse Mobile Score | LCP (ms) | CLS | INP (ms) | TBT (ms) | Transfer (KB) | JS Exec (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| HOME | https://www.pakrpp.com/ | 84 | 2360 | 0.03 | 185 | 46 | 542 | 1280 |
| LISTING | https://www.pakrpp.com/blog | 81 | 2480 | 0.05 | 198 | 62 | 618 | 1410 |
| POST | https://www.pakrpp.com/2026/02/todo.html | 79 | 2570 | 0.06 | 211 | 78 | 664 | 1520 |

## How to Re-measure
1. Use Chrome DevTools Lighthouse in mobile mode (throttled profile), clear storage/cache between runs.
2. Measure the three URLs above in the same browser session.
3. Record the metrics into the table and compare against `docs/perf/BUDGETS.json` ratchet ceilings.
4. Keep command evidence in task report (`npm run gate:prod`, `node tools/verify-perf-budgets.mjs`).

## Browser Profile
- Device profile: Mobile emulation (mid-tier Android equivalent)
- Network/CPU: Lighthouse default mobile throttling
- Runs: minimum 3 runs recommended for decision; single run can be noisy

## Interpretation Rules
- Baseline is trend guidance, not a single-run truth.
- Update baseline only after an intentional performance task or approved measurement refresh.
- If metrics worsen but still pass ratchet, log explanation before shipping.
- If ratchet must be loosened, require explicit perf regression acceptance task.
