#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT}/docs/ledger/NEW_ROOM_HANDOFF.md"

now_iso="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

branch="$(git -C "${ROOT}" rev-parse --abbrev-ref HEAD)"
short_hash="$(git -C "${ROOT}" rev-parse --short HEAD)"
commit_subject="$(git -C "${ROOT}" log -1 --pretty=%s)"
commit_body="$(git -C "${ROOT}" log -1 --pretty=%B)"

status_porcelain="$(git -C "${ROOT}" status --porcelain)"
if [[ -z "${status_porcelain}" ]]; then
  status_porcelain="(clean)"
fi

last_commit_show="$(git -C "${ROOT}" show --name-only --oneline -1)"

last5_changed="$(git -C "${ROOT}" log -5 --name-only --pretty="format:" | sort -u | sed '/^$/d')"
if [[ -z "${last5_changed}" ]]; then
  last5_changed="(none)"
fi

task_ids_raw="$(printf '%s\n' "${commit_body}" | grep -Eo 'TASK-[0-9A-Za-z._-]+' || true)"
task_ids="$(printf '%s\n' "${task_ids_raw}" | sort -u | paste -sd ', ' -)"
if [[ -z "${task_ids}" ]]; then
  task_ids="(none found)"
fi

completed_line="${short_hash} — ${commit_subject}"
if [[ "${task_ids}" != "(none found)" ]]; then
  completed_line="${completed_line} (TASK ids: ${task_ids})"
fi

flags_ts="$(date +%s)"
flags_url="https://www.pakrpp.com/gg-flags.json?x=${flags_ts}"

smoke_output="$(SMOKE_LIVE_HTML=1 "${ROOT}/tools/smoke.sh" 2>&1 || true)"

flags_headers_raw="$(curl -sS -D - -o /dev/null --max-time 10 "${flags_url}" 2>&1 || true)"
flags_headers="$(printf '%s' "${flags_headers_raw}" | tr -d '\r')"
flags_header_excerpt="$(printf '%s\n' "${flags_headers}" | awk 'BEGIN{IGNORECASE=1} /^cache-control:/ || /^cf-cache-status:/ || /^x-gg-worker:/ || /^x-gg-worker-version:/ {print $0}')"
if [[ -z "${flags_header_excerpt}" ]]; then
  flags_header_excerpt="(no header data - curl failed or headers missing)"
fi

current_release="$(printf '%s\n' "${flags_headers}" | awk -F': *' 'BEGIN{IGNORECASE=1} $1 ~ /^x-gg-worker-version$/ {print $2}' | head -n1 | tr -d '[:space:]')"
if [[ -z "${current_release}" ]]; then
  current_release="(unknown)"
fi

flags_body_raw="$(curl -sS --max-time 10 "${flags_url}" 2>&1 || true)"
flags_body="$(printf '%s' "${flags_body_raw}" | tr -d '\r' | head -c 300)"
if [[ -z "${flags_body}" ]]; then
  flags_body="(no body data - curl failed or empty response)"
fi

{
  printf '# NEW ROOM HANDOFF — GG / pakrpp.com\n'
  printf '## Snapshot\n'
  printf '* Generated (UTC): %s\n' "${now_iso}"
  printf '* Repo: gg\n'
  printf '* Branch: %s\n' "${branch}"
  printf '* Commit: %s — %s\n' "${short_hash}" "${commit_subject}"
  printf '* Deploy model: main-only, deploy gated, manual paste index.prod.xml to Blogger\n'
  printf '* DEV/PROD: index.dev.xml & index.prod.xml manual copy\n'
  printf '* Current live release (x-gg-worker-version): %s\n' "${current_release}"
  printf '* Notes: (fill)\n'
  printf '\n'
  printf '## What just happened\n'
  printf '* Completed tasks: %s\n' "${completed_line}"
  printf '* Current task: (fill)\n'
  printf '\n'
  printf '## Proof (copy-paste friendly)\n'
  printf '<details><summary>SMOKE_LIVE_HTML=1 tools/smoke.sh</summary>\n\n'
  printf '~~~text\n'
  printf '%s\n' "${smoke_output}"
  printf '~~~\n\n'
  printf '</details>\n\n'
  printf '<details><summary>gg-flags headers proof</summary>\n\n'
  printf '~~~text\n'
  printf '%s\n' "${flags_header_excerpt}"
  printf '~~~\n\n'
  printf '</details>\n\n'
  printf '<details><summary>gg-flags body proof (first 300 chars)</summary>\n\n'
  printf '~~~text\n'
  printf '%s\n' "${flags_body}"
  printf '~~~\n\n'
  printf '</details>\n\n'
  printf 'Git status (porcelain)\n'
  printf '~~~text\n'
  printf '%s\n' "${status_porcelain}"
  printf '~~~\n\n'
  printf 'Changed files (last commit)\n'
  printf '~~~text\n'
  printf '%s\n' "${last_commit_show}"
  printf '~~~\n\n'
  printf 'Changed files (last 5 commits union)\n'
  printf '~~~text\n'
  printf '%s\n' "${last5_changed}"
  printf '~~~\n\n'
  printf 'Next request to continue\n'
  printf 'Please audit TASK-0008F.0 outputs and propose next precise CODEX tasks to restore interactivity:\n'
  printf 'smartdock, command palette, toolbar/panels, listing sidebar, post sidebar, comments toggle, library, share, mobile footer accordion.\n'
} > "${OUT}"

echo "Handoff generated at docs/ledger/NEW_ROOM_HANDOFF.md"
echo "Copy-paste that file into the new chat."
