# TASK-002E — Console Config Editor Minimal UI

## Goal

Create a minimal Console UI for editing whitelisted config JSON via the existing TASK-002D Console Config API.

## Scope

Build a tiny vanilla HTML/CSS/JS operational editor in `apps/console`.

It must support:
- config list
- config load
- JSON textarea edit
- local JSON validation
- save via whitelisted `PUT /api/config/:key`
- visible status/errors
- clear secret handling note

## Blogger credential decision

`mainBlog` and `storeBlog` are under the same Google account.
So future Blogger API integration can use one shared OAuth credential set:

```env
GOOGLE_BLOGGER_CLIENT_ID=
GOOGLE_BLOGGER_CLIENT_SECRET=
GOOGLE_BLOGGER_REFRESH_TOKEN=
```

The two Blogger CMS targets are separated by `blogId` in `config/blogger.targets.json`, not by separate OAuth apps.

Do not implement OAuth in this task.

## Do not implement

- Tailwind
- shadcn/ui
- Tiptap
- React/Vite
- Blogger OAuth
- real publish/sync
- production remote write adapter
- legacy JS split

## Acceptance

```bash
npm run doctor
npm run build
npm run check
npm run check:softcode
npm run console:check
npm run studio:check
npm run deploy:dry
bash scripts/task002e-acceptance.sh
```
