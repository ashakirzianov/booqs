# IR Design

The intermediate representation (IR) used by Booqs to represent parsed EPUB content. This document describes the final state of the IR after the Big Model Migration.

For migration history and divergences from earlier designs, see [ir-design-migration.md](../archive/ir-design-migration.md).

## Design Goals

1. **Faithful to source** — preserve EPUB/XHTML structure without React-specific transforms at parse time.
2. **Simple** — minimal type surface, no redundant fields, standard attribute handling.
3. **Render-agnostic** — the IR can be consumed by any renderer (web, native, export). Rendering concerns (attribute normalization, element mapping) happen at render time.
4. **Memory-efficient** — the processing pipeline mutates in place; `BooqStub` compresses out-of-range content to a single integer.

## Type Model

All types are defined in `core/model.ts`.

### Node Types

```typescript
// A parsed EPUB spine document (one per spine item)
type BooqDocument = {
    fileName: string,          // EPUB-internal path (e.g. "OEBPS/chapter1.xhtml")
    children: BooqChildNode[],
    error?: string,            // parser error, if any
}

// An HTML/XML element
type BooqElement = {
    name: string,              // tag name, lowercase (e.g. "p", "div", "html")
    children: BooqChildNode[],
    attributes?: BooqElementAttributes,
}

// A text node — just a string
type BooqTextNode = string

// A stub representing elided content, storing its character length
type BooqStub = { stub: number } | null

// Unions
type BooqChildNode = BooqElement | BooqTextNode | BooqStub
type BooqContainerNode = BooqDocument | BooqElement
type BooqNode = BooqDocument | BooqChildNode
type BooqContent = BooqDocument[]
```

### Discriminant Pattern

All union members carry `?: undefined` for fields they don't have (`name`, `fileName`, `stub`, `children`). This allows safe property access on any `BooqNode` without type assertions — e.g. `node.name` is `string` for elements and `undefined` for everything else.

### Top-Level Types

```typescript
type Booq = {
    content: BooqContent,      // array of parsed documents (spine items)
    styles: BooqStyles,        // deduplicated CSS map: canonicalFileName → processed CSS string
    metadata: BooqMetadata,    // title, authors, cover, length
    toc: TableOfContents,      // flat list of TOC items with paths and positions
}

type BooqFragment = {
    start: BooqPath,
    end: BooqPath,
    content: BooqContent,      // sliced subset (out-of-range docs are stubs)
    styles: BooqStyles,        // only styles referenced by in-range documents
}
```

### Addressing

```typescript
type BooqPath = number[]       // tree address: [docIndex, childIndex, childIndex, ...]
type BooqRange = { start: BooqPath, end: BooqPath }
```

A `BooqPath` addresses a node by index at each level of the tree. `[2, 0, 3]` means: document at index 2, its child at index 0, that child's child at index 3. Paths are stable across renders as long as the tree structure doesn't change.

### Locators

```typescript
type BooqLocator = {
    start: BooqPath,
    end?: BooqPath,
    prefix: string,            // text before the selection (for healing)
    text?: string,             // selected text content
    suffix: string,            // text after the selection (for healing)
}
```

Locators extend paths with textual context for resilience against tree changes (e.g. updated EPUB editions). The `prefix`/`suffix` enable future locator healing.

## Processing Pipeline

Defined in `parser/process.ts`. The pipeline mutates documents in place for memory efficiency (the tree is the dominant memory consumer in serverless).

```
parseDocuments → processDocuments(documents, epub, diags) → { documents, styles, hrefToPathMap }
```

### Steps (in order)

1. **Sanitize** — strip `<script>` element content (keep the empty element in tree).
2. **Process styles** — walk all nodes, extract CSS from `<style>` elements (inline) and `<link rel="stylesheet">` elements (loaded from EPUB), store processed CSS in `BooqStyles` map keyed by canonical file name. CSS processing: rewrite root selectors (`html`/`body`/`:root` → `:scope`), strip global color declarations.
3. **Scope IDs and resolve hrefs** — scope element `id` attributes using `booqs-{spineIndex}-{basename}--{originalId}`, rewrite internal `href` to `#scopedId`, add `data-booqs-ref-path` attribute with the target's `BooqPath` (for cross-chapter navigation).
4. **Mark paragraphs** — add `data-booqs-paragraph` attribute to leaf `<p>` and `<div>` elements (used for reading position tracking).

### Invariants After Processing

- Every element `id` is globally unique within the book (scoped).
- Internal hrefs point to scoped IDs (`#booqs-0-chapter1--sec5`).
- `BooqStyles` keys are canonical EPUB file paths; values are processed CSS strings.
- `<script>` elements exist in the tree but have empty `children`.
- No camelCasing of attributes — stored as raw XML attribute names.
- No element renaming — `<html>`, `<body>`, `<head>` remain as-is.

## Styles

`BooqStyles` is `Record<string, string>` — a map from canonical CSS file name to processed CSS text.

At render time, each document's styles are wrapped in `@scope ([data-booqs-doc="N"])` for containment. This scoping is **not** baked into the stored CSS — it's applied dynamically so the same CSS can be shared across documents that reference it.

### CSS Processing (`parser/styles.ts`)

- Root selectors (`html`, `body`, `:root`, including qualified forms like `body.classname`) are rewritten to `:scope`.
- Global color declarations (`color`, `background-color`, `background` on root selectors) are stripped to prevent books from overriding the app theme.
- Inline `<style>` content is processed and left in the element (not extracted to `BooqStyles`).
- `<link>` stylesheet `href` is rewritten to the canonical file name after loading.

## Custom Data Attributes

All defined in `core/attributes.ts`:

| Attribute | Purpose |
|-----------|---------|
| `data-booqs-path` | BooqPath for selection and scroll tracking (added at render time) |
| `data-booqs-ref-path` | Target BooqPath for internal links (added during processing) |
| `data-booqs-paragraph` | Marks leaf paragraph elements (added during processing) |
| `data-booqs-augmentation-id` | Annotation/augmentation click targeting (added at render time) |
| `data-booqs-doc` | Document index for `@scope` containment (added at render time) |

## Fragment Building

`buildFragment()` in `core/fragment.ts` extracts a renderable subset of a book:

- Documents fully outside the range become stub documents.
- Documents at range boundaries are sliced recursively — out-of-range children become stubs, structurally important nodes (`<style>`, `<link rel="stylesheet">`) are preserved.
- Only styles referenced by in-range documents are included in the fragment's `styles`.

Fragments are the unit served to the reader — each chapter/page is a fragment built from the full `Booq`.

## Rendering Contract

The IR is render-agnostic. The web renderer applies these transforms at render time (not stored in the IR):

- **Attribute normalization**: `class` → `className`, `colspan` → `colSpan`, etc.
- **Element mapping**: `<html>`/`<body>` → `<div>`; `<head>`/`<link>`/`<script>`/`<meta>`/`<title>` → skipped.
- **Path tracking**: adds `data-booqs-path` to rendered elements.
- **Style scoping**: wraps CSS in `@scope` with document-index selector.
- **Link handling**: in-range links use browser-native `#id` scroll; out-of-range links (detected via `data-booqs-ref-path`) trigger page navigation.

## Utilities

Core tree utilities in `core/node.ts`:

- `isTextNode`, `isStubNode`, `isElementNode`, `isDocumentNode`, `isContainerNode` — type guards.
- `visitNodes(nodes, visitor)` — depth-first walk of child nodes.
- `mapDocumentNodes(documents, transform)` — map over all child nodes in all documents.
- `mapChildNodes(nodes, transform)` — recursive child node mapping.
- `nodeForPath(nodes, path)` — resolve a path to its node.
- `nodesForRange(nodes, range)` — extract nodes within a range (with stubs for out-of-range).
- `stubNode(length)` — create a stub with given character length.

Position utilities in `core/position.ts`:

- `nodeLength(node)` — character length of a node (recursive for containers, string length for text, stored integer for stubs).
- `positionForPath(nodes, path)` — convert a path to a character offset.
- `pathForPosition(nodes, position)` — convert a character offset to a path.
