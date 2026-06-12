#!/usr/bin/env bash
set -euo pipefail

printf "\n[task002b] macOS zip hygiene check...\n"
if find . -path './node_modules' -prune -o \( -name '__MACOSX' -o -name '.DS_Store' -o -name '._*' \) -print | grep -q .; then
  echo "ERROR: macOS metadata found. Remove __MACOSX, .DS_Store, and ._* files before committing/zipping."
  find . -path './node_modules' -prune -o \( -name '__MACOSX' -o -name '.DS_Store' -o -name '._*' \) -print
  exit 1
fi

printf "\n[task002b] required files check...\n"
test -f .gitignore
test -f config/blogger.targets.json
test -f config/softcode.inventory.json
test -f apps/_shared/blogger-targets.mjs

printf "\n[task002b] npm acceptance...\n"
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry

printf "\n[task002b] all green.\n"
