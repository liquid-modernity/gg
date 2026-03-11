const { firefox } = require("playwright");

const waitMs = Number.parseInt(process.env.GG_EPANEL_WAIT_MS || "6500", 10) || 6500;
const targetUrl = String(process.env.GG_EPANEL_URL || "https://www.pakrpp.com/blog").trim();
const screenshotPath = String(
  process.env.GG_EPANEL_SCREENSHOT || "test-results/live-blog-epanel-before.png"
).trim();

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function run() {
  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1900 } });

  try {
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(waitMs);

    const data = await page.evaluate(async () => {
      const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
      const panel = document.querySelector(".gg-info-panel .gg-editorial-preview");
      const pickRow = (name) => {
        const row = panel ? panel.querySelector(`[data-row="${name}"]`) : null;
        if (!row) return null;
        return { hidden: !!row.hidden, text: clean(row.textContent) };
      };

      const rows = {
        title: pickRow("title"),
        author: pickRow("author"),
        contributors: pickRow("contributors"),
        labels: pickRow("labels"),
        tags: pickRow("tags"),
        date: pickRow("date"),
        updated: pickRow("updated"),
        comments: pickRow("comments"),
        readtime: pickRow("readtime"),
        snippet: pickRow("snippet"),
        toc: pickRow("toc"),
      };

      const href = panel ? panel.querySelector('[data-s="title"]')?.getAttribute("href") || "" : "";
      const cards = Array.from(document.querySelectorAll(".gg-post-card"));
      const card = href
        ? cards.find((node) => {
            const nodeHref = node.querySelector(".gg-post-card__title-link")?.getAttribute("href") || "";
            return nodeHref === href;
          })
        : null;

      const cardAttrs = card
        ? {
            href,
            dataContrib:
              card.getAttribute("data-contributors") || card.getAttribute("data-gg-contributors") || "",
            dataTags: card.getAttribute("data-tags") || card.getAttribute("data-gg-tags") || "",
            dataSnippet: card.getAttribute("data-snippet") || card.getAttribute("data-gg-snippet") || "",
            dataTocJson: card.getAttribute("data-gg-toc-json") || "",
            labels: Array.from(
              card.querySelectorAll('.gg-post-card__label a[rel="tag"], .gg-post-card__labels a[rel="tag"]')
            ).map((tag) => clean(tag.textContent)),
          }
        : null;

      const contributorsChips = panel ? panel.querySelectorAll('[data-gg-slot="contributors"] .gg-chip').length : -1;
      const tagsChips = panel ? panel.querySelectorAll('[data-gg-slot="tags"] .gg-chip').length : -1;
      const labelsChips = panel ? panel.querySelectorAll('[data-gg-slot="labels"] .gg-chip').length : -1;
      const tocLinks = panel ? panel.querySelectorAll('[data-gg-slot="toc"] a.gg-info-panel__toclink').length : -1;
      const tocHint = panel ? clean(panel.querySelector('[data-gg-slot="toc-hint"]')?.textContent || "") : "";

      let postProbe = null;
      if (href) {
        try {
          const abs = new URL(href, location.href).toString();
          const fetchUrl = abs + (abs.includes("?") ? "&" : "?") + "m=1";
          const response = await fetch(fetchUrl, { cache: "no-store" });
          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, "text/html");
          const root = doc.querySelector(
            ".post-body.entry-content, .post-body.post-body-container, .post-body, .entry-content, .post-outer .post-body, .gg-post__content.post-body.entry-content, .gg-post__content"
          );
          const headings = root
            ? Array.from(root.querySelectorAll("h1,h2,h3,h4"))
                .map((h) => ({ tag: h.tagName, id: h.id || "", text: clean(h.textContent) }))
                .filter((h) => h.text)
            : [];
          const postMeta = doc.querySelector(".gg-postmeta,[data-gg-postmeta]");
          postProbe = {
            abs,
            headingsCount: headings.length,
            headingsSample: headings.slice(0, 5),
            postmeta: postMeta
              ? {
                  contributors:
                    postMeta.getAttribute("data-contributors") ||
                    postMeta.getAttribute("data-gg-contributors") ||
                    "",
                  tags: postMeta.getAttribute("data-tags") || postMeta.getAttribute("data-gg-tags") || "",
                  snippet:
                    postMeta.getAttribute("data-snippet") || postMeta.getAttribute("data-gg-snippet") || "",
                  updated:
                    postMeta.getAttribute("data-updated") || postMeta.getAttribute("data-gg-updated") || "",
                  read:
                    postMeta.getAttribute("data-read-min") ||
                    postMeta.getAttribute("data-readtime") ||
                    postMeta.getAttribute("data-gg-read-min") ||
                    postMeta.getAttribute("data-gg-readtime") ||
                    "",
                }
              : null,
          };
        } catch (error) {
          postProbe = { error: String(error) };
        }
      }

      return {
        pageUrl: location.href,
        panelExists: !!panel,
        rows,
        contributorsChips,
        tagsChips,
        labelsChips,
        tocLinks,
        tocHint,
        cardAttrs,
        postProbe,
      };
    });

    await page.screenshot({ path: screenshotPath, fullPage: true });
    // Print machine-readable report for root-cause analysis.
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  process.stderr.write(`LIVE_EPANEL_PROBE_FAIL: ${error && error.message ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
