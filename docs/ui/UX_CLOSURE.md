# UX_CLOSURE
Last updated: 2026-02-15

This is the single UX closure source for this repo.  
Use this file for closure status; use linked docs for deeper detail.

## Definition of Done (DoD)
| Area | DoD (must all pass) | Proof |
| --- | --- | --- |
| Dock search + palette (Tier 1 / Tier 2 / `/label` / `> commands`) | Cmd/Ctrl+K focuses dock search input; Tier 1 suggestions render from local index; Enter opens active item; Cmd/Ctrl+Enter and Tier 2 always hard-nav to `/search?q=`; `/label` stays in facet mode; `>` stays in command mode; no double search surface. | Manual checks M1, M2, M3, M4, M5 |
| Router parity + canonical/head sync | SPA nav updates `#gg-main` + body surface state to target page; canonical + `og:url` in `<head>` match final URL; no “URL changed but UI stale” state. | Manual checks M6, M7 |
| Recovery lock (`gg_fail=palette`) | Forced error closes palette, clears dock search state, restores focus deterministically, writes `window.__gg_err` entry, and prevents instant reopen loop during recovery window. | Manual checks M8, M9 |
| A11y contract (combobox/listbox/activedescendant) | Dock input has combobox attrs; list has listbox role; items use option role and selected state; active option mirrors `aria-activedescendant`; Esc closes and returns focus. | `node tools/verify-palette-a11y.mjs --mode=repo`, manual checks M10, M11 |
| Performance budgets | All asset raw/gzip sizes stay within `tools/perf-budgets.json`; no budget exceptions for search/palette changes. | `node tools/verify-budgets.mjs` |

## Manual QA Matrix
Run on desktop + mobile viewport (or device emulation).

| ID | Surface | Steps | Expected |
| --- | --- | --- | --- |
| M1 | Any page | Press Cmd/Ctrl+K. | Dock search input focused; no legacy modal opens. |
| M2 | Any page | Type query with local matches. | Tier 1 list appears, max list compact, keyboard selectable. |
| M3 | Any page | Arrow Down/Up then Enter. | Active item opens correct post/page. |
| M4 | Any page | Cmd/Ctrl+Enter with query. | Full reload to `/search?q=<query>` (hard-nav). |
| M5 | Any page | Type `> home`, Enter; then `/vlog`. | Command executes for `>` mode; facet filter works for `/` mode without command execution. |
| M6 | Listing -> Post | Open a post via palette result. | Surface switches to `post`; content is post detail (not listing shell). |
| M7 | After M6 | Check `link[rel=canonical]` and `meta[property='og:url']`. | Both match current URL exactly. |
| M8 | Any page with `?gg_fail=palette` | Open palette and type. | Error path recovers: palette closed, dock state idle, page still usable. |
| M9 | After M8 | Check `window.__gg_err?.slice(-1)[0]`. | Last entry exists with `where:"palette"` and timestamp. |
| M10 | Any page | Open palette, move active option with arrows. | `aria-activedescendant` changes to active option id. |
| M11 | Any page | Press Esc while palette open. | Palette closes; focus returns to dock input/opener. |
| M12 | Mobile viewport | Open search and rotate/simulate address bar resize. | Panel remains anchored and usable; no trapped keyboard focus. |

## Known Tradeoffs
- Native Blogger comments stay enabled by product constraint; loading/interaction cost can raise TBT on post pages with comments.
- “100 Lighthouse / 0ms” is not realistic for all post + comments states on Blogger-native stack; target is best-effort native webapp feel with progressive enhancement.
- Live smoke can be network-dependent in local environments; repo-mode a11y verification is deterministic fallback for local gating.

See: `docs/audit/AUDIT_REPORT.md`, `docs/audit/REDUCTIONS.md`, `docs/roadmap.md`.
