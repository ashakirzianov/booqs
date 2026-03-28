# Backlog

Low-priority improvements and technical debt.

---

## Epub relative path resolution

**Priority**: Low

- [ ] Implement proper relative path resolution for epub image srcs instead of stripping `../` prefixes

Currently `normalizeImageSrc` in `backend/parse.ts` strips `../` prefixes from image srcs. This works for the standard epub layout where all content lives under one root directory (e.g., `OEBPS/`), but would break for deeply nested structures where `../` traverses multiple levels. The root cause is that `booqs-epub`'s `resolveHref` just concatenates `basePath + href` without resolving `..`. A proper fix would either resolve paths correctly in `booqs-epub` or do full path resolution here.

---

## Internal links to section nodes

**Priority**: Low

- [ ] Support resolving internal book links that point to whole sections (e.g., `href="chapter3.xhtml"`)

Currently `findPathForId` in `core/node.ts` only matches element nodes by `id`. Section nodes don't have `id`, so links pointing to a chapter file (without a `#fragment`) fail to resolve. Additionally, href values may be relative (e.g., `chapter3.xhtml`) while section names include the directory prefix (e.g., `Text/chapter3.xhtml`), so even adding `id` to section nodes would require path normalization to match correctly.

---

## Reading history: sorted sets + PostgreSQL backup

**Priority**: Low

- [ ] Replace Redis hash (`hset`/`hgetall`) with sorted set (`ZADD`/`ZREVRANGE`) for server-side pagination
- [ ] Optionally add a `reading_history` PostgreSQL table for durability

Currently `booqHistoryForUser` loads the entire hash into memory and paginates client-side. This is fine for now (no live traffic, small histories) but will become a problem at scale. Upstash Redis persists data durably, so the PostgreSQL backup is not urgent.

---

## Unified search across library providers

**Priority**: Low

- [ ] Create a unified `book_metadata` table that all providers (pg, uu, future) populate with searchable fields (title, authors, subjects, languages, library_id, booq_id)
- [ ] Migrate existing `pg_metadata` search fields into the unified table
- [ ] Extract metadata from `uu_assets.meta` JSONB into the unified table on upload
- [ ] Replace per-library `query()` dispatch with a single cross-library search query
- [ ] Respect privacy semantics: PG books are public (visible to all), UU books are private (visible only to the uploader). The search query must filter by visibility — a user searching should see all PG results plus only their own UU uploads, never another user's uploads.
- [ ] Update GraphQL `search` query (currently hardcoded to `pg`) to use the unified search
- [ ] Consider whether the `Library.query()` interface should remain for library-specific browsing (e.g., browse by subject within PG) while unified search handles the cross-library case

Currently search only works for Project Gutenberg books via `LIKE` on `pg_metadata.title` and `pg_metadata.authors_text`. User uploads (`uu`) have metadata stored in JSONB but no search implementation (`// TODO: implement` in `backend/uu.ts`). The `search` GraphQL query is hardcoded to `pg`. Each library implements its own `query()` method independently with no cross-library aggregation.

---

## Full-text search upgrade

**Priority**: Low

- [ ] Replace `LIKE`-based search with PostgreSQL `tsvector`/`tsquery` for proper full-text search
- [ ] Use the `unaccent` extension (already loaded but unused) for diacritic-insensitive search
- [ ] Add relevance ranking to search results via `ts_rank`
- [ ] Consider stemming and language-aware search configuration
- [ ] Optionally extend to content search (searching within book text, not just metadata)

Currently search uses `lower(title) LIKE '%query%'` which has no ranking, no diacritic normalization, and no stemming. PostgreSQL's full-text search infrastructure (`tsvector`, `tsquery`, `ts_rank`) would provide all of these. The `unaccent` and `pg_trgm` extensions are already enabled in the schema but unused by search queries. This task is independent of the unified search table — it improves search quality regardless of whether search is per-library or unified.
