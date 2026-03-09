#!/usr/bin/env bash
set -Eeuo pipefail

label="live-verifier"
max_attempts="${LIVE_VERIFIER_MAX_ATTEMPTS:-2}"
base_delay_ms="${LIVE_VERIFIER_BASE_DELAY_MS:-1500}"
cap_delay_ms="${LIVE_VERIFIER_CAP_DELAY_MS:-10000}"

usage() {
  cat <<'USAGE'
Usage:
  tools/run-live-verifier-with-retry.sh [options] -- <command...>

Options:
  --label <text>           Label shown in logs.
  --max-attempts <n>       Wrapper-level max attempts (default: 2).
  --base-delay-ms <ms>     Exponential backoff base in ms (default: 1500).
  --cap-delay-ms <ms>      Backoff cap in ms (default: 10000).
USAGE
}

while (($#)); do
  case "$1" in
    --label)
      label="${2:-}"
      shift 2
      ;;
    --max-attempts)
      max_attempts="${2:-}"
      shift 2
      ;;
    --base-delay-ms)
      base_delay_ms="${2:-}"
      shift 2
      ;;
    --cap-delay-ms)
      cap_delay_ms="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "ERROR: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if (($# == 0)); then
  echo "ERROR: missing command after --" >&2
  usage >&2
  exit 2
fi

if ! [[ "${max_attempts}" =~ ^[0-9]+$ ]] || (( max_attempts < 1 )); then
  echo "ERROR: --max-attempts must be >=1 (got ${max_attempts})" >&2
  exit 2
fi
if ! [[ "${base_delay_ms}" =~ ^[0-9]+$ ]] || (( base_delay_ms < 0 )); then
  echo "ERROR: --base-delay-ms must be >=0 (got ${base_delay_ms})" >&2
  exit 2
fi
if ! [[ "${cap_delay_ms}" =~ ^[0-9]+$ ]] || (( cap_delay_ms < 0 )); then
  echo "ERROR: --cap-delay-ms must be >=0 (got ${cap_delay_ms})" >&2
  exit 2
fi

sleep_ms() {
  local ms="$1"
  if ! [[ "${ms}" =~ ^[0-9]+$ ]] || (( ms <= 0 )); then
    return 0
  fi
  local seconds
  seconds="$(awk -v ms="${ms}" 'BEGIN { printf "%.3f", ms / 1000 }')"
  sleep "${seconds}"
}

classify_failure() {
  local log_file="$1"
  if grep -Eq 'FAILURE_CLASS:[[:space:]]*FUNCTIONAL_FAIL' "${log_file}"; then
    echo "FUNCTIONAL_FAIL"
    return 0
  fi
  if grep -Eq 'FAILURE_CLASS:[[:space:]]*LIVE_UNAVAILABLE' "${log_file}"; then
    echo "LIVE_UNAVAILABLE"
    return 0
  fi
  if grep -q 'FUNCTIONAL FAIL:' "${log_file}"; then
    echo "FUNCTIONAL_FAIL"
    return 0
  fi
  if grep -q 'LIVE UNAVAILABLE AFTER RETRIES:' "${log_file}"; then
    echo "LIVE_UNAVAILABLE"
    return 0
  fi
  echo "UNKNOWN_FAIL"
}

cmd=( "$@" )

attempt=1
while (( attempt <= max_attempts )); do
  log_file="$(mktemp)"
  if "${cmd[@]}" >"${log_file}" 2>&1; then
    cat "${log_file}"
    rm -f "${log_file}"
    echo "PASS: ${label} (attempt ${attempt}/${max_attempts})"
    exit 0
  fi

  cat "${log_file}"
  failure_class="$(classify_failure "${log_file}")"
  rm -f "${log_file}"

  if [[ "${failure_class}" == "FUNCTIONAL_FAIL" ]]; then
    echo "FAIL: ${label} functional regression detected (no wrapper retry)" >&2
    exit 1
  fi
  if [[ "${failure_class}" != "LIVE_UNAVAILABLE" ]]; then
    echo "FAIL: ${label} unknown/non-retriable failure class (${failure_class})" >&2
    exit 1
  fi
  if (( attempt >= max_attempts )); then
    echo "FAIL: ${label} live unavailable after ${max_attempts} wrapper attempt(s)" >&2
    exit 1
  fi

  exp_delay_ms=$(( base_delay_ms * (2 ** (attempt - 1)) ))
  if (( exp_delay_ms > cap_delay_ms )); then
    exp_delay_ms="${cap_delay_ms}"
  fi
  jitter_ms=$(( RANDOM % 500 ))
  wait_ms=$(( exp_delay_ms + jitter_ms ))
  next_attempt=$(( attempt + 1 ))
  echo "WARN: ${label} transient live unavailable; wrapper retry ${next_attempt}/${max_attempts} in ${wait_ms}ms" >&2
  sleep_ms "${wait_ms}"
  attempt="${next_attempt}"
done

echo "FAIL: ${label} reached unexpected wrapper state" >&2
exit 1
