import { test, expect } from '@playwright/test';

const BASE_URL = process.env.GG_RUNTIME_BASE_URL || 'https://www.pakrpp.com/';

test.setTimeout(60000);

async function dockSearchOpen(page) {
  return page.evaluate(() => {
    const dock = document.querySelector('nav.gg-dock[data-gg-module="dock"], nav.gg-dock');
    if (!dock) return null;
    return dock.classList.contains('search');
  });
}

test('runtime smoke: gg-dock boot + search toggle', async ({ page }) => {
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

  const searchOpenBtn = page.locator('nav.gg-dock [data-gg-action="search"]').first();
  await expect(searchOpenBtn).toBeVisible({ timeout: 15000 });

  await searchOpenBtn.click({ timeout: 10000, force: true });

  await expect
    .poll(async () => dockSearchOpen(page), {
      timeout: 15000,
      message: 'Dock search state did not open after gg-dock search click'
    })
    .toBe(true);

  const searchCloseBtn = page.locator('nav.gg-dock [data-gg-action="search-exit"]').first();
  await expect(searchCloseBtn).toBeVisible({ timeout: 10000 });
  await searchCloseBtn.click({ timeout: 10000, force: true });

  await expect
    .poll(async () => dockSearchOpen(page), {
      timeout: 10000,
      message: 'Dock search state did not close after search-exit click'
    })
    .toBe(false);
});
