# Booqs Locator & Annotation Design

Decisions made during the Readium/W3C annotation investigation. Focused on the annotation and quote-sharing architecture.

## Core decision: two-tier locator model

Keep `BooqPath` as the fast workhorse. Introduce `BooqLocator` as a richer, resilient type used only where locators must survive re-rendering against a possibly different tree.

```ts
// Fast path, unchanged. Used for same-render operations.
type BooqPath = number[];

// Resilient locator. Used for annotations and shared quotes.
type BooqLocator = {
  start: BooqPath;
  end: BooqPath;
  before: string;     // ~30 chars of context before the highlight
  highlight: string;  // the selected text itself
  after: string;      // ~30 chars of context after
};
```

**Why two types, not one:** if a function signature shows `BooqPath`, the contract is "same render, no drift possible." If it shows `BooqLocator`, the tree might have changed. This invariant is worth making explicit at the type level.

**Where each is used:**
- `BooqPath`: history/reading position, TOC navigation, in-book ref rewriting, any operation within a single render session
- `BooqLocator`: annotations (create/read/update), shared quote URLs

## Why this shape

Evaluated three alternatives and rejected each:

**Full CFI adoption.** Three things bundled (odd/even encoding, ID assertions, standardization). For Booqs:
- Odd/even encoding is a high-ceremony solution to a low-frequency problem (annotating non-leaf elements). An explicit `offset?` field solves the same problem with less mystery.
- ID assertions provide partial insurance — good for recovering to the right chapter/section, but not within a paragraph. Text-quote context does more work for typical highlights (middle-of-paragraph selections).
- Standardization only matters at API boundaries with external consumers. For internal use it's strictly worse than a tree-native representation (can't `.slice()` a string, must parse/operate/reserialize).

Verdict: CFI serialization is always available as an adapter if interop ever shows up. Don't adopt preemptively.

**Web Annotation Data Model as internal format.** The JSON-LD ceremony (`@context`, RDF semantics) isn't necessary. The valuable idea — multi-selector redundancy — is already captured by the flat `before` / `highlight` / `after` fields on the locator.

**Single unified type.** Paying the cost of text context on every path use (including in-book nav, history) for no benefit. The two-tier split makes the cost/benefit explicit.

## Server-side healing

Every annotation read passes through a resolution step:

```ts
function resolveLocator(tree: BooqTree, loc: BooqLocator): {
  status: 'ok' | 'healed' | 'failed';
  range: BooqRange;
}
```

Logic:
1. Try resolving `loc.start` / `loc.end` on current tree
2. Check text at those paths matches `loc.highlight`
3. Match → `ok`, return original range
4. Mismatch → fuzzy-search for `before + highlight + after` in nearby tree region → `healed`, return corrected range
5. Total failure → `failed`, surface to client UI

Server returns either "still valid" or "corrected." Clients never deal with resolution ambiguity.

**Construction:** clients only build `BooqLocator` when handling selection/annotation events — they already have the DOM Range, so extracting the context fields is cheap via `Range.toString()` scoped to the nearest block ancestor.

## Highlight rendering

Evaluated CSS Custom Highlight API as a replacement for current DOM-wrapping approach. **Decision: stay with DOM wrapping.** Full analysis in `css-custom-highlights.md`.

Key points relevant to the locator design:
- Healing algorithm and locator schema are **orthogonal** to rendering mechanism
- Migration to CHA later requires no locator schema changes
- Current DOM-wrapping gives `event.target.dataset.annotationId` for free, which CHA can't match until WebKit ships `highlightsFromPoint`

## Quote sharing: stateless URLs

Requirement: must work offline, zero-latency, zero-network. Driven by:
- Native offline-first Flutter app
- Clipboard-enrichment feature (quote URL injected into clipboard on copy)
- Use cases like "save quote to notes app," "paste into draft email"

**Stateful share URLs rejected** despite offering better durability and analytics — the offline and latency constraints are hard.

### Encoding
Put the full locator in the URL: path + text context. Budget ~200–400 bytes, well within URL limits.

```
https://booqs.app/b/<book-id>?q=<encoded-locator>
```

**Recommended encoding:** custom compact text format over base64. Something like `p=2.4.6.12-2.4.6.45&t=<before>|<highlight>|<after>`. Smaller than base64 (~40%) and readable in message threads / social media where URLs appear verbatim.

Keep old path-only format as a valid subset for backward compatibility:
- `?q=<path-only>` → old format, resolves via path only, no healing
- `?q=<path>&c=<context>` → new format, resolves with healing

### Client-side healing
Runs in the reader on share URL load:
1. Parse URL → locator
2. Load relevant spine item(s)
3. Try path resolution, check text matches highlight
4. Match → navigate + transient highlight
5. Mismatch → fuzzy-search `before + highlight + after` in chapter-scoped region (~20KB of text, ~ms)
6. Failure → scroll to nearest resolvable ancestor + banner

### Clipboard-enrichment pattern
On text copy, populate clipboard with rich MIME types:
- `text/plain`: quote + attribution
- `text/html`: quote as blockquote with link to quote URL
- Custom format (optional) for round-tripping back into Booqs

Pasting into plain-text fields gets the quote; pasting into rich editors (email, Notion, Slack) gets a linked citation. Pattern used by Matter, Readwise, Apple Books. Provide a user setting to disable.

Example rendered paste:
> "The water, the water! The water is everywhere!"
> — Fyodor Dostoevsky, *Crime and Punishment* [booqs.app/b/...]

## Versioning & Project Gutenberg

Booqs has no book-versioning story yet.

**For annotations**: design ahead. The `before` / `highlight` / `after` fields exist now so the healing pass works when versioning arrives — no schema migration needed later.

**For shared quotes**: accept that old URLs die if books are re-ingested. Add robust version-aware healing when versioning ships; by then the context-based healing approach will already be proven via the annotation healing path.

**Project Gutenberg specifics**: PG updates ebooks continuously (typo fixes + ongoing `ebookmaker` regeneration across all 60K titles). License explicitly states updated editions replace old ones. Pragmatic approach: **ingest once, cache, treat as canonical**. Re-ingest only on explicit triggers (user reports, known ebookmaker fixes). Store PG source etag/timestamp as metadata on cached copy to detect divergence. Don't auto-pull updates.

**Standard Ebooks** as a quality alternative for public-domain titles: ~1,000 carefully typeset books, semantically clean markup, much better starting material than raw PG output. Same versioning caution applies.

## Open decisions

- **Context length**: start at 30 chars each side (`before` / `after`). Revisit if healing failure rates become noticeable in practice. Repetitive content (dialogue, lists) may need 50.
- **Book ID format in URLs**: slug (`/b/crime-and-punishment`) vs opaque short ID (`/b/a7f3d2`) vs hybrid (`/b/a7f3d2/crime-and-punishment`). User-uploaded books need opaque IDs regardless. Hybrid gives prettiness + uniqueness.
- **Path-to-Range resolver**: when implementing CHA in the future, or any DOM-range-based feature, write `rangeFromBooqPath(root, start, end)`. Walks the BooqPath to produce DOM Range endpoints. Currently not needed since annotations embed during pre-render.

## Architectural principles reinforced

- **Pay for resilience only where drift is possible.** Same-render operations get fast paths. Cross-render operations get rich locators.
- **Multi-selector redundancy is the cross-spec convergence.** Both W3C Web Annotation and Readium Locator arrived at prefix/highlight/suffix + multiple redundant coordinates. Steal the pattern regardless of which spec to model after.
- **Standards at API boundaries, native types internally.** CFI as an adapter, never as a working representation.
- **Park mature-but-incomplete standards until they're actually done.** CHA's painting story is great; its interaction story isn't. Wait for `highlightsFromPoint` on WebKit before revisiting.

## See also

- [css-custom-highlights.md](css-custom-highlights.md) — highlight rendering investigation referenced above.
- [css-handling.md](css-handling.md) — EPUB CSS containment strategy.
- [../../docs/roadmap.md](../../docs/roadmap.md) — "Technical decisions standing" records the Locators commitment.
