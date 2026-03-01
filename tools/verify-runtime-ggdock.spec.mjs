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

async function ensureBlogMode(page) {
  const toggleVisible = page.locator(
    'nav.gg-dock [data-gg-action="left-toggle"]:visible, nav.gg-dock [data-gg-toggle="left-panel"]:visible'
  );
  if ((await toggleVisible.count()) > 0) return;

  const blogBtn = page.locator('nav.gg-dock [data-gg-action="home-blog"]').first();
  await expect(blogBtn).toBeVisible({ timeout: 10000 });
  await blogBtn.click({ timeout: 10000, force: true });

  await expect
    .poll(
      async () => {
        const url = page.url();
        const onBlogUrl = /\/blog(?:[/?#]|$)/i.test(url);
        const homeState = await page.evaluate(() => {
          const main = document.querySelector('main.gg-main[data-gg-surface],main.gg-main,#gg-main');
          return ((main && main.getAttribute('data-gg-home-state')) || '').toLowerCase();
        });
        const visibleToggleCount = await toggleVisible.count();
        return onBlogUrl || homeState === 'blog' || visibleToggleCount > 0;
      },
      { timeout: 20000, message: 'Failed to transition dock from landing to blog mode' }
    )
    .toBeTruthy();
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

  await ensureBlogMode(page);

  const toggle = page.locator(
    'nav.gg-dock [data-gg-action="left-toggle"]:visible, nav.gg-dock [data-gg-toggle="left-panel"]:visible'
  );
  await expect(toggle.first()).toBeVisible({ timeout: 15000 });

  const before = await leftPanelState(page);
  try {
    await toggle.first().click({ timeout: 10000, force: true });
  } catch (_) {
    await page.evaluate(() => {
      const btn = document.querySelector(
        'nav.gg-dock [data-gg-action="left-toggle"], nav.gg-dock [data-gg-toggle="left-panel"]'
      );
      if (btn) btn.click();
    });
  }

  await expect
    .poll(async () => leftPanelState(page), {
      timeout: 15000,
      message: `Left panel state did not change after gg-dock toggle click (before=${before})`
    })
    .not.toBe(before);

  const after = await leftPanelState(page);
  expect(['open', 'closed']).toContain(after);
});
