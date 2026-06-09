#!/usr/bin/env node

import { createServer } from "node:http";
import { readFileSync, statSync, existsSync } from "node:fs";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), "../.."));
const CONSOLE_DIR = join(ROOT, "apps/console");
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8789;

const WORKSPACE_ALLOWLIST = Object.freeze([
  "package.json",
  "SOURCE-OF-TRUTH.md",
  "SURFACE-CONTRACT.md",
  "REPO-STRUCTURE.md",
  "QA-COMMANDS.md",
  "docs/ci-guard-policy.md",
  "docs/gg-console.md",
  "gg-copy-en.json",
  "gg-copy-id.json",
  "gg-copy-manifest.json",
  "gg-copy-meta.json",
  "index.xml",
  "landing.html",
  "store.html",
  "wrangler.jsonc",
  ".github/workflows/ci.yml",
  ".github/workflows/deploy-cloudflare.yml",
  ".github/workflows/lighthouse-ci.yml",
  ".gitignore",
  "dashboard.html"
]);

const STATIC_ROUTES = Object.freeze(new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/app.js", "app.js"],
  ["/styles.css", "styles.css"]
]));

function readAllowed(relPath) {
  if (!WORKSPACE_ALLOWLIST.includes(relPath)) {
    throw new Error(`disallowed read: ${relPath}`);
  }
  const path = join(ROOT, relPath);
  if (!existsSync(path)) {
    return { relPath, exists: false, text: "", bytes: 0 };
  }
  const text = readFileSync(path, "utf8");
  return { relPath, exists: true, text, bytes: Buffer.byteLength(text) };
}

function readConsoleFile(file) {
  const fullPath = normalize(join(CONSOLE_DIR, file));
  if (relative(CONSOLE_DIR, fullPath).startsWith("..")) {
    throw new Error(`disallowed console path: ${file}`);
  }
  return readFileSync(fullPath);
}

function firstMatch(text, pattern, fallback = "") {
  const match = text.match(pattern);
  return match ? String(match[1] || "").trim() : fallback;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseJsonScript(text) {
  const decoded = decodeEntities(text);
  const start = decoded.indexOf("{");
  const end = decoded.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(decoded.slice(start, end + 1));
  } catch {
    return null;
  }
}

function parseJsonFile(text) {
  try {
    return JSON.parse(text);
  } catch {
    return parseJsonScript(text);
  }
}

function flattenKeys(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      return flattenKeys(child, next);
    }
    return [next];
  });
}

function collectAttrs(text, attrName) {
  const attr = attrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\b${attr}=['"]([^'"]+)['"]`, "g");
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

function collectLinksByAttr(text, attrName) {
  const attr = attrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<(?:a|button)\\b([^>]*\\b${attr}=['"]([^'"]+)['"][^>]*)>([\\s\\S]*?)<\\/(?:a|button)>`, "g");
  return [...text.matchAll(pattern)].map((match) => {
    const attrs = match[1];
    const label = decodeEntities(match[3]).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return {
      id: match[2],
      href: firstMatch(attrs, /\bhref=['"]([^'"]+)['"]/),
      label: label || firstMatch(attrs, /\baria-label=['"]([^'"]+)['"]/),
      copyKey: firstMatch(attrs, /\bdata-(?:gg-)?copy=['"]([^'"]+)['"]/)
    };
  });
}

function fileStatus(files, relPath) {
  const file = files[relPath];
  return file && file.exists ? "present" : "missing";
}

function buildProfile(files) {
  const index = files["index.xml"].text;
  const landing = files["landing.html"].text;
  const store = files["store.html"].text;
  const canonicalBase = "https://www.pakrpp.com/";
  const storeFeed = firstMatch(store, /\bdata-store-feed-url=["']([^"']+)["']/);
  const storeLegacyFeed = firstMatch(store, /\bdata-store-legacy-feed-url=["']([^"']+)["']/);

  return {
    status: "legacy-derived",
    siteName: firstMatch(landing, /<title>([^<]+)/, "PakRPP").split("|")[0].split("-")[0].trim(),
    canonicalBase,
    rootBloggerSource: "https://pakrpp.blogspot.com/",
    storeBloggerSource: storeFeed || "https://pakrppstore.blogspot.com/feeds/posts/default/-/Store?alt=json&max-results=50",
    storeLegacySource: storeLegacyFeed,
    landingSurfaceUrl: firstMatch(landing, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/),
    storeCanonicalUrl: firstMatch(store, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/),
    environment: firstMatch(index, /\bdata-env=['"]([^'"]+)['"]/, "local-readonly"),
    release: firstMatch(index, /\bdata-release=['"]([^'"]+)['"]/, "unavailable"),
    templateFingerprint: firstMatch(index, /\bdata-gg-template-fingerprint=['"]([^'"]+)['"]/, "unavailable")
  };
}

function buildSurfaces(files, profile) {
  return [
    {
      id: "root-blog",
      type: "blog",
      renderer: "Blogger XML SSR",
      source: profile.rootBloggerSource,
      canonical: profile.canonicalBase,
      status: fileStatus(files, "index.xml")
    },
    {
      id: "landing",
      type: "static",
      renderer: "static HTML",
      source: "landing.html",
      canonical: profile.landingSurfaceUrl,
      status: fileStatus(files, "landing.html")
    },
    {
      id: "store",
      type: "commerce",
      renderer: "Yellow Cart static build",
      source: profile.storeBloggerSource,
      canonical: profile.storeCanonicalUrl,
      status: fileStatus(files, "store.html")
    },
    {
      id: "root-cms",
      type: "cms-source",
      renderer: "Blogger feed",
      source: "pakrpp.blogspot.com",
      canonical: profile.canonicalBase,
      status: fileStatus(files, "index.xml")
    },
    {
      id: "store-cms",
      type: "cms-source",
      renderer: "Blogger feed",
      source: "pakrppstore.blogspot.com",
      canonical: profile.storeCanonicalUrl,
      status: fileStatus(files, "store.html")
    }
  ];
}

function buildNavigation(files) {
  const index = files["index.xml"].text;
  const landing = files["landing.html"].text;
  const store = files["store.html"].text;
  const combined = [index, landing, store].join("\n");
  return {
    dockItems: unique([
      ...collectAttrs(combined, "data-gg-nav"),
      ...collectAttrs(combined, "data-store-dock")
    ]).map((id) => ({ id, status: "present" })),
    moreLinks: collectLinksByAttr(combined, "data-gg-more-route"),
    listingFilters: unique(collectAttrs(combined, "data-discovery-filter")).map((id) => ({ id })),
    contact: {
      rootMode: firstMatch(index, /\bdata-gg-contact-state=['"]([^'"]+)['"]/, "unknown"),
      landingRoute: "/landing#contact",
      fallbackEmail: firstMatch(index, /href=['"]mailto:([^'"]+)['"]/, "unavailable")
    }
  };
}

function buildRoutes(files) {
  const wrangler = files["wrangler.jsonc"].text;
  return {
    publicRoutes: [
      { route: "/landing", meaning: "Home", owner: "landing.html" },
      { route: "/", meaning: "Blog", owner: "index.xml / Blogger" },
      { route: "/store", meaning: "Store", owner: "store.html / Worker static route" },
      { route: "/search", meaning: "Blogger search/listing", owner: "Blogger root CMS" },
      { route: "/p/*.html", meaning: "Blogger page detail", owner: "Blogger root CMS" },
      { route: "/*/*.html", meaning: "Blogger post detail", owner: "Blogger root CMS" }
    ],
    workerRoutes: [...wrangler.matchAll(/"pattern"\s*:\s*"([^"]+)"/g)].map((match) => match[1])
  };
}

function buildCopy(files) {
  const en = parseJsonFile(files["gg-copy-en.json"].text) || {};
  const id = parseJsonFile(files["gg-copy-id.json"].text) || {};
  const manifest = parseJsonFile(files["gg-copy-manifest.json"].text) || {};
  const meta = parseJsonFile(files["gg-copy-meta.json"].text) || {};
  const enKeys = flattenKeys(en);
  const idKeys = flattenKeys(id);
  const enSet = new Set(enKeys);
  const idSet = new Set(idKeys);

  return {
    files: ["gg-copy-en.json", "gg-copy-id.json", "gg-copy-manifest.json", "gg-copy-meta.json"].map((relPath) => ({
      relPath,
      status: fileStatus(files, relPath),
      bytes: files[relPath] ? files[relPath].bytes : 0
    })),
    locales: {
      en: enKeys.length,
      id: idKeys.length
    },
    missingInId: enKeys.filter((key) => !idSet.has(key)),
    missingInEn: idKeys.filter((key) => !enSet.has(key)),
    namespaces: Array.isArray(manifest.namespaces) ? manifest.namespaces : [],
    namespacePolicyCount: meta.namespacePolicy && typeof meta.namespacePolicy === "object"
      ? Object.keys(meta.namespacePolicy).length
      : 0
  };
}

function collectIds(text) {
  return [...text.matchAll(/\bid=['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

function stripTags(text) {
  return decodeEntities(text).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countButtonsWithoutNames(text) {
  const buttons = [...text.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
  return buttons.filter((match) => {
    const attrs = match[1];
    if (/\b(?:aria-label|title|data-copy|data-gg-copy|data-copy-aria|data-gg-copy-aria-label)=['"][^'"]+['"]/.test(attrs)) return false;
    return stripTags(match[2]) === "";
  }).length;
}

function countInputsMissingLabels(text) {
  const labelsFor = new Set([...text.matchAll(/<label\b[^>]*\bfor=['"]([^'"]+)['"]/g)].map((match) => match[1]));
  const inputs = [...text.matchAll(/<(input|select|textarea)\b([^>]*)>/g)];
  return inputs.filter((match) => {
    const attrs = match[2];
    if (/\btype=['"]hidden['"]/.test(attrs)) return false;
    if (/\b(?:aria-label|aria-labelledby|data-copy-aria|data-copy-placeholder|data-gg-copy-placeholder)=['"][^'"]+['"]/.test(attrs)) return false;
    const id = firstMatch(attrs, /\bid=['"]([^'"]+)['"]/);
    return !id || !labelsFor.has(id);
  }).length;
}

function countTriggerMismatches(text) {
  const ids = new Set(collectIds(text));
  const controls = collectAttrs(text, "aria-controls");
  return controls.filter((target) => !ids.has(target)).length;
}

function buildA11y(files) {
  const htmlFiles = ["index.xml", "landing.html", "store.html"];
  const perFile = htmlFiles.map((relPath) => {
    const text = files[relPath].text;
    const ids = collectIds(text);
    const duplicateIdCount = ids.length - new Set(ids).size;
    return {
      relPath,
      duplicateIdCount,
      buttonsWithoutNames: countButtonsWithoutNames(text),
      missingFormLabels: countInputsMissingLabels(text),
      sheetTriggerPanelMismatches: countTriggerMismatches(text)
    };
  });
  return {
    perFile,
    totals: perFile.reduce((acc, item) => ({
      duplicateIdCount: acc.duplicateIdCount + item.duplicateIdCount,
      buttonsWithoutNames: acc.buttonsWithoutNames + item.buttonsWithoutNames,
      missingFormLabels: acc.missingFormLabels + item.missingFormLabels,
      sheetTriggerPanelMismatches: acc.sheetTriggerPanelMismatches + item.sheetTriggerPanelMismatches
    }), {
      duplicateIdCount: 0,
      buttonsWithoutNames: 0,
      missingFormLabels: 0,
      sheetTriggerPanelMismatches: 0
    })
  };
}

function scriptExists(packageJson, name) {
  return Boolean(packageJson.scripts && packageJson.scripts[name]);
}

function buildCi(files) {
  const packageJson = parseJsonFile(files["package.json"].text) || {};
  const ci = files[".github/workflows/ci.yml"].text;
  const deploy = files[".github/workflows/deploy-cloudflare.yml"].text;
  const lighthouse = files[".github/workflows/lighthouse-ci.yml"].text;
  const qaCommands = files["QA-COMMANDS.md"].text;
  const requiredCommands = ["build", "ci:cloudflare", "ci:qa", "ci:85", "ci:95"];
  const deployVerifyIndex = deploy.indexOf("npm run ci:cloudflare");
  const deployPreparedIndex = deploy.indexOf("npm run deploy:cloudflare:prepared");
  return {
    commandChecklist: requiredCommands.map((name) => ({
      command: `npm run ${name}`,
      status: scriptExists(packageJson, name) ? "wired" : "missing"
    })),
    workflows: [
      {
        id: "ci",
        file: ".github/workflows/ci.yml",
        status: files[".github/workflows/ci.yml"].exists ? "present" : "missing",
        node20: /node-version:\s*['"]?20['"]?/.test(ci),
        npmCi: /\bnpm ci\b/.test(ci),
        cloudflareCi: /npm run ci:cloudflare/.test(ci)
      },
      {
        id: "deploy-cloudflare",
        file: ".github/workflows/deploy-cloudflare.yml",
        status: files[".github/workflows/deploy-cloudflare.yml"].exists ? "present" : "missing",
        node20: /node-version:\s*['"]?20['"]?/.test(deploy),
        npmCi: /\bnpm ci\b/.test(deploy),
        verifyBeforeDeploy: deployVerifyIndex !== -1 && deployPreparedIndex !== -1 && deployVerifyIndex < deployPreparedIndex,
        preparedDeploy: /npm run deploy:cloudflare:prepared/.test(deploy),
        strictLiveSmoke: /npm run gaga:verify-worker-live:strict/.test(deploy)
      },
      {
        id: "lighthouse",
        file: ".github/workflows/lighthouse-ci.yml",
        status: files[".github/workflows/lighthouse-ci.yml"].exists ? "present" : "missing",
        advisory: /continue-on-error:\s*true/.test(lighthouse) && /advisory/i.test(lighthouse)
      }
    ],
    packaging: {
      dotfilesDocumented: /git-visible source files|git archive|git ls-files|dotfiles/i.test(qaCommands),
      gitignorePresent: files[".gitignore"].exists
    },
    policy: {
      blocker: ["broken build", "template fingerprint mismatch", "Worker syntax failure", "route mismatch", "critical accessibility issue"],
      warning: ["advisory bundle growth", "Lighthouse during development", "visual rhythm drift", "non-critical unused CSS"],
      info: ["asset size trend", "file count", "build duration"]
    }
  };
}

function buildPrototypeNotes(files) {
  const dashboard = files["dashboard.html"].text;
  return {
    decision: "dashboard.html remains an experimental GG Blogger Studio prototype; GG Console ships separately under apps/console.",
    extractedConcepts: [
      { id: "BloggerApiClient", present: /BloggerApiClient/.test(dashboard) },
      { id: "OAuth flow", present: /OAuth|googleOAuthClientId|accounts\.google\.com/.test(dashboard) },
      { id: "config placeholders", present: /%%GG_/.test(dashboard) },
      { id: "gate validation ideas", present: /gate|validation|validate/i.test(dashboard) },
      { id: "editor/compiler ideas", present: /Compiler|TipTap|editor/i.test(dashboard) }
    ]
  };
}

function collectSnapshot() {
  const files = Object.fromEntries(WORKSPACE_ALLOWLIST.map((relPath) => [relPath, readAllowed(relPath)]));
  const profile = buildProfile(files);
  return {
    generatedAt: new Date().toISOString(),
    readonly: true,
    sourceMode: "local-files-whitelist",
    profile,
    surfaces: buildSurfaces(files, profile),
    routes: buildRoutes(files),
    navigation: buildNavigation(files),
    copy: buildCopy(files),
    a11y: buildA11y(files),
    ci: buildCi(files),
    prototype: buildPrototypeNotes(files),
    files: WORKSPACE_ALLOWLIST.map((relPath) => ({
      relPath,
      status: fileStatus(files, relPath),
      bytes: files[relPath] ? files[relPath].bytes : 0
    }))
  };
}

function runCheck() {
  const requiredConsoleFiles = ["index.html", "app.js", "styles.css", "server.mjs"];
  const failures = [];

  for (const file of requiredConsoleFiles) {
    const path = join(CONSOLE_DIR, file);
    if (!existsSync(path)) failures.push(`missing Console file: apps/console/${file}`);
    else if (!statSync(path).isFile()) failures.push(`Console path is not a file: apps/console/${file}`);
  }

  const snapshot = collectSnapshot();
  if (!snapshot.readonly) failures.push("snapshot must be readonly");
  if (!snapshot.profile.siteName) failures.push("profile site name missing");
  if (!snapshot.surfaces.length) failures.push("surface list missing");
  if (!snapshot.navigation.dockItems.length) failures.push("navigation dock items missing");
  if (!snapshot.copy.files.length) failures.push("copy file status missing");
  if (!snapshot.ci.commandChecklist.every((item) => item.status === "wired")) {
    failures.push("required build/CI package scripts are not all wired");
  }
  if (!scriptExists(parseJsonFile(readAllowed("package.json").text) || {}, "gg:console")) {
    failures.push("package.json missing gg:console script");
  }
  if (!scriptExists(parseJsonFile(readAllowed("package.json").text) || {}, "gg:console:check")) {
    failures.push("package.json missing gg:console:check script");
  }

  if (failures.length) {
    console.error("GG CONSOLE CHECK CONTRACT_FAILURE");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("GG CONSOLE CHECK PASS");
  console.log(`surfaces=${snapshot.surfaces.length}`);
  console.log(`dockItems=${snapshot.navigation.dockItems.length}`);
  console.log(`copyKeys.en=${snapshot.copy.locales.en}`);
  console.log(`copyKeys.id=${snapshot.copy.locales.id}`);
}

function contentType(file) {
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  }[extname(file)] || "text/plain; charset=utf-8";
}

function startServer() {
  const host = process.env.GG_CONSOLE_HOST || DEFAULT_HOST;
  const port = Number(process.env.GG_CONSOLE_PORT || DEFAULT_PORT);
  const server = createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ ok: true, readonly: true }));
      return;
    }

    if (url.pathname === "/api/snapshot") {
      try {
        const body = JSON.stringify(collectSnapshot());
        res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(body);
      } catch (error) {
        res.writeHead(500, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
      return;
    }

    const file = STATIC_ROUTES.get(url.pathname);
    if (!file) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    try {
      res.writeHead(200, {
        "content-type": contentType(file),
        "cache-control": "no-store",
        "x-gg-console-readonly": "true"
      });
      res.end(readConsoleFile(file));
    } catch {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Console asset unavailable");
    }
  });

  server.listen(port, host, () => {
    console.log(`GG Console read-only dashboard: http://${host}:${port}`);
  });
}

if (process.argv.includes("--check")) {
  runCheck();
} else {
  startServer();
}
