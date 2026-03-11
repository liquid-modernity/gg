const { chromium, firefox } = require("playwright");

const browserMode = String(process.env.GG_EPANEL_BROWSER || "chrome")
  .trim()
  .toLowerCase();

async function run() {
  let browser;
  if (browserMode === "firefox") {
    browser = await firefox.launch({ headless: true });
  } else if (browserMode === "chrome") {
    browser = await chromium.launch({ channel: "chrome", headless: true });
  } else {
    browser = await chromium.launch({ headless: true });
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1700 } });

  await page.addInitScript(() => {
    const mapSet = Map.prototype.set;
    const mapGet = Map.prototype.get;
    const mapDelete = Map.prototype.delete;
    window.__ggMapLog = [];
    const keyHit = (key) => String(key || "").includes("/2026/02/todo.html");
    const pushMapLog = (entry) => {
      const log = window.__ggMapLog || (window.__ggMapLog = []);
      if (log.length > 200) log.shift();
      log.push(Object.assign({ t: Date.now() }, entry || {}));
    };
    Map.prototype.set = function patchedSet(key, value) {
      if (keyHit(key)) {
        pushMapLog({
          op: "set",
          key: String(key),
          hasMeta: !!value,
          metaTags: value && value.t && value.t.length ? value.t.length : 0,
          metaContrib: value && value.c && value.c.length ? value.c.length : 0,
          metaAuthor: value && value.a ? String(value.a) : "",
        });
      }
      return mapSet.call(this, key, value);
    };
    Map.prototype.get = function patchedGet(key) {
      const out = mapGet.call(this, key);
      if (keyHit(key)) {
        pushMapLog({
          op: "get",
          key: String(key),
          hit: !!out,
          metaTags: out && out.t && out.t.length ? out.t.length : 0,
          metaContrib: out && out.c && out.c.length ? out.c.length : 0,
          metaAuthor: out && out.a ? String(out.a) : "",
        });
      }
      return out;
    };
    Map.prototype.delete = function patchedDelete(key) {
      if (keyHit(key)) {
        pushMapLog({ op: "delete", key: String(key) });
      }
      return mapDelete.call(this, key);
    };

    const originalFetch = window.fetch;
    window.__ggFetchLog = [];
    window.fetch = async function patchedFetch(input, init) {
      const url = String(typeof input === "string" ? input : (input && input.url) || "");
      const started = Date.now();
      const stack =
        /\/20\d{2}\/\d{2}\/[^/?#]+\.html\?m=1/i.test(url) && Error && Error.prototype
          ? String(new Error("gg-fetch").stack || "")
              .split("\n")
              .slice(1, 7)
              .map((line) => line.trim())
              .join(" | ")
          : "";
      try {
        const res = await originalFetch.call(this, input, init);
        let probe = null;
        const panelRoot = document.querySelector(".gg-info-panel");
        const main = document.querySelector("main.gg-main");
        const panelKeyNow = panelRoot ? String(panelRoot.__gK || "") : "";
        const infoPanelStateNow = main ? String(main.getAttribute("data-gg-info-panel") || "") : "";
        if (/\/20\d{2}\/\d{2}\/[^/?#]+\.html\?m=1/i.test(url)) {
          try {
            const txt = await res.clone().text();
            const hCount = (txt.match(/<h[1-4]\b/gi) || []).length;
            const hasRoot = /class=['"][^'"]*\bpost-body\b[^'"]*\bentry-content\b/i.test(txt);
            const hasNonEmptyContrib = /\bdata-contributors\s*=\s*(['"])\s*[^'"]+\1/i.test(txt);
            const hasNonEmptyTags = /\bdata-tags\s*=\s*(['"])\s*[^'"]+\1/i.test(txt);
            const hasNonEmptySnippet = /\bdata-snippet\s*=\s*(['"])\s*[^'"]+\1/i.test(txt);
            const doc = new DOMParser().parseFromString(txt, "text/html");
            const root = doc.querySelector(
              ".post-body.entry-content, .post-body.post-body-container, .post-body, .entry-content, .post-outer .post-body, .gg-post__content.post-body.entry-content, .gg-post__content"
            );
            const rootHeadings = root
              ? Array.from(root.querySelectorAll("h1,h2,h3,h4"))
                  .map((h) => String(h.textContent || "").replace(/\s+/g, " ").trim())
                  .filter(Boolean)
              : [];
            const rootHeadingsFiltered = root
              ? Array.from(root.querySelectorAll("h1,h2,h3,h4"))
                  .filter(
                    (node) =>
                      !(
                        node &&
                        node.closest &&
                        node.closest('pre,code,[hidden],[aria-hidden="true"]')
                      )
                  )
                  .map((h) => String(h.textContent || "").replace(/\s+/g, " ").trim())
                  .filter(Boolean)
              : [];
            const headingIdEncodeErrors = [];
            if (root) {
              Array.from(root.querySelectorAll("h1,h2,h3,h4")).forEach((node, idx) => {
                if (!node || (node.closest && node.closest('pre,code,[hidden],[aria-hidden="true"]'))) return;
                const id = String(node.getAttribute("id") || "");
                if (!id) return;
                try {
                  encodeURIComponent(id);
                } catch (error) {
                  headingIdEncodeErrors.push({
                    idx,
                    id,
                    message: String(error && error.message ? error.message : error),
                  });
                }
              });
            }
            const pmNodes = Array.from(doc.querySelectorAll(".gg-postmeta,[data-gg-postmeta]")).slice(0, 6).map((el) => ({
              contrib: (el.getAttribute("data-contributors") || el.getAttribute("data-gg-contributors") || "").trim(),
              tags: (el.getAttribute("data-tags") || el.getAttribute("data-gg-tags") || "").trim(),
              snippet: (el.getAttribute("data-snippet") || el.getAttribute("data-gg-snippet") || "").trim(),
              updated: (el.getAttribute("data-updated") || el.getAttribute("data-gg-updated") || "").trim()
            }));
            const svc =
              window.GG &&
              window.GG.services &&
              window.GG.services.postmeta &&
              typeof window.GG.services.postmeta.getFromContext === "function"
                ? window.GG.services.postmeta
                : null;
            const pm = svc ? svc.getFromContext(doc) : null;
            const moduleLike = (() => {
              const clean = (raw) => String(raw || "").replace(/\s+/g, " ").trim();
              const readMinLabel = (raw) => {
                const txt = clean(raw);
                const m = txt.match(/(\d+)/);
                if (!m) return "";
                const mins = Math.max(1, parseInt(m[1], 10) || 1);
                return `${mins} min read`;
              };
              const calcReadTime = (rootNode) => {
                if (!rootNode) return "";
                const clone = rootNode.cloneNode(true);
                const drop = clone.querySelectorAll("nav,footer");
                for (let i = 0; i < drop.length; i += 1) drop[i].remove();
                const text = clean(clone.textContent || "");
                if (!text) return "";
                return `${Math.max(1, Math.ceil(text.split(/\s+/).length / 200))} min read`;
              };
              const tagSlug = (raw) =>
                clean(raw)
                  .toLowerCase()
                  .replace(/^#/, "")
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]+/g, "")
                  .replace(/^-+|-+$/g, "");
              const tagHref = (key) => (key ? `/p/tags.html?tag=${encodeURIComponent(key)}` : "#");
              const tagFallback = (raw) => {
                const x = raw && typeof raw === "object" ? raw : {};
                const key = tagSlug(x.key || x.text || raw);
                const text = clean(x.text || x.name || raw) || key;
                return { key, text, href: tagHref(key) };
              };
              const normalizePostUrl = (raw) => {
                try {
                  const u = new URL(String(raw || ""), location.href);
                  const m = clean(u.searchParams.get("m") || "");
                  if (m === "0" || m === "1") u.searchParams.delete("m");
                  u.hash = "";
                  return u.toString();
                } catch (_) {
                  return "";
                }
              };
              try {
                const out = [];
                const rootNode = doc.querySelector(
                  ".post-body.entry-content, .post-body.post-body-container, .post-body, .entry-content, .post-outer .post-body, .gg-post__content.post-body.entry-content, .gg-post__content"
                );
                const pmeta = svc ? svc.getFromContext(doc) : {};
                const author = clean((pmeta && pmeta.author) || "");
                const contributors = Array.isArray(pmeta && pmeta.contributors) ? pmeta.contributors : [];
                const tags = (Array.isArray(pmeta && pmeta.tags) ? pmeta.tags : [])
                  .map(tagFallback)
                  .filter((x) => x && x.text);
                const updated = clean((pmeta && pmeta.updated) || "");
                let readTime = readMinLabel((pmeta && pmeta.readMin) || "");
                if (!readTime) readTime = calcReadTime(rootNode);
                const snippet = clean((pmeta && pmeta.snippet) || "");
                out._m = { t: tags, a: author, c: contributors, u: updated, r: readTime, s: snippet };
                if (!rootNode) return { count: 0, first: "", meta: out._m, error: "" };
                const headings = rootNode.querySelectorAll("h1,h2,h3,h4");
                const max = Math.min(headings.length, 12);
                const baseHref = normalizePostUrl(url.replace(/\?m=1(\b|&|$)/, "")) || "#";
                for (let i = 0; i < max; i += 1) {
                  const node = headings[i];
                  if (
                    !node ||
                    (node.closest && node.closest('pre,code,[hidden],[aria-hidden="true"]'))
                  ) {
                    continue;
                  }
                  let level = parseInt(String(node.tagName || "").slice(1), 10) || 1;
                  if (level > 4) level = 4;
                  const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
                  if (!text) continue;
                  const headingId = String(node.getAttribute("id") || "").trim();
                  let href = baseHref;
                  if (headingId) href += `#${encodeURIComponent(headingId)}`;
                  out.push({ text, level, href });
                }
                return { count: out.length, first: out[0] ? out[0].text : "", meta: out._m, error: "" };
              } catch (error) {
                return {
                  count: -1,
                  first: "",
                  meta: null,
                  error: String(error && error.message ? error.message : error),
                };
              }
            })();
            probe = {
              hCount,
              hasRoot,
              hasNonEmptyContrib,
              hasNonEmptyTags,
              hasNonEmptySnippet,
              rootHeadingsCount: rootHeadings.length,
              rootHeadingsSample: rootHeadings.slice(0, 6),
              rootHeadingsFilteredCount: rootHeadingsFiltered.length,
              rootHeadingsFilteredSample: rootHeadingsFiltered.slice(0, 6),
              headingIdEncodeErrors,
              pm,
              moduleLike,
              pmNodes
            };
          } catch (_) {}
        }
        window.__ggFetchLog.push({
          url,
          ok: !!res.ok,
          status: res.status,
          ms: Date.now() - started,
          probe,
          stack,
          panelKeyNow,
          infoPanelStateNow
        });
        return res;
      } catch (error) {
        const panelRoot = document.querySelector(".gg-info-panel");
        const main = document.querySelector("main.gg-main");
        const panelKeyNow = panelRoot ? String(panelRoot.__gK || "") : "";
        const infoPanelStateNow = main ? String(main.getAttribute("data-gg-info-panel") || "") : "";
        window.__ggFetchLog.push({
          url,
          ok: false,
          error: String(error),
          ms: Date.now() - started,
          stack,
          panelKeyNow,
          infoPanelStateNow
        });
        throw error;
      }
    };
  });

  await page.goto("https://www.pakrpp.com/blog", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page
    .waitForFunction(() => window.__GG_LISTING_LOADED === true, { timeout: 30000 })
    .catch(() => null);
  await page.waitForSelector('.gg-post-card [data-gg-action="info"]', { timeout: 20000 });
  await page.click('.gg-post-card [data-gg-action="info"]', { timeout: 10000, force: true });
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    const panel = document.querySelector(".gg-info-panel .gg-editorial-preview");
    if (!panel) return;
    const snapshot = () => {
      const q = (sel) => panel.querySelector(sel);
      return {
        t: Date.now(),
        contributorsChips: panel.querySelectorAll('[data-gg-slot="contributors"] .gg-chip').length,
        tagsChips: panel.querySelectorAll('[data-gg-slot="tags"] .gg-chip').length,
        tocLinks: panel.querySelectorAll('[data-gg-slot="toc"] a.gg-info-panel__toclink').length,
        tocHint: String(q('[data-gg-slot="toc-hint"]')?.textContent || "").trim(),
        contributorsHidden: !!q('[data-row="contributors"]')?.hidden,
        tagsHidden: !!q('[data-row="tags"]')?.hidden,
      };
    };
    window.__ggPanelMut = [snapshot()];
    if (window.__ggPanelObs) {
      try {
        window.__ggPanelObs.disconnect();
      } catch (_) {}
    }
    const obs = new MutationObserver(() => {
      const log = window.__ggPanelMut || (window.__ggPanelMut = []);
      if (log.length > 200) log.shift();
      log.push(snapshot());
    });
    obs.observe(panel, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
      attributeFilter: ["hidden", "href", "class"],
    });
    window.__ggPanelObs = obs;
  });
  await page.waitForTimeout(25000);

  const out = await page.evaluate(() => {
    const panel = document.querySelector(".gg-info-panel .gg-editorial-preview");
    const panelRoot = document.querySelector(".gg-info-panel");
    const main = document.querySelector("main.gg-main");
    const snippetNode = panel ? panel.querySelector('[data-s="snippet"]') : null;
    const snippetRow = panel ? panel.querySelector('[data-row="snippet"]') : null;
    return {
      fetchLog: (window.__ggFetchLog || []).slice(-20),
      panelHidden: panelRoot ? !!panelRoot.hidden : null,
      mainInfoPanelState: main ? String(main.getAttribute("data-gg-info-panel") || "") : "",
      panelKey: panelRoot ? String(panelRoot.__gK || "") : "",
      panelTitleHref: panel ? panel.querySelector('[data-s="title"]')?.getAttribute("href") || "" : "",
      tocLinks: panel ? panel.querySelectorAll('[data-gg-slot="toc"] a.gg-info-panel__toclink').length : -1,
      tocHint: panel ? String(panel.querySelector('[data-gg-slot="toc-hint"]')?.textContent || "").trim() : "",
      tagsChips: panel ? panel.querySelectorAll('[data-gg-slot="tags"] .gg-chip').length : -1,
      contributorsChips: panel ? panel.querySelectorAll('[data-gg-slot="contributors"] .gg-chip').length : -1,
      snippetText: snippetNode ? String(snippetNode.textContent || "").trim() : "",
      snippetHidden: snippetRow ? !!snippetRow.hidden : null,
      panelMutations: Array.isArray(window.__ggPanelMut) ? window.__ggPanelMut.slice(-25) : [],
      mapLog: Array.isArray(window.__ggMapLog) ? window.__ggMapLog.slice(-40) : [],
    };
  });

  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  await page.screenshot({ path: "test-results/live-blog-epanel-debug.png", fullPage: true });
  await browser.close();
}

run().catch((error) => {
  process.stderr.write(`DEBUG_FETCH_PROBE_FAIL: ${error && error.message ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
