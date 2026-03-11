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
    const originalFetch = window.fetch;
    window.__ggFetchLog = [];
    window.fetch = async function patchedFetch(input, init) {
      const url = String(typeof input === "string" ? input : (input && input.url) || "");
      const started = Date.now();
      try {
        const res = await originalFetch.call(this, input, init);
        let probe = null;
        if (/\/20\d{2}\/\d{2}\/[^/?#]+\.html\?m=1/i.test(url)) {
          try {
            const txt = await res.clone().text();
            const hCount = (txt.match(/<h[1-4]\b/gi) || []).length;
            const hasRoot = /class=['"][^'"]*\bpost-body\b[^'"]*\bentry-content\b/i.test(txt);
            const hasNonEmptyContrib = /\bdata-contributors\s*=\s*(['"])\s*[^'"]+\1/i.test(txt);
            const hasNonEmptyTags = /\bdata-tags\s*=\s*(['"])\s*[^'"]+\1/i.test(txt);
            const hasNonEmptySnippet = /\bdata-snippet\s*=\s*(['"])\s*[^'"]+\1/i.test(txt);
            const doc = new DOMParser().parseFromString(txt, "text/html");
            const pmNodes = Array.from(doc.querySelectorAll(".gg-postmeta,[data-gg-postmeta]")).slice(0, 6).map((el) => ({
              contrib: (el.getAttribute("data-contributors") || el.getAttribute("data-gg-contributors") || "").trim(),
              tags: (el.getAttribute("data-tags") || el.getAttribute("data-gg-tags") || "").trim(),
              snippet: (el.getAttribute("data-snippet") || el.getAttribute("data-gg-snippet") || "").trim(),
              updated: (el.getAttribute("data-updated") || el.getAttribute("data-gg-updated") || "").trim()
            }));
            probe = { hCount, hasRoot, hasNonEmptyContrib, hasNonEmptyTags, hasNonEmptySnippet, pmNodes };
          } catch (_) {}
        }
        window.__ggFetchLog.push({ url, ok: !!res.ok, status: res.status, ms: Date.now() - started, probe });
        return res;
      } catch (error) {
        window.__ggFetchLog.push({ url, ok: false, error: String(error), ms: Date.now() - started });
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
