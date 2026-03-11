const { chromium } = require("playwright");

async function run() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1700 } });

  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    window.__ggFetchLog = [];
    window.fetch = async function patchedFetch(input, init) {
      const url = String(typeof input === "string" ? input : (input && input.url) || "");
      const started = Date.now();
      try {
        const res = await originalFetch.call(this, input, init);
        window.__ggFetchLog.push({ url, ok: !!res.ok, status: res.status, ms: Date.now() - started });
        return res;
      } catch (error) {
        window.__ggFetchLog.push({ url, ok: false, error: String(error), ms: Date.now() - started });
        throw error;
      }
    };
  });

  await page.goto("https://www.pakrpp.com/blog", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(25000);

  const out = await page.evaluate(() => {
    const panel = document.querySelector(".gg-info-panel .gg-editorial-preview");
    const snippetNode = panel ? panel.querySelector('[data-s="snippet"]') : null;
    const snippetRow = panel ? panel.querySelector('[data-row="snippet"]') : null;
    return {
      fetchLog: (window.__ggFetchLog || []).slice(-20),
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
