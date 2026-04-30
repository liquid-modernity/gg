TASK: Fix Store deployment verification order. Do not change the final Store UI contract.

Problem:
`npm run gaga:verify-worker` fails because `qa/live-smoke-worker.sh` checks live production `https://www.pakrpp.com/store`, while the updated Store HTML has not been deployed yet.

Local source and `.cloudflare-build/public/store.html` already pass the final Store selector contract. The failure is expected if live smoke runs before deployment.

Do NOT restore Blog to the /store dock.
Do NOT weaken the final Store contract.
Do NOT revert Discover/Saved/More.

Final /store dock remains:
- Store
- Contact
- Discover
- Saved
- More

Blog/Home remain inside More sheet.

Required changes:

1. Split smoke lanes clearly

Create or update scripts so there are two separate verification modes:

A. Artifact/build smoke:
- checks local source or `.cloudflare-build/public/store.html`
- runs before deploy
- validates final Store selectors in the built artifact

B. Live worker smoke:
- checks `https://www.pakrpp.com/store`
- runs only after deploy
- validates what is actually deployed

Do not use live production smoke as a pre-deploy gate for newly changed HTML.

2. Add a build-artifact Store smoke script

Suggested file:
qa/store-artifact-smoke.sh

It should check `.cloudflare-build/public/store.html` if present, otherwise `store.html`.

Checks:
- canonical is https://www.pakrpp.com/store
- H1 is Yellow Cart
- no `.store-topbar`
- no `.store-card__quick`
- no visible `.store-preview__close`
- no `store-read-article`
- dock Store exists with data-store-dock="store" and href="/store"
- dock Contact exists with data-store-dock="contact" and href="/store#contact"
- dock Discover exists with data-store-dock="discover"
- dock Saved exists with data-store-dock="saved"
- dock More exists with data-store-dock="more"
- More sheet has data-store-more-link="blog" href="/"
- More sheet has data-store-more-link="home" href="/landing"
- Discovery sheet exists
- Saved sheet exists
- preview footer handle exists
- marketplace links use target="_blank"
- marketplace rel includes sponsored nofollow noopener noreferrer
- card media uses aspect-ratio 4 / 5
- Store feed uses /feeds/posts/default/-/Store

3. Keep live smoke, but run it after deploy

`qa/live-smoke-worker.sh` should remain a live production verification script.

But CI/deploy workflow must not run it before the new Worker/assets are deployed.

If the current pipeline is:
- build
- gaga:verify-worker
- deploy

Change to:
- build
- artifact smoke
- deploy
- live smoke

4. Add explicit script names in package.json

Suggested:
- "gaga:verify-store-artifact": "bash qa/store-artifact-smoke.sh"
- "gaga:verify-worker-live": "bash qa/live-smoke-worker.sh"

Then either:
- make `gaga:verify-worker` call artifact smoke only before deploy,
or
- rename it so nobody mistakes live smoke for pre-deploy verification.

Preferred:
- `gaga:verify-worker` should not hit production unless explicitly named live.
- live script should be named `gaga:verify-worker-live`.

5. Add deploy freshness check

After deploy, live smoke should first print:
- x-gg-release or template fingerprint if present
- first 200 chars around `data-store-dock`
- whether live `/store` contains `data-store-dock="saved"`

This makes stale-live failures obvious.

6. Optional cache purge if deploy succeeds but live remains stale

If after successful deploy live `/store` still serves old HTML:
- purge Cloudflare cache for:
  - https://www.pakrpp.com/store
  - https://www.pakrpp.com/store.html
  - https://www.pakrpp.com/yellowcart
  - https://www.pakrpp.com/yellowcart.html
  - https://www.pakrpp.com/yellowcard
  - https://www.pakrpp.com/yellowcard.html
- confirm Worker serves `/store.html` asset for `/store`
- confirm `assets.run_worker_first = true`
- confirm `.cloudflare-build/public/store.html` is the artifact actually deployed

7. Commands to run locally

Run:
node tools/preflight.mjs
bash -n qa/live-smoke-worker.sh
bash qa/store-artifact-smoke.sh
npm run build

Do not run live smoke as a blocker before deploy.

After deploy, run:
npm run gaga:verify-worker-live

Acceptance:
- Pre-deploy verification passes against built Store artifact.
- Deployment is not blocked because production has not yet updated.
- Post-deploy live smoke passes after the new Worker/assets are live.
- Final Store contract remains Store / Contact / Discover / Saved / More.
- Blog/Home remain inside More.