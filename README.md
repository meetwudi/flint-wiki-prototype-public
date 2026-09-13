# Flint living-wiki — Pass A

Turn Slack into living wikis. This repository contains a phone-first static demo of Flint's four-screen terminal flow.

## Review locally

```bash
npm install
npm run build --workspace=frontend
npx serve dist
```

The Next.js frontend uses a static export, so `dist` can be hosted without the API. To publish the requested build from an authenticated environment:

```bash
npx surge dist flint-wiki-prototype.surge.sh
```

See [DEMO.md](DEMO.md) for the short review path.

## Pass A behavior

- Stories lists ready, building, and updating briefs; Connect contains only Slack and Google Docs.
- New story is a literal `~/wiki $` command line: one line must carry both `@channel` and `@doc`/`@document` corpus mentions plus the one-thing spine, then Flint sharpens it for confirmation.
- The brief is continuous prose in a dark terminal-style wiki with green status accents and blue evidence boxes.
- Compact `E1`/`E2` source footnotes reveal Used, Skipped, and Unknown evidence without exposing the build process.
- If any required source is inaccessible, Flint replaces the entire brief with an Access denied state instead of rendering a partial story.
- Editing or deleting a backing message adds a subtle **Source changed** marker to every dependent passage.
- Sources appear only on demand; there is no empty Sources section.
- Demo controls stay collapsed at the bottom of the page.
- A compact “Ask or share an idea about this page…” prompt treats each submission as a new episode, shows a calm updating cue, and visibly adds it to the story.

The Express backend remains as a reference prototype and uses the same source-change state terminology, but it is not required by the static demo.
