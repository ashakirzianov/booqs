# Phase 2: CSS `@scope` Migration

Detailed task list for Phase 2 of the [Big Model Migration](model-migration.md). Design context in [CSS handling](../docs/css-handling.md) (see "Decided Architecture" section).

Each stage is an end-to-end change. The app must function on localhost after each stage. Test by loading EPUBs with varying CSS complexity, checking dark mode, and verifying style isolation.

Key design point: `@scope` wrapping happens **client-side at render time**, not during server-side processing. This is because `BooqStyles` stores CSS once per file (shared across documents), but the `@scope` selector is per-document (`[data-booqs-doc="N"]`).

## Stage 1: Server-side CSS processing changes

Replace `postcss-prefix-selector` with root selector rewriting and color stripping only. Change `BooqStyles` keys to canonical fileNames. Process inline `<style>` in-place. Remove `styleRefs`.

### CSS processing (`parser/css.ts`)

- [x] Remove `postcss-prefix-selector` — no more selector rewriting
- [x] Add root selector rewriting: `html`, `body`, `:root` → `:scope` (postcss plugin)
- [x] Update `processCss` signature — no longer needs `prefix` parameter
- [x] Update `rewriteColorsPlugin` — strip colors from global selectors only (including qualified variants like `body.class`)

### Style processing (`parser/styles.ts`)

- [x] Key `BooqStyles` by canonical fileName (e.g., `OEBPS/styles/main.css`) instead of generated prefix
- [x] Rewrite `<link>` element's `href` attribute to canonical fileName in the document tree
- [x] For inline `<style>` elements: process text content in-place (root selectors, color stripping), leave in tree
- [x] Process `<style>` elements everywhere in the tree, not just `<head>`
- [x] Return `{ documents, styles }` instead of mutating documents
- [x] Single-pass tree walk via `mapChildNodesAsync`
- [x] Remove `generateSelectorPrefix`, `findHead`

### Core

- [x] Remove `styleRefs` from `BooqDocument` (`core/model.ts`)
- [x] Add `mapChildNodesAsync` to `core/node.ts`
- [x] Add `buildFragment` in `core/fragment.ts` — style-aware range slicing that preserves `<head>`, `<style>`, `<link>` in partially-sliced documents
- [x] Move `BooqFragment` type to `core/fragment.ts`, rename `nodes` → `content` to mirror `Booq` shape
- [x] Update `buildChapter` to use `buildFragment` (removed `collectReferencedStyles`)
- [x] Add `DATA_DOC` constant to `core/attributes.ts`

### GraphQL

- [x] Rename `BooqFragment.nodes` → `BooqFragment.content` in schema
- [x] Rename `Booq.nodes` → `Booq.content` in schema and resolver

### Tests

- [x] 14 new tests for `buildFragment` in `tests/core/fragment.test.ts`

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (162/162)

---

## Stage 2: Client-side `@scope` rendering

Update the renderer to resolve styles from `<head>` elements, wrap in `@scope` at render time, and render `<head>` as a container.

### Viewer/Renderer (`viewer/render.ts`)

- [x] `renderDocumentNode`: add `data-booqs-doc="{spineIndex}"` attribute to `<section>` wrapper
- [x] `renderDocumentNode`: pass `spineIndex` through `RenderContext`
- [x] `renderDocumentNode`: remove `className` and `styleRefs`-based style injection
- [x] `mapElementName`: map `<head>` to `<div>` instead of skipping; use `withinHead` context to skip non-style children
- [x] `renderLinkNode`: render `<link rel="stylesheet">` as `<style>` with content from `BooqStyles[href]`, wrapped in `@scope`
- [x] `renderStyleNode`: render inline `<style>` elements wrapped in `@scope`
- [x] `wrapInScope(css, scopeSelector)` utility

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (162/162)

---

## ~~Stage 3: Inline style attribute sanitization~~ — skipped

Decision: do not sanitize inline `style` attributes. Inline styles are rare in well-formed EPUBs, and stripping them risks removing intentional author styling. Revisit if dark mode issues surface in practice. See [css-handling.md](../docs/css-handling.md) "Color stripping strategy".

---

## Stage 4: Cleanup and specificity audit

Remove unused dependencies, verify no regressions from specificity changes.

### Cleanup

- [x] Remove `postcss-prefix-selector` and `@types/postcss-prefix-selector` dependencies
- [x] Remove `css`, `css-select`, `@csstools/selector-specificity`, `postcss-selector-parser`, `@types/css` — all unused after dead code removal
- [x] Delete ~200 lines of dead code from `parser/css.ts` (`parseCss`, `applyRules`, `selectXml`, `processRules`, `buildRule`, `parseSelector`, all associated types)

### Specificity audit

- [x] No naked tag selectors in app CSS (`globals.css`, CSS modules)
- [x] Tailwind preflight uses `@layer base` — lower priority than unlayered `@scope` EPUB rules
- [x] No conflicts found

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (162/162)
- [x] Manual test with diverse EPUBs (PG books, user uploads, books with complex CSS)

---

## Deferred / Future work

- [ ] Per-spine-item isolation granularity — current per-document isolation may be insufficient if chapters within a single spine item have conflicting styles. Revisit if real-world EPUBs surface this issue.
- [ ] Shared stylesheet deduplication optimization — emit shared CSS once with combined scope selector instead of once per document. Revisit if full-book rendering shows measurable slowness.
- [ ] Donut scoping — `@scope (.booqs-content) to (.booqs-annotation)` to exclude annotation UI from EPUB styles. Consider when annotation rendering is revisited.
- [ ] Re-enable booq-level cache (`backend/library.ts`, `useCache = false` since Phase 1). The cache stores serialized `Booq` objects — must be invalidated/rebuilt after migration.
- [ ] Enumerate full list of EPUB CSS properties to sanitize for Next.js (beyond color stripping).
