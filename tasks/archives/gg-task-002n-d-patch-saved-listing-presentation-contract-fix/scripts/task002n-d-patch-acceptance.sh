#!/usr/bin/env bash
set -euo pipefail

printf '\n=== TASK-002N-D-PATCH ACCEPTANCE ===\n'

if [ ! -f "src/modules/legacy-app/legacy-app.js" ]; then
  echo "fail: missing src/modules/legacy-app/legacy-app.js" >&2
  exit 1
fi

if [ ! -f "src/modules/saved-listing-bridge/saved-listing-bridge.js" ]; then
  echo "fail: missing src/modules/saved-listing-bridge/saved-listing-bridge.js" >&2
  exit 1
fi

if [ ! -f "apps/blog/index.xml" ]; then
  echo "fail: missing apps/blog/index.xml" >&2
  exit 1
fi

node <<'NODE'
const fs = require('fs');
const legacy = fs.readFileSync('src/modules/legacy-app/legacy-app.js', 'utf8');
const blog = fs.readFileSync('apps/blog/index.xml', 'utf8');

function ok(cond, msg) {
  if (!cond) {
    console.error('fail:', msg);
    process.exit(1);
  }
  console.log('ok:', msg);
}

ok(legacy.includes('savedListingActive'), 'savedListingActive flow is present');
ok(legacy.includes('renderSavedListing'), 'renderSavedListing flow is present');
ok(legacy.includes('setNativeListingRowsHidden') || legacy.includes('nativeListing'), 'native row visibility control is present');
ok(legacy.includes('loadMoreWrap') || legacy.includes('loadMore'), 'load-more visibility control is present');
ok(blog.includes('gg-template-listing-row'), 'canonical listing row template exists');
ok(blog.includes('gg-empty-state-saved-articles'), 'saved empty state template exists');
ok(!/gg-template-(div|link|button|element|generic)\b/.test(blog), 'no generic/universal template introduced');

const contractPaths = [
  'config/saved-listing-presentation-contract.json',
  'docs/saved-listing-presentation-contract.md',
  'docs/public-dom-generation-audit.md'
];
ok(contractPaths.some((p) => fs.existsSync(p) && /saved listing|saved mode|savedModeExclusive/i.test(fs.readFileSync(p, 'utf8'))), 'saved listing presentation contract documented');

if (fs.existsSync('config/saved-listing-presentation-contract.json')) {
  const contract = JSON.parse(fs.readFileSync('config/saved-listing-presentation-contract.json', 'utf8'));
  ok(contract.savedModeExclusive === true, 'contract: savedModeExclusive=true');
  ok(contract.hideNativeRowsWhenSavedActive === true, 'contract: hideNativeRowsWhenSavedActive=true');
  ok(contract.hideLoadMoreWhenSavedActive === true, 'contract: hideLoadMoreWhenSavedActive=true');
  ok(contract.rawDetailsTextVisible === false, 'contract: rawDetailsTextVisible=false');
}
NODE

printf '\nRun full validation before marking complete:\n'
printf '%s\n' 'npm run doctor && npm run build && npm run check && npm run check:softcode && npm run check:public-softcode && npm run check:public-ui && npm run check:public-dom && npm run check:legacy-bridge && npm run console:check && npm run studio:check && npm run deploy:dry'

printf '\nManual smoke test required:\n'
printf '%s\n' '- Saved mode shows only saved posts.'
printf '%s\n' '- Native/latest rows are not visible in saved mode.'
printf '%s\n' '- Load more/pagination is hidden in saved mode.'
printf '%s\n' '- Raw visible Details text is gone.'
printf '%s\n' '- Unsave in saved mode removes row or refreshes list.'
printf '%s\n' '- Empty saved state appears when all saved posts are removed.'

printf '\n=== TASK-002N-D-PATCH ACCEPTANCE PASSED ===\n'
