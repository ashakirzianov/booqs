# Phase 1 Handoff Notes

Context for continuing work after Phase 1 of the Big Model Migration.

## What was accomplished

Phase 1 (8 stages) is complete. The IR has been migrated from the old `BooqNode` union to the new `BooqDocument`/`BooqElement` model. See [model-migration-phase-1-ir.md](model-migration-phase-1-ir.md) for detailed task status and [../docs/ir-design-migration.md](../docs/ir-design-migration.md) for the design with divergences documented.

## Key decisions made during Phase 1

### Type model
- `BooqNode` is a union (`BooqDocument | BooqChildNode`), not an interface. Union discriminant fields (`?: undefined`) enable safe property access.
- `id` removed from `BooqElement` — it's just an attribute. Access via `node.attributes?.id`.
- `ref` and `pph` removed from `BooqElement` — replaced by `data-booqs-ref-path` and `data-booqs-paragraph` attributes.
- `Booq.content` (not `Booq.documents`) holds the document array.
- Convention: every `as Type` cast requires a comment explaining why.
- Convention: all custom `data-*` attributes defined in `core/attributes.ts`.

### Parser architecture
- Parser is minimal — `processXml` handles all elements uniformly, no special-casing of `html`/`head`/`body`.
- `processDocuments()` in `parser/process.ts` is the single post-processing entry point, returns `{ documents, styles, hrefToPathMap }`.
- `resolveHref()` in `parser/href.ts` is the canonical href resolution utility, used everywhere.
- `mapDocumentNodes` + `mapChildNodes` replace the old `mapNodes`.

### ID scoping and navigation
- IDs scoped using `booqs-{spineIndex}-{basename}--{originalId}` scheme.
- Internal `href` values rewritten to `#scopedId` in post-processing.
- `data-booqs-ref-path` attribute carries serialized `BooqPath` for renderer to decide in-range (scroll) vs out-of-range (page navigation).
- Browser-native `#id` scroll works for in-range links. Cross-chapter links use `hrefForPath` callback.
- `HrefToPathMap` built once in `processDocuments`, shared with `buildToc`.

### Rendering
- Elements get `data-booqs-path` for path tracking (selection, scroll). Scoped `id` preserved from EPUB.
- Augmentation spans get both `data-booqs-path` and `id=pathToId`.
- `normalizeAttributes()` converts XML attribute names to React props at render time.
- `mapElementName()` maps elements: `html`/`body` → `div`, `head`/`link`/`script`/`meta`/`title` → skip.
- Selection and scroll tracking read `data-booqs-path` via `dataset` property.

### Image processing
- Kept as standard HTML attributes (`src`, `width`, `height`), not data attributes. No benefit to data attributes.
- Image paths resolved via `resolveHref` relative to each document's `fileName`.

## Deferred / known issues

### Booq-level cache disabled
Cache in `backend/library.ts` is disabled during migration (`useCache = false`). Must be re-enabled after migration completes. The cache stores serialized `Booq` objects — the new type shape differs from cached data.

### `styleRefs` still on `BooqDocument`
CSS scoping relies on class-name-based selectors. `styleRefs` is populated during post-processing (not parsing), but removing it requires changing the CSS scoping approach. This is Phase 2 work.

### TOC href resolution base path
TOC hrefs should resolve relative to the TOC file's location, but `booqs-epub` doesn't expose the TOC file path. Currently assumes TOC hrefs are in the same coordinate space as document fileNames. Backlog item added in `tasks/backlog.md`.

### CommentsPanel link scrolling
`reader/CommentsPanel.tsx` uses `#pathToId(comment.range.start)` for links to comment locations. With the new model, elements no longer have path-based IDs. The link sets a URL hash that `useHashPath` could pick up, but `useHashPath` is not connected to `useScrollToPath` in the reader. Needs fixing.

### Per-chapter style isolation
Not verified. Currently all styles are passed to every fragment via `collectReferencedStyles` which reads `styleRefs`. This should work but hasn't been tested with books that have conflicting per-chapter styles.

## Phase 2: CSS `@scope` migration

See [../docs/css-handling.md](../docs/css-handling.md) for the full design. Key tasks:

- Replace `postcss-prefix-selector` with `@scope (.booqs-content) { ... }` wrapping
- Root selector rewriting (`html`, `body`, `:root` → `:scope`)
- Inline `style` attribute sanitization for theming
- Remove `styleRefs` from `BooqDocument` — styles resolved from `<head>` elements
- Remove class-name-based scoping on `<section>` wrappers
- Verify specificity changes don't break styling

Phase 2 task list to be created at `tasks/model-migration-phase-2-css.md`.

## Files changed in Phase 1

### New files
- `core/attributes.ts` — custom data attribute constants
- `parser/process.ts` — unified post-processing pipeline
- `parser/scopeIds.ts` — ID scoping and href resolution
- `parser/styles.ts` — CSS preprocessing (was `preprocessStyles.ts`)
- `parser/href.ts` — canonical href resolution utility

### Deleted files
- `parser/refs.ts` — replaced by `scopeIds.ts`
- `parser/parserUtils.ts` — `transformHref` no longer needed
- `parser/path.ts` — `resolveRelativePath` replaced by `href.ts`
- `parser/pph.ts` — inlined into `process.ts`
- `parser/preprocess.ts` — renamed to `process.ts`
- `parser/preprocessStyles.ts` — renamed to `styles.ts`

### Significantly changed files
- `core/model.ts` — new type model
- `core/node.ts` — updated type guards, `mapDocumentNodes`/`mapChildNodes`, removed `findPathForId`
- `core/text.ts` — uses `isMarkedAsParagraph`
- `core/chapter.ts` — uses `isDocumentNode`
- `parser/section.ts` — minimal parser, uniform element processing
- `parser/book.ts` — uses `processDocuments`
- `parser/toc.ts` — uses `resolveHref` and shared `hrefToPathMap`
- `viewer/render.ts` — `data-booqs-path`, `normalizeAttributes`, `mapElementName`
- `viewer/selection.ts` — reads `data-booqs-path`
- `viewer/scroll.ts` — reads `data-booqs-path`
- `backend/parse.ts` — `resolveHref` for image paths
- `CLAUDE.md` — new conventions (discriminant fields, type assertions, data attributes)
