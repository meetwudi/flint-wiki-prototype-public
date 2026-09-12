# Flint Living Wiki v0 - Demo Guide

This guide walks through the complete demo path to verify all v0 features work correctly.

## Setup

```bash
# Install dependencies
npm install

# Start both servers
npm run dev
```

- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

## Demo Path

### 1. View the Default Page ✅

**Goal**: See decision-first structure without empty Sources section

**Steps**:
1. Open http://localhost:3000
2. Observe page header: "Pricing for launch"
3. See three sections:
   - **The call**: "Launch pricing set at $49/month..."
   - **Why it mattered**: Three claims with reasoning
   - **What no longer belongs**: Earlier rejected approach

**Success criteria**:
- ✅ Three sections visible
- ✅ NO "Sources" section (sources appear on dig)
- ✅ Claims are synthesized statements, not raw Slack messages

---

### 2. ACL Redaction Demo ✅

**Goal**: Verify restricted claims show stub ON the page, not full text

**Steps**:
1. Look at the third claim in "Why it mattered" section
2. Observe text: `[Financial details about runway and burn rate]`
3. Note red badge: "Source exists — no access"
4. Check "Viewer has finance access" checkbox in demo controls
5. Page reloads with new claim text visible

**Expected behavior**:
- **Without access**: Stub text + red badge in same slot as other claims
- **With access**: Full financial details shown
- Claim is NOT hidden (slot always visible)
- Claim line appears at the same position regardless of access

**Success criteria**:
- ✅ Stub appears ON THE PAGE (not hidden)
- ✅ Red badge visible
- ✅ Toggle checkbox → full text appears
- ✅ Never shows full text then stub on walk-back (no ACL laundering)

---

### 3. Walk-back to Sources (Dig) ✅

**Goal**: Verify on-demand source viewing, not empty fourth section

**Steps**:
1. Click "Dig → walk-back" on any non-restricted claim
2. Modal appears showing:
   - Message author (@Bob)
   - Timestamp
   - Full message text
   - Edit history (if edited)

**Try with restricted claim**:
1. Uncheck "Viewer has finance access"
2. Click "Dig → walk-back" on the ACL-restricted claim
3. Modal shows: "Source exists — no access" with explanation

**Success criteria**:
- ✅ Modal opens on dig
- ✅ Source message shown with metadata
- ✅ ACL-denied modal for restricted sources
- ✅ NO empty "Sources" section on main page

---

### 4. Shouldn't-stand Markers ✅

**Goal**: Verify visible change marks when backing sources change

**Steps**:
1. Click "Dig → walk-back" on the second claim: "CAC analysis required minimum $40..."
2. In the modal, click "Edit Message"
3. Change text to: "Our CAC analysis shows we need at least $45 to break even."
4. Click "Save Edit"
5. Modal closes, page reloads
6. Observe the claim now has:
   - Yellow background tint
   - Yellow "Shouldn't stand" badge

**What happened**:
- Backend edited msg_002's text
- Backend added entry to msg_002's editHistory
- Backend marked all claims with that sourceMessageId=msg_002 as shouldntStand=true
- Frontend shows yellow warning

**Success criteria**:
- ✅ Yellow badge appears
- ✅ Yellow background tint
- ✅ Change is VISIBLE (not silent)
- ✅ Dig again → see edit history in "Edit history (1)" details

---

### 5. Delete Detection ✅

**Goal**: Verify deletion of backing source marks claim

**Steps**:
1. Click "Dig → walk-back" on the claim in "What no longer belongs" section
2. In modal, click "Demo: Delete Message" (red button)
3. Page reloads
4. Claim now has yellow "Shouldn't stand" badge
5. Dig again → modal shows "[This message was deleted]" with red background

**Success criteria**:
- ✅ Delete triggers shouldn't-stand marker
- ✅ Deleted message shows red background in modal
- ✅ Text shows "[This message was deleted]"
- ✅ Edit/delete buttons disabled for deleted messages

---

### 6. Pin Survives Re-projection ✅

**Goal**: Verify human edits (pins) survive automated re-projection

**Steps**:
1. Find a claim with "Shouldn't stand" badge (from step 4 or 5)
2. Click "Pin" button on that claim
3. Yellow "Shouldn't stand" badge replaced with purple "Pinned" badge
4. Background changes to purple tint
5. Click "Re-project episode" button in demo controls
6. Page reloads
7. Pinned claim still shows purple "Pinned" badge, NO "Shouldn't stand"

**What happened**:
- Pin toggled isPinned=true on the claim
- Pin action cleared shouldntStand flag
- Re-projection skipped pinned claims (didn't re-mark shouldn't-stand)
- Unpinned claims with edited/deleted sources get re-marked

**Success criteria**:
- ✅ Pin clears shouldn't-stand
- ✅ Purple "Pinned" badge appears
- ✅ Re-project preserves pin
- ✅ Re-project re-checks unpinned claims

---

### 7. Mobile Experience ✅

**Goal**: Verify mobile-first design on phone-sized viewport

**Steps**:
1. Resize browser to ~375px width (iPhone SE)
2. OR: Open http://localhost:3000 on actual phone
3. Verify:
   - Text is readable (no zoom required)
   - Buttons are tappable (44px minimum)
   - Modal appears as bottom sheet
   - Touch tap on button → visual feedback (scale + color change)
   - No hover-only interactions

**Responsive checks**:
- Header is readable
- Claim cards stack vertically
- "Dig → walk-back" and "Pin" buttons are 44px tall
- Checkbox is 20px × 20px in 44px label
- Demo controls stack vertically
- Modal fills bottom of screen with rounded top corners

**Success criteria**:
- ✅ Usable at 375px width
- ✅ All tap targets 44px minimum
- ✅ Bottom-sheet modal on mobile
- ✅ Touch states work (not hover-only)
- ✅ No horizontal scroll
- ✅ Text is readable without pinch-zoom

---

## API Testing

For backend verification without frontend:

### Health Check
```bash
curl http://localhost:3001/api/health
# {"status":"ok"}
```

### Fetch Episode (No ACL)
```bash
curl "http://localhost:3001/api/episodes/episode_001?hasFinanceAccess=false" | jq .
# Third claim in whyItMattered should show stub text
```

### Fetch Episode (With ACL)
```bash
curl "http://localhost:3001/api/episodes/episode_001?hasFinanceAccess=true" | jq .
# Third claim in whyItMattered should show full financial details
```

### Edit Message
```bash
curl -X POST http://localhost:3001/api/demo/control \
  -H "Content-Type: application/json" \
  -d '{"messageId": "msg_003", "action": "edit", "newText": "Updated text"}' | jq .
# {"success": true, "action": "edit"}

curl http://localhost:3001/api/episodes/episode_001 | \
  jq '.claims.whyItMattered[] | select(.sourceMessageId == "msg_003") | .shouldntStand'
# true
```

### Delete Message
```bash
curl -X POST http://localhost:3001/api/demo/control \
  -H "Content-Type: application/json" \
  -d '{"messageId": "msg_006", "action": "delete"}' | jq .
# {"success": true, "action": "delete"}

curl http://localhost:3001/api/episodes/episode_001 | \
  jq '.claims.theCall[] | select(.sourceMessageId == "msg_006") | .shouldntStand'
# true
```

### Fetch Message (Deleted)
```bash
curl http://localhost:3001/api/messages/msg_006 | jq .
# isDeleted: true
```

### Toggle Pin
```bash
# Get claim ID
CLAIM_ID=$(curl -s http://localhost:3001/api/episodes/episode_001 | \
  jq -r '.claims.theCall[0].id')

# Toggle pin
curl -X POST "http://localhost:3001/api/episodes/episode_001/claims/$CLAIM_ID/pin" | \
  jq '.claims.theCall[0] | {isPinned, shouldntStand}'
# isPinned: true, shouldntStand: false
```

### Re-project
```bash
curl -X POST http://localhost:3001/api/episodes/episode_001/reproject | jq .
# Re-checks all unpinned claims for edited/deleted sources
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check backend logs
cd backend && npm run dev
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check frontend logs
cd frontend && npm run dev
```

### Claims not updating
- Refresh the page (state is fetched on load)
- Check browser console for API errors
- Verify backend is running on port 3001

### ACL demo not working
- Toggle "Viewer has finance access" checkbox
- Page should reload automatically
- Check Network tab for `?hasFinanceAccess=true/false` param

---

## Success Checklist

After completing the demo path, verify:

- [ ] Default page shows three sections (no empty Sources)
- [ ] ACL-restricted claim shows stub ON the page
- [ ] Toggle access → claim text changes
- [ ] Dig opens modal with source message
- [ ] Dig on ACL claim → access denied modal
- [ ] Edit message → claim gets "Shouldn't stand" badge
- [ ] Delete message → claim gets "Shouldn't stand" badge
- [ ] Pin clears "Shouldn't stand"
- [ ] Re-project preserves pins
- [ ] Mobile viewport (375px) is usable
- [ ] All buttons are 44px tap targets
- [ ] Bottom sheet modal on mobile

All checked? ✅ Flint Living Wiki v0 demo complete!

---

## Named v0 Holes

These are intentional limitations for v0 scope:

❌ **No NEW contradicting messages** - Only edit/delete of existing sources triggers shouldn't-stand, not new opposing messages  
❌ **No real re-reasoning** - Re-project just re-checks flags, doesn't re-synthesize with LLM  
❌ **No Graphiti integration** - Simple in-memory store, no graph DB  
❌ **No real Slack** - Fixture data only, no Slack API  
❌ **Single episode** - Hardcoded topic, no multi-topic or creation flow  
❌ **No auth** - ACL is checkbox, no real user sessions  
❌ **No persistence** - In-memory, resets on server restart  

See ARCHITECTURE.md for extension points beyond v0.
