RELEASE-GATE-SEO-001

PASS only if:
- robots.txt allows production crawl
- no X-Robots-Tag noindex on public routes
- canonical URL is stable
- sitemap includes /, /landing, /store, categories, product posts
- /store has no placeholder images
- JSON-LD validates on rendered HTML
- title/meta description unique per route
- Lighthouse mobile >= 90 target
- no dev/debug banners visible
- no worker fallback UI appears on healthy Blogger render
- Googlebot and OAI/Search crawler are not blocked in production