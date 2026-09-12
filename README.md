> **Public mirror for dry-run.** `npm install && npm run dev` → http://localhost:3000

# Flint Living Wiki v0

Turn Slack into living wikis. A prototype demonstrating decision-first documentation from Slack conversations.

> **Visual Design**: UI styled after Hex.tech's dark storytelling notebooks — near-black canvas, elevated charcoal panels, soft violet accent glows, and Inter + IBM Plex Mono typography.

## What This Is

Flint takes messages from a Slack channel and creates a living wiki page with three sections:
1. **The call** - the decision or current status
2. **Why it mattered** - the reasoning and context
3. **What no longer belongs** - superseded approaches

The page stays truthful: when source messages are edited or deleted, the page shows "shouldn't stand" markers. Human edits can be pinned to survive re-projection.

## Architecture

- **Backend** (`/backend`): TypeScript/Express API server with in-memory data store
- **Frontend** (`/frontend`): Next.js app with mobile-first responsive design
- **Fixtures**: Seeded Slack channel data (`#flint-v0-fixture`) with ACL-restricted messages

## Setup & Run

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install all dependencies
npm install

# Start both backend and frontend
npm run dev
```

The backend runs on `http://localhost:3001` and the frontend on `http://localhost:3000`.

### Separate Commands

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Demo Path

### 1. View the Default Page
- Open `http://localhost:3000`
- See the episode "Pricing for launch" with three sections
- Note: NO empty "Sources" section (sources live on dig walk-backs)

### 2. ACL Redaction Demo
- Observe the third claim in "Why it mattered" shows: `[Source exists — no access]` with a red badge
- This is an ACL-restricted claim - the full text does NOT appear on the page
- Check the "Viewer has finance access" checkbox
- The claim now shows actual financial details
- **Key point**: Without access, the stub appears ON THE PAGE (not hidden, not showing full text)

### 3. Walk-back to Sources (Dig)
- Click "Dig → walk-back" on any claim
- See the source Slack message in a modal
- Edit history is shown if the message was edited
- Sources are NOT a fourth empty section - they appear on-demand

### 4. Shouldn't-stand Markers
- Click "Dig → walk-back" on the second claim ("CAC analysis...")
- Click "Edit Message" and change the text to something different
- Click "Save Edit"
- The claim now shows a yellow "Shouldn't stand" badge and yellow-tinted background
- This marks that the backing source has changed

### 5. Delete Source Message
- Dig into any claim's source
- Click "Demo: Delete Message"
- The claim gets marked "Shouldn't stand"
- Dig again → see "[This message was deleted]"

### 6. Pin to Survive Re-projection
- Click "Pin" on a claim that has "Shouldn't stand"
- The yellow warning badge is replaced with purple "Pinned" badge
- Click "Re-project episode" in demo controls
- The pinned claim keeps its text (human edit survives)
- Unpinned claims would be re-reasoned (not implemented in v0, but pins persist)

### 7. Mobile Experience
- Resize browser to ~375px width or view on phone
- All tap targets are 44px minimum
- Modal appears as bottom sheet on mobile
- Touch interactions work without hover

## v0 Named Holes & Limitations

### What's Working
✅ One Slack channel corpus (`#flint-v0-fixture`)  
✅ Three content sections (no empty Sources section)  
✅ ACL redaction: stub + badge ON the default page  
✅ Walk-backs on dig (source messages in modal)  
✅ Shouldn't-stand when source edited/deleted  
✅ Pin mechanism survives re-project  
✅ Mobile-friendly (375px+, 44px tap targets)  
✅ Demo controls for edit/delete simulation  

### Known v0 Holes
❌ **No detection of NEW contradicting messages** - only edit/delete triggers shouldn't-stand  
❌ **No real re-reasoning on re-project** - just re-marks shouldn't-stand flags  
❌ **No Graphiti integration** - using simple in-memory Episode/Claim store  
❌ **No real Slack integration** - fixture data only  
❌ **Single hardcoded episode** - no multi-topic or dynamic creation  
❌ **No authentication** - ACL access is just a checkbox  
❌ **No persistence** - data resets on server restart  

## Tech Stack

- **Backend**: TypeScript, Express, Node.js
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **State**: In-memory data store (no database)
- **Styling**: CSS with mobile-first responsive design

## File Structure

```
/backend
  /src
    server.ts       - Express API server
    types.ts        - TypeScript interfaces
    fixtures.ts     - Seeded data and DataStore class
  package.json
  tsconfig.json

/frontend
  /app
    layout.tsx      - Next.js root layout
    page.tsx        - Main episode page component
  /lib
    api.ts          - API client functions
    types.ts        - TypeScript interfaces
  /styles
    globals.css     - Mobile-first CSS
  package.json
  tsconfig.json

package.json        - Root workspace config
```

## Design Principles

1. **Decision-first, not sausage** - The page shows the decision and why, not the conversation process
2. **Sources on dig** - Walk-backs appear on demand, not as an empty fourth section
3. **Never silent changes** - Edit/delete of sources → visible shouldn't-stand marker
4. **Explicit human control** - Pin to keep, explicit accept/clear
5. **ACL-aware from the start** - Restricted content shows stub ON the page, never full text
6. **Mobile-first** - Phone-usable (375px+) with proper tap targets

## API Endpoints

- `GET /api/episodes/:id?hasFinanceAccess=true/false` - Fetch episode with ACL filtering
- `GET /api/messages/:id?hasFinanceAccess=true/false` - Fetch source message
- `POST /api/episodes/:episodeId/claims/:claimId/pin` - Toggle pin on claim
- `POST /api/episodes/:id/reproject` - Re-project episode (re-check shouldn't-stand)
- `POST /api/demo/control` - Simulate Slack message edit/delete

## Success Criteria Met

✅ Runnable locally (backend + frontend)  
✅ Default page shows decision not sausage  
✅ NO empty Sources section  
✅ ACL claim: stub + badge on default page (not full text)  
✅ Dig → walk-back to fixture message OR redaction stub  
✅ Edit/delete backing message → visible change mark  
✅ Pin survives re-project  
✅ Mobile-usable (375px+, 44px tap targets)  

## License

MIT
