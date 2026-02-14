import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const failures = [];

const read = (rel) => {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    failures.push(`${rel} missing`);
    return "";
  }
  return fs.readFileSync(p, "utf8");
};

const parseAttrs = (raw) => {
  const attrs = {};
  if (!raw) return attrs;
  const re = /([a-zA-Z0-9:-]+)\s*=\s*(['"])(.*?)\2/g;
  let match;
  while ((match = re.exec(raw))) {
    attrs[match[1].toLowerCase()] = match[3];
  }
  return attrs;
};

const serializeAttrs = (attrs) => {
  const parts = [];
  for (const [key, value] of Object.entries(attrs)) {
    parts.push(` ${key}="${String(value)}"`);
  }
  return parts.join("");
};

const buildTestHtmlRewriter = () =>
  class HTMLRewriter {
    constructor() {
      this.handlers = [];
    }
    on(selector, handler) {
      this.handlers.push({ selector, handler });
      return this;
    }
    async transform(response) {
      let html = await response.text();
      for (const { selector, handler } of this.handlers) {
        if (!handler) continue;
        if (selector === "script[src]") {
          const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
          html = html.replace(re, (full, attrs) => {
            if (!/\bsrc\s*=/.test(attrs)) return full;
            const attrMap = parseAttrs(attrs);
            let removed = false;
            const el = {
              getAttribute(name) {
                return attrMap[name.toLowerCase()] || null;
              },
              remove() {
                removed = true;
              },
            };
            if (handler.element) handler.element(el);
            return removed ? "" : full;
          });
          continue;
        }
        if (selector === "link[rel]") {
          const re = /<link\b([^>]*)>/gi;
          html = html.replace(re, (full, attrs) => {
            const attrMap = parseAttrs(attrs);
            let removed = false;
            const el = {
              getAttribute(name) {
                return attrMap[name.toLowerCase()] || null;
              },
              remove() {
                removed = true;
              },
            };
            if (handler.element) handler.element(el);
            return removed ? "" : full;
          });
          continue;
        }
        if (selector === "body") {
          const re = /<body([^>]*)>/i;
          const match = html.match(re);
          if (!match) continue;
          const attrMap = parseAttrs(match[1] || "");
          let prependHtml = "";
          const el = {
            getAttribute(name) {
              return attrMap[name.toLowerCase()] || null;
            },
            setAttribute(name, value) {
              attrMap[name.toLowerCase()] = String(value);
            },
            prepend(fragment) {
              prependHtml = String(fragment) + prependHtml;
            },
          };
          if (handler.element) handler.element(el);
          const bodyOpen = `<body${serializeAttrs(attrMap)}>`;
          html = html.replace(re, bodyOpen + prependHtml);
        }
      }
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
  };

const extractAttr = (tag, attr) => {
  if (!tag) return "";
  const re = new RegExp(`${attr}\\s*=\\s*(['"])([^'"]*)\\1`, "i");
  const match = tag.match(re);
  return match ? match[2] : "";
};

const findMetaContent = (xml, name) => {
  const re = new RegExp(`<meta[^>]+name=['"]${name}['"][^>]*>`, "i");
  const match = xml.match(re);
  if (!match) return "";
  return extractAttr(match[0], "content");
};

const findFingerprint = (xml) => {
  const envMeta = findMetaContent(xml, "gg-env");
  const relMeta = findMetaContent(xml, "gg-release");
  const divMatch = xml.match(/<div[^>]+id=['"]gg-fingerprint['"][^>]*>/i);
  const divTag = divMatch ? divMatch[0] : "";
  const envDiv = extractAttr(divTag, "data-env");
  const relDiv = extractAttr(divTag, "data-release");
  return { envMeta, relMeta, envDiv, relDiv };
};

const expect = (cond, msg) => {
  if (!cond) failures.push(msg);
};

const devXml = read("index.dev.xml");
const prodXml = read("index.prod.xml");
const worker = read("src/worker.js");

if (devXml) {
  const fp = findFingerprint(devXml);
  expect(fp.envMeta.toLowerCase() === "dev", "index.dev.xml gg-env meta must be dev");
  expect(fp.envDiv.toLowerCase() === "dev", "index.dev.xml gg-fingerprint data-env must be dev");
  expect(fp.relMeta.toLowerCase() === "dev", "index.dev.xml gg-release meta must be dev");
  expect(fp.relDiv.toLowerCase() === "dev", "index.dev.xml gg-fingerprint data-release must be dev");
}

if (prodXml) {
  const fp = findFingerprint(prodXml);
  const prodRelMatch = prodXml.match(/\/assets\/v\/([^/]+)\//);
  const prodRel = prodRelMatch ? prodRelMatch[1] : "";
  expect(fp.envMeta.toLowerCase() === "prod", "index.prod.xml gg-env meta must be prod");
  expect(fp.envDiv.toLowerCase() === "prod", "index.prod.xml gg-fingerprint data-env must be prod");
  expect(fp.relMeta.length > 0, "index.prod.xml gg-release meta missing/empty");
  expect(fp.relDiv.length > 0, "index.prod.xml gg-fingerprint data-release missing/empty");
  if (prodRel) {
    expect(fp.relMeta === prodRel, "index.prod.xml gg-release meta must match assets release id");
    expect(fp.relDiv === prodRel, "index.prod.xml gg-fingerprint data-release must match assets release id");
  } else {
    failures.push("index.prod.xml assets release id not found");
  }
}

if (worker) {
  expect(worker.includes("x-gg-template-mismatch"), "src/worker.js missing mismatch header handling");
  expect(worker.includes("gg-fingerprint"), "src/worker.js missing gg-fingerprint handling");
  expect(worker.includes("gg-release"), "src/worker.js missing gg-release handling");
}

const runMismatchTest = async () => {
  const originalFetch = globalThis.fetch;
  const originalRewriter = globalThis.HTMLRewriter;
  const testHtml = [
    "<!doctype html>",
    "<html>",
    "<head>",
    "<meta name=\"gg-env\" content=\"prod\">",
    "<meta name=\"gg-release\" content=\"OLD\">",
    "<link rel=\"modulepreload\" href=\"/assets/v/OLD/app.js\">",
    "<script src=\"/assets/v/OLD/boot.js\"></script>",
    "</head>",
    "<body>",
    "<div id=\"gg-fingerprint\" data-env=\"prod\" data-release=\"OLD\"></div>",
    "<main>Test</main>",
    "</body>",
    "</html>",
  ].join("");

  globalThis.fetch = async () =>
    new Response(testHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  globalThis.HTMLRewriter = buildTestHtmlRewriter();

  try {
    const workerUrl = pathToFileURL(path.join(root, "src/worker.js")).href;
    const workerMod = await import(workerUrl);
    const workerImpl = workerMod.default || workerMod;
    const res = await workerImpl.fetch(new Request("https://unit.test/"), {});
    const body = await res.text();
    if (body.includes("/boot.js")) {
      failures.push("mismatch test: boot.js script tag still present");
    }
    const mismatchHeader = res.headers.get("x-gg-template-mismatch") || "";
    if (mismatchHeader !== "1") {
      failures.push("mismatch test: x-gg-template-mismatch header missing");
    }
    const cacheControl = (res.headers.get("cache-control") || "").toLowerCase();
    if (!cacheControl.includes("no-store")) {
      failures.push("mismatch test: Cache-Control missing no-store");
    }
    if (res.status !== 503) {
      failures.push("mismatch test: expected 503 status for mismatch HTML");
    }
  } catch (err) {
    failures.push(`mismatch test: ${err && err.message ? err.message : String(err)}`);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.HTMLRewriter = originalRewriter;
  }
};

await runMismatchTest();

if (failures.length) {
  console.error("VERIFY_TEMPLATE_FINGERPRINT: FAIL");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("VERIFY_TEMPLATE_FINGERPRINT: PASS");
