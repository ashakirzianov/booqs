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
