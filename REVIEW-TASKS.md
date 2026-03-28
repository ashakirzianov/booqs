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
- [x] **D2. Standardize mutation error responses** — added `MutationResult` type (`{ success: Boolean!, error: String }`) and replaced all 15 `Boolean`-returning mutations. Clients can now distinguish auth failures, not-found, and operation errors.
- [x] **D5. Tighten GraphQL schema nullability** — made `Bookmark.id`, `Bookmark.path`, `Note.id`, `Note.targetQuote`, `Note.createdAt`, `Note.updatedAt` non-null. Left `kind` and `privacy` nullable (may be removed or relocated in future). Left `content`, `text`, `position`, `surroundingFragment`, `author`, `booq` nullable (genuinely optional or depend on async loading).

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
- [x] **C3. Clarify dynamic SQL in `updateUser`** — added explanatory comment, changed `values: any[]` to `unknown[]`.
- [x] **C6. Pick a constant naming convention** — standardized on `UPPER_SNAKE_CASE` across the codebase. Converted 4 camelCase constants in `core/path.ts` and `core/chapter.ts`.

## Performance Improvements

- [x] **P3. Add DataLoader for follower/following counts** — added batch functions in `backend/follows.ts`, created `followersCountLoader`/`followingCountLoader` in `graphql/loaders.ts`, updated resolvers.
- [x] **P6. Add cleanup to streaming cache** — `application/cache.ts`: delete cache entries when the last listener unsubscribes.
- [x] **P5. Cache user profiles and follow counts** — skipped: DataLoaders (P3) already solve the N+1 problem per-request. Cross-request Redis caching would add invalidation complexity for modest benefit.

## History Redesign

- [x] **P1 + SC1. Migrate reading history** — moved to BACKLOG. Upstash Redis persists data durably; no live traffic yet and history is non-critical. The in-memory pagination issue (P1) remains but is low priority until users have very large histories.

## Database Integrity

- [x] **SC2 + D3. Add transaction management for multi-step operations**:
  - `backend/uu.ts`: wrapped `insertRecord` + `addToRegistry` in `sql.transaction()` as `insertRecordAndRegister`
  - `backend/users.ts`: simplified `deleteUserForId` to rely on `ON DELETE CASCADE`, S3 cleanup is best-effort after
- [x] **SC5. Handle concurrent upload race condition** — added `UNIQUE` constraint on `file_hash` in schema, changed insert to `ON CONFLICT (file_hash) DO UPDATE`. Also added `ON CONFLICT DO NOTHING` on uploads registry.
- [x] **SC3. Set `maxDuration` on all long-running routes** — added to `/api/upload/confirm`, `/api/graphql`, `/api/copilot/answer`, `/api/copilot/answer/stream`, `/api/copilot/suggestions`.
- [ ] **UPL1. Optimize post-upload experience** — after a user uploads a book:
  - Fire image extraction via `after(() => extractAndUploadMissingOriginals(...))` like we do for variant generation
  - Cache the parsed booq JSON to S3 via `after()` so first read doesn't trigger a parse
  - Prime the in-memory `cachedFile` with the just-uploaded file so the first read is instant

## Rate Limiting

- [x] **S2. Add rate limiting** — moved to BACKLOG. Needs design work: per-user rate limiting requires extracting auth before GraphQL resolution, IP-based limiting penalizes VPN/NAT users. `@upstash/ratelimit` installed but not wired up.

## Larger Structural Work

- [x] **D1. Resolve GraphQL → backend layer violation** — false positive. The original hierarchy `backend > graphql > data` already allows `graphql` to access `backend` (higher layers access lower). No violation existed; no changes needed.
- [x] **SC4. Add S3 retry logic** — already handled: AWS SDK v3 defaults to 3 attempts with standard backoff. No changes needed.
- [ ] **D4. Persist parser diagnostics** — store diagnostics per booq (in `uu_assets.meta` or a dedicated column) so admins can debug parse/render issues without re-parsing.
- [ ] **P4. Improve EPUB file caching** — `backend/library.ts`: replace single-file `cachedFile` variable with an LRU cache (e.g. `lru-cache` package) holding the N most recent EPUBs.

## Future / Low Priority

- [ ] **SC6. Plan for notes table growth** — monitor index sizes; consider date-based partitioning when approaching millions of rows.
- [ ] **SC7. Monitor Redis command budget** — track Upstash usage; plan upgrade to paid tier before hitting limits.
- [ ] **SC8. Tune database connection pooling** — review Neon serverless defaults; consider explicit pool size and timeout configuration.
- [ ] **S9. Harden EPUB path resolution** — `parser/path.ts`: explicitly reject `../` segments, even though in-memory ZIP prevents filesystem traversal.
- [ ] **P8. Paginate large booq payloads** — consider streaming or chunking `Booq.nodes()` and `Booq.styles()` responses for very large books.
- [ ] **P9. Bound table of contents responses** — add a max-items limit to TOC queries.
