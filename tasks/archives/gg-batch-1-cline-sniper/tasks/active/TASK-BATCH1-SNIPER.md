# TASK-BATCH1-SNIPER

## Objective
Make GG vNext Batch 1 green with the smallest possible set of edits.

## Success Criteria
These commands must pass:

```bash
npm run doctor
npm run build
npm run check
npm run console:check
npm run studio:check
npm run deploy:dry
```

## Scope
Batch 1 only:

1. Registry/config softcode contract
2. Module source contract
3. Dev/prod bundle output contract
4. Cloudflare cache policy contract
5. Minimal guard green

## Do Not Do

- Do not build full Console UI.
- Do not build full Studio editor.
- Do not add Tailwind/shadcn/Tiptap.
- Do not implement real Blogger publishing.
- Do not implement real production deploy.
- Do not split all legacy JS.
- Do not edit generated output as source.

## Work Style

- Inspect narrowly.
- Fix one failure category at a time.
- Re-run the smallest related check.
- Stop after acceptance commands pass.
