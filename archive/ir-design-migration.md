# IR Migration Design

How we migrate from the current `BooqNode` IR to the new EPUB-aligned IR. Part of the Big Model Migration alongside [css-handling.md](css-handling.md) and [booqs-locator-design.md](booqs-locator-design.md).

For the target IR design itself (types, rationale, invariants), see [ir-design.md](ir-design.md) (to be written).

## Current State

The current IR (`BooqNode`) is a 4-way discriminated union (`BooqSectionNode | BooqElementNode | BooqTextNode | BooqStubNode`). During parsing, it applies several transformations that couple it to React rendering:

- `<body>` renamed to `<div>`, `<html>` stripped
- Attributes camelCased (`class` → `className`, `colspan` → `colSpan`)
- IDs scoped with filename prefix (`id` → `fileName/id`)
- `href` values rewritten (`chapter2.xhtml#s5` → `#chapter2.xhtml/s5`)
- Internal hrefs resolved to `ref: BooqPath` on elements
- `<style>` elements extracted to a separate `BooqStyles` map, replaced with stubs
- `<script>` elements replaced with stubs
- Paragraph elements marked with custom `pph: boolean` property
- CSS preprocessed with selector rewriting via `postcss-prefix-selector`
- Colors stripped from non-global CSS selectors

## Implemented State

### Type model

- `BooqDocument` (one per spine item) with `fileName` and `children: BooqChildNode[]`
- `BooqElement` with `name`, `attributes?`, `children: BooqChildNode[]` — no custom fields (`id`, `ref`, `pph` all removed)
- `BooqChildNode = BooqElement | BooqTextNode | BooqStub` (where `BooqTextNode = string`, `BooqStub = null | { stub: number }`)
- `BooqNode = BooqDocument | BooqChildNode` (union type, not an interface)
- All union members have `?: undefined` discriminant fields for safe property access without type assertions
- `Booq.content: BooqDocument[]` (was `Booq.nodes: BooqNode[]`)

### Parser

The parser is minimal — it converts XHTML to `BooqDocument`/`BooqElement` with almost no transformation:
- All XML elements processed uniformly via `processXml` — no special-casing of `<html>`, `<head>`, `<body>`
- `<script>` elements kept in tree with content stripped (empty `children`)
- `<style>` and `<link>` elements kept in tree as regular elements
- Attributes stored as-is from XML (no camelCasing, no ID scoping, no href rewriting)
- `id` is just an attribute — no separate field on `BooqElement`

### Post-processing pipeline (`parser/process.ts`)

Single `processDocuments()` function returns `{ documents, styles, hrefToPathMap }`:

1. **CSS preprocessing** (`parser/styles.ts`): walks `<head>` elements, loads CSS files for `<link>`, preprocesses all CSS, stores in `BooqStyles`, sets `styleRefs` on documents
2. **ID scoping and href resolution** (`parser/scopeIds.ts`): scopes IDs using `booqs-{spineIndex}-{basename}--{originalId}` scheme, rewrites internal `href` to `#scopedId`, adds `data-booqs-ref-path` attribute with serialized BooqPath for renderer to decide in-range vs out-of-range
3. **Paragraph marking**: adds `data-booqs-paragraph` attribute to leaf `<p>`/`<div>` elements
4. **Image processing** (`backend/parse.ts`): resolves image paths relative to document fileName via `resolveHref`, rewrites `src` to CDN URLs, sets `width`/`height` directly (standard HTML attributes, not data attributes)

### Client-side rendering

- `data-booqs-path` on all rendered elements for path tracking (selection, scroll)
- Elements preserve their scoped `id` from EPUB attributes (for `#scopedId` navigation)
- Augmentation spans get both `data-booqs-path` and `id=pathToId`
- Attribute normalization at render time (`class` → `className`, `colspan` → `colSpan`, etc.) via `normalizeAttributes()`
- Element mapping at render time via `mapElementName()`: `<html>`/`<body>` → `<div>`, `<head>`/`<link>`/`<script>`/`<meta>`/`<title>` → skip
- In-range links use already-rewritten `href="#scopedId"` (browser-native scroll)
- Out-of-range links use `hrefForPath` callback (cross-chapter page navigation)

### Href resolution (`parser/href.ts`)

Single `resolveHref(href, baseFileName)` utility for all EPUB-internal href resolution. Handles `#id`, `file.xhtml#id`, `../file.xhtml#id` with proper `../` traversal. Used by ID scoping, TOC construction, image path normalization, and CSS file loading.

### Custom data attributes (`core/attributes.ts`)

All custom `data-*` attributes defined in one file:
- `data-booqs-path` — BooqPath for selection and scroll tracking
- `data-booqs-ref-path` — resolved BooqPath for internal link targets
- `data-booqs-paragraph` — marks leaf paragraph elements
- `data-booqs-augmentation-id` — augmentation click targeting

## Divergences from Original Design

### `BooqNode` is a union, not an interface

**Design**: `BooqNode = { children: BooqChildNode[] }` as a shared interface for utilities.
**Implemented**: `BooqNode = BooqDocument | BooqChildNode` as a union type. Both `BooqDocument` and `BooqElement` have `children` via `?: undefined` discriminant fields, making property access safe without assertions. Utility functions take `BooqNode[]` which accepts both `BooqDocument[]` and `BooqChildNode[]` due to union subtyping.
**Why**: A union is simpler to work with in TypeScript — type guards and discriminant fields handle everything the interface would, without needing the `BooqNode` interface to be satisfied by text nodes and stubs (which have no children).

### `Booq.content` instead of `Booq.documents`

**Design**: `Booq.documents: BooqDocument[]`.
**Implemented**: `Booq.content: BooqDocument[]`.
**Why**: `content` is more concise and reads better at call sites.

### `styleRefs` kept on `BooqDocument`

**Design**: remove `styleRefs`, renderer resolves styles from `<head>` elements.
**Implemented**: `styleRefs` kept, populated during post-processing instead of parsing.
**Why**: the current CSS scoping mechanism uses the style key as both a class name on the `<section>` wrapper and a selector prefix in CSS rules. Removing `styleRefs` requires changing the CSS scoping approach, which is Phase 2 (`@scope` migration).

### `data-booqs-ref-path` instead of browser-native `#id` navigation

**Design**: browser-native `#id` navigation for in-book links, no custom client-side link resolution.
**Implemented**: `href` rewritten to `#scopedId` for in-range scroll, but `data-booqs-ref-path` with BooqPath still needed for out-of-range detection. Renderer checks `pathInRange` to decide scroll vs page navigation.
**Why**: in a paginated reader, cross-chapter link targets are not on the current page. The renderer needs the path to determine which chapter to navigate to. Browser-native `#id` only works for same-page scroll.

### `id` removed from `BooqElement` type

**Design**: keep `id` as a field on `BooqElement`.
**Implemented**: `id` is just an attribute in `attributes` map. Accessed via `node.attributes?.id`.
**Why**: `id` is a standard XML attribute — having it as a separate field was redundant. Makes the model more faithful to XML.

### Image dimensions as standard attributes, not data attributes

**Design**: store dimensions in `data-booqs-width` / `data-booqs-height`, original src in `data-booqs-original-src`.
**Implemented**: `width` and `height` set directly as standard HTML attributes. `src` rewritten to CDN URL in place.
**Why**: `width`, `height`, and `src` are standard HTML attributes that any renderer needs. Data attributes would add an unnecessary render-time step.

### Paragraph attribute renamed

**Design**: `data-booqs-pph`.
**Implemented**: `data-booqs-paragraph`.
**Why**: `pph` abbreviation was cryptic. Full word is clearer.

### `mapNodes` replaced with `mapDocumentNodes` + `mapChildNodes`

**Design**: keep `mapNodes` working on `BooqNode[]`.
**Implemented**: `mapDocumentNodes(documents, transform)` where transform operates on `BooqChildNode`. `mapChildNodes` exported for use when document-level iteration is handled manually.
**Why**: `BooqDocument` should not be passed to the transform function — transformers only operate on child nodes (elements, text, stubs). The split makes the type signatures correct without casts.

### TOC items store scoped `id`

**Design**: not specified.
**Implemented**: `TableOfContentsItem.id?: string` stores the scoped element ID.
**Why**: prepares for future ID-based navigation without needing another tree walk.

## Migration Order

Detailed task list in [../tasks/model-migration-phase-1-ir.md](../tasks/model-migration-phase-1-ir.md).

## See Also

- [ir-design.md](ir-design.md) — target IR design (to be written)
- [css-handling.md](css-handling.md) — CSS scoping strategy
- [booqs-locator-design.md](booqs-locator-design.md) — annotation locator design
