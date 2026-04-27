# Big Model Migration

Coordinated migration spanning three design docs:
- [IR migration design](../docs/ir-design-migration.md) — bring IR closer to EPUB
- [CSS handling](../docs/css-handling.md) — migrate from selector rewriting to `@scope`
- [Locator design](../docs/booqs-locator-design.md) — resilient annotation locators

## Guiding principles

- **Iterative**: each phase produces a working system. No big-bang rewrite.
- **No backward compatibility**: we don't have valuable user data. Stored paths, bookmarks, history, notes can all break between phases.
- **End-to-end changes**: each commit includes parser, core, and renderer changes together so the app stays functional. Easier to review — the renderer change is obviously motivated by the parser change.
- **One concern at a time**: don't mix IR shape changes with CSS strategy changes with locator changes.
- **Stages within phases**: each phase has clear stages. The app should remain functional (or nearly so) on localhost after each stage, verified by testing.

## Phase 1: New type model + parser simplification

Goal: introduce `BooqDocument` / `BooqElement` types, simplify the parser to produce EPUB-faithful output, move transformations to post-processing and client-side rendering.

What this phase achieves:
- New type model: `BooqDocument`, `BooqElement`, `BooqChildNode`, `BooqTextNode`, `BooqStub`, `BooqNode` interface
- Parser produces near-raw EPUB content (no attribute camelCasing, no element renaming, no style extraction)
- Server-side post-processing pipeline handles: CSS preprocessing, ID scoping + href resolution, paragraph marking, image processing
- Client-side rendering handles: React-specific attribute normalization, element mapping, style resolution
- In-book navigation uses browser-native `#id` with scoped IDs (no `BooqPath`-based link resolution)
- All custom data attributes use `data-booqs-` prefix

Detailed task list: `tasks/phase-1-ir.md` (to be created)

## Phase 2: CSS `@scope` migration

Goal: replace selector-rewriting preprocessor with `@scope`-based containment.

Depends on: Phase 1 (documents carry their own `<head>` with style references).

What this phase achieves:
- CSS containment via `@scope` instead of `postcss-prefix-selector`
- Root selector rewriting (`html`, `body`, `:root` → `:scope`)
- Inline `style` attribute sanitization for theming
- Original selectors visible in DevTools
- Optional per-spine-item `@scope` isolation

See [css-handling.md](../docs/css-handling.md) for full design.

Detailed task list: `tasks/phase-2-css.md` (to be created)

## Phase 3: Locator migration

Goal: introduce `BooqLocator` with text context for resilient annotations.

Depends on: Phase 1 (stable new path scheme).

What this phase achieves:
- `BooqLocator` type with `before`/`highlight`/`after` context fields
- Server-side and client-side healing for drifted annotations
- Stateless quote-sharing URLs
- Clipboard enrichment (rich paste)

See [booqs-locator-design.md](../docs/booqs-locator-design.md) for full design.

Detailed task list: `tasks/phase-3-locators.md` (to be created)

## Phase 4: Documentation

Goal: document the final IR design and update specs.

Depends on: Phase 1 (write docs based on what we actually built).

What this phase achieves:
- `docs/ir-design.md` — IR design document (types, rationale, invariants)
- `docs/specs.md` updated to reflect new IR model

## Phase ordering and dependencies

```
Phase 1 (IR)
  ├──→ Phase 2 (CSS @scope)
  ├──→ Phase 3 (Locators)
  └──→ Phase 4 (Docs)
```

Phases 2, 3, and 4 are independent of each other and can be done in any order.

## Suggestions

- **Test with diverse EPUBs**: Project Gutenberg books, user uploads, and books with complex CSS (tables, SVG, `@font-face`, RTL) should all be checked after each phase.
- **Parser diagnostics**: the current diagnostic system (`Diagnoser`) is useful. Keep it and consider logging a before/after comparison during development to catch regressions.
