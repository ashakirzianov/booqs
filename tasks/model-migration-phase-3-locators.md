# Phase 3: Locator & Annotation Migration

Detailed task list for Phase 3 of the [Big Model Migration](model-migration.md). Design context in [Booqs Locator Design](../docs/booqs-locator-design.md) (see "Decided Architecture" section).

Each stage is an end-to-end change. The app must function on localhost after each stage (or be explicitly noted as a partial step within a stage).

## Stage 1: BooqLocator type

Pure addition — nothing breaks, no consumers yet.

### Core type (`core/`)

- [x] Define `BooqLocator` type in `core/model.ts`: `{ start, end?, prefix, text?, suffix }`
- [x] Export from `core/` barrel (if one exists)

## Stage 2: Mechanical rename — Note → Annotation

No logic changes. Pure rename of types, variables, file names, and imports. App should function identically after this stage.

### Backend (`backend/`)

- [x] Rename `backend/notes.ts` → `backend/annotations.ts`
- [x] Rename `DbNote` → `DbAnnotation`, `DbNoteWithAuthor` → `DbAnnotationWithAuthor`
- [x] Rename functions: `noteForId` → `annotationForId`, `notesWithAuthorFor` → `annotationsWithAuthorFor`, `addNote` → `addAnnotation`, `removeNote` → `removeAnnotation`, `updateNote` → `updateAnnotation`
- [x] Update all imports

### Data layer (`data/`)

- [x] Rename `data/notes.ts` → `data/annotations.ts`
- [x] Rename `BooqNote` → `BooqAnnotation`, `UnresolvedBooqNote` → `UnresolvedBooqAnnotation`, `NoteAuthorData` → `AnnotationAuthorData`
- [x] Rename functions: `fetchNotes` → `fetchAnnotations`, `createNote` → `createAnnotation`, `modifyNote` → `modifyAnnotation`, `deleteNote` → `deleteAnnotation`
- [x] Rename converter: `noteFromDb` (or similar) → `annotationFromDb`
- [x] Update all imports

### API routes (`app/api/`)

- [x] Rename `app/api/notes/` → `app/api/annotations/`
- [x] Update route handlers and types (`ResolvedNote` → `ResolvedAnnotation`, etc.)
- [x] Update request/response field names if they reference "note"

### GraphQL (`graphql/`)

- [x] Rename `graphql/note.ts` → `graphql/annotation.ts`
- [x] Rename `Note` type → `Annotation` in `schema.graphql`
- [x] Rename queries/mutations that reference "note" → "annotation"
- [x] Update resolvers

### Application layer (`application/`)

- [x] Rename `application/notes.ts` → `application/annotations.ts`
- [x] Rename `useBooqNotes` → `useBooqAnnotations`, `NoteAugmentation` → `AnnotationAugmentation`
- [x] Rename kind constants if they reference "note"
- [x] Update all imports

### Reader & components

- [x] Rename `reader/useNotesData.ts` → `reader/useAnnotationsData.ts`
- [x] Rename `reader/NoteNode.tsx` → `reader/AnnotationNode.tsx`
- [x] Rename `reader/NoteTargetMenu.tsx` → `reader/AnnotationTargetMenu.tsx`
- [x] Update imports and references in: `Reader.tsx`, `CommentsPanel.tsx`, `ContextMenuItems.tsx`, `CreateCommentTargetMenu.tsx`, `AskTargetMenu.tsx`, `useAugmentations.ts`, `NavigationPanel.tsx`, `nodes.ts`

### App pages

- [x] Rename `app/(main)/notes/` → `app/(main)/annotations/` (directory + page routes)
- [x] Rename `NoteCard.tsx` → `AnnotationCard.tsx`, `NoteFragment.tsx` → `AnnotationFragment.tsx`, `NotesFilter.tsx` → `AnnotationsFilter.tsx`
- [x] Update all imports and internal references

## Stage 3: Client-side locator construction + API accepts new fields

Client builds full locator on selection. API accepts new optional fields but server stores only what the old table supports (extra fields silently ignored until Stage 4).

### Viewer/selection

- [x] Update `getBooqSelection()` or introduce a helper that returns a `BooqLocator` (calls `getQuoteAndContext` with the current tree)
- [x] Determine how to pass the booq content (or relevant fragment) to the selection handler for context extraction

### Application layer

- [x] Update `createAnnotation` call sites to pass `prefix`, `text`, `suffix` from the locator
- [x] Update optimistic update logic to include locator fields

### Reader components

- [x] Update `AnnotationTargetMenu`, `CreateCommentTargetMenu`, `AskTargetMenu` to build full locator on creation
- [x] Ensure `ContextMenuItems` copy/quote actions still work

### API routes

- [x] Expand POST body schema (Zod) to accept optional `prefix`, `text`, `suffix` fields
- [x] Server accepts but does not yet store the new fields (old `notes` table unchanged)

## Stage 4: New annotations table + kind/color split

Switch from old `notes` table to new `annotations` table. Server now stores all locator fields. Old data is dropped.

### Database (`backend/`)

- [x] Create new `annotations` table (see schema in design doc)
- [x] Update `DbAnnotation` type to match new schema: `start_path`, `end_path`, `prefix`, `text`, `suffix`, `kind`, `color`, `content`, `privacy`, `created_at`, `updated_at`
- [x] Update SQL queries in `backend/annotations.ts` to use new table and columns
- [x] Drop or ignore old `notes` table (can defer actual DROP to later)

### Kind/color split

- [x] Remove `highlight-0` through `highlight-4` kinds — replace with `kind: 'highlight'` + `color: 'yellow' | 'blue' | ...`
- [x] Define semantic color names (e.g., in `core/` or `application/`)
- [x] Update `application/annotations.ts` — color mapping logic (semantic name → CSS color for augmentations)

### Data layer (`data/`)

- [x] Update `BooqAnnotation` type: add `color` field, update `kind` to only allow `'highlight' | 'comment' | 'question'`
- [x] Update `annotationFromDb` converter for new column mapping
- [x] Update `createAnnotation` to accept and store locator fields + color

### API routes

- [x] Update POST body schema — `prefix`, `text`, `suffix` become required (no longer optional)
- [x] Add `color` to POST body
- [x] Update PATCH if needed (can color be changed?)
- [x] Update GET response shape

### GraphQL

- [x] Update `Annotation` type in schema: add `color`, `prefix`, `suffix` fields; rename `text` field if conflicting
- [x] Update resolvers

## Stage 5: Cleanup and verification

- [x] Run `npm run build` — fix any errors
- [x] Test on localhost: create highlights, comments, questions; verify they render, persist, and round-trip correctly
- [x] Verify copy/quote still works
- [x] Verify CommentsPanel displays annotations
- [x] Update `docs/specs.md` with annotation model changes
- [x] Update `docs/ux.md` if any visual behavior changed

## Backlog items produced by this phase

To be added to `tasks/backlog.md` after implementation:

- [x] Bookmark migration to BooqLocator (point locator with prefix/suffix)
- [x] New quote URL format with embedded locator (`p=...&t=prefix|text|suffix`)
- [x] Healing implementation (see design doc in `docs/booqs-locator-design.md`)
