import { test, expect } from '@playwright/test';

const BASE_URL = process.env.GG_RUNTIME_BASE_URL || 'https://www.pakrpp.com/';

test.setTimeout(60000);

async function isBlogSurface(page) {
  return page.evaluate(() => {
    const url = window.location.pathname || '';
    if (/^\/blog(?:\/)?$/i.test(url)) return true;
    const main =
      document.querySelector('main.gg-main[data-gg-surface],main.gg-main,#gg-main');
    const bodySurface = String(document.body?.getAttribute('data-gg-surface') || '').toLowerCase();
    const mainSurface = String(main?.getAttribute('data-gg-surface') || '').toLowerCase();
    return bodySurface === 'listing' || mainSurface === 'listing';
  });
}

test('runtime smoke: gg-dock boot + home-blog navigation', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const dock = page.locator('nav.gg-dock[data-gg-module="dock"], nav.gg-dock');
  await expect(dock.first()).toBeVisible({ timeout: 15000 });

  // Boot lazily loads main.js on landing surfaces after user interaction.
  await page.mouse.click(20, 20);

  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const hasGG = typeof window.GG === 'object' && !!window.GG;
          const boot = Number((document.documentElement?.dataset?.ggBoot || '0').trim() || '0');
          return hasGG || boot >= 2;
        }),
      { timeout: 20000, message: 'GG runtime did not boot (window.GG missing and ggBoot stage < 2)' }
    )
    .toBeTruthy();

  const blogBtn = page.locator('nav.gg-dock [data-gg-action="home-blog"]').first();
  await expect(blogBtn).toBeVisible({ timeout: 15000 });
  await blogBtn.click({ timeout: 10000, force: true });

  await expect
    .poll(async () => isBlogSurface(page), {
      timeout: 20000,
      message: 'Dock home-blog action did not navigate/flip to blog surface'
    })
    .toBe(true);
});
