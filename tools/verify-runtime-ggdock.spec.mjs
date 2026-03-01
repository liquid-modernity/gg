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

test('runtime smoke: gg-dock boot + home-blog navigation', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const dock = page.locator('nav.gg-dock[data-gg-module="dock"], nav.gg-dock');
  await expect(dock.first()).toBeVisible({ timeout: 15000 });

  const before = await readRuntimeFingerprint(page);
  if (before.mismatch) {
    throw new Error(
      [
        'Template mismatch active on live HTML; runtime enhancements are intentionally disabled.',
        formatRuntimeFingerprint(before),
      ].join('\n')
    );
  }

  // Boot lazily loads main.js on landing surfaces after user interaction.
  await page.mouse.click(20, 20);

  try {
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
  } catch (err) {
    const afterBoot = await readRuntimeFingerprint(page);
    throw new Error(
      [
        err && err.message ? err.message : 'GG runtime boot check failed',
        `Diagnostic: ${formatRuntimeFingerprint(afterBoot)}`,
      ].join('\n')
    );
  }

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
