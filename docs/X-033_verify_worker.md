# X-033 Verify Worker (Proof Header)

## Quick manual check (browser)
1) Open an incognito window.
2) Visit each URL with `?x=1` to force a fresh 200 response:
   - https://www.pakrpp.com/assets/dev/main.css?x=1
   - https://www.pakrpp.com/assets/dev/main.js?x=1
   - https://www.pakrpp.com/sw.js?x=1

## Expected headers
- `X-GG-Worker: assets`
- `Cache-Control: no-store, max-age=0` (for `/assets/dev/*`)

## If missing, likely causes
- Worker routes not attached to the correct worker.
- Route patterns are wrong.
- Apex vs www mismatch.

## Human steps
- Add apex -> www 301 redirect in Cloudflare Redirect Rules.
- Ensure Worker routes exist for the `www` host.
