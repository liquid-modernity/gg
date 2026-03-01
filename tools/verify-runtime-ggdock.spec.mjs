import { test, expect } from '@playwright/test';

const BASE_URL = process.env.GG_RUNTIME_BASE_URL || 'https://www.pakrpp.com/';
test.setTimeout(60000);

async function leftPanelState(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main.gg-main[data-gg-surface],main.gg-main,#gg-main');
    if (!main) return null;
    return (main.getAttribute('data-gg-left-panel') || '').toLowerCase() || null;
  });
}

test('runtime smoke: gg-dock boot + toggle left panel', async ({ page }) => {
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

  const toggle = page.locator(
    'nav.gg-dock [data-gg-action="left-toggle"], nav.gg-dock [data-gg-toggle="left-panel"]'
  );
  await expect(toggle.first()).toBeVisible({ timeout: 15000 });

  const before = await leftPanelState(page);
  await toggle.first().click({ timeout: 10000 });

  await expect
    .poll(async () => leftPanelState(page), {
      timeout: 10000,
      message: `Left panel state did not change after gg-dock toggle click (before=${before})`
    })
    .not.toBe(before);

  const after = await leftPanelState(page);
  expect(['open', 'closed']).toContain(after);
});
