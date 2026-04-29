# Phase 1: New Type Model + Parser Simplification

Detailed task list for Phase 1 of the [Big Model Migration](model-migration.md). Design context in [IR migration design](../docs/ir-design-migration.md).

Each stage is an end-to-end change (parser + core + renderer). The app must function on localhost after each stage. Test by loading a few EPUBs, navigating, checking highlights/notes.

## Stage 1: Type model

Purely structural rename — no behavior change. The app does exactly the same thing with new type names.

### Types (`core/model.ts`)

- [x] Define `BooqDocument` type (with `fileName`, `children: BooqChildNode[]`, optional `error` field; always has `children`, empty on error)
- [x] Define `BooqElement` type (with `name`, `id?`, `attributes?`, `children: BooqChildNode[]`)
- [x] Define `BooqChildNode = BooqElement | BooqTextNode | BooqStub`
- [x] Define `BooqTextNode = string`
- [x] Define `BooqStub = null`
- [x] Define `BooqNode = BooqDocument | BooqChildNode` (union; both `BooqDocument` and `BooqElement` have `children` via `?: undefined` discriminant fields)
- [x] Define `BooqElementAttributes = Record<string, string | undefined>`
- [x] Update `Booq`: `nodes` → `content: BooqDocument[]`
- [x] Remove old types: `BooqSectionNode`, `BooqElementNode`, `BooqTextNode` (old shape), `BooqStubNode`, `BooqNodeAttrs`

### Core utilities (`core/node.ts`, `core/position.ts`, `core/iterator.ts`, `core/text.ts`, `core/chapter.ts`)

- [x] Update type guards: `isElementNode`, `isTextNode`, `isStubNode` for new type shapes
- [x] Replace `isSectionNode` with `isDocumentNode` (checks `fileName` property)
- [x] Keep `isContainerNode` — checks for `children` property
- [x] Update `nodeChildren()`, `visitNodes()` for `BooqChildNode`
- [x] Replace `mapNodes()` with `mapDocumentNodes()` — transformer operates on `BooqChildNode`, preserves `BooqDocument[]` return type
- [x] Update `nodeForPath()`, `nodesForRange()`, `findPathForId()`
- [x] Update `stubNode()`, `textNode()` factories
- [x] Update `nodeLength()`, `nodesLength()`, `positionForPath()`
- [x] Update iterator functions (`iteratorAtPath`, `firstLeafNode`, etc.)
- [x] Update text functions (`nodeText`, `textForRange`, `previewForPath`, `getQuoteAndContext`, `getExpandedRange`)
- [x] Update `buildChapter()`, `collectReferencedStyles()` — use `isDocumentNode` instead of `isSectionNode`
- [x] Rename `attrs` → `attributes` in all core code that accesses element attributes

### Parser (`parser/`)

- [x] Rename `parseSection()` → `parseDocument()`, return `BooqDocument`
- [x] Rename `attrs` → `attributes` in `processRegularXml()`, `processAttributes()`
- [x] Update `processEpub()` in `book.ts`: collect into `BooqDocument[]`, set `Booq.content`
- [x] Update `pph.ts`: use `mapDocumentNodes`, take/return `BooqDocument[]`
- [x] Update `refs.ts`: use `mapDocumentNodes`, take/return `BooqDocument[]`
- [x] Update `preprocess.ts`: take/return `BooqDocument[]`

### Backend (`backend/parse.ts`)

- [x] Update `normalizeImageSrcsInBooq()`: access `node.attributes`, use `booq.content`
- [x] Update `collectUniqueSrcsFromBooq()`: access `node.attributes`, use `booq.content`
- [x] Update `preprocessBooq()`: use `mapDocumentNodes`, no cast needed

### Viewer/Renderer (`viewer/render.ts`, `viewer/BooqContent.tsx`)

- [x] Update `renderNode()`: use `isDocumentNode` instead of `isSectionNode`
- [x] Rename `renderSectionNode()` → `renderDocumentNode()` (still renders as `<section>` with style injection for now)
- [x] Update `getProps()`: access `node.attributes` instead of `node.attrs`

### Data layer (`data/booqs.ts`)

- [x] Update chapter building and note range expansion to use `Booq.content`

### GraphQL

- [x] Update all resolvers to use `booq.content` instead of `booq.nodes`

### Tests (`tests/`)

- [x] Update `tests/core/iterator.test.ts` for new type shapes
- [x] Update `tests/core/text.test.ts` for new type shapes

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (148/148)
- [x] Load PG book, navigate chapters, verify rendering
- [x] Load user-uploaded book, verify rendering
- [x] Verify notes/highlights display correctly
- [x] Verify internal links work

### Conventions established

- [x] Document union discriminant fields convention in CLAUDE.md
- [x] Document `as` type assertion comment requirement in CLAUDE.md
- [x] Disable booq-level cache during migration (remember to re-enable after)

---

## Stage 2: Stop camelCasing attributes

Parser stores XML attributes as-is. Renderer normalizes for React.

### Parser (`parser/section.ts`)

- [x] Remove camelCase conversions — `processAttributes()` removed entirely, href handling inlined into `processRegularXml()`
- [x] Keep `href` transformation for now (handled in Stage 6)

### Backend (`backend/parse.ts`)

- [x] Update image src access: `node.attributes?.xlinkHref` → `node.attributes?.['xlink:href']`

### Viewer/Renderer (`viewer/render.ts`)

- [x] Add `normalizeAttributes()` function with `attributeNameMap` table
- [x] Handle `class` → `className`, `colspan` → `colSpan`, `rowspan` → `rowSpan`, `cellspacing` → `cellSpacing`, `cellpadding` → `cellPadding`
- [x] Handle `xml:space` → `xmlSpace`, `xml:lang` → `xmlLang`, `xmlns:xlink` → `xmlnsXlink`, `xlink:href` → `xlinkHref`
- [x] Update `getProps()` to use `normalizeAttributes()`

### Core utilities

- [x] `getExpandedRange()` in `core/text.ts` — no change needed, doesn't access `className`

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (148/148)
- [x] Verify CSS classes apply correctly (class → className mapping works)
- [-] Verify tables render correctly (colspan/rowspan mapping works)

---

## Stage 3: Keep `<html>` and `<body>`

Parser preserves these elements. Renderer maps them during rendering.

### Parser (`parser/section.ts`)

- [x] Stop renaming `<body>` to `<div>` — `<body>` preserved as-is
- [x] Keep `<html>` element in the tree — `processSectionContent` wraps children in an `<html>` element (preserving its attributes)
- [x] `BooqDocument.children` now contains a single `<html>` element

### Viewer/Renderer (`viewer/render.ts`)

- [x] Add `mapElementName()` function: `<html>` → `<div>`, `<body>` → `<div>`, `<a>` within anchor → `<span>`
- [x] Refactored element name mapping out of inline ternary

### Core utilities

- [x] Tree traversal functions work unchanged — paths now go through `<html>` and `<body>` elements, no hardcoded assumptions found

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (148/148)
- [x] Verify rendering looks identical (body/html mapping produces same visual output)
- [x] Verify BooqPath values work correctly with the new tree depth

---

## Stage 4: Keep `<style>` elements in tree

Parser keeps `<style>` elements. CSS preprocessing moves to post-processing. Renderer resolves styles from `<head>`.

### Parser (`parser/section.ts`)

- [x] `<style>` and `<link>` processed as regular elements via `processRegularXml` — kept in tree
- [x] Removed `processStyleXml`, `processLink`, `processHead`, CSS accumulation in `env.css`
- [x] Removed `generateSelectorPrefix`, `isEmptyText`, unused imports
- [x] Simplified `Env` type — removed `css`, `styleRefs`, `styles`, `resolveTextFile`, `id`

### Post-processing (`parser/preprocessStyles.ts`)

- [x] New `preprocessStyles` module: walks `<head>` in each document, finds `<link>` and `<style>` elements
- [x] For `<link>`: loads CSS via epub, preprocesses, stores in `BooqStyles`
- [x] For `<style>`: preprocesses text content, stores in `BooqStyles`
- [x] Sets `styleRefs` on each document (kept for now — CSS scoping relies on class-name-based selectors; removal deferred to Phase 2 `@scope` migration)

### Core (`core/chapter.ts`)

- [x] `collectReferencedStyles()` unchanged — still reads `styleRefs` (deferred to Phase 2)

### Viewer/Renderer (`viewer/render.ts`)

- [x] Unchanged — still reads `styleRefs` from document nodes (deferred to Phase 2)

### Types (`core/model.ts`)

- [-] `styleRefs` kept on `BooqDocument` for now — populated during post-processing; removal deferred to Phase 2

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (148/148)
- [ ] Verify CSS styling applies correctly across sample EPUBs
- [ ] Verify per-chapter style isolation still works

---

## Stage 5: Keep `<script>` elements in tree

Small change — parser keeps `<script>` elements but strips their content.

### Parser (`parser/section.ts`)

- [x] `<script>` kept in tree as element with empty `children` (content stripped)
- [x] Processed in `processXml` switch case — preserves attributes, strips children

### Viewer/Renderer (`viewer/render.ts`)

- [x] Already handled — `mapElementName` returns `null` for `script` (added in Stage 3)

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (148/148)

---

## Stage 6: ID scoping + href resolution in post-processing

Move ID scoping and href resolution from parser to post-processing. Use new scoping scheme. Enable browser-native `#id` navigation.

### Parser (`parser/section.ts`)

- [x] Removed `processId()` — IDs stored as-is from XML
- [x] Removed `transformHref()` — hrefs stored as-is from XML

### Post-processing (`parser/scopeIds.ts`)

- [x] `scopeIdsAndResolveHrefs`: scopes IDs using `booqs-{spineIndex}-{basename}--{originalId}` scheme
- [x] Builds transient `HrefToPathMap` (`"fileName#id" → BooqPath`), returned alongside documents
- [x] Rewrites internal `href` to `#scopedId` for browser-native in-range scroll
- [x] Adds `data-booqs-ref-path` attribute for renderer to decide in-range vs out-of-range
- [x] Uses `fileName → docIndex` map to compute scoped IDs deterministically (no separate scopedId map needed)

### Href resolution (`parser/href.ts`)

- [x] New `resolveHref(href, baseFileName)` utility — canonical resolution for all EPUB-internal hrefs
- [x] Handles `#id`, `file.xhtml#id`, `../file.xhtml#id`, proper `../` traversal at any depth
- [x] Replaces `resolveRelativePath` (deleted `parser/path.ts`) and ad-hoc heuristics in `toc.ts`
- [x] `hrefToKey()` produces canonical map keys

### Preprocessing pipeline (`parser/process.ts`)

- [x] Unified `processDocuments()` returns `{ documents, styles, hrefToPathMap }`
- [x] `hrefToPathMap` built once, shared between `scopeIdsAndResolveHrefs` and `buildToc`

### TOC (`parser/toc.ts`)

- [x] Uses shared `hrefToPathMap` from preprocessing (no duplicate tree walk)
- [x] Stores scoped `id` on TOC items (for future ID-based navigation)
- [x] TOC href resolution via `resolveHref` — TODO for proper base path from `booqs-epub` (backlog item added)

### Viewer/Renderer (`viewer/render.ts`)

- [x] Elements get `data-booqs-path` for path tracking, preserve scoped `id` from EPUB attributes
- [x] Augmentation spans get both `data-booqs-path` and `id=pathToId`
- [x] In-range links use already-rewritten `href="#scopedId"` (browser-native scroll)
- [x] Out-of-range links use `hrefForPath` callback (cross-chapter navigation)
- [x] `mapElementName()` skips `<head>`, `<link>`, `<script>`, `<meta>`, `<title>` during rendering

### Selection and scroll (`viewer/selection.ts`, `viewer/scroll.ts`, `viewer/misc.ts`)

- [x] Selection reads `data-booqs-path` via `dataset` instead of `pathFromId(id)`
- [x] Scroll tracking reads `data-booqs-path` from paragraph elements
- [x] `useScrollToPath` uses `querySelector('[data-booqs-path="..."]')` instead of `getElementById`

### Core

- [x] Removed `ref` field from `BooqElement` type
- [x] Removed `id` field from `BooqElement` — id is now just an attribute
- [x] Exported `mapChildNodes` from `core/node.ts`
- [x] New `core/attributes.ts` — single source of truth for all custom `data-*` attribute names
- [x] Convention documented in CLAUDE.md

### Parser cleanup

- [x] Deleted `parserUtils.ts`, `refs.ts`, `path.ts`
- [x] Renamed `preprocess.ts` → `process.ts`, `preprocessStyles.ts` → `styles.ts`
- [x] Simplified `section.ts` — `processAttributes` removed, `processId` removed

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (148/148)
- [x] Selection works
- [x] In-book links navigate correctly
- [x] TOC navigation works
- [ ] Verify no ID collisions across chapters (manual check with book that has repeated IDs)

---

## Stage 7: Paragraph marking via data attribute

Replace `pph: boolean` property with `data-booqs-pph` attribute.

### Parser (`parser/pph.ts`)

- [x] `markParagraphs()` adds `[DATA_PPH]: ''` to element attributes
- [x] `DATA_PPH` constant in `core/attributes.ts`

### Core (`core/text.ts`)

- [x] `getExpandedRange()` checks `node.attributes?.[DATA_PPH]` instead of `node.pph`

### Viewer/Renderer (`viewer/render.ts`)

- [x] `getProps()` checks `node.attributes?.[DATA_PPH]` → adds `booqs-pph` CSS class

### Types (`core/model.ts`)

- [x] Removed `pph` field from `BooqElement`

### Tests

- [x] Updated `createParagraph` helper to use `DATA_PPH` attribute

### Verify

- [x] `npm run build` passes
- [x] `npm run test` passes (148/148)
- [ ] Verify scroll position tracking works
- [ ] Verify paragraph-level range expansion works for notes

---

## Stage 8: Image processing in post-processing

Move image dimension probing and CDN URL resolution to the post-processing pipeline with data attributes.

### Backend (`backend/parse.ts`)

- [ ] Refactor `normalizeImageSrcsInBooq()` into a post-processing step
- [ ] For internal images: resolve path to CDN URL, store original path in `data-booqs-original-src`, store CDN URL in `src`
- [ ] Probe image dimensions via `sharp`, store as `data-booqs-width` and `data-booqs-height` attributes
- [ ] For external images (absolute URLs): leave `src` as-is, no data attributes

### Viewer/Renderer (`viewer/render.ts`)

- [ ] Read `data-booqs-width` and `data-booqs-height` to set image dimensions
- [ ] Handle external vs internal images if needed

### Post-processing pipeline

- [ ] Integrate image processing into the post-processing pipeline alongside CSS, ID scoping, paragraph marking
- [ ] Ensure image processing runs after ID scoping (image elements may have IDs)

### Verify

- [ ] `npm run build` passes
- [ ] Verify images display with correct dimensions
- [ ] Verify cover images load correctly
- [ ] Verify SVG images with `xlink:href` work

---

## Final cleanup

After all stages are complete:

- [ ] Remove any dead code, unused imports, orphaned utilities
- [ ] Verify no references to old type names remain (`BooqSectionNode`, `BooqElementNode`, `BooqNodeAttrs`, etc.)
- [ ] Run full `npm run build` and `npm run lint`
- [ ] Manual end-to-end test with diverse EPUBs (PG books, user uploads, complex CSS, tables, SVG, images)
