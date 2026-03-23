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
- [ ] Add query to schema:
  ```graphql
  libraryBrowse(library: String!, kind: String!, query: String!, limit: Int, offset: Int): LibraryBrowseResult!
  ```
- [ ] Add result type:
  ```graphql
  type LibraryBrowseResult {
    booqs: [Booq!]!
    hasMore: Boolean!
  }
  ```

### Resolver changes
- [ ] In [graphql/query.ts](graphql/query.ts): add `libraryBrowse` resolver that calls `booqQuery(library, { kind, query, limit, offset })` and returns `{ booqs, hasMore }`

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
- [ ] Add query to schema:
  ```graphql
  myNotes(booqId: ID, limit: Int, offset: Int): [Note!]!
  ```

### Resolver/backend changes
- [ ] In [graphql/query.ts](graphql/query.ts): add `myNotes` resolver
  - Requires `userId` from context (return empty array if not authenticated)
  - Calls `notesWithAuthorFor({ booqId, authorId: userId })`
- [ ] In [backend/notes.ts](backend/notes.ts): add `limit`/`offset` support to `notesWithAuthorFor()` (currently returns all results)

### Notes
- `notesWithAuthorFor({ authorId })` already does the heavy lifting — it joins notes with users and supports optional `booqId` filtering. We just need to add pagination and expose it as a query.
- The resolver should use `DbNoteWithAuthor` as the parent type for `Note`, but the existing `NoteParent = DbNote` in [graphql/note.ts](graphql/note.ts) will need to also accept `DbNoteWithAuthor` (which extends `DbNote`, so this should work without changes).

---

## Suggested Implementation Order

1. **Bearer token** — smallest change, unblocks API consumers immediately
2. **Magic link mutations** — builds on bearer token (returns token in body)
3. **Library browse** — independent, straightforward wrapper
4. **myNotes** — independent, needs minor backend pagination addition

---

## Suggestions

- [ ] Consider typing `libraryBrowse.kind` as a GraphQL enum instead of `String!` for validation and discoverability
- [ ] The `notesWithAuthorFor` function has a TODO for privacy filtering — this work would be a good time to address it
