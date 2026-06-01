import { test, expect, chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const fileUrl = (file) => pathToFileURL(`${root}/${file}`).href;

async function newMobilePage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  return { browser, context, page };
}

async function touchAction(page, selector) {
  return page.locator(selector).first().evaluate((node) => getComputedStyle(node).touchAction);
}

async function expectBodyScrollable(page, selector) {
  await expect.poll(() => touchAction(page, selector)).not.toBe("none");
}

async function touchDrag(page, selector, deltaY) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible" });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`missing drag box for ${selector}`);
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + Math.min(box.height - 4, Math.max(4, box.height / 2)));
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: y + deltaY / 2, id: 1, radiusX: 4, radiusY: 4, force: 1 }],
  });
  await page.waitForTimeout(40);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: y + deltaY, id: 1, radiusX: 4, radiusY: 4, force: 1 }],
  });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(280);
}

async function openAndTouchClose(page, openSelector, sheetSelector, dragSelector, deltaY) {
  await page.locator(openSelector).first().click({ force: true });
  await page.waitForSelector(`${sheetSelector}[data-gg-state="open"]`);
  await touchDrag(page, dragSelector, deltaY);
  await page.waitForFunction((selector) => {
    const sheet = document.querySelector(selector);
    return sheet && (sheet.hidden || sheet.getAttribute("data-gg-state") === "closed" || sheet.getAttribute("aria-hidden") === "true");
  }, sheetSelector);
}

test("mobile touch drag closes landing and store sheets without disabling body scroll", async () => {
  const landing = await newMobilePage();
  await landing.page.goto(fileUrl("landing.html"), { waitUntil: "domcontentloaded" });
  await expect.poll(() => touchAction(landing.page, "#gg-command-panel [data-gg-sheet-drag-zone='head']")).toBe("none");
  await expect.poll(() => touchAction(landing.page, "#gg-command-panel [data-gg-sheet-drag-zone='handle']")).toBe("none");
  await expectBodyScrollable(landing.page, "#gg-command-panel .gg-sheet__panel");
  await openAndTouchClose(
    landing.page,
    "[data-gg-nav='search']",
    "#gg-command-panel",
    "#gg-command-panel [data-gg-sheet-drag-zone='head']",
    180,
  );
  await openAndTouchClose(
    landing.page,
    "[data-gg-nav='more']",
    "#gg-more-panel",
    "#gg-more-panel [data-gg-sheet-drag-zone='handle']",
    180,
  );
  await landing.browser.close();

  const store = await newMobilePage();
  await store.page.goto(fileUrl("store.html"), { waitUntil: "domcontentloaded" });
  await expect.poll(() => touchAction(store.page, "#store-discovery-sheet [data-gg-sheet-drag-zone='head']")).toBe("none");
  await expect.poll(() => touchAction(store.page, "#store-preview-sheet [data-gg-sheet-drag-zone='footer']")).toBe("none");
  await expectBodyScrollable(store.page, "#store-discovery-sheet .gg-sheet__panel");
  await expectBodyScrollable(store.page, "#store-preview-sheet .store-preview__body");
  await openAndTouchClose(
    store.page,
    "[data-store-dock='search']",
    "#store-discovery-sheet",
    "#store-discovery-sheet [data-gg-sheet-drag-zone='head']",
    180,
  );
  await store.page.locator("[data-store-open-preview]").first().click({ force: true });
  await store.page.waitForSelector("#store-preview-sheet[data-gg-state='open']");
  await touchDrag(store.page, "#store-preview-sheet [data-gg-sheet-drag-zone='footer']", -180);
  await store.page.waitForFunction(() => {
    const sheet = document.querySelector("#store-preview-sheet");
    return sheet && (sheet.hidden || sheet.getAttribute("data-gg-state") === "closed" || sheet.getAttribute("aria-hidden") === "true");
  });
  await store.browser.close();
});
