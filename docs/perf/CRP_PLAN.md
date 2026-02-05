# Critical Rendering Path (CRP) Plan
Last updated: 2026-02-05

Purpose: define a stable CRP doctrine and guardrails so performance cannot regress silently.

**Current Render Path (PROD, as built)**
- HTML served by Blogger theme `index.prod.xml` (canonical: https://www.pakrpp.com).
- Render-blocking CSS: `/assets/v/<RELEASE_ID>/main.css`.
- Deferred JS: `/assets/v/<RELEASE_ID>/main.js` (defer), plus `instant.page` module script.
- Fonts: Google Fonts preconnect + stylesheet (Material Symbols).
- Service Worker registers from `main.js` in PROD; it does not block first paint but affects repeat visits.

**Blocking Rules (Non-Negotiable for First Paint)**
- No synchronous `<script>` in the document head.
- No additional render-blocking CSS beyond `main.css` unless explicitly approved.
- No third-party scripts that block parsing on first paint.
- No inline JS larger than 4 KB before first paint.

**Loading Strategy**
- Critical CSS inline budget: target 6 KB, hard max 12 KB.
- Non-critical CSS stays in `main.css` until Phase 2 splits it.
- JS execution policy: `defer` or `type=module` only on initial load.
- Idle loading: non-critical UI and analytics run after first interaction or `requestIdleCallback`.
- Route-specific loading (blog listing): minimal JS, no heavy widgets before first paint.
- Route-specific loading (post page): comments and related widgets after user interaction.
- Route-specific loading (static pages): avoid loading post-only modules.

**Budgets and Guardrails**
- Budgets are enforced by `tools/perf-budgets.json` and `tools/verify-budgets.mjs`.
- CI runs the budget verifier after build; regressions fail CI.
- Budget increases require explicit justification and should be rare; prefer tightening over time.

**Measurement Protocol**
- Lighthouse: run in Incognito with extensions disabled, mobile throttling, cold cache.
- Repeatability: run 3 times and record the median.
- Long tasks: Chrome Performance panel, flag tasks > 50 ms on initial load.
- TBT target (lab): <= 200 ms median, max 300 ms until Phase 2 lands.
- Cache state: verify with SW disabled for DEV and enabled for PROD to compare behavior.

**3-Phase Roadmap**
- Phase 1: Stop the bleeding. Enforce budgets, ensure all scripts are deferred, prevent new render blockers.
- Phase 2: Zero long tasks. Split critical vs non-critical JS, idle-load secondary UI, reduce heavy parsing on first paint.
- Phase 3: Luxury feel. Add micro-interactions only after CRP is stable and budgets pass consistently.
