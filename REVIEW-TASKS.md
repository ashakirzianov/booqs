# Review Tasks

Ordered by priority — combining severity, effort, and dependencies. Quick security/correctness wins first, then hardening, then larger structural work.

---

## Quick Security & Correctness Fixes

- [ ] **S1. Fix bookmark deletion ownership check** — `backend/bookmarks.ts`: `deleteBookmark` takes only `id`. Add `userId` param and `AND user_id = ${userId}` to the WHERE clause. Update `graphql/mutation.ts:77` to pass `userId`.
- [ ] **S5. Throw on missing JWT secret** — `backend/config.ts:17`: replace `?? 'fake secret'` with a runtime error if `BOOQS_AUTH_SECRET` is undefined in production.
- [ ] **S10. Whitelist image variant formats** — `backend/variants.ts`: change the variant spec regex to only accept `webp|avif|png|jpg` instead of `\w+`.
- [ ] **C2. Fix `updated_at` → `updatedAt` in notes optimistic update** — `application/notes.ts:229`: snake_case field name doesn't match the `BooqNote` type.
- [ ] **P7. Fix notes default sort order** — `backend/notes.ts`: change `ORDER BY created_at ASC` to `DESC` (newest-first), or confirm the frontend intentionally reverses.

## GraphQL Hardening

- [ ] **S3. Add query depth and complexity limits** — `app/api/graphql/route.ts`: add `depthLimit` plugin (e.g. `graphql-depth-limit` or yoga's built-in `useDisableIntrospection`) and a max complexity rule.
- [ ] **S7. Disable introspection in production** — same file: conditionally disable introspection when `NODE_ENV === 'production'`.
- [ ] **P2. Cap maximum query limits** — `graphql/query.ts`: add `const MAX_LIMIT = 100` and wrap all `limit` args with `Math.min(limit ?? defaultLimit, MAX_LIMIT)`. Also apply to `/api/search/route.ts` offset/limit.
- [ ] **D2. Standardize mutation error responses** — replace bare `boolean` and `undefined` returns in `graphql/mutation.ts` with a consistent result shape (e.g. `{ success: boolean, error?: string }`). Update GraphQL schema accordingly.
- [ ] **D5. Tighten GraphQL schema nullability** — review `Bookmark` and `Note` types in `graphql/schema.graphql`; make fields non-null where they are always present.

## Security Headers & Input Validation

- [ ] **S4. Add security headers** — create `middleware.ts` (or configure in `next.config.js`) to set: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`. Consider a basic `Content-Security-Policy`.
- [ ] **S6. Add Zod validation on API route inputs** — add request body schemas to: `/api/notes/[id]` (POST, PATCH), `/api/collections/[name]` (POST, DELETE), `/api/search` (limit/offset bounds), `/api/copilot/answer`. Replace unsafe `as BooqId` casts with parsed types.
- [ ] **S8. Add CSRF protection for GraphQL mutations** — verify `Origin` header against allowed origins in the GraphQL route handler, or add `SameSite=Strict` to auth cookies.

## Code Clarity Fixes

- [ ] **C8. Replace `catch (err: any)` with `catch (err: unknown)`** — in `application/passkeys.ts` (3 occurrences), `backend/users.ts`. Use `err instanceof Error ? err.message : String(err)` for message extraction.
- [ ] **C1. Document `pph` property** — `core/model.ts:27`: add a JSDoc comment explaining what `pph` stands for and when it's set.
- [ ] **C4. Rename `hl` → `note`** — `reader/nodes.ts:84`: the filter callback parameter should match the collection it filters.
- [ ] **C5. Document magic numbers** — `core/chapter.ts:107` (`chapterLength = 4500`), `backend/library.ts:109` (`PREVIEW_LENGTH = 500`): add comments explaining the unit and rationale.
- [ ] **C7. Inline or document `noteFromJson`** — `data/notes.ts:247`: this no-op passthrough function either needs a comment explaining its purpose or should be inlined.
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
