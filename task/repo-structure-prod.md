repo/
├─ .github/
│  └─ workflows/
│     ├─ validate.yml
│     └─ deploy.yml
│
├─ apps/
│  ├─ console/
│  │  ├─ index.html
│  │  ├─ app.js
│  │  ├─ server.mjs
│  │  ├─ styles.css
│  │  ├─ modules/
│  │  │  ├─ overview/
│  │  │  ├─ setup/
│  │  │  ├─ cms/
│  │  │  ├─ surfaces/
│  │  │  ├─ registry/
│  │  │  ├─ copy/
│  │  │  ├─ store/
│  │  │  ├─ build/
│  │  │  ├─ deploy/
│  │  │  └─ checks/
│  │  └─ lib/
│  │     ├─ blogger-oauth.mjs
│  │     ├─ blogger-client.mjs
│  │     ├─ config-writer.mjs
│  │     └─ source-inspector.mjs
│  │
│  └─ studio/
│     ├─ index.html
│     ├─ app.js
│     ├─ styles.css
│     ├─ server.mjs
│     └─ modules/
│        ├─ posts/
│        ├─ pages/
│        ├─ products/
│        ├─ editor/
│        ├─ inspector/
│        ├─ preview/
│        ├─ media/
│        └─ publish/
│
├─ config/
│  ├─ profile.json
│  ├─ flags.json
│  ├─ routes.json
│  ├─ surfaces.json
│  ├─ deploy.json
│  └─ schemas/
│     ├─ profile.schema.json
│     ├─ flags.schema.json
│     ├─ routes.schema.json
│     ├─ surfaces.schema.json
│     └─ deploy.schema.json
│
├─ content/
│  ├─ copy/
│  │  ├─ en.json
│  │  └─ id.json
│  ├─ articles/
│  │  └─ .gitkeep
│  ├─ products/
│  │  └─ .gitkeep
│  └─ samples/
│     ├─ article.sample.json
│     ├─ page.sample.json
│     └─ product.sample.json
│
├─ registry/
│  ├─ profile.registry.json
│  ├─ surface.registry.json
│  ├─ route.registry.json
│  ├─ store.registry.json
│  ├─ content.registry.json
│  ├─ component.registry.json
│  └─ feature.registry.json
│
├─ src/
│  ├─ core/
│  │  ├─ config/
│  │  ├─ content/
│  │  ├─ routes/
│  │  ├─ schema/
│  │  └─ utils/
│  │
│  ├─ adapters/
│  │  ├─ cms/
│  │  │  ├─ blogger.adapter.mjs
│  │  │  └─ static-json.adapter.mjs
│  │  └─ deploy/
│  │     ├─ cloudflare.adapter.mjs
│  │     └─ static-host.adapter.mjs
│  │
│  ├─ components/
│  │  ├─ dock/
│  │  ├─ sheet/
│  │  ├─ listing-table/
│  │  ├─ contact-form/
│  │  ├─ more-menu/
│  │  ├─ outline-peek/
│  │  ├─ pagination-peek/
│  │  ├─ related-posts/
│  │  └─ save-article/
│  │
│  ├─ layouts/
│  │  ├─ root.layout.mjs
│  │  ├─ article.layout.mjs
│  │  ├─ page.layout.mjs
│  │  ├─ landing.layout.mjs
│  │  └─ store.layout.mjs
│  │
│  ├─ surfaces/
│  │  ├─ root/
│  │  ├─ article/
│  │  ├─ page/
│  │  ├─ landing/
│  │  └─ store/
│  │
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ base.css
│  │  ├─ components.css
│  │  ├─ surfaces.css
│  │  └─ utilities.css
│  │
│  └─ worker/
│     └─ worker.js
│
├─ templates/
│  ├─ blogger/
│  │  ├─ root.template.xml
│  │  └─ store-source.template.xml
│  └─ static/
│     ├─ landing.template.html
│     └─ store.template.html
│
├─ public/
│  ├─ icons/
│  ├─ manifest.webmanifest
│  ├─ robots.txt
│  ├─ ads.txt
│  ├─ llms.txt
│  ├─ offline.html
│  ├─ sw.js
│  └─ _headers
│
├─ scripts/
│  ├─ build.mjs
│  ├─ preview.mjs
│  ├─ deploy.mjs
│  ├─ doctor.mjs
│  ├─ clean.mjs
│  └─ pack.mjs
│
├─ checks/
│  ├─ config.check.mjs
│  ├─ registry.check.mjs
│  ├─ a11y.check.mjs
│  ├─ routes.check.mjs
│  └─ build-output.check.mjs
│
├─ docs/
│  ├─ getting-started.md
│  ├─ customization.md
│  ├─ architecture.md
│  ├─ deployment.md
│  ├─ design-system.md
│  ├─ blogger-setup.md
│  ├─ yellow-cart.md
│  └─ maintenance.md
│
├─ examples/
│  ├─ pakrpp.profile.example.json
│  ├─ personal-brand.profile.example.json
│  ├─ static-articles.example.json
│  └─ static-products.example.json
│
├─ dist/
│
├─ package.json
├─ package-lock.json
├─ wrangler.jsonc
├─ README.md
├─ CHANGELOG.md
├─ LICENSE.md
├─ .env.example
├─ .gitignore
└─ .editorconfig