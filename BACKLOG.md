# Backlog

Low-priority improvements and technical debt.

---

## Epub relative path resolution

**Priority**: Low

- [ ] Implement proper relative path resolution for epub image srcs instead of stripping `../` prefixes

Currently `normalizeImageSrc` in `backend/parse.ts` strips `../` prefixes from image srcs. This works for the standard epub layout where all content lives under one root directory (e.g., `OEBPS/`), but would break for deeply nested structures where `../` traverses multiple levels. The root cause is that `booqs-epub`'s `resolveHref` just concatenates `basePath + href` without resolving `..`. A proper fix would either resolve paths correctly in `booqs-epub` or do full path resolution here.
