const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.setDefaultTimeout(45000);
  await page.goto('https://www.pakrpp.com/2025/10/tes-2.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const commentsBtn = page.locator('[data-gg-action="comments"], [data-gg-panel-target="comments"], [href="#comments"]');
  if (await commentsBtn.count()) {
    await commentsBtn.first().click({ force: true }).catch(()=>{});
  }
  await page.waitForTimeout(2500);
  const report = await page.evaluate(() => {
    const root = document.querySelector('#ggPanelComments #comments') || document.querySelector('#comments');
    const out = { root: !!root, comments: 0, withRepliesContainer: 0, nestedLiDepthGt1: 0, nativeThreadToggle: 0, nativeThreadCount: 0, nativeItemControl: 0, commentDelete: 0, sample: [] };
    if (!root) return out;
    const list = Array.from(root.querySelectorAll('#cmt2-holder li.comment'));
    out.comments = list.length;
    out.withRepliesContainer = list.filter(li => !!li.querySelector(':scope > .comment-replies')).length;
    out.nestedLiDepthGt1 = list.filter(li => !!li.parentElement && !!li.parentElement.closest('li.comment')).length;
    out.nativeThreadToggle = root.querySelectorAll('.thread-toggle').length;
    out.nativeThreadCount = root.querySelectorAll('.thread-count').length;
    out.nativeItemControl = root.querySelectorAll('.item-control').length;
    out.commentDelete = root.querySelectorAll('a.comment-delete,.comment-delete,.cmt2-del').length;
    out.sample = list.slice(0,8).map(li => {
      const id = li.id || li.getAttribute('data-gg-comment-id') || '';
      const actions = li.querySelector('.comment-actions');
      const nativeT = li.querySelector('.thread-toggle');
      const nativeC = li.querySelector('.thread-count');
      const repl = li.querySelector(':scope > .comment-replies');
      const nested = li.parentElement && li.parentElement.closest('li.comment') ? true : false;
      return {
        id,
        hasRepliesContainer: !!repl,
        nested,
        nativeToggleText: nativeT ? nativeT.textContent.replace(/\s+/g,' ').trim() : '',
        nativeCountText: nativeC ? nativeC.textContent.replace(/\s+/g,' ').trim() : '',
        itemControlText: (li.querySelector('.item-control')?.textContent || '').replace(/\s+/g,' ').trim().slice(0,180),
        actionsText: (actions?.textContent || '').replace(/\s+/g,' ').trim().slice(0,220),
        hasEnhancedToggle: !!li.querySelector('.cmt2-thread-toggle'),
        hasMoreBtn: !!li.querySelector('.cmt2-ctx-btn')
      };
    });
    return out;
  });
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
