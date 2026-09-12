# Flint Living Wiki v0 - Architecture

## Design Philosophy

Flint transforms Slack conversations into **living wiki pages** that stay truthful as their sources change. The design prioritizes:

1. **Decision-first documentation** over conversation transcripts
2. **Explicit visibility** of changes (never silent)
3. **Human control** via pinning (not AI overwriting)
4. **Access control awareness** from the foundation
5. **Mobile-first** interaction

## Core Concepts

### Episode
A topic page (e.g. "Pricing for launch") synthesized from a Slack channel. Contains three sections of claims:
- **The call**: The decision or current status
- **Why it mattered**: Context and reasoning
- **What no longer belongs**: Superseded approaches

Episodes do NOT have an empty "Sources" section. Sources are revealed on-demand via walk-backs.

### Claim
A synthesized statement on the page with provenance to a source Slack message. Claims have:
- `text`: The claim content (may be stub if ACL-restricted)
- `sourceMessageId`: Link to backing Slack message
- `isPinned`: Human edit that survives re-projection
- `shouldntStand`: Flag when backing source was edited/deleted
- `aclRestricted`: Whether source requires elevated access
- `isStub`: Whether text is redacted stub (not full content)

### Walk-back (Dig)
User action to reveal the source message for a claim. Opens a modal showing:
- Full message content (if viewer has access)
- Message metadata (author, timestamp)
- Edit history (if message was edited)
- Delete status (if message was deleted)
- Demo controls (edit/delete simulation)

Walk-backs are the ONLY place sources appear - never as a fourth empty section on the page.

### Shouldn't-stand
Visible yellow marker indicating a claim's backing source has changed:
- Message was edited → claim text may no longer match
- Message was deleted → claim has no backing

Pinned claims do NOT get marked shouldn't-stand. This allows human curation to override automated detection.

### Pin
Human action to preserve a claim's text through re-projection. When pinned:
- Shouldn't-stand flag is cleared
- Text survives future re-projections
- Purple "Pinned" badge appears

Pinning is EXPLICIT (not inferred). Re-projection respects pins.

### ACL Redaction
When a claim is backed by an access-controlled source AND viewer lacks access:
- Claim text is replaced with stub: `[Source exists — no access]`
- Red badge appears: "Source exists — no access"
- Claim slot remains on page (not hidden, not removed)
- Walk-back shows access denied message

**Critical**: The stub appears ON THE PAGE in the same slot as the claim. We NEVER:
- Hide the line entirely (looks like model forgot)
- Show full text then stub on walk-back (launders ACL)
- Show broken link appearance

### Re-projection
Explicit action to re-evaluate shouldn't-stand flags across all claims:
- For unpinned claims: Check if backing source was edited/deleted → mark shouldn't-stand
- For pinned claims: Skip (pins survive)
- Updates `episode.updatedAt` timestamp

v0 does NOT do real re-reasoning (LLM synthesis). It just re-checks flags.

## Data Model

```typescript
SlackMessage {
  id: string
  channelId: string
  userId: string
  userName: string
  text: string
  timestamp: string
  isDeleted: boolean
  editHistory: Array<{text, editedAt}>
  aclRestricted: boolean
}

Claim {
  id: string
  text: string
  sourceMessageId: string
  episodeId: string
  isPinned: boolean
  shouldntStand: boolean
  aclRestricted: boolean
  isStub?: boolean  // frontend only
}

Episode {
  id: string
  channelId: string
  title: string
  claims: {
    theCall: Claim[]
    whyItMattered: Claim[]
    whatNoLongerBelongs: Claim[]
  }
  createdAt: string
  updatedAt: string
}
```

## Component Architecture

### Backend (`/backend`)
Express API server with in-memory DataStore:

- **fixtures.ts**: Seeded Slack messages and episode data
  - `fixtureMessages[]`: 6 messages including one ACL-restricted
  - `fixtureEpisode`: Pre-synthesized "Pricing for launch" topic
  - `DataStore` class: In-memory storage with mutation methods

- **server.ts**: REST API endpoints
  - `GET /api/episodes/:id?hasFinanceAccess=true/false`: Fetch episode with ACL filtering
  - `GET /api/messages/:id?hasFinanceAccess=true/false`: Fetch source message
  - `POST /api/demo/control`: Simulate edit/delete
  - `POST /api/episodes/:id/claims/:claimId/pin`: Toggle pin
  - `POST /api/episodes/:id/reproject`: Re-check shouldn't-stand

### Frontend (`/frontend`)
Next.js 14 (App Router) with mobile-first design:

- **app/page.tsx**: Main episode viewer component
  - Loads episode from API
  - Renders three sections of claims
  - Modal for walk-back (dig)
  - Demo controls (ACL toggle, re-project)
  - Edit/delete simulation UI

- **styles/globals.css**: Mobile-first responsive CSS
  - 375px+ base layout
  - 44px minimum tap targets
  - Touch-friendly active states
  - Bottom-sheet modal on mobile
  - Color-coded states (yellow=shouldn't-stand, purple=pinned, red=ACL)

## State Management

### Backend State
- `messages: Map<string, SlackMessage>`: All Slack messages
- `episodes: Map<string, Episode>`: All episodes
- `currentViewerHasFinanceAccess: boolean`: ACL simulation flag

State is NOT persisted. Restarting server resets to fixtures.

### Frontend State
```typescript
episode: Episode | null              // Current episode
hasFinanceAccess: boolean            // ACL demo toggle
selectedClaim: Claim | null          // Walk-back modal state
sourceMessage: SlackMessage | null   // Fetched source for modal
messageAccessDenied: boolean         // ACL denied flag
editingMessage: string | null        // Edit form state
```

## Demo Controls

v0 includes demo controls for testing without real Slack:

### ACL Toggle
Checkbox: "Viewer has finance access"
- Changes `hasFinanceAccess` query param on API calls
- Re-fetches episode to see ACL filtering

### Message Edit
In walk-back modal:
- "Edit Message" → textarea with current text
- "Save Edit" → POST to `/api/demo/control` with `action: "edit"`
- Backend updates message text, appends to editHistory
- Marks claims with that sourceMessageId as shouldn't-stand

### Message Delete
In walk-back modal:
- "Demo: Delete Message" button (red)
- POST to `/api/demo/control` with `action: "delete"`
- Backend sets `isDeleted: true`
- Marks claims with that sourceMessageId as shouldn't-stand

### Re-project
Button in demo controls:
- POST to `/api/episodes/:id/reproject`
- Backend loops through all claims
- Unpinned claims: check if source edited/deleted → mark shouldn't-stand
- Pinned claims: skip

## Mobile-First Design

### Breakpoint Strategy
- Base: 375px+ (iPhone SE)
- Desktop: 640px+ (larger fonts, spacing)

### Touch Targets
- Minimum 44px height on all interactive elements
- Buttons: `min-height: var(--tap-target)` (44px)
- Checkboxes: 20px × 20px in 44px tall label
- Modal close: 44px tap area

### Responsive Patterns
- **Modal**: Bottom sheet on mobile (<640px), centered on desktop
- **Buttons**: Full-width flex on mobile, inline on desktop
- **Typography**: 16px base (no zoom on iOS), scales up on desktop

### Touch States
- `:active` pseudo-class (not `:hover`) for primary feedback
- `transform: scale(0.98)` on button press
- Background color change on tap
- `touch-action: manipulation` to prevent double-tap zoom

## Known v0 Limitations

### Not Implemented
- **No NEW contradiction detection**: Only edit/delete triggers shouldn't-stand, not new opposing messages
- **No real re-reasoning**: Re-project just re-checks flags, doesn't re-synthesize claims
- **No Graphiti**: Simple in-memory Episode/Claim store, no graph DB
- **No real Slack**: Fixture data only, no Slack API integration
- **Single episode**: Hardcoded `episode_001`, no multi-topic or creation flow
- **No auth**: ACL is just a checkbox, no real user sessions
- **No persistence**: In-memory only, resets on restart

### Intentional v0 Scope Locks
- **One channel only**: `#flint-v0-fixture` corpus
- **Three sections**: No empty Sources section, walk-backs on dig
- **Edit/delete only**: No other shouldn't-stand triggers
- **Pin is explicit**: Not inferred, manual only

## Extension Points (Beyond v0)

To build beyond v0, these would be the next layers:

1. **Real Slack integration**: OAuth, RTM API, message streaming
2. **Graphiti for provenance**: Episode/Claim as graph nodes with source edges
3. **Multi-episode support**: Topic detection, dynamic creation
4. **Real ACL**: Slack workspace permissions, channel membership
5. **LLM re-reasoning**: On re-project, re-synthesize unpinned claims from sources
6. **Contradiction detection**: Compare new messages to existing claims, flag conflicts
7. **Persistence**: PostgreSQL for episodes/claims, Redis for message cache
8. **Search**: Full-text search across episodes, claims, sources
9. **Collaboration**: Multi-user edits, conflict resolution
10. **Analytics**: Track shouldnt-stand frequency, pin patterns, access denials

## Testing the Demo

See DEMO.md for step-by-step demo path.

Quick verification:
```bash
# Start servers
npm run dev

# Test backend API
curl http://localhost:3001/api/episodes/episode_001 | jq .

# Test ACL filtering
curl "http://localhost:3001/api/episodes/episode_001?hasFinanceAccess=false" | \
  jq '.claims.whyItMattered[2]'
# Should show: "[Source exists — no access]"

curl "http://localhost:3001/api/episodes/episode_001?hasFinanceAccess=true" | \
  jq '.claims.whyItMattered[2]'
# Should show: "[Financial details about runway and burn rate]"

# Test shouldn't-stand
curl -X POST http://localhost:3001/api/demo/control \
  -H "Content-Type: application/json" \
  -d '{"messageId": "msg_002", "action": "edit", "newText": "Changed!"}'

curl http://localhost:3001/api/episodes/episode_001 | \
  jq '.claims.whyItMattered[] | select(.sourceMessageId == "msg_002")'
# Should show: shouldntStand: true
```

## Design Principles Enforced

1. ✅ **Decision-first**: Page shows "The call" + "Why it mattered", not conversation flow
2. ✅ **Sources on dig**: Walk-backs in modal, never empty Sources section
3. ✅ **Never silent**: Edit/delete → visible shouldn't-stand marker
4. ✅ **Explicit human control**: Pin button, not inferred
5. ✅ **ACL stub on page**: Restricted claim shows stub in same slot, not hidden
6. ✅ **Mobile-first**: 375px+, 44px taps, touch states

These principles are baked into the architecture, not just UI polish.
