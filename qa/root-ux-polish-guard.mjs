#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const files = {
  index: readFileSync("index.xml", "utf8"),
  app: readFileSync("src/js/gg-app.source.js", "utf8"),
  css: readFileSync("src/css/gg-app.source.css", "utf8"),
  consoleIndex: readFileSync("apps/console/index.html", "utf8"),
  consoleApp: readFileSync("apps/console/app.js", "utf8"),
  consoleCss: readFileSync("apps/console/styles.css", "utf8"),
  consoleServer: readFileSync("apps/console/server.mjs", "utf8"),
  packageJson: readFileSync("package.json", "utf8"),
  surface: readFileSync("SURFACE-CONTRACT.md", "utf8"),
  consoleDoc: readFileSync("docs/gg-console.md", "utf8")
};

const failures = [];

function requireIncludes(text, needle, message) {
  if (!text.includes(needle)) failures.push(message);
}

function requirePattern(text, pattern, message) {
  if (!pattern.test(text)) failures.push(message);
}

function countPattern(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

requireIncludes(files.index, "class='gg-site-head'", "index.xml: gg-site-head root header missing");
requireIncludes(files.index, "data-gg-module='site-head'", "index.xml: site-head module marker missing");
if (countPattern(files.index, /class='gg-site-head'/g) !== 1) failures.push("index.xml: duplicate gg-site-head root header");
requireIncludes(files.index, "class='gg-site-head__menu gg-listing-toolbar'", "index.xml: listing toolbar compatibility alias missing");
requireIncludes(files.index, "data-gg-listing-filter='popular-posts'", "index.xml: Popular Posts menu item missing");
requireIncludes(files.index, "href='#saved'", "index.xml: Saved menu hash missing");
requireIncludes(files.index, "href='#popularpost'", "index.xml: Popular Posts menu hash missing");

[
  ["article", "article"],
  ["latest", "update"],
  ["lab", "science"],
  ["insight", "psychology"],
  ["case-notes", "clinical_notes"],
  ["perspective", "visibility"],
  ["saved", "bookmark"],
  ["popular-posts", "local_fire_department"],
  ["recents", "history"],
  ["details", "top_panel_open"]
].forEach(([key, icon]) => {
  requirePattern(files.app, new RegExp(`['"]?${key}['"]?: \\{ label:`), `src/js: listing icon registry missing key ${key}`);
  requireIncludes(files.app, `icon: '${icon}'`, `src/js: listing icon registry missing icon ${icon}`);
});
requireIncludes(files.app, "ROOT_LISTING_ICON_REGISTRY.article.icon", "src/js: unknown label article fallback missing");
requireIncludes(files.index, "data-gg-listing-icon='article'", "index.xml: listing row label icon missing");
requireIncludes(files.index, "top_panel_open", "index.xml: Details top_panel_open icon missing");

["PopularPosts1", "PopularPosts3", "PopularPosts2", "PopularPosts4"].forEach((id) => {
  requireIncludes(files.index, `id='${id}'`, `index.xml: native ${id} source widget missing`);
});
["ALL_TIME", "LAST_YEAR", "LAST_MONTH", "LAST_WEEK"].forEach((range) => {
  requireIncludes(files.index, `data-gg-popular-range='${range}'`, `index.xml: popular range ${range} missing`);
  requireIncludes(files.app, range, `src/js: popular range ${range} missing`);
});
requireIncludes(files.app, "function extractPopularItems", "src/js: PopularPosts extraction missing");
requireIncludes(files.app, "Popular posts are unavailable right now.", "src/js: popular unavailable state missing");
requireIncludes(files.app, "syncPopularListingFromHash", "src/js: popular hash mode missing");
requireIncludes(files.app, "syncSavedListingFromHash", "src/js: saved hash mode missing");

if (/>Pagination<|>Browse entries</.test(files.index)) failures.push("index.xml: visible pagination label text still present");
requireIncludes(files.index, "data-gg-module='listing-pagination-dock-tail'", "index.xml: pagination dock-tail marker missing");

requireIncludes(files.app, "relatedVisibleMax: 3", "src/js: related visible max must be 3");
requireIncludes(files.app, "data-gg-related-page", "src/js: related dots/page controls missing");
requireIncludes(files.css, ".gg-related-posts__dots", "css: related dots styling missing");
requireIncludes(files.css, ".gg-related-posts__thumb", "css: related thumbnail/placeholder styling missing");

requireIncludes(files.index, "data-gg-preview-taxonomy='deprecated'", "index.xml: preview taxonomy deprecation marker missing");
requireIncludes(files.index, "read_more", "index.xml: preview open icon missing");
requireIncludes(files.index, "data-gg-save-icon='true'", "index.xml: preview save icon marker missing");
requirePattern(files.css, /\.gg-preview__cta-row\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?display:\s*flex;/, "css: preview CTA row must be sticky flex");

requireIncludes(files.index, "class='gg-contact-social'", "index.xml: contact social block missing");
if (/gg-more-footer__social/.test(files.index)) failures.push("index.xml: More sheet still owns social links");
requireIncludes(files.surface, "PopularPosts1", "SURFACE-CONTRACT.md: PopularPosts source IDs not documented");
requireIncludes(files.surface, "gg:saved:v1", "SURFACE-CONTRACT.md: Saved storage key not documented");
requireIncludes(files.surface, "Gaga Design System only", "SURFACE-CONTRACT.md: public surface design-system rule not documented");
requireIncludes(files.consoleDoc, "GG Blogger Studio prototype", "docs/gg-console.md: dashboard prototype boundary missing");

requireIncludes(files.consoleIndex, 'href="/styles.css"', "Console index: CSS path missing");
requireIncludes(files.consoleIndex, 'src="/app.js"', "Console index: JS path missing");
requireIncludes(files.consoleApp, 'fetch("/api/snapshot"', "Console app: snapshot fetch missing");
requireIncludes(files.consoleApp, "error-card", "Console app: styled error state missing");
requireIncludes(files.consoleCss, ".console-shell", "Console CSS: shell styling missing");
requireIncludes(files.consoleCss, ".error-card", "Console CSS: error styling missing");
requireIncludes(files.consoleServer, "local-files-whitelist", "Console server: whitelist snapshot mode missing");
requireIncludes(files.consoleServer, 'readAllowed("../package.json")', "Console check: allowlist enforcement proof missing");
requireIncludes(files.consoleServer, "dashboard.html", "Console server: dashboard prototype reference missing");
requireIncludes(files.consoleServer, "dashboard.html prototype UI appears to be shipped as Console", "Console check: dashboard shipped UI rejection missing");
if (!existsSync("apps/console/styles.css") || !existsSync("apps/console/app.js")) failures.push("Console files missing");

requireIncludes(files.packageJson, '"gg:console:check"', "package.json: gg:console:check missing");
requireIncludes(files.packageJson, '"gaga:verify-root-ux-polish"', "package.json: root UX polish guard script missing");
requireIncludes(files.packageJson, "npm run gaga:verify-root-ux-polish", "package.json: ci:qa must include root UX polish guard");

if (failures.length) {
  console.error("ROOT UX POLISH GUARD CONTRACT_FAILURE");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("ROOT UX POLISH GUARD PASS");
