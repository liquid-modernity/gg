# GG Console

GG Console is the local read-only control plane for this workspace. It is not GG Studio and it is not a CMS editor.

## Current MVP

Run from the repository root:

```bash
npm run gg:console
```

Default URL:

```txt
http://127.0.0.1:8789
```

Validate wiring without starting a long-running server:

```bash
npm run gg:console:check
```

## Scope

The MVP inspects local repo state and displays:

- active profile values derived from current legacy files;
- root CMS config;
- Store CMS config;
- public surfaces and route truth;
- dock, More sheet, listing filter, and contact contracts;
- copy registry files, namespaces, and locale key parity;
- static a11y counters;
- build/check command wiring;
- GitHub Actions readiness;
- archive/dotfile packaging guidance status.

The Console does not write files, edit config, publish Blogger content, deploy Cloudflare, or run arbitrary shell commands from the browser.

Public Blogger surfaces remain separate from Console implementation. `index.xml`, `landing.html`, `store.html`, generated Blogger template output, and public runtime assets must keep using the Gaga Design System, `gg-*` hooks, vanilla JavaScript, and project-owned CSS. Do not introduce shadcn/ui, React, Vue, Tailwind, Bootstrap, Radix, or other third-party UI frameworks into public Blogger surfaces.

## Prototype Boundary

`dashboard.html` remains an experimental GG Blogger Studio prototype. It is not the final GG Console UI.

Useful concepts from that prototype may be reused later in GG Studio or future setup phases:

- `BloggerApiClient`;
- Google OAuth flow;
- local config placeholders;
- gate validation ideas;
- editor/compiler ideas.

Those concepts are intentionally not productized in the read-only Console MVP. A full editor-first UI belongs to GG Studio, not GG Console.

## Safety Model

`apps/console/server.mjs` binds to `127.0.0.1` by default and serves only:

- `/`;
- `/index.html`;
- `/app.js`;
- `/styles.css`;
- `/api/snapshot`;
- `/health`.

The snapshot endpoint reads a fixed allowlist of repo files. It has no path query parameter, no command runner, no auth token storage, and no write path.

The allowlist includes source/config/docs needed for Console inspection, plus `dashboard.html` only so the Console can report prototype-boundary concepts. The prototype is read as input; its UI is not served as Console.

## Files

```txt
apps/console/server.mjs
apps/console/index.html
apps/console/app.js
apps/console/styles.css
```

## CI Relationship

`gg:console:check` is a focused local verifier for Console wiring. It is read-only and should fail if:

- required Console files are missing;
- required package scripts are not wired;
- the snapshot cannot be collected;
- required build/CI scripts are not present.

Existing GitHub Actions remain the deployment authority:

```bash
npm ci
npm run ci:cloudflare
```

Deploy remains:

```bash
npm ci
npm run ci:cloudflare
npm run deploy:cloudflare:prepared
npm run gaga:verify-worker-live:strict
```

Cloudflare secrets are required only for the deploy step, not for local Console inspection.
