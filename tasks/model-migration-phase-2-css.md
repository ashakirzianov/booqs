# Phase 2: CSS `@scope` Migration

Detailed task list for Phase 2 of the [Big Model Migration](model-migration.md). Design context in [CSS handling](../docs/css-handling.md) (see "Decided Architecture" section).

Each stage is an end-to-end change. The app must function on localhost after each stage. Test by loading EPUBs with varying CSS complexity, checking dark mode, and verifying style isolation.

## Stage 1: Replace selector prefixing with `@scope` wrapping

Replace `postcss-prefix-selector` with `@scope` wrapping. Per-document isolation via spine-index-based scope selector.

### CSS processing (`parser/css.ts`)

- [ ] Replace `postcss-prefix-selector` call with `@scope` wrapping — wrap processed CSS in `@scope ([data-booqs-doc="{spineIndex}"]) { ... }`
- [ ] Add root selector rewriting: `html`, `body`, `:root` → `:scope` (as a postcss plugin or string transform)
- [ ] Update `processCss` signature — accept `spineIndex: number` instead of `prefix: string`
- [ ] Keep `rewriteColorsPlugin` unchanged

### Style processing (`parser/styles.ts`)

- [ ] Key `BooqStyles` by canonical fileName (e.g., `OEBPS/styles/main.css`) instead of generated prefix
- [ ] Pass spine index (document index) to `processCss` for the `@scope` selector
- [ ] Rewrite `<link>` element's `href` attribute to canonical fileName in the document tree
- [ ] For inline `<style>` elements: process text content in-place (root selectors, color stripping, `@scope` wrapping), leave in tree
- [ ] Stop setting `styleRefs` on `BooqDocument`

### Types (`core/model.ts`)

- [ ] Remove `styleRefs` from `BooqDocument`

### Verify

- [ ] `npm run build` passes
- [ ] Verify CSS styling applies correctly (styles still scoped properly)
- [ ] Verify dark mode works (color stripping still active)

---

## Stage 2: Update renderer to use `@scope` styles

Update the renderer to resolve styles from `<head>` elements instead of `styleRefs`, and render `<head>` as a container.

### Viewer/Renderer (`viewer/render.ts`)

- [ ] `renderDocumentNode`: remove `styleRefs`-based style injection
- [ ] `renderDocumentNode`: add `data-booqs-doc="{spineIndex}"` attribute to `<section>` wrapper (where spineIndex is derived from the document's position in `ctx.path`)
- [ ] `renderDocumentNode`: remove `className` from `<section>` wrapper (no longer needed for scoping)
- [ ] Update `mapElementName`: map `<head>` to `<div>` instead of `null` (so its children are rendered)
- [ ] Inside `<head>`, keep skipping `<meta>`, `<title>`, `<script>` (already skipped)
- [ ] Render `<link rel="stylesheet">` as `<style>` element with content from `BooqStyles[href]`
- [ ] Render inline `<style>` elements as-is (already processed on server)

### Core (`core/chapter.ts`)

- [ ] Update `collectReferencedStyles` — walk `<head>` for `<link>` elements, collect by canonical fileName instead of `styleRefs`
- [ ] Remove references to `styleRefs`

### Verify

- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] Verify CSS applied correctly — linked stylesheets render via `<style>` lookup
- [ ] Verify inline `<style>` elements render correctly
- [ ] Verify per-document isolation — styles from Doc A don't affect Doc B in multi-document fragments
- [ ] Verify dark mode styling

---

## Stage 3: Inline style attribute sanitization

Strip theme-affecting properties from inline `style` attributes during processing.

### Processing (`parser/process.ts` or `parser/styles.ts`)

- [ ] Add inline style sanitization step: walk all elements, strip `color`, `background`, `background-color` from `style` attributes
- [ ] Keep layout properties (margins, padding, alignment, etc.)
- [ ] Decide where this lives — either in `processDocuments` pipeline or as part of `processStyles`

### Verify

- [ ] `npm run build` passes
- [ ] Verify elements with inline `style="color: #000"` render correctly in dark mode
- [ ] Verify layout-related inline styles (margins, text-align) still apply

---

## Stage 4: Cleanup and specificity audit

Remove unused code, verify no regressions from specificity changes.

### Cleanup

- [ ] Remove `postcss-prefix-selector` dependency from `package.json`
- [ ] Remove unused `prefix` parameter plumbing from CSS processing
- [ ] Remove `generateSelectorPrefix` function from `parser/styles.ts`
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
