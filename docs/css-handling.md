# EPUB CSS Handling — Design Discussion

## Context

Current pipeline for rendering EPUB content:

1. Backend pre-processes EPUB, converts to JSON format with minor tweaks
2. Backend pre-processes CSS, adding a disambiguation selector (`.booqs-content`) so rules only target EPUB content
3. Client receives JSON spine elements + CSS, injects CSS into a `<style>` element
4. Client pre-processes spine elements to add annotations
5. For fragments, backend extracts only CSS relevant to the fragment being sent

Primary target: Next.js frontend. Native rendering is planned separately.

Requirements:
- Cross-spine / cross-element selection (for highlights spanning chapters)
- Theming (dark mode, font size, line height) that flows into EPUB content
- Fragment rendering (partial spine items, full documents)

## Approaches Considered

### 1. Current approach — selector rewriting preprocessor

Rewrite every EPUB selector to be prefixed with `.booqs-content`, inject as a single stylesheet.

- **Pros:** Works today. Selection works natively (one document). Events just work. Theming trivial. Broad browser support.
- **Cons:** Preprocessor is complex, especially around `:is()`, `:where()`, `:has()`, complex combinators, pseudo-classes on root. Hard to debug (DevTools show rewritten selectors). Per-spine-item isolation is awkward.

### 2. iframe per fragment

Render each spine item (or fragment) in its own iframe.

- **Pros:** True style and JS isolation. No preprocessing needed for containment. Matches how traditional EPUB renderers work.
- **Cons (significant for a reader):**
  - **Selection cannot cross iframe boundaries** — browser hard limit. Killer for cross-spine highlighting.
  - Manual height measurement (ResizeObserver + postMessage).
  - Event bridging via postMessage.
  - CSS custom properties don't cross iframe boundaries — theming has to be pushed through explicitly.
  - Multiple iframes compound every problem.
  - Extra layer of nesting on mobile WebView (latency + memory).
  - Accessibility: screen readers treat iframes as separate documents.

**Verdict:** iframes solve a problem we don't really have (isolation) while breaking something we need (cross-boundary selection).

### 3. Shadow DOM (open mode)

Inject EPUB content + CSS inside a shadow root.

- **Pros:** Scoped styles without a separate document. Events bubble (retargeted). CSS custom properties inherit through — theming works.
- **Cons:** Selection across shadow roots still has issues (same root cause as iframes, less severe). Only worth considering if cross-boundary selection isn't essential — which it is for us.

### 4. Native `@scope` CSS rule — **recommended**

Use `@scope (.booqs-content) { /* original rules */ }` instead of selector rewriting.

- **Pros:**
  - Selection works normally (one document, no boundaries).
  - Deletes the gnarliest part of the preprocessor (selector rewriting).
  - DevTools show original selectors — much easier to debug.
  - Donut scoping (`@scope (.booqs-content) to (.booqs-annotation)`) naturally excludes annotation UI from EPUB styles.
  - Enables clean per-spine-item isolation.
- **Cons / caveats:**
  - **Specificity differs subtly.** Preprocessor made `h1 { }` into `.booqs-content h1 { }` (specificity 0,1,1). `@scope` keeps it at 0,0,1; scope only adds *scope proximity* as a tiebreaker, not specificity. App-level rules like `h1 { }` or global typography resets can now override EPUB rules where they didn't before. Mitigated if app CSS is well-namespaced (Tailwind, CSS modules).
  - **Root-level selectors still need rewriting.** EPUBs commonly style `html`, `body`, `:root`. Inside `@scope (.booqs-content)`, `body { }` matches a `<body>` descendant of `.booqs-content` — which doesn't exist. Needs a preprocessing pass to rewrite to `:scope` or strip.
  - **URL resolution still needs handling** (`url(./cover.jpg)` etc.) — same as today.
  - **Less arbitrary control** than a full preprocessor — `@scope` only solves containment, not sanitization / `@import` stripping / `@font-face` deduping / unit normalization.
- **Browser support (2026):** Chrome/Edge 118 (Oct 2023), Safari 17.4 (March 2024), Firefox 128 (July 2024). Fine for Next.js.

## Recommended Architecture

**Hybrid: slim preprocessor + `@scope`**

Keep the preprocessor but drop its most fragile responsibility. The preprocessor handles:

1. **Root-selector rewriting** — rewrite `html`, `body`, `:root` to `:scope` or strip, since `@scope` can't handle these.
2. **`url()` normalization** — resolve EPUB-relative URLs.
3. **Sanitization** — strip `@import`, dangerous properties, etc.
4. **`@font-face` deduping** — across multiple stylesheets in a book.
5. **Fragment-relevant CSS extraction** — existing optimization, orthogonal to containment.
6. **Wrap remaining rules in `@scope (.booqs-content) { ... }`** — replaces the selector-rewriting logic.

What we gain:
- Less code (the selector-rewriting step is the trickiest part of the preprocessor).
- More robust against unusual selectors (`:has()`, complex combinators, etc.).
- Better debugging (original selectors visible in DevTools).
- Donut scoping available for annotation UI nested inside content.
- Easier per-spine-item isolation if desired.

What to verify:
- Grep global CSS for naked tag selectors (`h1`, `p`, `a`, etc.) — the cascade-specificity change is the one thing that could surprise us.

## Handling EPUB `<style>` Elements and `style` Attributes

Two different problems.

### `<style>` elements (embedded stylesheets)

Wrap contents in `@scope` — same treatment as external CSS:

```html
<style>@scope (.booqs-content) { /* original rules verbatim */ }</style>
```

Same caveats: root selectors still need rewriting, `url()` resolution still needs handling.

**Opportunity — per-spine-item isolation:**

If multiple spine items render in one document, each `<style>` normally affects *all* spine content. With `@scope`, each item's styles can be isolated to that item:

```html
<div class="booqs-spine-item" data-idx="3">
  <style>@scope (.booqs-spine-item[data-idx="3"]) { ... }</style>
  ...
</div>
```

Chapter 3's embedded styles can't bleed into chapter 4. Much harder to achieve cleanly with selector rewriting.

Alternative: hoist all `<style>` contents into the main scoped stylesheet during preprocessing. Simpler, but loses per-item isolation. Depends on how much real-world EPUBs rely on conflicting per-chapter styles (usually not much).

### `style` attributes (inline)

`@scope` doesn't apply — it wraps rulesets, not attributes. Inline styles win the cascade (specificity 1,0,0,0), beaten only by `!important`.

The real problem is theming: `<p style="color: #000">` stays black in dark mode regardless of scoping.

Options, ranked:

1. **Strip theme-affecting properties during preprocessing.** Parse each `style` attribute, remove `color`, `background`, `background-color`, maybe `font-family`. Keep the rest (margins, alignment). **Recommended** — pairs naturally with the slim preprocessor we're already keeping.
2. **Leave them alone** — fine only if we don't care about themes overriding author intent.
3. **`!important` in theme CSS** — works but escalates a war we'll keep fighting. Avoid.
4. **Rewrite inline styles into classes during preprocessing** — over-engineered.

## Summary

- **Containment mechanism:** migrate from selector rewriting to native `@scope`.
- **Preprocessor role:** shrinks, doesn't disappear. Handles root selectors, URLs, sanitization, font-face deduping, fragment extraction, `@scope` wrapping, and inline-style property stripping.
- **`<style>` elements:** wrap in `@scope`, optionally per-spine-item for isolation.
- **`style=""` attributes:** strip theme-affecting properties (`color`, `background`, etc.) during preprocessing.
- **iframes:** rejected — cross-boundary selection is a hard requirement, theming is harder, and we're already in a WebView on native.
- **Shadow DOM:** rejected for the same selection reason, with less severity.

## Decided Architecture (Phase 2)

Decisions made during Phase 2 planning, superseding the "Recommended Architecture" section above where they differ.

### CSS processing pipeline

Terminology: "processing" (not "pre/post-processing") — consistent with Phase 1 conventions.

**Server-side processing (`parser/styles.ts` + `parser/css.ts`):**

1. Walk each document's `<head>` elements.
2. For `<link rel="stylesheet">`: load CSS from EPUB, process it (root selector rewriting, color stripping — but **not** `@scope` wrapping), store in `BooqStyles` keyed by **canonical fileName** (e.g., `OEBPS/styles/main.css`). Rewrite the `<link>`'s `href` attribute to the canonical fileName so the client can look it up.
3. For inline `<style>` elements: process the text content in-place (root selectors, color stripping — but **not** `@scope` wrapping). Leave the element in the tree.
4. `styleRefs` removed from `BooqDocument` — the `<head>` elements are the references.

`@scope` wrapping does **not** happen server-side because the scope selector is per-document (`[data-booqs-doc="N"]`) and `BooqStyles` stores CSS once per file (shared across documents).

**CSS processing (`parser/css.ts`):**

- `postcss-prefix-selector` removed entirely.
- Root selector rewriting: `html`, `body`, `:root` → `:scope`.
- Color stripping stays (same `rewriteColorsPlugin` behavior — strip `color`, `background`, `background-color` from non-global selectors).

**Client-side rendering (`viewer/render.ts`):**

- `<head>` maps to `<div>` instead of being skipped.
- Inside `<head>`, most children still skipped (`<meta>`, `<title>`, `<script>`).
- `<link rel="stylesheet">` rendered as a `<style>` element: content looked up from `BooqStyles[href]` and wrapped in `@scope ([data-booqs-doc="N"]) { ... }`.
- Inline `<style>` elements rendered wrapped in `@scope ([data-booqs-doc="N"]) { ... }` (content already processed on server, scoping added at render time).
- Document `<section>` wrappers no longer need class names from `styleRefs`.

### Per-document style isolation

Each document in a fragment gets its own `<section>` wrapper with a spine-index-based identifier (e.g., `data-booqs-doc="3"`). All CSS for that document — both linked and inline — is wrapped in `@scope ([data-booqs-doc="3"])` so styles from Doc A don't bleed into Doc B when a fragment spans multiple documents.

This replaces the current class-name-based isolation (where each `<section>` gets a generated class like `booqs-ref-styles-main-css` and CSS is prefixed with `.booqs-ref-styles-main-css`).

### Shared stylesheet deduplication

`BooqStyles` is keyed by canonical fileName, so a `book.css` referenced by 30 chapters is stored once. However, it is **rendered once per document** that references it (each with a different `@scope` selector targeting that document's wrapper).

For the normal case (fragment with 1-3 chapters), this is negligible. For full-book rendering (30+ chapters), it's wasteful but unlikely to be a bottleneck — EPUB stylesheets are small (5-20KB), and `@scope` limits style matching to each document's subtree.

**Future optimization** (not implemented now): when multiple documents reference the same CSS file, emit it once with a combined scope selector: `@scope ([data-booqs-doc="0"]), ([data-booqs-doc="1"]), ([data-booqs-doc="2"]) { ... }`.

### Color stripping strategy

Color properties (`color`, `background`, `background-color`) are stripped from **global selectors only**. A selector is considered global if it targets a document root element: `*`, `html`, `body`, `:root`, `:scope` — including qualified variants like `body.tei.tei-text`, `html[lang]`, `body .content`. Author styling on specific selectors (e.g., `.mynote { background-color: #DDE }`) is preserved — these are intentional design choices.

If a rule has mixed selectors like `body, .special { color: red }` and any selector is global, the color declarations are stripped from the entire rule.

Inline `style` attributes are **not** sanitized. Inline styles are relatively rare in well-formed EPUBs, and stripping them risks removing intentional author styling. If inline colors cause dark mode issues in practice, we can revisit with a more targeted approach.

### What changes from the "Recommended Architecture" section

- **`BooqStyles` stays** — keyed by canonical fileName instead of generated prefix. Design doc suggested it could potentially be eliminated; we keep it to avoid bloating the tree with duplicated CSS for shared stylesheets.
- **Per-document `@scope` isolation** — the design doc left this as an open question. We're doing it, scoped by spine index.
- **`<head>` rendered as `<div>`** — instead of being skipped entirely. This lets the renderer discover `<link>` and `<style>` references by walking the tree.
- **Color stripping preserved** — the design doc focused on inline style sanitization. We also keep CSS rule color stripping (existing behavior).

## Open Questions / Future Work

- Verify no global naked tag selectors in app CSS before the specificity change bites.
- Enumerate which EPUB CSS properties actually need sanitizing for Next.js (may be a different list than for native).

## See also

- [booqs-locator-design.md](booqs-locator-design.md) — locator and annotation design (cross-references CSS handling).
- [css-custom-highlights.md](css-custom-highlights.md) — highlight rendering investigation.
- [../../docs/roadmap.md](../../docs/roadmap.md) — "Technical decisions standing" records the EPUB CSS handling commitment.