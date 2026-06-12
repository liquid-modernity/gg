# GG vNext repo skill

Use this skill before editing GG vNext.

1. Read `AGENTS.md`.
2. Treat `src/modules/*` as the shared source edit area.
3. Treat `registry/*` and `config/*` as Console-owned softcoded truth.
4. Never edit `dist/*` or `.cloudflare-build/*` as a fix.
5. Run `npm run doctor`, `npm run build`, and `npm run check` before handoff.
6. For Blogger publishing changes, update `config/blogger.targets.json` and Studio code together.
7. For Console changes, preserve local/production adapter boundary.
