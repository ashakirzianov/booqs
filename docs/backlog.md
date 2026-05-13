# Backlog

Low-priority improvements and technical debt. Grouped by domain.

Conventions beyond TASKS.md: items carry a `#priority:low`/`#priority:medium` tag at the end of the title line since they may sit for months, and an optional indented context line for picking up cold.

### EPUB parsing and path resolution

- [ ] TOC href resolution: expose TOC file location from `booqs-epub`, pass as base to `resolveHref` in `toc.ts` #priority:medium
  Currently assumes TOC hrefs are in the same coordinate space as spine fileNames. Breaks when TOC is in a different directory.
- [ ] Proper relative path resolution for EPUB image srcs instead of stripping `../` prefixes #priority:low
  `normalizeImageSrc` in `backend/parse.ts` uses a hack. Needs proper `..` traversal in `booqs-epub` or here.
- [ ] Support internal book links that point to whole sections (e.g., `href="chapter3.xhtml"` without `#fragment`) #priority:low
  `findPathForId` only matches by `id`; section nodes don't have one. Also needs path normalization for relative hrefs.
- [ ] Explicitly reject `../` segments in parser path handling #priority:low
  Not exploitable (ZIP entries are keyed in memory), but defense-in-depth.

### CSS and styling

- [ ] Per-spine-item style isolation: investigate whether per-document `@scope` is sufficient or per-spine-item isolation is needed #priority:low
  Revisit if real-world EPUBs surface conflicting styles within a single spine item.
- [ ] Shared stylesheet deduplication: emit shared CSS once with combined scope selector instead of once per document #priority:low
  Only worth doing if full-book rendering (30+ chapters) shows measurable slowness.
- [ ] Donut scoping: use `@scope (.booqs-content) to (.booqs-annotation)` to exclude annotation UI from EPUB styles #priority:low
- [ ] EPUB CSS sanitization: enumerate full list of properties to sanitize beyond color stripping #priority:low
  Currently only `color`, `background`, `background-color` are stripped. May need `position: fixed`, `z-index`, `overflow` on global selectors.

### Reader rendering

- [ ] Web frontend performance audit: profile initial load, reader rendering, and large book handling #priority:medium
- [ ] Remove redundant span wrapping: skip augmentation wrappers for nodes with no augmentations; consider `data-booqs-path` only on paragraph-level elements #priority:low

### Search

- [ ] Unified search across library providers: create a `book_metadata` table all providers populate, replace per-library dispatch #priority:low
  Currently only PG is searchable; UU has no search. GraphQL `search` is hardcoded to `pg`.
- [ ] Full-text search upgrade: replace `LIKE` with `tsvector`/`tsquery`, add `unaccent` and `ts_rank` #priority:low
  Extensions are already enabled but unused. Independent of unified search.

### Annotations and locators

- [ ] New quote URL format with embedded locator: `p=2.4.6.12-2.4.6.45&t=prefix|text|suffix` #priority:medium
  See [booqs-locator-design.md](../archive/booqs-locator-design.md) "Quote sharing" section.
- [ ] Annotation healing: implement `resolveLocator()` algorithm, tree hash infrastructure, lazy per-book healing #priority:medium
  See [booqs-locator-design.md](../archive/booqs-locator-design.md) "Healing Design" section.
- [ ] Bookmark migration to BooqLocator (point locator with prefix/suffix) #priority:low
  Bookmarks aren't exposed in UI yet. Add locator context when they are.
- [ ] Annotations table partitioning: monitor index sizes, consider date-based partitioning at scale #priority:low

### API and infrastructure

- [ ] Rate limiting: design per-user strategy, tiered limits (auth/API/uploads), decide userId extraction approach #priority:medium
  `@upstash/ratelimit` installed. Key challenge: GraphQL auth happens inside yoga context, so route handler doesn't know userId before dispatch.
- [ ] Large payload pagination: consider streaming/chunking for very large books, max-items limit on TOC queries #priority:low
- [ ] Reading history: replace Redis hash with sorted set for server-side pagination; optionally add PostgreSQL backup #priority:low

### Code quality

- [ ] Review all `as Type` assertions: remove where narrowing can replace them, document remaining per CLAUDE.md convention #priority:low
- [ ] Document codebase layer by layer: purpose, key files, public API, and invariants per layer #priority:medium
- [ ] Expand test coverage starting with core/ and parser/; introduce DI for DB-access layers where needed #priority:medium
- [ ] Bot traffic mitigation: review `robots.txt` effectiveness, find alternatives to auth-gating as sole bot defense #priority:low
