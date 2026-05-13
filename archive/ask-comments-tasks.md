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
- [x] Add `selectedCommentId` state to CommentsPanel (controlled via props from Reader)
- [x] Create detail view inside CommentsPanel — shows single comment with replies, "back" button
  - Reuses existing `CommentItem` rendering
  - Shows `NoteReplies` for the comment
  - Accepts an optional `streamingReply` prop for the AI answer in progress
- [x] Add `StreamingReplyDisplay` component for rendering the in-progress AI reply
  - Shows AI user emoji/name
  - Renders streaming text with cursor indicator
  - Shows "Thinking..." pulse while waiting for first chunk
- [x] Wire list → detail navigation: clicking a comment in list mode opens detail mode
- [x] Wire "back" button: returns to list mode

### 8. Reader Integration: Ask Flow
- [x] Modify the Ask flow in Reader to:
  1. Keep existing question input UI (floater with textarea)
  2. On question submit: create optimistic comment note, open CommentsPanel in detail mode for that note, start streaming via `useAskQuestion`
  3. Remove the current `AskTargetMenu` answer display phase — the CommentsPanel detail view handles it now
- [x] Update `useContextMenuState` — Ask target no longer needs `'side-panel'` display for the answer phase
- [x] Auto-open CommentsPanel (right panel) when Ask flow starts streaming
- [x] Ensure the question input floater still works as before (positioning near selection)
- [x] Simplify `AskTarget` type — removed `question`, `hidden`, `footnote` fields (no longer needed)
- [x] Add `QUESTION_KIND` constant and update `useNotesData` to include questions in the comments list

### 9. Fix: context menu broken after asking question
- [x] Add `isTargetDismissable` function to `ContextMenuContent` and use it in `useContextMenuFloater`
  - Returns true for targets that should be replaced by a new text selection (empty, selection, ask, comment, question-asked)
  - Returns false for targets that need user interaction to dismiss (note, create-comment, quote)

### 10. Fix: Comments button not highlighted and can't dismiss panel after ask
- [x] Comments button now reflects both `commentsPanelOpen` and comment target state via `isCommentsPanelVisible`
- [x] Clicking the button when a comment target is active clears the target to dismiss the panel

### 11. Fix: prevent duplicate `/generate-reply` calls on remounts
- [x] After calling `ask()`, transition target from `question-asked` to `comment` — the effect only fires once, and remounts see `comment` instead of re-triggering

### 12. Fix: backend idempotency for AI reply generation
- [x] Added `hasReplyFromAuthor` query in `backend/replies.ts`
- [x] `generateAiReply` checks before starting generation — returns `ALREADY_EXISTS` error if AI reply exists
- [x] `saveAiReply` checks again before inserting — safety net for concurrent requests

### 13. Refactor: consistent note CRUD return types
- [x] All three note CRUD functions now return `{ optimistic, posted }` or `undefined`
  - `addNote` returns `{ optimistic: PostResponse, posted: Promise }`
  - `removeNote` returns `{ optimistic: { noteId }, posted: Promise }`
  - `updateNote` returns `{ optimistic: { noteId, ...body }, posted: Promise }`

### 14. Restore: footnote context for AI questions from notes
- [-] The old Ask flow passed `note.content` as a `footnote` to the AI prompt when asking from `NoteTargetMenu` (ask about a highlighted/commented passage)
  - This gave the AI extra context: "The user has provided this note about the selected passage: ..."
  - `buildPromptForAnswer` in `backend/copilot.ts` still supports the `footnote` parameter
  - Need to thread this through: `AskTarget` → `QuestionAskedTarget` → `/api/ask` → `generateAnswerStreaming`

### 15. UI Polish
- [-] Skipped for now

### 16. Cleanup
- [x] Removed `application/copilot.ts` and `application/cache.ts` (no consumers)
- [x] Removed `data/copilot.ts` (no consumers)
- [x] Removed `/api/copilot/answer`, `/api/copilot/suggestions`, `/api/copilot/answer/stream` routes (no consumers)
- [x] Removed `copilotAnswerStream` subscription and `copilot` query from GraphQL schema and resolvers
- [x] Removed `Copilot` and `CopilotContext` types from GraphQL schema
- [x] Cleaned up `backend/copilot.ts` — kept only `generateAnswerStreaming` and its dependencies
- [x] Updated SPECS.md

### 17. Naming
- [x] Renamed `ContextMenuTarget` → `MenuState`, `ContextMenuTargetSetter` → `MenuStateSetter`
- [x] Renamed `useContextMenuState` → `useMenuState`, file `useContextMenuState.ts` → `useMenuState.ts`
- [x] Renamed `setTarget`/`setMenuTarget` → `setMenuState`, `menuTarget` → `menuState` throughout
- [x] Renamed `isTargetDismissable` → `isStateDismissable`
- [x] Renamed `useAskQuestion` → `useGenerateReply`, `AskState` → `GenerateReplyState`, `ask` → `generateReply`

## Suggestions
