import { test, expect } from '@playwright/test';

const BASE_URL = process.env.GG_RUNTIME_BASE_URL || 'https://www.pakrpp.com/';

test.setTimeout(60000);

async function isMorePanelVisible(page) {
  return page.evaluate(() => {
    const panel = document.getElementById('gg-dock-more');
    if (!panel) return false;
    const state = String(panel.getAttribute('data-gg-state') || '').toLowerCase();
    const isTarget = window.location.hash === '#gg-dock-more';
    const css = window.getComputedStyle(panel);
    const visible = css.display !== 'none' && css.visibility !== 'hidden';
    return visible && (isTarget || state.indexOf('open') !== -1);
  });
}

async function isSearchVisible(page) {
  return page.evaluate(() => {
    const path = String(window.location.pathname || '').toLowerCase();
    if (/^\/search(?:\/)?$/i.test(path)) return true;
    const dock = document.querySelector('nav.gg-dock[data-gg-module="dock"],nav.gg-dock');
    const dockState = String(dock?.getAttribute('data-gg-state') || '').toLowerCase();
    if (dockState.indexOf('search') !== -1) return true;
    if (document.documentElement?.classList?.contains('gg-search-focus')) return true;
    const input = dock?.querySelector('[data-gg-dock-search-input],input[type="search"]');
    if (input) {
      const cs = window.getComputedStyle(input);
      if (cs.display !== 'none' && cs.visibility !== 'hidden') return true;
    }
    const dialog = document.querySelector(
      '#gg-search[open],#gg-search-dialog[open],#gg-search-modal[open],[data-gg-search-modal]:not([hidden])'
    );
    return !!dialog;
  });
}

async function verifyDockContract(page) {
  const actions = ['home', 'blog', 'search', 'contact', 'more'];
  const primary = page.locator('nav.gg-dock a.gg-dock__item[data-gg-primary="1"]');
  await expect(primary).toHaveCount(5, { timeout: 15000 });

  const payload = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('nav.gg-dock a.gg-dock__item[data-gg-primary="1"]'))
      .map((el) => ({
        action: el.getAttribute('data-gg-action') || '',
        href: el.getAttribute('href') || '',
      }));
  });
  const seen = payload.map((item) => item.action);
  expect(seen.slice().sort()).toEqual(actions.slice().sort());
  for (const item of payload) {
    expect(String(item.href || '').trim().length).toBeGreaterThan(0);
  }
}

async function readRuntimeFingerprint(page) {
  const dom = await page.evaluate(() => {
    const relMeta =
      document.querySelector('meta[name="gg-release"]')?.getAttribute('content') || '';
    const fp = document.querySelector('#gg-fingerprint');
    const relFp = fp ? (fp.getAttribute('data-release') || '') : '';
    const mismatch = !!document.querySelector('#gg-template-mismatch');
    const bootScripts = Array.from(document.querySelectorAll('script[src]'))
      .map((el) => el.getAttribute('src') || '')
      .filter((src) => /\/boot\.js(?:[?#]|$)/i.test(src));
    const bootStage = Number((document.documentElement?.dataset?.ggBoot || '0').trim() || '0');
    const hasGG = typeof window.GG === 'object' && !!window.GG;
    return { relMeta, relFp, mismatch, bootScripts, bootStage, hasGG };
  });

  let workerVersion = '';
  try {
    const pingUrl = new URL(`/__gg_worker_ping?x=${Date.now()}`, page.url()).toString();
    const ping = await page.request.get(pingUrl, { timeout: 10000 });
    workerVersion = ping.headers()['x-gg-worker-version'] || '';
  } catch (_) {}

  return { ...dom, workerVersion };
}

function formatRuntimeFingerprint(fp) {
  const boots = Array.isArray(fp.bootScripts) && fp.bootScripts.length ? fp.bootScripts.join(', ') : '-';
  return [
    `worker=${fp.workerVersion || '-'}`,
    `meta.release=${fp.relMeta || '-'}`,
    `fingerprint.release=${fp.relFp || '-'}`,
    `mismatch=${fp.mismatch ? '1' : '0'}`,
    `bootStage=${String(fp.bootStage || 0)}`,
    `hasGG=${fp.hasGG ? '1' : '0'}`,
    `bootScripts=${boots}`,
  ].join(' ');
}

test('runtime smoke: gg-dock fail-open more + search', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const dock = page.locator('nav.gg-dock[data-gg-module="dock"], nav.gg-dock');
  await expect(dock.first()).toBeVisible({ timeout: 15000 });
  await verifyDockContract(page);

  const before = await readRuntimeFingerprint(page);
  if (before.mismatch) {
    throw new Error(
      [
        'Template mismatch active on live HTML; runtime enhancements are intentionally disabled.',
        formatRuntimeFingerprint(before),
      ].join('\n')
    );
  }

  const moreBtn = page.locator('nav.gg-dock a[data-gg-action="more"]').first();
  await expect(moreBtn).toBeVisible({ timeout: 15000 });
  await moreBtn.click({ timeout: 10000, force: true });
  await expect
    .poll(async () => isMorePanelVisible(page), {
      timeout: 20000,
      message: 'Dock more action did not open visible panel (:target or JS state)'
    })
    .toBe(true);

  const closeMore = page.locator('#gg-dock-more [data-gg-action="more-close"]').first();
  if (await closeMore.isVisible().catch(() => false)) {
    await closeMore.click({ timeout: 10000, force: true });
  }

  const searchBtn = page.locator('nav.gg-dock a[data-gg-action="search"]').first();
  await expect(searchBtn).toBeVisible({ timeout: 15000 });
  await searchBtn.click({ timeout: 10000, force: true });

  await expect
    .poll(async () => isSearchVisible(page), {
      timeout: 20000,
      message: 'Dock search action did not expose search UI/fallback'
    })
    .toBe(true);
});
