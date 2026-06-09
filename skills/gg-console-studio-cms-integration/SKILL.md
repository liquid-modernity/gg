---
name: gg-console-studio-cms-integration
description: Use when building or revising GG Console, GG Studio, Blogger API integration, root/store CMS setup, OAuth, source inspection, config writing, or editorial tooling.
---

# GG Console / Studio CMS Integration Skill

Use this skill for GG Console, GG Studio, and Blogger API integration work.

## Prime Directive

Keep Console and Studio separate.

- GG Console is a Cloudflare-like control plane.
- GG Studio is an editorial workspace.

Do not ship an editor-first dashboard as the final Console.

## GG Console Responsibilities

Console manages:

- project overview;
- setup wizard;
- profile config;
- domain/canonical config;
- root CMS config;
- store CMS config;
- source boundary validation;
- surfaces;
- routes;
- registry inspection;
- copy registry status;
- Yellow Cart config;
- build/doctor/preview;
- deploy readiness;
- checks status.

Console UI pattern:

- left sidebar;
- topbar;
- status cards;
- resource tables;
- forms;
- right drawer/details;
- logs/check panels.

## GG Studio Responsibilities

Studio manages:

- posts;
- pages;
- products;
- drafts;
- editor;
- right inspector;
- media;
- preview;
- publish;
- editorial gate.

Studio UI pattern:

- editor canvas;
- topbar save/publish;
- right metadata inspector;
- preview/publish checklist.

## Blogger API Integration Scope

Use Blogger API integration progressively.

### Phase 1: Read-only CMS setup

- OAuth local setup;
- list user blogs;
- select Root CMS blog;
- select Store CMS blog;
- read `blogId`, name, URL, posts/pages counts;
- write `config/profile.json` or equivalent config source;
- validate source boundary;
- no write to Blogger.

### Phase 2: Source inspector

- latest root posts;
- latest store posts;
- label/product source inspection;
- canonical conflict warnings;
- source boundary warnings.

### Phase 3: Safe write mode

- create product/article/page draft;
- update draft;
- publish only after explicit confirmation;
- backup before patch;
- dry-run mode;
- local audit log.

## Security Rules

- Store tokens only in local ignored storage such as `.gg-local/`.
- Do not write OAuth tokens into `config/`, `registry/`, `content/`, `public/`, or git-tracked files.
- Do not place secrets in frontend code.
- Browser API keys must be restricted and treated as public identifiers, not secrets.

## Config Shape

Root and store CMS must be separate:

```json
{
  "cms": {
    "root": {
      "provider": "blogger",
      "blogId": "",
      "sourceHost": "pakrpp.blogspot.com",
      "publicHost": "www.pakrpp.com"
    },
    "store": {
      "provider": "blogger",
      "blogId": "",
      "sourceHost": "pakrppstore.blogspot.com",
      "sourceCustomHost": "store.pakrpp.com",
      "publicCanonicalBase": "https://www.pakrpp.com/store/"
    }
  }
}
```

## Prototype Handling

If a file like `dashboard.html` exists:

- treat it as GG Studio prototype/reference;
- extract API/client/compiler/gate ideas;
- do not ship its UI as final GG Console;
- split code into modules before productizing.

## Validation

Run current CI checks plus any new deterministic console/studio checks.

At minimum:

```bash
git diff --check
npm run ci:qa
```

For future product repo:

```bash
npm run doctor
npm run build
```
