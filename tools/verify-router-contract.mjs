import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function readFile(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    failures.push(`${rel} missing`);
    return "";
  }
  return fs.readFileSync(p, "utf8");
}

function extractReleaseId(xml) {
  const m = xml.match(/\/assets\/v\/([^/]+)\/(main\.js|main\.css|boot\.js)/);
  return m ? m[1] : null;
}

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  if (start === -1) return "";
  const end = src.indexOf(endToken, start);
  if (end === -1) return src.slice(start);
  return src.slice(start, end);
}

function validateCore(core, label) {
  if (!core) {
    failures.push(`${label} missing or empty`);
    return;
  }

  const handleBlock = sliceBetween(core, "router.handleClick", "router.navigate");
  if (!handleBlock) failures.push(`${label}: router.handleClick block not found`);
  if (handleBlock && /requestUi|loadUi/.test(handleBlock)) {
    failures.push(`${label}: router.handleClick must not call requestUi/loadUi`);
  }
  if (handleBlock && !/\._shouldIntercept/.test(handleBlock)) {
    failures.push(`${label}: router.handleClick must call router._shouldIntercept`);
  }

  const navigateBlock = sliceBetween(core, "router.navigate", "router._onPopState");
  if (!navigateBlock) {
    failures.push(`${label}: router.navigate block not found`);
  } else {
    if (!/indexOf\('\/search'\)===0/.test(navigateBlock)) {
      failures.push(`${label}: router.navigate must force hard-nav for /search`);
    }
    if (!/location\.assign/.test(navigateBlock)) {
      failures.push(`${label}: router.navigate must call location.assign for /search`);
    }
    const preSurfaceIdx = navigateBlock.indexOf("router._applySurface(url)");
    const loadIdx = navigateBlock.indexOf("router._load(url");
    if (preSurfaceIdx === -1) {
      failures.push(`${label}: router.navigate must pre-apply router._applySurface(url) before load`);
    }
    if (preSurfaceIdx !== -1 && loadIdx !== -1 && preSurfaceIdx > loadIdx) {
      failures.push(`${label}: router.navigate applies surface after router._load (causes FOUC risk)`);
    }
  }

  const loadBlock = sliceBetween(core, "router._load", "router.handleClick");
  if (!loadBlock) {
    failures.push(`${label}: router._load block not found`);
  } else {
    const renderIdx = loadBlock.indexOf("GG.core.render.apply(html, url)");
    const surfaceIdx = loadBlock.indexOf("router._applySurface(url)");
    const postRenderScrollIdx = loadBlock.indexOf("if (typeof scrollY === 'number') w.scrollTo");
    if (renderIdx === -1) {
      failures.push(`${label}: router._load must call GG.core.render.apply(html, url)`);
    }
    if (surfaceIdx === -1) {
      failures.push(`${label}: router._load must re-apply router._applySurface(url) after render`);
    }
    if (renderIdx !== -1 && surfaceIdx !== -1 && surfaceIdx < renderIdx) {
      failures.push(`${label}: router._applySurface(url) must run after render.apply`);
    }
    if (surfaceIdx !== -1 && postRenderScrollIdx !== -1 && surfaceIdx > postRenderScrollIdx) {
      failures.push(`${label}: router._applySurface(url) must run before scroll/route finalization`);
    }
  }

  const shouldMatch = core.match(/router\._shouldIntercept[\s\S]*?};/);
  if (!shouldMatch) {
    failures.push(`${label}: router._shouldIntercept missing`);
  } else {
    const body = shouldMatch[0];
    if (!body.includes("/assets/")) failures.push(`${label}: router._shouldIntercept must deny /assets/*`);
    const endpoints = ["/robots.txt", "/sitemap.xml", "/favicon.ico", "/manifest.json", "/manifest.webmanifest"];
    endpoints.forEach((e) => {
      if (!body.includes(e)) failures.push(`${label}: router._shouldIntercept missing denylist for ${e}`);
    });
    const exts = [
      ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
      ".json", ".xml", ".txt", ".map", ".woff", ".woff2", ".ttf",
    ];
    let found = 0;
    exts.forEach((ext) => {
      if (body.includes(ext)) found += 1;
    });
    if (found < 5) failures.push(`${label}: router._shouldIntercept must check at least 5 static extensions`);
  }

  const lines = core.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (line.includes("[GG.router]")) {
      if (!(line.includes("isDev()") || line.includes("GG_DEBUG"))) {
        failures.push(`${label}: router log not dev-only at core.js:${idx + 1}`);
      }
    }
  });
}

function validateMixedGate(listingSource, label) {
  if (!listingSource) {
    failures.push(`${label} missing or empty`);
    return;
  }

  if (!/data-gg-surface/.test(listingSource)) {
    failures.push(`${label}: mixed init gate must read data-gg-surface`);
  }
  if (!/c&&c\.surface/.test(listingSource)) {
    failures.push(`${label}: mixed init gate must use routerCtx.surface`);
  }
  const hasLandingHomeGuard =
    /v!==['"]landing['"]&&v!==['"]home['"]\)\s*return\s+false/.test(listingSource) ||
    /cs!=='landing'&&cs!=='home'/.test(listingSource) ||
    /v===['"]landing['"]\|\|v===['"]home['"]/.test(listingSource) ||
    /['"]landing['"]===v\|\|['"]home['"]===v/.test(listingSource);
  if (!hasLandingHomeGuard) {
    failures.push(`${label}: mixed init gate must allow only landing/home surfaces`);
  }
  if (/return\s*!v\|\|v===['"]landing['"]\|\|v===['"]home['"]/.test(listingSource)) {
    failures.push(`${label}: mixed init gate must not treat empty surface as landing/home (blocks /blog bleed)`);
  }
  if (/c&&c\.view&&c\.view!==['"]home['"]/.test(listingSource)) {
    failures.push(`${label}: mixed init gate still keyed by routerCtx.view==='home'`);
  }
  if (/data-gg-view/.test(listingSource)) {
    failures.push(`${label}: mixed init gate must not depend on data-gg-view`);
  }
}

function countMatches(source, re) {
  const hits = source.match(re);
  return hits ? hits.length : 0;
}

function validateTemplateTaxonomy(source, label) {
  if (!source) {
    failures.push(`${label} missing or empty`);
    return;
  }

  const labelPattern = /<b:attr\s+cond='[^']*data:ggIsLabel[^']*data:view\.search[^']*data:view\.search\.label[^']*'\s+expr:value='data:view\.search\.label'\s+name='data-gg-label'\/>/g;
  const queryPattern = /<b:attr\s+cond='[^']*data:ggIsSearch[^']*not\s+data:ggIsLabel[^']*data:view\.search[^']*data:view\.search\.query[^']*'\s+expr:value='data:view\.search\.query'\s+name='data-gg-query'\/>/g;

  if (countMatches(source, labelPattern) < 2) {
    failures.push(`${label}: data-gg-label must be sourced from data:view.search.label on body+main attrs`);
  }
  if (countMatches(source, queryPattern) < 2) {
    failures.push(`${label}: data-gg-query must be sourced from data:view.search.query and excluded for label pages`);
  }

  const legacyLabel =
    /name='data-gg-label'[^>]*expr:value='data:view\.title'|expr:value='data:view\.title'[^>]*name='data-gg-label'/i;
  const legacyQuery =
    /name='data-gg-query'[^>]*expr:value='data:view\.title'|expr:value='data:view\.title'[^>]*name='data-gg-query'/i;
  if (legacyLabel.test(source)) {
    failures.push(`${label}: legacy data-gg-label mapping to data:view.title is not allowed`);
  }
  if (legacyQuery.test(source)) {
    failures.push(`${label}: legacy data-gg-query mapping to data:view.title is not allowed`);
  }
}

const indexXml = readFile("index.prod.xml");
const indexDevXml = readFile("index.dev.xml");
const releaseId = extractReleaseId(indexXml);
if (!releaseId) {
  failures.push("unable to extract release id from index.prod.xml");
}

validateTemplateTaxonomy(indexXml, "index.prod.xml");
validateTemplateTaxonomy(indexDevXml, "index.dev.xml");

if (releaseId) {
  const pinnedCore = readFile(`public/assets/v/${releaseId}/core.js`);
  validateCore(pinnedCore, `pinned core.js (v/${releaseId})`);
  const pinnedListing = readFile(`public/assets/v/${releaseId}/modules/ui.bucket.listing.js`);
  validateMixedGate(pinnedListing, `pinned ui.bucket.listing.js (v/${releaseId})`);
}

const latestCorePath = path.join(root, "public", "assets", "latest", "core.js");
if (fs.existsSync(latestCorePath)) {
  const latestCore = fs.readFileSync(latestCorePath, "utf8");
  validateCore(latestCore, "latest core.js");
}
const latestListingPath = path.join(root, "public", "assets", "latest", "modules", "ui.bucket.listing.js");
if (fs.existsSync(latestListingPath)) {
  const latestListing = fs.readFileSync(latestListingPath, "utf8");
  validateMixedGate(latestListing, "latest ui.bucket.listing.js");
}

if (failures.length) {
  console.error("VERIFY_ROUTER_CONTRACT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_ROUTER_CONTRACT: PASS");
