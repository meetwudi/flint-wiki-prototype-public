# Flint prototype architecture

## Deployable experience

The primary demo is the statically exported Next.js app in `frontend`. It is a client-side state machine with four screens inside one terminal shell:

1. **Stories** — ready, building, and updating briefs.
2. **Connect** — Slack and Google Docs only.
3. **New story** — one `~/wiki $` command containing `@channel` and `@doc`/`@document` corpus references plus the single story request; this advances to a sharpened spine and one quiet building status.
4. **Brief** — continuous prose, expandable Sources with Used/Skipped/Unknown evidence, and an episode prompt.

The frontend is deliberately self-contained so the review artifact has no service dependency. `npm run build --workspace=frontend` runs `next build` and copies the export to `dist`.

## Living-story behavior

A message submitted through **Ask or share an idea about this page…** becomes a new episode. The interface first exposes one calm `UPDATING STORY` status line, then adds the episode visibly to the prose. There is no chat transcript or internal processing timeline.

Backing-message edits and deletes use the `sourceChanged` claim flag. The UI renders this as the small underlined **Source changed** marker. Used, Skipped, and Unknown describe evidence disposition inside the expandable Sources area.

## Access control

The static fixture has a finance-access switch in collapsed demo controls. When a required source is unavailable, the Brief component is not mounted; an Access denied screen replaces it. This prevents partial prose from leaking the shape or contents of restricted evidence.

## Reference API

The Express app in `backend` remains a reference implementation for episodes, source messages, source changes, pins, and reprojection. It is not called by the static demo. Its in-memory store resets on restart and does not represent production authentication or persistence.

## Static deployment

```bash
npm run build --workspace=frontend
npx surge dist flint-wiki-prototype.surge.sh
```
