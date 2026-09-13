# Pass A demo

## Run or static-deploy

```bash
npm install
npm run build --workspace=frontend
npx surge dist flint-wiki-prototype.surge.sh
```

The export in `dist` is self-contained and does not need the prototype API. For local review, run `npx serve dist` after the build.

## Two-minute review path

1. **Stories** opens first with ready, updating, and building states. Open **Allocation checkup** to read the continuous brief.
2. Use the bottom shell navigation to open **Connect**. Only Slack and Google Docs are present.
3. Open **New** and use the literal `~/wiki $` prompt. Its single command contains both `@channel` and `@doc`/`@document`, followed by the one thing the story should keep true. Press Enter, review the sharpened spine, and confirm it. Building remains one quiet status line.
4. In the brief, open an `E1`/`E2` **Sources** footnote and switch between Used, Skipped, and Unknown.
5. Submit “Ask or share an idea about this page…” to create a new episode. A calm updating line appears first; then the episode is visibly added to the story. The tiny underlined **! Source changed 2h ago** marker demonstrates a changed backing source.
6. In collapsed demo controls, remove finance access. Because a required source becomes inaccessible, the brief is replaced by a full-page **Access denied** state; use the small demo restore action to return.

There is no connector marketplace, chat wall, section-block summary, or visible build-process log. Demo state is in-memory and resets on refresh.
