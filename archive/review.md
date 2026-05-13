# Codebase Review — Booqs

Deep review of the Booqs codebase covering security, performance, scaling, architecture, and code clarity. Findings are prioritized within each section as **Critical**, **High**, **Medium**, or **Low**.

---

## 1. Security

### Critical

**S1. Bookmark deletion has no ownership check**
`backend/bookmarks.ts` — `deleteBookmark(id)` deletes by bookmark ID alone without verifying that the requesting user owns the bookmark. Any authenticated user who knows (or guesses) a bookmark ID can delete another user's bookmarks.

```typescript
// Current — no user_id check
DELETE FROM bookmarks WHERE id = ${id}

// Fix
DELETE FROM bookmarks WHERE id = ${id} AND user_id = ${userId}
```

### High

**S2. No rate limiting on any endpoint**
No rate limiting exists on auth endpoints (passkey login, email sign-in), GraphQL mutations, search, or upload URL generation. This leaves the app vulnerable to brute-force attacks, credential stuffing, and resource exhaustion.
- Auth endpoints are especially sensitive — email sign-in secrets are 32-char nanoid with 1-hour TTL, but without attempt limiting an attacker can try many secrets.
- Search and GraphQL are vulnerable to abuse/scraping.

**S3. No GraphQL query depth or complexity limits**
The graphql-yoga server is created with no depth-limiting or complexity-analysis plugins. Recursive queries like `user → followers → followers → ...` can cause unbounded server load.

**S4. No security headers configured**
No `middleware.ts` and no header configuration in `next.config.js`. Missing: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy. The GraphQL endpoint is also accessible without CORS restrictions.

**S5. Weak default JWT secret**
`backend/config.ts:17` falls back to `'fake secret'` if `BOOQS_AUTH_SECRET` is not set. In a misconfigured production deployment, all tokens would be signed with a known secret. Should throw an error instead of defaulting.

### Medium

**S6. Missing input validation on API routes**
API routes (`/api/notes/[id]`, `/api/collections/[name]`, `/api/search`, `/api/copilot/answer`) deserialize request bodies without schema validation (no Zod/Yup). Type assertions like `booq_id as BooqId` are unsafe casts. The search endpoint parses `limit`/`offset` via `parseInt()` with no bounds — a request with `limit=99999999` would be accepted.

**S7. GraphQL introspection enabled in production**
graphql-yoga enables introspection by default. This exposes the full schema to any client, making it easier for attackers to discover the API surface.

**S8. No CSRF protection on GraphQL mutations**
No origin verification or CSRF token mechanism is visible for mutation requests. Cookie-based auth combined with no CSRF protection could allow cross-site mutation attacks from malicious pages.

### Low

**S9. EPUB path resolution doesn't reject `../`**
`parser/path.ts` resolves relative paths within EPUBs without explicitly rejecting parent-directory escapes. Not exploitable since ZIP entries are keyed in memory (no filesystem traversal), but could be hardened.

**S10. Image variant format not whitelisted**
`backend/variants.ts` — variant spec regex allows any `\w+` for format. Should whitelist `webp|avif|png|jpg` to prevent unexpected file generation.

---

## 2. Performance

### High

**P1. Reading history loads entire dataset into memory**
`backend/history.ts` — `booqHistoryForUser()` calls Redis `hgetall()` to load ALL history records, then sorts and paginates in-memory. For users with thousands of read books, this is wasteful. The GraphQL resolver (`query.ts:54-62`) slices the full array after loading — defeating the purpose of pagination.

**Fix:** Replace Redis hash with a sorted set (`ZADD` with timestamp score, `ZREVRANGE` for paginated queries).

**P2. No maximum limit on GraphQL query results**
Several queries accept a `limit` argument with no upper bound: `search` defaults to 100, `libraryBrowse` defaults to 24, but a client can pass `limit: 1000000`. Add `Math.min(limit, MAX_LIMIT)` validation.

**P3. N+1 on follower/following count fields**
`graphql/user.ts` — `followersCount` and `followingCount` each execute a separate `COUNT(*)` query per user. When querying a list of users, this creates N+1 queries. No DataLoader exists for count operations.

### Medium

**P4. Single-file in-memory EPUB cache**
`backend/library.ts:273-287` — only the most recently accessed EPUB file is kept in a process-level variable (`cachedFile`). In a multi-instance deployment, each instance holds its own copy, and cache hit rate is low for concurrent users reading different books.

**P5. No caching for user profiles, follow relationships, or collection memberships**
These are queried from PostgreSQL on every request. User profiles and follow counts are good candidates for short-TTL caching.

**P6. Streaming cache listeners never cleaned up**
`application/cache.ts` — `createStreamingCache()` maintains in-memory listener maps indefinitely with no eviction policy. If listeners aren't manually unsubscribed, this is a slow memory leak.

**P7. Notes ordered ascending by default**
`backend/notes.ts:51` — `ORDER BY created_at ASC`. Most UIs expect newest-first. If the frontend reverses the array, that's wasted work; if not, the UX is backwards.

### Low

**P8. Full booq nodes/styles returned without truncation**
GraphQL `Booq.nodes()` and `Booq.styles()` resolvers return the entire document tree and style map. For large books (War and Peace = 200KB+ JSON), responses are massive. Consider field-level pagination or depth limits.

**P9. Table of contents has no pagination**
Returned as a flat array with no limits. Typically small (100–500 items), but not bounded.

---

## 3. Scaling

### High

**SC1. Reading history stored only in Redis — no durable backup**
If the Redis instance is lost or flushed, all reading history is permanently gone. There is no PostgreSQL backup, no periodic snapshot, and no way to rebuild from activity logs. Consider dual-writing to PostgreSQL or periodic Redis backup.

**SC2. No database transaction management**
User deletion (`backend/users.ts` — `deleteUserForId`) uses `Promise.all` across three independent delete operations without a transaction. If one fails mid-way, the database is left in a partially deleted state. Same risk exists for multi-step upload flows.

**SC3. Serverless timeout risk for EPUB processing**
EPUB parsing + image dimension loading can exceed Vercel's 60-second timeout for large books. Only `/api/images` sets `maxDuration = 60`. Other routes (upload confirmation, book loading) have no explicit timeout configuration and could fail silently on large files.

### Medium

**SC4. No S3 retry logic or backpressure**
S3 operations (`backend/blob.ts`) have no retry logic with exponential backoff. Transient failures (throttling, network issues) cause immediate failure. Image variant generation could spike S3 PUT requests.

**SC5. Concurrent upload race condition**
If two users upload the same EPUB simultaneously, both call `buildFileFromBuffer()` → `cardForHash()`, both get a cache miss, and both insert. The deduplication-by-hash check has a TOCTOU race. Consider a distributed lock or `ON CONFLICT` at the asset level.

**SC6. Notes table growth unbounded**
No archival, partitioning, or cleanup strategy. Each note is indexed 5+ ways. At millions of notes, index maintenance becomes a bottleneck.

### Low

**SC7. Redis command budget on free tier**
Upstash free tier allows 10,000 commands/day. Each user accessing history, each cached preview lookup, and each auth challenge consumes commands. Monitor and plan for paid tier.

**SC8. No connection pool tuning**
Relies entirely on Neon serverless defaults. No explicit pool size, timeout, or retry configuration.

---

## 4. General Design

### Architecture & Layering

**D1. GraphQL layer directly imports from backend (layer violation)** — High
The documented layer hierarchy states `graphql > data > app/api`, meaning GraphQL should access backend through the data layer. In practice, all GraphQL resolvers (`loaders.ts`, `query.ts`, `mutation.ts`, `booq.ts`, `user.ts`, `author.ts`) import directly from `backend/*`. This is the most significant architectural violation in the codebase.

Options:
- (a) Route GraphQL through `data/` like the rest of the app.
- (b) Acknowledge that GraphQL sits at the same level as `data/` and update CLAUDE.md to reflect reality: `backend > graphql | data > ...`

**D2. Inconsistent error response patterns across mutations** — Medium
GraphQL mutations use three different patterns:
- Return `boolean` (e.g., `addBookmark`, `follow`) — no error details
- Return `undefined | Type` (e.g., `addNote`) — can't distinguish auth failure from operation failure
- Return `{ success, error?, field? }` (e.g., `updateUser`) — most informative

Standardizing on a result object would let the frontend give meaningful feedback.

**D3. No explicit database transactions** — Medium
Multi-step operations (user deletion, upload confirmation, collection + booq insert) rely on independent queries. Failures mid-sequence leave partial state. PostgreSQL transactions via `BEGIN`/`COMMIT` would provide atomicity.

**D4. Parser diagnostics lost** — Low
The parser accumulates rich diagnostics (warnings, validation errors) but they're logged to console and discarded. No way for users or admins to see why a book failed to parse or rendered incorrectly. Consider storing diagnostics per booq.

**D5. GraphQL schema nullability could be tighter** — Low
`Bookmark` fields (`booq`, `id`, `path`) and several `Note` fields are optional where they should likely be non-null. Loose nullability pushes null-checking burden to the client.

### Positive Design Observations

- **Layer discipline is excellent** everywhere except D1. The `data/` abstraction is clean and consistently used by app/components/reader layers.
- **Discriminated union result types** (`{ success: true, user } | { success: false, reason }`) are used well across backend and data layers.
- **Privacy filtering is done in SQL** (`AND (n.privacy = 'public' OR n.author_id = $userId)`), not application code — correct and efficient.
- **DataLoaders** prevent N+1 for the most common patterns (booq, user lookups).
- **Stateless design** — no server-side sessions, cookie-based JWT, external state in Redis/S3/PostgreSQL — ready for horizontal scaling.
- **SWR with optimistic updates and rollback** on the frontend is well-implemented.
- **Discriminated union state** for UI (`{ state: 'idle' } | { state: 'loading' } | { state: 'error', error }`) is consistently applied per CLAUDE.md.

---

## 5. Code Clarity, Naming & Other Issues

### Medium

**C1. Undocumented `pph` property**
`core/model.ts:27` — `BooqElementNode` has a `pph?: boolean` field. The meaning of this acronym is unclear without reading `parser/pph.ts`. Needs a JSDoc comment at the definition site.

**C2. Timestamp field naming inconsistency**
`application/notes.ts:229` uses `updated_at` (snake_case) in a context where the `BooqNote` type defines `updatedAt` (camelCase). Mixing conventions in the same expression is a likely bug:
```typescript
// Current
? { ...n, ...body, updated_at: now }
// Should be
? { ...n, ...body, updatedAt: now }
```

**C3. Dynamic SQL parameter counter is fragile**
`backend/users.ts:153-178` builds UPDATE queries with a manual `$${i++}` counter. While safe (user input goes through `values` array), the pattern is error-prone under modification. Deserves a comment explaining the approach, or a refactor to use Neon's template literals.

### Low

**C4. Unclear variable name `hl`**
`reader/nodes.ts:84` — `notes.filter(hl => ...)` uses `hl` (presumably "highlight") where `note` would be clearer and match the collection name.

**C5. Magic numbers without explanation**
- `core/chapter.ts:107` — `const chapterLength = 4500` — what unit? Characters? Words?
- `backend/library.ts:109` — `const PREVIEW_LENGTH = 500` — same question.
Add a comment explaining the unit and why that value.

**C6. Constant naming conventions mixed**
`core/path.ts` uses `camelCase` constants (`pathSeparator`, `idPrefix`), while `backend/library.ts` uses `UPPER_SNAKE_CASE` (`CACHE_BUCKET`, `PREVIEW_LENGTH`). Pick one convention.

**C7. No-op type conversion function**
`data/notes.ts:247` — `noteFromJson()` is a function that returns its argument unchanged. It exists as a type assertion wrapper. Consider inlining or adding a comment explaining the intent.

**C8. `catch (err: any)` pattern**
Used in `application/passkeys.ts:55,95,116`, `backend/users.ts:96`, `backend/blob.ts:78`, and others. Should be `catch (err: unknown)` with proper type narrowing:
```typescript
catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
}
```

### Positive Observations

- **Function declaration style** is consistent per CLAUDE.md (prefers `function name()` over `const name = () =>`).
- **"booq" vs "book" naming** is correctly applied: user-facing code uses "booq", internal functions use "book" where natural.
- **No dead code detected** — no TODO/FIXME comments, no commented-out code, no eslint-disable directives.
- **Null handling is strong** — consistent use of optional chaining, nullish coalescing, and early returns.
- **Type safety is good** — minimal `any` usage, mostly justified in parser/CLI logging code.

---

## Summary: Top 10 Action Items

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 1 | **S1** — Bookmark deletion ownership check | Critical | Small |
| 2 | **S2** — Add rate limiting (auth endpoints first) | High | Medium |
| 3 | **S5** — Throw on missing JWT secret instead of defaulting | High | Small |
| 4 | **S3** — Add GraphQL depth/complexity limits | High | Small |
| 5 | **P1** — Fix history to use Redis sorted sets with real pagination | High | Medium |
| 6 | **S4** — Configure security headers via middleware or next.config | High | Small |
| 7 | **SC1** — Back up reading history to PostgreSQL | High | Medium |
| 8 | **D1** — Resolve GraphQL→backend layer violation | High | Large |
| 9 | **S6** — Add Zod validation on API route inputs | Medium | Medium |
| 10 | **SC2** — Wrap multi-step DB operations in transactions | Medium | Medium |
