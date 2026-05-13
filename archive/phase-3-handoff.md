# Phase 3 & Model Cleanup Handoff

## What was done

### Phase 3: Locators & Annotations (completed prior session)
- `BooqNote` → `BooqAnnotation` rename across all layers
- `BooqLocator` type: `{ start, end?, prefix, text?, suffix }`
- `BooqAnnotation` uses nested `locator: BooqLocator` field
- New `annotations` table (old `notes` dropped, no data migration)
- Kind/color split: `kind: 'highlight'` + semantic `color` field
- Client-side locator construction via `BooqSelection.prefix`/`suffix`
- API POST accepts `{ locator, kind, color?, content?, privacy }`
- Healing design doc: `docs/booqs-locator-design.md`

### Model cleanup (this session)
- Added `BooqContent = BooqDocument[]` and `BooqContainerNode = BooqDocument | BooqElement`
- Tightened core function signatures: `nodeForPath` takes `BooqContainerNode`, `visitNodes`/`nodeText` take `BooqChildNode`
- Parser: renamed `section.ts` → `document.ts`, removed `xmlTree.ts`
- Merged `scopeIds.ts` into `process.ts`, extracted `transformStyleNode` from `styles.ts`
- Processing pipeline now mutates documents in place (memory efficiency)
- Moved sanitization from `document.ts` to `process.ts`
- Fixed `sliceChildren` end boundary bug (next chapter title was leaking into previous chapter)
- Removed dead code: `useHashPath.ts`, `extract.ts`, `schema.ts`
- Investigated switching to `fast-xml-parser` — reverted (tree shape parity issues, `htmlparser2` is correct tool for document parsing)

## What's next

### Immediate (next session)
- **Sunset `id=pathToId` pattern**: augmentation spans currently get `id: pathToId(span.path)` which is used for native browser hash-scroll. Replace with `#aug-{annotationId}` navigation for annotations. Need to understand what actually uses path-based IDs (quote links? ToC?) and design unified approach.
- **Phase 4: Documentation**: write `docs/ir-design.md`, update `docs/specs.md`

### Backlog
- Booq-level cache disabled in `backend/library.ts` (`useCache = false`) — re-enable after migration
- Bookmark migration to BooqLocator (deferred, bookmarks not in UI)
- New quote URL format with locator encoding
- Healing implementation (design doc exists, implementation deferred)
- Tree hash / book versioning (in healing design doc as "needed infrastructure")
- Per-document @scope isolation edge cases
- Shared stylesheet dedup optimization

## Key design decisions made this session

1. **`field?: undefined` pattern** — keep as-is, no `DiscriminatorFields` abstraction (union is small, maintenance burden is low)
2. **`BooqNode` kept** — still needed for polymorphic tree-walking; `BooqContent`/`BooqContainerNode` added for precision at usage sites
3. **In-place mutation in parser pipeline** — deliberate exception to immutability preference; linear pipeline, no shared references, memory-constrained serverless environment. Documented in CLAUDE.md.
4. **Keep `htmlparser2`** — correct tool for document structure preservation. `fast-xml-parser` designed for data extraction, not document fidelity.
5. **`styles.ts` stays separate** — CSS transformation is different abstraction level from tree-walking in `process.ts`. Exports `transformStyleNode`, consumed by `process.ts`.

## Files changed (key ones)
- `core/model.ts` — `BooqContent`, `BooqContainerNode` types
- `core/path.ts`, `core/text.ts`, `core/node.ts`, `core/fragment.ts`, `core/iterator.ts` — tightened signatures
- `parser/document.ts` — was `section.ts`, simplified (no more xmlTree dependency)
- `parser/process.ts` — absorbed scopeIds, sanitization
- `parser/styles.ts` — exports `transformStyleNode`
- `viewer/render.ts` — uses `BooqContent`
- Deleted: `parser/xmlTree.ts`, `parser/scopeIds.ts`, `parser/extract.ts`, `parser/schema.ts`, `reader/useHashPath.ts`
