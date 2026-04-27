# Phase 1: New Type Model + Parser Simplification

Detailed task list for Phase 1 of the [Big Model Migration](model-migration.md). Design context in [IR migration design](../docs/ir-design-migration.md).

Each stage is an end-to-end change (parser + core + renderer). The app must function on localhost after each stage. Test by loading a few EPUBs, navigating, checking highlights/notes.

## Stage 1: Type model

Purely structural rename — no behavior change. The app does exactly the same thing with new type names.

### Types (`core/model.ts`)

- [ ] Define `BooqDocument` type (with `fileName`, `children: BooqElement[]`, optional `error` field; always has `children`, empty on error)
- [ ] Define `BooqElement` type (with `name`, `id?`, `attributes?`, `children: BooqChildNode[]`)
- [ ] Define `BooqChildNode = BooqElement | BooqTextNode | BooqStub`
- [ ] Define `BooqTextNode = string`
- [ ] Define `BooqStub = null`
- [ ] Define `BooqNode = { children: BooqChildNode[] }` as shared interface (both `BooqDocument` and `BooqElement` satisfy this)
- [ ] Define `BooqElementAttributes = Record<string, string | undefined>`
- [ ] Update `Booq`: `nodes` → `documents: BooqDocument[]`
- [ ] Remove old types: `BooqSectionNode`, `BooqElementNode`, `BooqTextNode` (old shape), `BooqStubNode`, `BooqNodeAttrs`

### Core utilities (`core/node.ts`, `core/position.ts`, `core/iterator.ts`, `core/text.ts`, `core/chapter.ts`)

- [ ] Update type guards: `isElementNode`, `isTextNode`, `isStubNode` for new type shapes
- [ ] Replace `isSectionNode` with `isDocumentNode` (checks `fileName` property)
- [ ] Replace `isContainerNode` — `BooqNode` interface means both documents and elements have `children`
- [ ] Update `nodeChildren()`, `visitNodes()`, `mapNodes()` for `BooqChildNode`
- [ ] Update `nodeForPath()`, `nodesForRange()`, `findPathForId()`
- [ ] Update `stubNode()`, `textNode()` factories
- [ ] Update `nodeLength()`, `nodesLength()`, `positionForPath()` — text via `.length`, stub via `=== null`
- [ ] Update iterator functions (`iteratorAtPath`, `firstLeafNode`, etc.)
- [ ] Update text functions (`nodeText`, `textForRange`, `previewForPath`, `getQuoteAndContext`, `getExpandedRange`)
- [ ] Update `buildChapter()`, `collectReferencedStyles()` — use `isDocumentNode` instead of `isSectionNode`
- [ ] Rename `attrs` → `attributes` in all core code that accesses element attributes

### Parser (`parser/`)

- [ ] Update `parseSection()` / `processSectionContent()` to produce `BooqDocument` instead of section node
- [ ] Rename `attrs` → `attributes` in `processRegularXml()`, `processAttributes()`
- [ ] Update `processEpub()` in `book.ts`: collect into `documents: BooqDocument[]`
- [ ] Update `pph.ts`: access `node.attributes` instead of `node.attrs`
- [ ] Update `refs.ts`: access `node.attributes` instead of `node.attrs`

### Backend (`backend/parse.ts`)

- [ ] Update `normalizeImageSrcsInBooq()`: access `node.attributes` instead of `node.attrs`
- [ ] Update `collectUniqueSrcsFromBooq()`: access `node.attributes` instead of `node.attrs`
- [ ] Update `preprocessBooq()`: work with `Booq.documents`

### Viewer/Renderer (`viewer/render.ts`, `viewer/BooqContent.tsx`)

- [ ] Update `renderNode()`: use `isDocumentNode` instead of `isSectionNode`
- [ ] Update `renderSectionNode()` → render document nodes (still renders as `<section>` with style injection for now)
- [ ] Update `getProps()`: access `node.attributes` instead of `node.attrs`
- [ ] Rename `node.attrs` → `node.attributes` throughout renderer

### Data layer (`data/booqs.ts`)

- [ ] Update chapter building and note range expansion to use `Booq.documents`

### GraphQL (`graphql/resolvers.ts`)

- [ ] Update `BooqNode` scalar handling if needed (likely transparent since it's JSON)

### Tests (`tests/`)

- [ ] Update `tests/core/iterator.test.ts` for new type shapes
- [ ] Update `tests/core/text.test.ts` for new type shapes

### Verify

- [ ] `npm run build` passes
- [ ] Load PG book, navigate chapters, verify rendering
- [ ] Load user-uploaded book, verify rendering
- [ ] Verify notes/highlights display correctly
- [ ] Verify internal links work

---

## Stage 2: Stop camelCasing attributes

Parser stores XML attributes as-is. Renderer normalizes for React.

### Parser (`parser/section.ts`)

- [ ] Remove camelCase conversions from `processAttributes()`: stop converting `class` → `className`, `colspan` → `colSpan`, `rowspan` → `rowSpan`, `cellspacing` → `cellSpacing`, `cellpadding` → `cellPadding`, `xml:space` → `xmlSpace`, `xml:lang` → `xmlLang`, `xmlns:xlink` → `xmlnsXlink`, `xlink:href` → `xlinkHref`
- [ ] Keep `href` transformation for now (handled in Stage 6)

### Backend (`backend/parse.ts`)

- [ ] Update image src access: `node.attributes?.src` stays as-is, but `node.attributes?.xlinkHref` → `node.attributes?.['xlink:href']`

### Viewer/Renderer (`viewer/render.ts`)

- [ ] Add `normalizeAttributes()` function that converts XML attribute names to React props at render time
- [ ] Handle `class` → `className`, `colspan` → `colSpan`, `rowspan` → `rowSpan`, `cellspacing` → `cellSpacing`, `cellpadding` → `cellPadding`
- [ ] Handle `xml:space` → `xmlSpace`, `xml:lang` → `xmlLang`, `xmlns:xlink` → `xmlnsXlink`, `xlink:href` → `xlinkHref`
- [ ] Update `getProps()` to use `normalizeAttributes()`

### Core utilities

- [ ] Update `getExpandedRange()` in `core/text.ts` if it accesses `node.attributes?.className` (now `node.attributes?.class`)

### Verify

- [ ] `npm run build` passes
- [ ] Verify CSS classes apply correctly (class → className mapping works)
- [ ] Verify tables render correctly (colspan/rowspan mapping works)

---

## Stage 3: Keep `<html>` and `<body>`

Parser preserves these elements. Renderer maps them during rendering.

### Parser (`parser/section.ts`)

- [ ] Stop renaming `<body>` to `<div>` in `processSectionContent()`
- [ ] Keep `<html>` element in the tree (stop extracting children of `<html>` and processing them separately — instead, process `<html>` as a regular element)
- [ ] Adjust `processSectionContent()` structure: parse the full XML tree as-is, wrapping in `BooqDocument`

### Viewer/Renderer (`viewer/render.ts`)

- [ ] Add element mapping: `<body>` → render as `<div>`
- [ ] Add element mapping: `<html>` → render as `<div>` or skip (render children only)
- [ ] Ensure these mappings work within `renderNode()` / `getProps()`

### Core utilities

- [ ] Verify tree traversal functions handle the deeper nesting (paths now go through `<html>` and `<body>` elements)
- [ ] Update any hardcoded path assumptions if they exist

### Verify

- [ ] `npm run build` passes
- [ ] Verify rendering looks identical (body/html mapping produces same visual output)
- [ ] Verify BooqPath values work correctly with the new tree depth

---

## Stage 4: Keep `<style>` elements in tree

Parser keeps `<style>` elements. CSS preprocessing moves to post-processing. Renderer resolves styles from `<head>`.

### Parser (`parser/section.ts`)

- [ ] Stop extracting `<style>` text content into `env.css` — keep the `<style>` element in the tree with its text content as a child text node
- [ ] Stop replacing `<style>` elements with stubs
- [ ] Keep `<link rel="stylesheet">` processing for now (still needs to load CSS files), but keep the `<link>` element in the tree instead of replacing with stub

### Post-processing (`parser/preprocess.ts` or new module)

- [ ] Add CSS preprocessing step: walk each document's `<head>`, find `<style>` and `<link>` elements
- [ ] For `<link>`: load referenced CSS file, preprocess, store in `BooqStyles` keyed by file path
- [ ] For `<style>`: preprocess the text content, replace the text content in-tree with preprocessed version, also store in `BooqStyles`
- [ ] Extract CSS preprocessor into clean module with `preprocessCss(css, { scopeSelector }) → string` interface

### Core (`core/chapter.ts`)

- [ ] Update `collectReferencedStyles()`: instead of reading `node.styleRefs`, walk the document's `<head>` to find `<link>` hrefs and collect corresponding entries from `BooqStyles`
- [ ] Update `buildChapter()` / fragment extraction accordingly

### Viewer/Renderer (`viewer/render.ts`)

- [ ] Update document node rendering: instead of injecting styles from `styleRefs`, walk `<head>` children
- [ ] For `<link rel="stylesheet">`: look up preprocessed CSS from `BooqStyles` map by href, render as `<style>` element
- [ ] For `<style>` elements: render their (preprocessed) text content directly
- [ ] Skip rendering `<link>` elements that were already resolved to `<style>`

### Types (`core/model.ts`)

- [ ] Remove `styleRefs` field from `BooqDocument` (was on `BooqSectionNode`)

### Verify

- [ ] `npm run build` passes
- [ ] Verify CSS styling applies correctly across sample EPUBs
- [ ] Verify per-chapter style isolation still works
- [ ] Verify fragment rendering includes correct styles

---

## Stage 5: Keep `<script>` elements in tree

Small change — parser keeps `<script>` elements but strips their content.

### Parser (`parser/section.ts`)

- [ ] Stop replacing `<script>` elements with stubs
- [ ] Keep the `<script>` element in the tree, but replace its text content with empty string

### Viewer/Renderer (`viewer/render.ts`)

- [ ] Skip `<script>` elements during rendering (return `null`)

### Verify

- [ ] `npm run build` passes
- [ ] Verify no script execution in rendered content
- [ ] Verify path indices remain stable (script element preserves position)

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
