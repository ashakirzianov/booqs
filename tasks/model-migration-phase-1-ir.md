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

- [ ] Stop scoping IDs in `processId()` — store original `id` values as-is
- [ ] Stop rewriting `href` via `transformHref()` — store original `href` values as-is

### Post-processing (new or expanded module)

- [ ] Implement ID scoping step: walk all documents, rewrite `id` attributes using `booqs-{spineIndex}-{basename}--{originalId}` scheme
- [ ] Build transient lookup table: `"fileName#id"` → scoped ID string
- [ ] Implement href resolution step: walk all documents, rewrite internal `href` attributes to `#scopedId` using the lookup table
- [ ] Handle edge cases: href to a file without fragment (`chapter2.xhtml` without `#id`), relative paths

### TOC (`parser/toc.ts`)

- [ ] Update TOC construction to use the transient lookup table for resolving entry hrefs to scoped IDs
- [ ] TOC items still store `BooqPath` — lookup table maps `fileName#id` → path as before

### Viewer/Renderer (`viewer/render.ts`)

- [ ] Remove `node.ref` handling from `getProps()` — links now use plain `href="#scopedId"` which browsers handle natively
- [ ] Remove `hrefForPath` callback — no longer needed

### Core

- [ ] Remove `ref` field from `BooqElement` type (or verify it was never added to new type)
- [ ] Remove or repurpose `findPathForId()` if no longer needed post-migration

### Parser cleanup

- [ ] Remove `transformHref()` from `parserUtils.ts`
- [ ] Remove `resolveRefs()` from `refs.ts`
- [ ] Update `preprocess.ts` to remove `resolveRefs` from the pipeline

### Verify

- [ ] `npm run build` passes
- [ ] Verify in-book links navigate correctly (click footnote ref → scrolls to footnote)
- [ ] Verify TOC navigation works
- [ ] Verify no ID collisions across chapters (check a book with repeated IDs)

---

## Stage 7: Paragraph marking via data attribute

Replace `pph: boolean` property with `data-booqs-pph` attribute.

### Parser (`parser/pph.ts`)

- [ ] Update `markParagraphs()`: instead of setting `pph: true`, add `'data-booqs-pph': ''` to `node.attributes`

### Core (`core/text.ts`)

- [ ] Update `getExpandedRange()`: check `node.attributes?.['data-booqs-pph']` instead of `node.pph`

### Viewer/Renderer (`viewer/render.ts`)

- [ ] Update `getProps()`: detect `data-booqs-pph` attribute → add `booqs-pph` to CSS class list (instead of checking `node.pph`)

### Types (`core/model.ts`)

- [ ] Remove `pph` field from `BooqElement` type (or verify it was never added to new type)

### Verify

- [ ] `npm run build` passes
- [ ] Verify scroll position tracking works (paragraph anchoring)
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
