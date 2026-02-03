# TASK_report.md

## TASK SUMMARY
Task ID: X-012
Status: DONE

Changes:
- Replaced awk state variable `in` with `inside` in `report_short_change` for macOS awk compatibility.

## TASK PROOF
- `tools/scripts:gg` no longer uses `BEGIN{in=0}` or `in==1` in report parsing.

## FILES TOUCHED
- tools/scripts:gg
- public/assets/dev/main.js
- TASK_report.md
