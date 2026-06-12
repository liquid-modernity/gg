#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== TASK-002C ACCEPTANCE ==="

echo "--- npm run doctor ---"
npm run doctor

echo "--- npm run build ---"
npm run build

echo "--- npm run check ---"
npm run check

echo "--- npm run console:check ---"
npm run console:check

echo "--- npm run studio:check ---"
npm run studio:check

echo "--- npm run deploy:dry ---"
npm run deploy:dry

echo "--- npm run check:softcode ---"
npm run check:softcode

echo "=== TASK-002C ACCEPTANCE: ALL GREEN ==="