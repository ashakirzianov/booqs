# Review Tasks

Ordered by priority — combining severity, effort, and dependencies. Quick security/correctness wins first, then hardening, then larger structural work.

---

## Quick Security & Correctness Fixes

- [x] **S1. Fix bookmark deletion ownership check** — `backend/bookmarks.ts`: `deleteBookmark` takes only `id`. Add `userId` param and `AND user_id = ${userId}` to the WHERE clause. Update `graphql/mutation.ts:77` to pass `userId`.
- [x] **S5. Throw on missing JWT secret** — `backend/config.ts:17`: replace `?? 'fake secret'` with a runtime error if `BOOQS_AUTH_SECRET` is undefined in production.
- [x] **S10. Whitelist image variant formats** — `backend/images.ts`: `generateVariant` returns `undefined` for unsupported formats instead of passing arbitrary strings to sharp.
- [x] **C2. Fix `updated_at` → `updatedAt` in notes optimistic update** — `application/notes.ts:229`: snake_case field name doesn't match the `BooqNote` type.
- [x] **P7. Fix notes default sort order** — `backend/notes.ts`: changed to `ORDER BY created_at DESC` (newest-first).

## GraphQL Hardening

- [x] **S3. Add query depth and complexity limits** — `app/api/graphql/route.ts`: added depth limit rule (max 10) via `@envelop/core` `useValidationRule`.
- [x] **S7. Disable introspection in production** — same file: `graphiql: !isProduction`, `maskedErrors: isProduction`.
- [x] **P2. Cap maximum query limits** — `graphql/query.ts`: added `clampLimit` helper with `MAX_LIMIT = 100`. Also applied to `/api/search/route.ts`.
- [ ] **D2. Standardize mutation error responses** — replace bare `boolean` and `undefined` returns in `graphql/mutation.ts` with a consistent result shape (e.g. `{ success: boolean, error?: string }`). Update GraphQL schema accordingly.
- [ ] **D5. Tighten GraphQL schema nullability** — review `Bookmark` and `Note` types in `graphql/schema.graphql`; make fields non-null where they are always present.

## Security Headers & Input Validation

- [x] **S4. Add security headers** — created `proxy.ts` with X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, X-DNS-Prefetch-Control.
- [x] **S6. Add Zod validation on API route inputs** — added Zod schemas to `/api/notes/[id]`, `/api/collections/[name]`, `/api/copilot/answer`. Derived types from schemas.
- [x] **S8. Add CSRF protection for GraphQL mutations** — added Origin header check against allowed origins on POST to `/api/graphql`.

## Code Clarity Fixes

- [x] **C8. Replace `catch (err: any)` with `catch (err: unknown)`** — fixed in `application/passkeys.ts`, `backend/users.ts`, `backend/blob.ts`.
- [x] **C1. Document `pph` property** — `core/model.ts`: added JSDoc explaining paragraph marking for scroll tracking.
- [x] **C4. Rename `hl` → `note`** — `reader/nodes.ts`: filter callback parameter now matches collection name.
- [x] **C5. Document magic numbers** — `core/chapter.ts`, `backend/library.ts`: added comments explaining character count units.
- [x] **C7. Inline or document `noteFromJson`** — removed no-op passthrough function from `application/notes.ts`, replaced with direct type assertions.
- [ ] **C3. Clarify dynamic SQL in `updateUser`** — `backend/users.ts:153-178`: add a comment block explaining the `$${i++}` placeholder counter pattern, or refactor to use Neon template literals.
- [ ] **C6. Pick a constant naming convention** — decide between `camelCase` (used in `core/`) and `UPPER_SNAKE_CASE` (used in `backend/`) for module-level constants, then apply consistently.

## Performance Improvements

- [ ] **P3. Add DataLoader for follower/following counts** — `graphql/user.ts`: `followersCount` and `followingCount` each run a separate COUNT query per user. Create a batching loader or combine with user query.
- [ ] **P6. Add cleanup to streaming cache** — `application/cache.ts`: add TTL-based eviction or `WeakRef`-based cleanup for idle cache entries with no listeners.
- [ ] **P5. Cache user profiles and follow counts** — add short-TTL Redis caching (e.g. 60s) for `userForId`, `getFollowersCount`, `getFollowingCount` to avoid hitting PostgreSQL on every request.

## History Redesign

- [ ] **P1 + SC1. Migrate reading history from Redis hash to sorted set + PostgreSQL backup** — `backend/history.ts`:
  - Replace `hset`/`hgetall` with `ZADD` (score = timestamp) and `ZREVRANGE` (for paginated queries)
  - Add a `reading_history` PostgreSQL table as durable storage
  - Dual-write: write to both Redis (fast reads) and PostgreSQL (durability)
  - Update `booqHistoryForUser` to use `ZREVRANGE` with offset/limit instead of loading everything

## Database Integrity

- [ ] **SC2 + D3. Add transaction management for multi-step operations** — wrap these operations in `BEGIN`/`COMMIT`:
  - `backend/users.ts` `deleteUserForId` (3 independent deletes)
  - `backend/uu.ts` `uploadEpubForUser` (parse → upload → insert → register)
  - `backend/collections.ts` collection + booq insert
- [ ] **SC5. Handle concurrent upload race condition** — `backend/uu.ts`: add `ON CONFLICT` on `file_hash` in `uu_assets` insert, or use a distributed lock so only one writer proceeds.
- [ ] **SC3. Set `maxDuration` on all long-running routes** — add `export const maxDuration = 60` to `/api/upload/confirm`, `/api/graphql`, and any route that triggers EPUB parsing.

## Rate Limiting

- [ ] **S2. Add rate limiting** — add rate limiting middleware, starting with auth-critical endpoints:
  - `/api/graphql` mutations: `initiateSign`, `completeSignIn`, passkey endpoints (e.g. 10 attempts/minute)
  - `/api/search` (e.g. 30 req/minute)
  - `/api/upload/request` (e.g. 5 req/minute)
  - Consider `@upstash/ratelimit` since Upstash Redis is already in the stack.

## Larger Structural Work

- [ ] **D1. Resolve GraphQL → backend layer violation** — all GraphQL resolvers import directly from `backend/*`, violating the documented hierarchy. Decide:
  - Option A: Route GraphQL through `data/` (consistent but creates pass-through functions)
  - Option B: Update CLAUDE.md to acknowledge `graphql` and `data` as sibling layers above `backend` (matches reality)
- [ ] **SC4. Add S3 retry logic** — `backend/blob.ts`: add exponential backoff with jitter for transient S3 failures (throttling, network errors). AWS SDK v3 has built-in retry — verify it's configured.
- [ ] **D4. Persist parser diagnostics** — store diagnostics per booq (in `uu_assets.meta` or a dedicated column) so admins can debug parse/render issues without re-parsing.
- [ ] **P4. Improve EPUB file caching** — `backend/library.ts`: replace single-file `cachedFile` variable with an LRU cache (e.g. `lru-cache` package) holding the N most recent EPUBs.

## Future / Low Priority

- [ ] **SC6. Plan for notes table growth** — monitor index sizes; consider date-based partitioning when approaching millions of rows.
- [ ] **SC7. Monitor Redis command budget** — track Upstash usage; plan upgrade to paid tier before hitting limits.
- [ ] **SC8. Tune database connection pooling** — review Neon serverless defaults; consider explicit pool size and timeout configuration.
- [ ] **S9. Harden EPUB path resolution** — `parser/path.ts`: explicitly reject `../` segments, even though in-memory ZIP prevents filesystem traversal.
- [ ] **P8. Paginate large booq payloads** — consider streaming or chunking `Booq.nodes()` and `Booq.styles()` responses for very large books.
- [ ] **P9. Bound table of contents responses** — add a max-items limit to TOC queries.
