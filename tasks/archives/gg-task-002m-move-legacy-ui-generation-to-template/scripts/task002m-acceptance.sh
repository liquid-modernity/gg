#!/usr/bin/env bash
set -euo pipefail

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }

echo "=== TASK-002M ACCEPTANCE ==="

npm run doctor
npm run build
npm run check
npm run check:softcode
npm run check:public-softcode
npm run check:public-ui
npm run check:public-dom
npm run console:check
npm run studio:check
npm run deploy:dry

[ -f "apps/landing/landing.html" ] || fail "apps/landing/landing.html missing"
[ -f "config/public-dom-generation-policy.json" ] || fail "public DOM policy missing"
[ -f "docs/public-dom-generation-audit.md" ] || fail "public DOM audit doc missing"
[ -f "checks/public-dom.check.mjs" ] || fail "public DOM check missing"
[ -f "tasks/active/TASK-002M-MOVE-LEGACY-UI-GENERATION-TO-TEMPLATE.md" ] || fail "TASK-002M note missing"

# Landing must now expose a template for the discovery command panel. Allow exact marker or equivalent naming.
grep -Eq '<template[^>]+(id="gg-landing-discovery-command-template"|data-gg-landing-discovery-command-template|data-gg-template="landing-discovery-command")|<template[^>]*>[[:space:]]*<[^>]+(data-gg-discovery-command|class="[^"]*discovery-command)' apps/landing/landing.html \
  || fail "landing discovery command template marker missing"

# Check docs/policy mention the public DOM rule.
grep -Eiq 'large public UI|HTML/XML|template' docs/public-dom-generation-audit.md \
  || fail "audit doc does not mention large public UI template rule"

grep -Eiq 'largePublicUiMustLiveInHtmlOrTemplate|template|uiGeneration' config/public-dom-generation-policy.json \
  || fail "policy does not include template/ui-generation rule"

# Guard should exist in check file.
grep -Eq 'landing.*discovery|discovery.*template|public-dom' checks/public-dom.check.mjs \
  || fail "public DOM check does not appear to validate landing discovery/template contract"

# There should be no unallowlisted insertAdjacentHTML/outerHTML in public source according to the checker.
npm run check:public-dom >/tmp/task002m-public-dom.log
cat /tmp/task002m-public-dom.log

pass "TASK-002M acceptance passed"
