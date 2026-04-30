# Phase 2: CSS `@scope` Migration

Detailed task list for Phase 2 of the [Big Model Migration](model-migration.md). Design context in [CSS handling](../docs/css-handling.md) (see "Decided Architecture" section).

Each stage is an end-to-end change. The app must function on localhost after each stage. Test by loading EPUBs with varying CSS complexity, checking dark mode, and verifying style isolation.

Key design point: `@scope` wrapping happens **client-side at render time**, not during server-side processing. This is because `BooqStyles` stores CSS once per file (shared across documents), but the `@scope` selector is per-document (`[data-booqs-doc="N"]`).

## Stage 1: Server-side CSS processing changes

Replace `postcss-prefix-selector` with root selector rewriting and color stripping only. Change `BooqStyles` keys to canonical fileNames. Process inline `<style>` in-place. Remove `styleRefs`.

### CSS processing (`parser/css.ts`)

- [ ] Remove `postcss-prefix-selector` — no more selector rewriting
- [ ] Add root selector rewriting: `html`, `body`, `:root` → `:scope` (as a postcss plugin or string transform)
- [ ] Update `processCss` signature — no longer needs `prefix` parameter
- [ ] Keep `rewriteColorsPlugin` unchanged

### Style processing (`parser/styles.ts`)

- [ ] Key `BooqStyles` by canonical fileName (e.g., `OEBPS/styles/main.css`) instead of generated prefix
- [ ] Rewrite `<link>` element's `href` attribute to canonical fileName in the document tree
- [ ] For inline `<style>` elements: process text content in-place (root selectors, color stripping), leave in tree
- [ ] Stop setting `styleRefs` on `BooqDocument`
- [ ] Remove `generateSelectorPrefix` function

### Types (`core/model.ts`)

- [ ] Remove `styleRefs` from `BooqDocument`

### Verify

- [ ] `npm run build` passes
- [ ] (App will not display styles correctly until Stage 2 — renderer still reads `styleRefs`)

---

## Stage 2: Client-side `@scope` rendering

Update the renderer to resolve styles from `<head>` elements, wrap in `@scope` at render time, and render `<head>` as a container.

### Viewer/Renderer (`viewer/render.ts`)

- [ ] `renderDocumentNode`: remove `styleRefs`-based style injection
- [ ] `renderDocumentNode`: add `data-booqs-doc="{spineIndex}"` attribute to `<section>` wrapper (spineIndex derived from document's position in `ctx.path`)
- [ ] `renderDocumentNode`: remove `className` from `<section>` wrapper (no longer needed for scoping)
- [ ] Update `mapElementName`: map `<head>` to `<div>` instead of `null` (so its children are rendered)
- [ ] Inside `<head>`, keep skipping `<meta>`, `<title>`, `<script>` (already skipped)
- [ ] Render `<link rel="stylesheet">` as `<style>` element: look up content from `BooqStyles[href]`, wrap in `@scope ([data-booqs-doc="N"]) { ... }`
- [ ] Render inline `<style>` elements: wrap content in `@scope ([data-booqs-doc="N"]) { ... }` (content already processed on server)

### Core (`core/chapter.ts`)

- [ ] Update `collectReferencedStyles` — walk `<head>` for `<link>` elements, collect by canonical fileName instead of `styleRefs`
- [ ] Remove references to `styleRefs`

### Core (`core/attributes.ts`)

- [ ] Add `DATA_BOOQS_DOC` constant for `data-booqs-doc`

### Verify

- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] Verify CSS applied correctly — linked stylesheets render via `<style>` lookup
- [ ] Verify inline `<style>` elements render correctly
- [ ] Verify per-document isolation — styles from Doc A don't affect Doc B in multi-document fragments
- [ ] Verify dark mode styling

---

## ~~Stage 3: Inline style attribute sanitization~~ — skipped

Decision: do not sanitize inline `style` attributes. Inline styles are rare in well-formed EPUBs, and stripping them risks removing intentional author styling. Revisit if dark mode issues surface in practice. See [css-handling.md](../docs/css-handling.md) "Color stripping strategy".

---

## Stage 4: Cleanup and specificity audit

Remove unused dependencies, verify no regressions from specificity changes.

### Cleanup

- [ ] Remove `postcss-prefix-selector` dependency from `package.json`
- [ ] Clean up any dead code paths related to old selector rewriting

### Specificity audit

- [ ] Grep global CSS (Tailwind, `globals.css`, CSS modules) for naked tag selectors (`h1`, `p`, `a`, `table`, etc.) that could now override EPUB rules
- [ ] Verify EPUB styling isn't broken by the specificity change (old: `.prefix h1` at 0,1,1; new: `h1` inside `@scope` at 0,0,1)
- [ ] Fix any conflicts found (namespace app CSS or increase EPUB rule specificity)

### Verify

- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] Manual test with diverse EPUBs (PG books, user uploads, books with complex CSS)
- [ ] Verify no visual regressions from specificity changes

---

## Deferred / Future work

- [ ] Per-spine-item isolation granularity — current per-document isolation may be insufficient if chapters within a single spine item have conflicting styles. Revisit if real-world EPUBs surface this issue.
- [ ] Shared stylesheet deduplication optimization — emit shared CSS once with combined scope selector instead of once per document. Revisit if full-book rendering shows measurable slowness.
- [ ] Donut scoping — `@scope (.booqs-content) to (.booqs-annotation)` to exclude annotation UI from EPUB styles. Consider when annotation rendering is revisited.
- [ ] Re-enable booq-level cache (`backend/library.ts`, `useCache = false` since Phase 1). The cache stores serialized `Booq` objects — must be invalidated/rebuilt after migration.
- [ ] Enumerate full list of EPUB CSS properties to sanitize for Next.js (beyond color stripping).
