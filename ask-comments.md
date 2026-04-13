# Ask + Comments Integration

## Overview
Integrate the "Ask" feature with the comments/replies system. When a user asks a question about a text selection, it becomes a public comment (kind: `'question'`) with an AI-generated reply that streams in real-time and is persisted.

## Design Decisions

### Comment kind
Questions use `kind: 'question'` to distinguish from regular `'comment'` notes. This enables filtering, special UI styling, and identifying which comments have AI-generated replies.

### AI reply authorship
A sentinel "AI" user row in the `users` table (e.g., username `"booqs-ai"`, name `"Booqs AI"`). AI replies are authored by this user — no schema changes needed beyond a single insert.

### Orchestration (Option B — single endpoint)
Client generates `noteId` via nanoid, sends everything to a single `/api/ask` endpoint. The endpoint:
1. Creates the comment note (kind: `'question'`, privacy: `'public'`)
2. Streams the AI answer back to the client
3. Saves the AI reply on stream completion (independent of client connection)

The client already knows the `noteId` before the call, so it can immediately open the comment detail view and show the streaming reply.

### CommentsPanel: list/detail modes
CommentsPanel gets two modes:
- **List mode** (current) — shows all comments/questions
- **Detail mode** — shows a single comment/question with its replies and a "back" button

For the Ask flow: after submitting a question, the client creates an optimistic comment, opens CommentsPanel in detail mode for that comment, and the AI reply streams inline in the replies section.

This same detail mode is reusable for regular comments — tapping any comment in list mode could open detail mode (future enhancement, not in this scope).

### Reply persistence
- The comment (question) is created immediately by the `/api/ask` endpoint before streaming begins
- The AI reply is saved after the stream completes
- The server continues generating even if the client disconnects (using `waitUntil` or equivalent)
- Redis cache remains as a fallback
- After stream completion, the client revalidates the replies SWR cache to pick up the persisted reply with its real ID

### GraphQL support
Add an `askQuestion` mutation/subscription that mirrors the REST endpoint:
- Creates the question note
- Streams the AI answer
- Saves the reply on completion

## Tasks

### 1. Sentinel AI User
- [x] Add a migration/seed script or backend utility to ensure the AI user exists (id: `'booqs-ai'`, username: `'booqs-ai'`, name: `'Booqs AI'`, emoji: `'🤖'`)
- [x] Add a constant/helper in `backend/` to get the AI user ID
- [x] Ensure the AI user works with existing author resolution in replies (data layer, GraphQL resolvers)

### 2. Backend: Ask Endpoint Logic
- [x] Create `backend/ask.ts` with a function that orchestrates: create question note → stream AI answer → save reply on completion
  - Accepts: `{ noteId, booqId, start, end, question, targetQuote, authorId }`
  - Creates the note via existing `addNote()` from `backend/notes.ts`
  - Generates AI answer stream via existing `generateAnswerStreaming()` from `backend/copilot.ts`
  - On stream completion: saves reply via `addReply()` from `backend/replies.ts` with AI user as author
  - Returns the stream to the caller
- [x] Ensure the stream keeps running even if the consumer disconnects (accumulate full response, save reply in a finally/completion handler)

### 3. Data Layer
- [x] Create `data/ask.ts` with a server action or data function that wraps `backend/ask.ts`
  - Bridges the app/api layer to the backend, consistent with existing data layer patterns

### 4. API Route
- [x] Create `app/api/ask/route.ts` — POST endpoint
  - Accepts: `{ noteId, booqId, start, end, question, targetQuote }`
  - Authenticates user
  - Calls data layer to create question + stream answer
  - Returns streaming response (text/plain)
  - Note: reply saving happens in the stream's pump loop; `waitUntil` can be added later if needed for disconnection resilience

### 5. GraphQL
- [x] Add `askQuestion` subscription to `graphql/schema.graphql`
  - Input: note ID, copilot context (booqId, start, end), question, targetQuote
  - Streams answer chunks (same as `copilotAnswerStream` but also creates question + saves reply)
- [x] Add resolver in `graphql/copilot.ts` (or new file `graphql/ask.ts`)
  - Uses same backend orchestration as the REST endpoint

### 6. Application Layer: Streaming Hook
- [x] Create `application/ask.ts` with `useAskQuestion` hook
  - Calls `/api/ask` with streaming
  - Manages state: `{ status: 'idle' | 'streaming' | 'done' | 'error', answer: string, error?: string }`
  - On completion (`'done'`), triggers SWR revalidation for both notes and replies
  - Reuses streaming patterns from existing `application/copilot.ts` / `application/cache.ts`

### 7. CommentsPanel: Detail Mode
- [ ] Add `selectedCommentId` state to CommentsPanel (or lift to Reader)
- [ ] Create `CommentDetailView` component — shows single comment with replies, "back" button
  - Reuses existing `CommentItem` rendering
  - Shows `NoteReplies` for the comment
  - Accepts an optional `streamingReply` prop for the AI answer in progress
- [ ] Add a `StreamingReply` component for rendering the in-progress AI reply
  - Shows AI user avatar/name
  - Renders streaming text with loading indicator
  - Transitions to a regular reply display on completion
- [ ] Wire list → detail navigation: clicking a comment in list mode opens detail mode
- [ ] Wire "back" button: returns to list mode

### 8. Reader Integration: Ask Flow
- [ ] Modify the Ask flow in Reader to:
  1. Keep existing question input UI (floater with textarea)
  2. On question submit: create optimistic comment note, open CommentsPanel in detail mode for that note, start streaming via `useAskQuestion`
  3. Remove the current `AskTargetMenu` answer display phase — the CommentsPanel detail view handles it now
- [ ] Update `useContextMenuState` — Ask target no longer needs `'side-panel'` display for the answer phase
- [ ] Auto-open CommentsPanel (right panel) when Ask flow starts streaming
- [ ] Ensure the question input floater still works as before (positioning near selection)

### 9. UI Polish
- [ ] Style question comments differently from regular comments (e.g., "?" badge or different icon)
- [ ] Style AI replies differently from user replies (e.g., subtle background, AI badge)
- [ ] Handle edge cases: user not authenticated (Ask menu item already gated), empty question, stream error
- [ ] Loading states: show skeleton/pulse while AI reply is streaming

### 10. Cleanup
- [ ] Remove or deprecate the standalone `copilotAnswerStream` subscription if fully replaced
- [ ] Remove `AnswerDisplay` component from `AskTargetMenu` (answer phase moves to CommentsPanel)
- [ ] Update SPECS.md with the new Ask + Comments behavior

## Suggestions
