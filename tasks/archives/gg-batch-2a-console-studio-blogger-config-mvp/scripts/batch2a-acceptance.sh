#!/usr/bin/env bash
set -euo pipefail

echo "== GG vNext Batch 2A acceptance =="
echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"
echo

npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry

echo
echo "Batch 2A acceptance: GREEN"
