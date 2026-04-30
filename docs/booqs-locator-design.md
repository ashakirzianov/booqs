# Booqs Locator & Annotation Design

## Decided Architecture

### Naming: annotations

The umbrella term for all user-created marks anchored to content is **annotation**. Types use `BooqAnnotation` (not `BooqNote`). The `kind` field discriminates between `highlight`, `comment`, and `question`.

### BooqLocator type

Two-tier model: `BooqPath` for fast same-render operations, `BooqLocator` for resilient cross-render operations.

```ts
type BooqPath = number[];

type BooqLocator = {
  start: BooqPath;
  end?: BooqPath;       // absent = point locator (e.g., bookmarks)
  prefix: string;       // ~30 chars of text before the selection
  text?: string;        // the selected text (absent for point locators)
  suffix: string;       // ~30 chars of text after the selection
}
```

**Design choices:**
- `prefix`/`suffix` (not `before`/`after`) — explicitly textual naming
- `text` (not `highlight` or `quote`) — neutral, doesn't imply annotation kind
- Optional `end`/`text` for point locators (bookmarks could use this in the future)
- Flat optional fields rather than discriminated union — simpler, maps cleanly to DB columns

**Where each type is used:**
- `BooqPath`: reading history, TOC navigation, in-book link resolution, any single-render-session operation
- `BooqLocator`: annotations (create/read/update), future: bookmarks, share URLs

### Annotations table schema

New empty table replacing the old `notes` table. All existing data is dropped (not real user data).

```sql
CREATE TABLE annotations (
  id          TEXT        PRIMARY KEY,
  user_id     TEXT        NOT NULL REFERENCES users(id),
  booq_id     TEXT        NOT NULL,

  -- locator fields (flat, not JSONB)
  start_path  INTEGER[]   NOT NULL,
  end_path    INTEGER[]   NOT NULL,
  prefix      TEXT        NOT NULL,
  text        TEXT        NOT NULL,
  suffix      TEXT        NOT NULL,

  -- annotation metadata
  kind        TEXT        NOT NULL,  -- 'highlight', 'comment', 'question'
  color       TEXT,                  -- semantic name ('yellow', 'blue', etc.), highlights only
  content     TEXT,                  -- user-written text, NULL for bare highlights
  privacy     TEXT        NOT NULL DEFAULT 'private',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_annotations_user_booq ON annotations(user_id, booq_id);
CREATE INDEX idx_annotations_booq ON annotations(booq_id);
```

**Design choices:**
- Flat columns (not JSONB) for the locator — we never query by locator fields (only by `user_id`/`booq_id`), adding optional columns is trivial, and we're not using discriminated unions
- `end_path` and `text` are NOT NULL on this table — annotations always have a range. The optional fields on `BooqLocator` exist for other use cases (bookmarks), not annotations
- `kind` is a plain string, not `highlight-0`/`highlight-1` etc. Color is a separate field
- `color` uses semantic names (`yellow`, `blue`, `pink`, `green`, `orange`) — theme-independent, mapped to CSS in the application layer
- `content` (not `body` or `note`) — the user's written text for comments/questions. NULL for bare highlights. No DB-level constraint enforcing the correlation with `kind`
- No `tree_hash`/`tree_version` column yet — deferred until healing is implemented (see Healing Design below)

### Context construction: client responsibility

The **client** builds the full `BooqLocator` when creating an annotation. The server stores it as-is.

**Rationale:**
- The client has the exact tree the user is looking at — it's the authority on what was selected
- Server-side construction is fragile: if client and server trees diverge, the server stores wrong context (worse than no context)
- Optimistic updates and future offline mutation queue (native app) need the full locator available client-side without a server round-trip
- Context extraction is simple (N chars before/after a range) — any client that can render and capture selection can do this
- `getQuoteAndContext()` already exists in `core/text.ts` for the web client

**API contract:** the annotation creation endpoint accepts a full locator (all fields), not just a range. The server does not re-derive context.

### Bookmarks: deferred

Bookmarks remain as `BooqPath` for now. Migration to `BooqLocator` (point locator with `prefix`/`suffix`, no `end`/`text`) is deferred to backlog — bookmarks aren't exposed in the UI currently and the cost of drift is low.

## Healing Design (future implementation)

This section sketches the healing strategy. Implementation is out of scope for Phase 3.

### Core concept

Annotations can drift when the book's tree changes (re-upload, re-ingestion, parser upgrade). Healing detects drift and relocates annotations to the correct position in the new tree using text context.

### Detection: text comparison

The locator's `text` field is the source of truth for drift detection:
1. Resolve `start`/`end` paths on current tree
2. Extract text at those paths
3. If extracted text matches `locator.text` → annotation is valid, no healing needed
4. If mismatch → healing needed

This is version-agnostic — no hash/version comparison needed for detection. The text either matches or it doesn't.

### Resolution algorithm

```ts
function resolveLocator(
  tree: BooqNode[],
  locator: BooqLocator
): { status: 'ok' | 'healed' | 'failed'; locator: BooqLocator }
```

1. Try paths directly, check text → `ok`
2. On mismatch, search for `prefix + text + suffix` in nearby region (same chapter, expanding outward)
3. Found → `healed`, return new locator with corrected paths and fresh context
4. Not found → `failed`, preserve original locator

Healed annotations are updated in-place — old paths are meaningless against the new tree. The annotation's identity is the text it anchors to, not the paths.

Failed annotations are preserved (not dropped) and surfaced to the user with a warning. UX for failed annotations is TBD.

### When healing runs

Healing is **lazy, per-book, triggered on read**:
- When annotations are fetched for a book, the server checks whether they're still valid
- This avoids batch-healing 60K+ books after a parser upgrade
- Only books that are actually read get healed

### Infrastructure needed: tree versioning

To make drift detection **cheap** (avoid text extraction on every read), a future version needs:

- **Tree hash** on each book — a short (6-8 char) content hash, stored alongside the parsed book
- **Tree hash on each annotation** — records which version the locator was created against
- **Hash on `Booq` and `BooqFragment` types** — so clients know what version they're rendering

With this infrastructure, the check becomes: `annotation.tree_hash === book.tree_hash` → skip. Otherwise → run text comparison and potentially heal.

**Why deferred:** computing hashes requires parsing every book (60K+ PG books). Adding the column is trivial, populating it is a real migration effort. The text-comparison approach works without hashes — it's just slightly more expensive per read.

### Multi-version challenge

When multiple clients render different tree versions:
- Native app may cache book v1 locally
- Web app always gets the latest (v2) from server
- Annotations created on v1 are correct for v1, but need healing for v2

The server must heal relative to **the requesting client's tree version**, not a single canonical version. This requires:
- Client tells server what tree version it's rendering
- Server heals annotations from version X to version Y on the fly
- Server needs access to the target tree (current canonical tree) for re-extraction

If a client has an old tree version, the server should NOT heal annotations that are still correct for that client. The server should instead signal "you have an old book version, update for annotations to work correctly."

This multi-version handling is complex and deferred to when book versioning is implemented.

## Background: investigation notes

### Why two types, not one

If a function signature shows `BooqPath`, the contract is "same render, no drift possible." If it shows `BooqLocator`, the tree might have changed. This invariant is worth making explicit at the type level.

Paying the cost of text context on every path use (including in-book nav, history) has no benefit. The two-tier split makes the cost/benefit explicit.

### Alternatives evaluated and rejected

**Full CFI adoption.** Three things bundled (odd/even encoding, ID assertions, standardization). For Booqs:
- Odd/even encoding is a high-ceremony solution to a low-frequency problem (annotating non-leaf elements). An explicit `offset?` field solves the same problem with less mystery.
- ID assertions provide partial insurance — good for recovering to the right chapter/section, but not within a paragraph. Text-quote context does more work for typical highlights (middle-of-paragraph selections).
- Standardization only matters at API boundaries with external consumers. For internal use it's strictly worse than a tree-native representation (can't `.slice()` a string, must parse/operate/reserialize).

Verdict: CFI serialization is always available as an adapter if interop ever shows up. Don't adopt preemptively.

**Web Annotation Data Model as internal format.** The JSON-LD ceremony (`@context`, RDF semantics) isn't necessary. The valuable idea — multi-selector redundancy — is already captured by the flat `prefix` / `text` / `suffix` fields on the locator.

**Single unified type.** Paying the cost of text context on every path use (including in-book nav, history) for no benefit. The two-tier split makes the cost/benefit explicit.

### Highlight rendering

Evaluated CSS Custom Highlight API as a replacement for current DOM-wrapping approach. **Decision: stay with DOM wrapping.** Full analysis in `css-custom-highlights.md`.

Key points relevant to the locator design:
- Healing algorithm and locator schema are **orthogonal** to rendering mechanism
- Migration to CHA later requires no locator schema changes
- Current DOM-wrapping gives `event.target.dataset.annotationId` for free, which CHA can't match until WebKit ships `highlightsFromPoint`

### Versioning & Project Gutenberg

Booqs has no book-versioning story yet.

**For annotations**: design ahead. The `prefix` / `text` / `suffix` fields exist now so the healing pass works when versioning arrives — no schema migration needed later.

**For shared quotes**: accept that old URLs die if books are re-ingested. Add robust version-aware healing when versioning ships; by then the context-based healing approach will already be proven via the annotation healing path.

**Project Gutenberg specifics**: PG updates ebooks continuously (typo fixes + ongoing `ebookmaker` regeneration across all 60K titles). License explicitly states updated editions replace old ones. Pragmatic approach: **ingest once, cache, treat as canonical**. Re-ingest only on explicit triggers (user reports, known ebookmaker fixes). Store PG source etag/timestamp as metadata on cached copy to detect divergence. Don't auto-pull updates.

**Standard Ebooks** as a quality alternative for public-domain titles: ~1,000 carefully typeset books, semantically clean markup, much better starting material than raw PG output. Same versioning caution applies.

### Quote sharing: stateless URLs (future)

Requirement: must work offline, zero-latency, zero-network.

**Stateful share URLs rejected** despite offering better durability and analytics — the offline and latency constraints are hard.

Encoding: put the full locator in the URL. Budget ~200–400 bytes, well within URL limits.

```
https://booqs.app/b/<book-id>?q=<encoded-locator>
```

Recommended encoding: custom compact text format. Something like `p=2.4.6.12-2.4.6.45&t=<prefix>|<text>|<suffix>`. Smaller than base64 (~40%) and readable in URLs.

Keep old path-only format as a valid subset for backward compatibility.

### Open decisions

- **Context length**: start at 30 chars each side (`prefix` / `suffix`). Revisit if healing failure rates become noticeable in practice. Repetitive content (dialogue, lists) may need 50.
- **Book ID format in URLs**: slug (`/b/crime-and-punishment`) vs opaque short ID (`/b/a7f3d2`) vs hybrid (`/b/a7f3d2/crime-and-punishment`). User-uploaded books need opaque IDs regardless. Hybrid gives prettiness + uniqueness.

### Architectural principles reinforced

- **Pay for resilience only where drift is possible.** Same-render operations get fast paths. Cross-render operations get rich locators.
- **Multi-selector redundancy is the cross-spec convergence.** Both W3C Web Annotation and Readium Locator arrived at prefix/text/suffix + multiple redundant coordinates. Steal the pattern regardless of which spec to model after.
- **Standards at API boundaries, native types internally.** CFI as an adapter, never as a working representation.
- **Park mature-but-incomplete standards until they're actually done.** CHA's painting story is great; its interaction story isn't. Wait for `highlightsFromPoint` on WebKit before revisiting.

## See also

- [css-custom-highlights.md](css-custom-highlights.md) — highlight rendering investigation.
- [css-handling.md](css-handling.md) — EPUB CSS containment strategy.
