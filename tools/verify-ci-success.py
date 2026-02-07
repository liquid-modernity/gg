#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.request


def die(msg):
    print(msg)
    sys.exit(1)


def summarize(runs, limit=5):
    for r in runs[:limit]:
        status = r.get("status")
        conclusion = r.get("conclusion")
        url = r.get("html_url")
        updated = r.get("updated_at")
        print(f"- status={status} conclusion={conclusion} updated_at={updated} url={url}")


def fetch_runs(url, token):
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


def main():
    token = os.environ.get("GH_TOKEN", "").strip()
    repo = os.environ.get("REPO", "").strip()
    sha = os.environ.get("SHA", "").strip()
    workflow = os.environ.get("CI_WORKFLOW", "ci.yml").strip()

    if not token:
        die("ERROR: GH_TOKEN is required")
    if not repo:
        die("ERROR: REPO is required")
    if not sha:
        die("ERROR: inputs.sha is required")

    url = f"https://api.github.com/repos/{repo}/actions/workflows/{workflow}/runs?head_sha={sha}&per_page=20"
    attempts = 30
    sleep_s = 15

    for attempt in range(1, attempts + 1):
        print(f"CI_WAIT attempt {attempt}/{attempts}")
        try:
            data = fetch_runs(url, token)
        except Exception as exc:
            print(f"WARN: failed to query CI workflow runs: {exc}")
            if attempt == attempts:
                die("ERROR: unable to verify CI success after retries")
            time.sleep(sleep_s)
            continue

        runs = [r for r in data.get("workflow_runs", []) if r.get("head_sha") == sha]
        if not runs:
            print("INFO: no CI runs found for sha yet")
            if attempt == attempts:
                die("ERROR: CI not found after retries")
            time.sleep(sleep_s)
            continue

        success = any(
            r.get("status") == "completed" and r.get("conclusion") == "success"
            for r in runs
        )
        if success:
            print("CI_SUCCESS_OK")
            summarize(runs)
            return

        completed = [r for r in runs if r.get("status") == "completed"]
        in_flight = [r for r in runs if r.get("status") in ("queued", "in_progress")]

        if completed and not in_flight:
            print("ERROR: CI completed but not successful")
            summarize(runs)
            sys.exit(1)

        print("INFO: CI still in progress")
        summarize(runs)

        if attempt == attempts:
            die("ERROR: CI not completed after retries")
        time.sleep(sleep_s)


if __name__ == "__main__":
    main()
