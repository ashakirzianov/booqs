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

## Target State

See [ir-design.md](ir-design.md) for the full target design. Summary:

- `BooqDocument` (one per spine item) with `fileName` and `children: BooqElement[]`
- `BooqElement` stores original XML attributes unmodified
- `BooqChildNode = BooqElement | BooqTextNode | BooqStub` (where `BooqTextNode = string`)
- `BooqNode = { children: BooqChildNode[] }` as shared interface for utilities
- `<html>`, `<head>`, `<body>`, `<style>`, `<script>` preserved in tree
- `<script>` content stripped server-side
- `<style>` content preprocessed server-side (in post-processing pipeline)
- IDs scoped server-side in post-processing (for browser-native `#id` navigation)
- In-book `href` values rewritten server-side to match scoped IDs
- Paragraph marking via `data-booqs-pph` attribute
- Image dimensions stored in data attributes; internal images resolved to CDN URLs
- React-specific transforms (attribute normalization, element mapping) happen at render time
- All data attributes use `data-booqs-` prefix to avoid collisions with EPUB content

## What Changes

### Parser simplification

The parser becomes minimal — it converts XHTML to `BooqDocument`/`BooqElement` with almost no transformation.

| Transformation | Current | New |
|---------------|---------|-----|
| `<html>` | Stripped | Preserved |
| `<body>` | Renamed to `<div>` | Preserved |
| `<head>` | Processed, children replaced with stubs | Preserved |
| `<style>` elements | Extracted to `BooqStyles`, replaced with stubs | Kept in tree; content preprocessed during post-processing |
| `<script>` elements | Replaced with stubs | Kept in tree, text content stripped |
| Attributes | camelCased | Stored as-is from XML |
| IDs | Scoped during parsing (`fileName/id`) | Stored as-is during parsing; scoped during post-processing |
| `href` | Rewritten via `transformHref` during parsing | Stored as-is during parsing; rewritten during post-processing |
| `ref: BooqPath` on elements | Set during `resolveRefs` pass | Removed — browser-native `#id` navigation instead |
| `pph: boolean` | Custom property on element | `data-booqs-pph` attribute via post-processing |

### Server-side post-processing pipeline

The post-processing step runs after document parsing and handles everything that needs cross-document knowledge or should happen once (not per augmentation change):

1. **CSS preprocessing**: walk each document's `<head>`, find `<link>` and `<style>` elements, preprocess CSS (color rewriting + scope containment), store in `BooqStyles` map, replace `<style>` element text content with preprocessed version

2. **ID scoping and href resolution**: scope element `id` values to avoid collisions across spine items, and rewrite in-book `href` values to match. This enables browser-native `#id` navigation for in-book links — no custom client-side link resolution needed.

   Scoped ID format: `booqs-{spineIndex}-{basename}--{originalId}`
   - `spineIndex`: document's position in the spine (disambiguates)
   - `basename`: filename without path prefix and extension (readability)
   - `--` delimiter: separates our prefix from the original ID (original ID is always recoverable by splitting on `--`)
   - `booqs-` prefix: ensures no collision with app IDs

   Example: `id="section5"` in `Text/chapter02.xhtml` (spine index 3) → `id="booqs-3-chapter02--section5"`

   Implementation:
   - Walk all documents, rewrite `id` attributes using the scoping scheme
   - Build transient lookup table: `"fileName#id"` → scoped ID string
   - Walk all documents, rewrite `href` attributes that point to internal targets: `"chapter02.xhtml#section5"` → `"#booqs-3-chapter02--section5"`
   - Use same lookup table to resolve TOC entry hrefs
   - Discard lookup table after post-processing

3. **Paragraph marking**: add `data-booqs-pph=""` to leaf `<p>`/`<div>` element attributes

4. **Image processing**: resolve internal image paths to CDN URLs, probe dimensions, store in data attributes (`data-booqs-original-src`, `data-booqs-width`, `data-booqs-height`); leave external image references as-is for client to handle

### Client-side rendering

The renderer receives `BooqFragment` (as today). Its new responsibilities are limited to React-specific transforms:

**Attribute normalization** (React-specific):
- `class` → `className`
- `colspan` → `colSpan`, `rowspan` → `rowSpan`, etc.
- `xml:space` → `xmlSpace`, `xml:lang` → `xmlLang`
- `xlink:href` → `xlinkHref`
- `style` string → parsed React style object

**Element mapping** (React-specific):
- `<body>` → `<div>` (or other wrapper as appropriate)
- `<html>` → skip or map to wrapper
- `<script>` → skip during rendering
- Nested `<a>` → `<span>` (existing behavior, stays)

**Style resolution**:
- Walk `<head>` children to find `<link rel="stylesheet">` elements
- Look up preprocessed CSS from `BooqStyles` map using the `href` value
- Render as `<style>` elements
- For inline `<style>` elements, render their preprocessed content directly

**Data attribute handling**:
- `data-booqs-pph` → add `booqs-pph` CSS class
- `data-booqs-width` / `data-booqs-height` → set image dimensions
- `data-booqs-original-src` → handle as needed (CDN URLs already resolved server-side for internal images)

**In-book links**: no custom handling needed — `href="#booqs-3-chapter02--section5"` and `id="booqs-3-chapter02--section5"` work via browser-native `#id` navigation.

**Augmentations**: unchanged — highlight/annotation rendering via DOM wrapping, applied on top of the preprocessed content.

### Rendering pipeline order

```
BooqFragment (from server, already post-processed)
  → Rendering preprocess (attribute normalization, element mapping, style resolution)
  → Augmentation embedding (highlights, notes)
  → React render
```

Rendering preprocessing happens once per content load. Augmentation embedding can change dynamically without re-running the preprocessing step.

### No backward compatibility

We don't have valuable user data. All stored paths (bookmarks, history, notes) can break. This is one reason to do the migration now.

## Migration Order

Detailed task list in [../tasks/model-migration.md](../tasks/model-migration.md).

## See Also

- [ir-design.md](ir-design.md) — target IR design (to be written)
- [css-handling.md](css-handling.md) — CSS scoping strategy
- [booqs-locator-design.md](booqs-locator-design.md) — annotation locator design
