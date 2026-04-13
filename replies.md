# Replies Feature

## Design Decisions
- Replies live in a separate `replies` table (not reusing `notes`)
- A reply has: `id`, `note_id` (FK to notes, CASCADE delete), `author_id` (FK to users, CASCADE delete), `content`, `created_at`, `updated_at`
- No `parent_id` for now — flat list per note, ordered by `created_at` ascending (oldest first)
- No anchoring, target_quote, privacy, or kind on replies — these are inherited/irrelevant
- UX: single-level replies only (no reply-to-reply), but the model doesn't enforce this
- UI: replies are shown on public comments only (data layer has no such restriction)

## Tasks

### Database & Backend
- [x] Add `replies` table to `backend/schema.sql`
- [x] Create `backend/replies.ts` with DB types and query functions (`repliesForNotes`, `addReply`, `removeReply`, `updateReply`)

### Data Layer
- [x] Create `data/replies.ts` with types (`BooqReply`, `UnresolvedBooqReply`) and server actions (`fetchReplies`, `createReply`, `deleteReply`, `modifyReply`)

### API Routes
- [x] Create `app/api/replies/route.ts` — GET replies by `note_id`
- [x] Create `app/api/replies/[id]/route.ts` — POST, PATCH, DELETE

### Application Layer
- [x] Create `application/replies.ts` — `useNoteReplies` SWR hook with optimistic updates

### Reader UI
- [x] Add "Reply" button to `NoteTargetMenu` for public comments
- [x] Create reply list component to display replies under a comment
- [x] Create reply form component (textarea + Post/Cancel)

### Notes Page UI
- [x] Show reply count on `NoteCard` for comments
- [x] Add reply list and reply form to `NoteCard` expanded view

### GraphQL
- [x] Add `Reply` type and `replies` field on `Note` in `graphql/schema.graphql`
- [x] Add reply resolvers in `graphql/reply.ts`
- [x] Add reply mutations (`addReply`, `removeReply`, `updateReply`) to schema and `graphql/mutation.ts`

### Comments Panel (Reader)
- [x] Show replies under each comment in `CommentsPanel`
- [x] Add reply form (inline) to each comment in `CommentsPanel`
- [x] Support edit/remove for own replies in `CommentsPanel`

### Specs
- [x] Update SPECS.md with replies feature

## Suggestions
