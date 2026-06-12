#!/usr/bin/env bash
set -euo pipefail

npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry

echo "Batch 1 acceptance: PASS"
