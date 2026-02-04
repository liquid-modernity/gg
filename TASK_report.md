TASK_SUMMARY
- Added worker ping detection to set `GG.env.worker` and gate `/blog` canonicalization plus SW/`gg-flags.json` behind it.
- Updated blog home routing helpers to prefer `/?view=blog` when Worker is absent.
- Documented the new worker-gated behavior in audit and documentation.

FILES_CHANGED
- public/assets/v/8f3d67c/main.js
- public/assets/dev/main.js
- docs/audit/FAILURE_REPORT.md
- docs/DOCUMENTATION.md
- TASK_report.md

VERIFICATION
- `./tools/check-links.sh`
  - PASS: link hygiene (rg)
- `./tools/verify-worker.sh`
  - FAIL (exit 1, no output)
- `BASE=https://www.pakrpp.com ./tools/smoke.sh`
  - FAIL: curl could not resolve host `www.pakrpp.com`; `__gg_worker_ping` request failed.
- Manual (not run): simulate worker=false by blocking `/__gg_worker_ping` or editing hosts, then confirm blog home stays at `/?view=blog` and no SW registration attempt in DevTools. Verify worker=true path by allowing ping and confirming `/blog` canonicalization and SW registration.

RISKS / ROLLBACK
- Risk: false-negative worker ping (timeout/blocked headers) disables `/blog` canonicalization and SW on a healthy Worker.
- Rollback: revert `public/assets/v/8f3d67c/main.js`, `public/assets/dev/main.js`, and doc changes.
