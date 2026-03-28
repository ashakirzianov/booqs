# GraphQL API Enhancements

## 1. Bearer Token Authentication

The GraphQL endpoint currently authenticates via `token` cookie only. It needs to also accept `Authorization: Bearer <jwt>` header (using the same JWT).

### What exists
- [backend/token.ts](backend/token.ts) already has `userIdFromHeader(header)` that strips the `Bearer ` prefix and verifies the token — it's just never called from the GraphQL context.
- [graphql/context.ts](graphql/context.ts) reads only from `getCookie('token')`.
- [app/api/graphql/route.ts](app/api/graphql/route.ts) already has access to `headers()` but only reads `origin`.

### Changes
- [x] In [graphql/context.ts](graphql/context.ts): extend `RequestContext` to include `getHeader(name: string): string | undefined`
- [x] In `context()`: try `Authorization` header first via `userIdFromHeader()`, fall back to cookie
- [x] In [app/api/graphql/route.ts](app/api/graphql/route.ts): pass `getHeader` into the context factory using Next.js `headers()`

### Notes
- Minimal change — the JWT verification code already exists, we just need to wire it into the GraphQL context.
- When authenticated via header, `setAuthForUserId`/`clearAuth` still set cookies (which is fine — a bearer-token client can ignore them).

---

## 2. Magic Link Auth Mutations

The email magic link flow exists as server actions in [data/auth.ts](data/auth.ts) backed by [backend/sign.ts](backend/sign.ts), but isn't exposed via GraphQL.

### What exists
- `backend/sign.ts`: `initiateSignRequest()`, `completeSignInRequest()`, `completeSignUp()`
- `graphql/schema.graphql`: `AuthResult` type exists (currently `{ user: User }`) but has no `token` field
- Passkey mutations already follow the pattern: call backend, then `setAuthForUserId()`, return `AuthResult`

### Schema changes
- [x] Add `token: String` field to `AuthResult` type (passkey mutations can return it too, but it's optional for backward compat)
- [x] Add mutations to schema:
  ```graphql
  initiateSign(email: String!, returnTo: String): Boolean
  completeSignIn(email: String!, secret: String!): AuthResult
  completeSignUp(email: String!, secret: String!, username: String!, name: String!, emoji: String!): AuthResult
  ```

### Resolver changes
- [x] In [graphql/mutation.ts](graphql/mutation.ts): add resolvers for the three mutations
  - `initiateSign`: call `backend/sign.initiateSignRequest()`, return `true` on success
  - `completeSignIn`: call `backend/sign.completeSignInRequest()`, call `setAuthForUserId()`, return `{ token, user }`
  - `completeSignUp`: call `backend/sign.completeSignUp()`, call `setAuthForUserId()`, return `{ token, user }`
- [x] Generate the JWT token via `generateToken(userId)` and include it in the response body so non-browser clients can use it

### Notes
- The server actions in `data/auth.ts` do additional things (set cookies via `setUserIdInsideRequest`, revalidation). The GraphQL mutations should call the `backend/sign.*` functions directly (same layer as other GraphQL resolvers), not the server actions.
- `AuthResult` currently has no `token` field. Adding it is backward-compatible — existing passkey mutations can optionally return it too.

---

## 3. Library Browse Query

### What exists
- The web app browses at `/library/pg/subject/{subject}` and `/library/pg/language/{lang}` via [data/booqs.ts:booqCardsForQuery()](data/booqs.ts).
- Backend: [backend/library.ts:booqQuery()](backend/library.ts) supports `kind: 'author' | 'subject' | 'language'` with `limit` and `offset`.
- GraphQL: `search(query, limit)` exists but hardcodes `kind: 'search'` and library `'pg'`. No browse-by-subject/language query.

### Schema changes
- [x] Add query to schema:
  ```graphql
  libraryBrowse(library: String!, kind: String!, query: String!, limit: Int, offset: Int): LibraryBrowseResult!
  ```
- [x] Add result type:
  ```graphql
  type LibraryBrowseResult {
    booqs: [Booq!]!
    hasMore: Boolean!
  }
  ```

### Resolver changes
- [x] In [graphql/query.ts](graphql/query.ts): add `libraryBrowse` resolver that calls `booqQuery(library, { kind, query, limit, offset })` and returns `{ booqs, hasMore }`

### Notes
- `booqQuery` already returns `{ cards: BooqData[], hasMore }` where `BooqData` maps to `BooqParent`. This is a thin wrapper.
- The `kind` parameter could be typed as an enum (`SEARCH | AUTHOR | SUBJECT | LANGUAGE`) instead of `String!` for better API ergonomics. Worth considering.

---

## 4. Notes List Query

### What exists
- `booq(id).notes` resolves notes for a specific book via [backend/notes.ts:notesForBooqId()](backend/notes.ts).
- REST endpoint `/api/notes?booq_id=X` fetches notes for a specific book.
- [backend/notes.ts:notesWithAuthorFor()](backend/notes.ts) already supports querying by `authorId` without `booqId` — returns all notes by that author.
- No top-level GraphQL query for "all my notes".

### Schema changes
- [x] Add query to schema:
  ```graphql
  myNotes(booqId: ID, limit: Int, offset: Int): [Note!]!
  ```

### Resolver/backend changes
- [x] In [graphql/query.ts](graphql/query.ts): add `myNotes` resolver
  - Requires `userId` from context (return empty array if not authenticated)
  - Calls `notesWithAuthorFor({ booqId, authorId: userId })`
- [x] In [backend/notes.ts](backend/notes.ts): add `limit`/`offset` support to `notesWithAuthorFor()` (currently returns all results)

### Notes
- `notesWithAuthorFor({ authorId })` already does the heavy lifting — it joins notes with users and supports optional `booqId` filtering. We just need to add pagination and expose it as a query.
- The resolver should use `DbNoteWithAuthor` as the parent type for `Note`, but the existing `NoteParent = DbNote` in [graphql/note.ts](graphql/note.ts) will need to also accept `DbNoteWithAuthor` (which extends `DbNote`, so this should work without changes).

---

## 5. Copilot Answer Streaming Subscription

### What exists
- `/api/copilot/answer/stream` streams AI answers as text chunks for the web app
- `copilot(context).answer(question)` returns the full response in one shot
- graphql-yoga supports subscriptions out of the box (WebSocket via graphql-ws, or SSE)

### Schema changes
- [x] Add `Subscription` type:
  ```graphql
  type Subscription {
      copilotAnswerStream(context: CopilotContext!, question: String!): String!
  }
  ```

### Resolver changes
- [x] Implement subscription resolver that wraps the existing streaming AI call and yields text chunks as they arrive
- [x] Configure graphql-yoga subscription transport (WebSocket/SSE) — graphql-yoga supports SSE out of the box, no extra config needed

### Notes
- Each event yields the next text chunk (or accumulated text — either works). The Flutter side will subscribe over WebSocket and display text incrementally.

---

## 6. Presigned Book Upload Mutations

### What exists
- `uploadEpubAction` handles upload end-to-end (receive file, parse EPUB, create record)
- S3 storage is already used for book assets
- No presigned URL support yet

### Schema changes
- [x] Add mutations:
  ```graphql
  requestUpload: UploadRequest
  confirmUpload(uploadId: String!): UploadResult!
  ```
- [x] Add types:
  ```graphql
  type UploadRequest {
      uploadId: String!
      uploadUrl: String!
  }

  type UploadResult {
      success: Boolean!
      booqId: ID
      title: String
      coverSrc: String
      error: String
  }
  ```

### Resolver/backend changes
- [x] Implement presigned S3 PUT URL generation scoped to user and upload ID (15min expiry)
- [x] Implement `requestUpload` resolver: generate upload ID, create presigned URL, return to client
- [x] Implement `confirmUpload` resolver: download from storage, parse EPUB, create book record (reuse `uploadEpubAction` logic)

### Notes
- No file data flows through GraphQL — client PUTs directly to the presigned URL, then confirms via mutation.
- The same backend logic should also be exposed via API routes (`POST /api/upload/request`, `POST /api/upload/confirm`) for web app consistency. See [BOOK-UPLOAD.md](BOOK-UPLOAD.md).

---

## 7. Expose styles and restructure fragment/section types

### What was done
- Restructured GraphQL types: `BooqFragment` (was the navigable chapter type) → `BooqChapter` (with `previous`/`current`/`next` anchors + nested `BooqFragment`)
- `BooqFragment` is now a simpler type: `start`, `end`, `nodes`, `styles` — reusable for both sections and expanded fragments
- `BooqAnchor` now includes `position` (moved from the old `BooqFragment`)
- Added `styles` field to both `Booq` type (full map) and `BooqFragment` type (scoped subset)
- Renamed `Booq.fragment(path)` → `Booq.chapter(path)` returning `BooqChapter`
- Added `Note.surroundingFragment` returning `BooqFragment` — the expanded content around a note's range
- Renamed all related core types and functions: `buildFragment` → `buildChapter`, `BooqFragment` → `BooqChapter`, etc.
- Removed unused `backend/fragment.ts` and `core/fragment.ts` (replaced by `core/section.ts`)

### Schema changes
- [x] Add `styles` field to `Booq` type (returns full styles map)
- [x] Add `styles` field to `BooqFragment` type (returns only styles referenced by fragment nodes)
- [x] Restructure `BooqFragment` → `BooqChapter` with nested `BooqFragment`
- [x] Move `position` to `BooqAnchor`
- [x] Add `Note.surroundingFragment` field (moved from `Booq.expandedFragment`)
- [x] Rename `Booq.fragment(path)` → `Booq.chapter(path)`

### Resolver changes
- [x] In `booq.ts`: resolve `styles` by returning `booq.styles`
- [x] In `booq.ts`: section resolver returns `BooqChapter` with nested `BooqFragment`
- [x] In `note.ts`: `surroundingFragment` resolver calls `getExpandedRange` + `nodesForRange` + `collectReferencedStyles` using the note's own range

### Notes
- `Note.surroundingFragment` expands the note's range to paragraph boundaries and returns the surrounding content with scoped styles. Uses `booqLoader` so multiple notes on the same book share a single book load.

---

## 9. Redesign notes queries

### What exists
- `myNotes(booqId, limit, offset)` top-level query — returns only authenticated user's notes, optionally filtered by book
- `booq.notes` field — returns all notes for a book, no filtering or pagination
- `fetchBooqsWithOwnNotes()` server action — returns book IDs where user has notes (used for notes sidebar navigation)

### Proposed schema
Replace `myNotes` and the current `booq.notes` with:

```graphql
type Query {
    # All notes by a user across all books (username required)
    notes(username: String!, limit: Int, offset: Int): [Note!]!
}

type Booq {
    # Notes on this book, optionally filtered by author
    notes(username: String, limit: Int, offset: Int): [Note!]!
}

type User {
    # Books this user has annotated (for sidebar navigation)
    booksWithNotes: [Booq!]!
}
```

### Changes
- [x] Add `username` filter + pagination to `booq.notes` field
- [x] Replace `myNotes` with top-level `notes(username!)` query (username required to avoid unbounded queries)
- [x] Add `booqsWithNotes` field to `User` type
- [x] Removed `myNotes`

### Notes
- `booq.notes(username)` covers: all notes on a book (no username), my notes (my username), someone else's notes (their username)
- Top-level `notes(username)` covers the "all my annotations" page
- `user.booksWithNotes` covers the notes sidebar navigation

---

## 10. Passkey management queries

### What exists
- `fetchPasskeyData()` server action — lists user's registered passkeys
- `deletePasskeyAction(id)` server action — deletes a passkey
- GraphQL has registration/login flows but no list/delete

### Schema changes
- [x] Add `passkeys` field to `User` type (returns null for other users' profiles):
  ```graphql
  type User {
      passkeys: [Passkey!]
  }
  type Passkey {
      id: ID!
      label: String
      createdAt: String!
  }
  ```
- [x] Add mutation:
  ```graphql
  deletePasskey(id: ID!): Boolean
  ```

---

## 11. History pagination

### What exists
- `history` query returns all reading history entries with no pagination
- Server actions support `limit`/`offset` for paginated history

### Schema changes
- [x] Add pagination parameters to `history` query:
  ```graphql
  history(limit: Int, offset: Int): [BooqHistory]
  ```

---

## 12. Copilot streaming context fields

### What exists
- REST `/api/copilot/answer/stream` accepts optional `footnote` parameter for additional context
- GraphQL `copilotAnswerStream` subscription only accepts `context` and `question`

### Schema changes
- [x] Add `footnote` parameter to subscription:
  ```graphql
  type Subscription {
      copilotAnswerStream(context: CopilotContext!, question: String!, footnote: String): String!
  }
  ```

---

## Suggested Implementation Order

1. **Bearer token** — smallest change, unblocks API consumers immediately
2. **Magic link mutations** — builds on bearer token (returns token in body)
3. **Library browse** — independent, straightforward wrapper
4. **Notes redesign** — replaces myNotes with more flexible query pattern
5. **Copilot streaming** — independent, depends on subscription transport setup
6. **Presigned upload mutations** — depends on backend presigned URL support (see [BOOK-UPLOAD.md](BOOK-UPLOAD.md))
7. **Expose styles** — needed for styled rendering via GraphQL
8. **Expanded fragment query** — needed for note previews with context
9. **Passkey management** — needed for full profile management
10. **History pagination** — needed for large reading histories
11. **Copilot context fields** — improves AI answer quality

---

## Suggestions

- [x] Consider typing `libraryBrowse.kind` as a GraphQL enum instead of `String!` for validation and discoverability
- [x] The `notesWithAuthorFor` function has a TODO for privacy filtering — this work would be a good time to address it
- [x] Audit REST API endpoints in `app/api/` — removed `/api/booq/[booq_id]/expanded-fragment` (zero callers, old naming) and `/api/users/[username]/follow` (web app uses server actions instead). Remaining ~10 endpoints are actively used by the web frontend.
