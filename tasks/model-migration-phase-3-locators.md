# Phase 3: Locator & Annotation Migration

Detailed task list for Phase 3 of the [Big Model Migration](model-migration.md). Design context in [Booqs Locator Design](../docs/booqs-locator-design.md) (see "Decided Architecture" section).

Each stage is an end-to-end change. The app must function on localhost after each stage (or be explicitly noted as a partial step within a stage).

## Stage 1: BooqLocator type

Pure addition — nothing breaks, no consumers yet.

### Core type (`core/`)

- [ ] Define `BooqLocator` type in `core/model.ts`: `{ start, end?, prefix, text?, suffix }`
- [ ] Export from `core/` barrel (if one exists)

## Stage 2: Mechanical rename — Note → Annotation

No logic changes. Pure rename of types, variables, file names, and imports. App should function identically after this stage.

### Backend (`backend/`)

- [ ] Rename `backend/notes.ts` → `backend/annotations.ts`
- [ ] Rename `DbNote` → `DbAnnotation`, `DbNoteWithAuthor` → `DbAnnotationWithAuthor`
- [ ] Rename functions: `noteForId` → `annotationForId`, `notesWithAuthorFor` → `annotationsWithAuthorFor`, `addNote` → `addAnnotation`, `removeNote` → `removeAnnotation`, `updateNote` → `updateAnnotation`
- [ ] Update all imports

### Data layer (`data/`)

- [ ] Rename `data/notes.ts` → `data/annotations.ts`
- [ ] Rename `BooqNote` → `BooqAnnotation`, `UnresolvedBooqNote` → `UnresolvedBooqAnnotation`, `NoteAuthorData` → `AnnotationAuthorData`
- [ ] Rename functions: `fetchNotes` → `fetchAnnotations`, `createNote` → `createAnnotation`, `modifyNote` → `modifyAnnotation`, `deleteNote` → `deleteAnnotation`
- [ ] Rename converter: `noteFromDb` (or similar) → `annotationFromDb`
- [ ] Update all imports

### API routes (`app/api/`)

- [ ] Rename `app/api/notes/` → `app/api/annotations/`
- [ ] Update route handlers and types (`ResolvedNote` → `ResolvedAnnotation`, etc.)
- [ ] Update request/response field names if they reference "note"

### GraphQL (`graphql/`)

- [ ] Rename `graphql/note.ts` → `graphql/annotation.ts`
- [ ] Rename `Note` type → `Annotation` in `schema.graphql`
- [ ] Rename queries/mutations that reference "note" → "annotation"
- [ ] Update resolvers

### Application layer (`application/`)

- [ ] Rename `application/notes.ts` → `application/annotations.ts`
- [ ] Rename `useBooqNotes` → `useBooqAnnotations`, `NoteAugmentation` → `AnnotationAugmentation`
- [ ] Rename kind constants if they reference "note"
- [ ] Update all imports

### Reader & components

- [ ] Rename `reader/useNotesData.ts` → `reader/useAnnotationsData.ts`
- [ ] Rename `reader/NoteNode.tsx` → `reader/AnnotationNode.tsx`
- [ ] Rename `reader/NoteTargetMenu.tsx` → `reader/AnnotationTargetMenu.tsx`
- [ ] Update imports and references in: `Reader.tsx`, `CommentsPanel.tsx`, `ContextMenuItems.tsx`, `CreateCommentTargetMenu.tsx`, `AskTargetMenu.tsx`, `useAugmentations.ts`, `NavigationPanel.tsx`, `nodes.ts`

### App pages

- [ ] Rename `app/(main)/notes/` → `app/(main)/annotations/` (directory + page routes)
- [ ] Rename `NoteCard.tsx` → `AnnotationCard.tsx`, `NoteFragment.tsx` → `AnnotationFragment.tsx`, `NotesFilter.tsx` → `AnnotationsFilter.tsx`
- [ ] Update all imports and internal references

## Stage 3: Client-side locator construction + API accepts new fields

Client builds full locator on selection. API accepts new optional fields but server stores only what the old table supports (extra fields silently ignored until Stage 4).

### Viewer/selection

- [ ] Update `getBooqSelection()` or introduce a helper that returns a `BooqLocator` (calls `getQuoteAndContext` with the current tree)
- [ ] Determine how to pass the booq content (or relevant fragment) to the selection handler for context extraction

### Application layer

- [ ] Update `createAnnotation` call sites to pass `prefix`, `text`, `suffix` from the locator
- [ ] Update optimistic update logic to include locator fields

### Reader components

- [ ] Update `AnnotationTargetMenu`, `CreateCommentTargetMenu`, `AskTargetMenu` to build full locator on creation
- [ ] Ensure `ContextMenuItems` copy/quote actions still work

### API routes

- [ ] Expand POST body schema (Zod) to accept optional `prefix`, `text`, `suffix` fields
- [ ] Server accepts but does not yet store the new fields (old `notes` table unchanged)

## Stage 4: New annotations table + kind/color split

Switch from old `notes` table to new `annotations` table. Server now stores all locator fields. Old data is dropped.

### Database (`backend/`)

- [ ] Create new `annotations` table (see schema in design doc)
- [ ] Update `DbAnnotation` type to match new schema: `start_path`, `end_path`, `prefix`, `text`, `suffix`, `kind`, `color`, `content`, `privacy`, `created_at`, `updated_at`
- [ ] Update SQL queries in `backend/annotations.ts` to use new table and columns
- [ ] Drop or ignore old `notes` table (can defer actual DROP to later)

### Kind/color split

- [ ] Remove `highlight-0` through `highlight-4` kinds — replace with `kind: 'highlight'` + `color: 'yellow' | 'blue' | ...`
- [ ] Define semantic color names (e.g., in `core/` or `application/`)
- [ ] Update `application/annotations.ts` — color mapping logic (semantic name → CSS color for augmentations)

### Data layer (`data/`)

- [ ] Update `BooqAnnotation` type: add `color` field, update `kind` to only allow `'highlight' | 'comment' | 'question'`
- [ ] Update `annotationFromDb` converter for new column mapping
- [ ] Update `createAnnotation` to accept and store locator fields + color

### API routes

- [ ] Update POST body schema — `prefix`, `text`, `suffix` become required (no longer optional)
- [ ] Add `color` to POST body
- [ ] Update PATCH if needed (can color be changed?)
- [ ] Update GET response shape

### GraphQL

- [ ] Update `Annotation` type in schema: add `color`, `prefix`, `suffix` fields; rename `text` field if conflicting
- [ ] Update resolvers

## Stage 5: Cleanup and verification

- [ ] Run `npm run build` — fix any errors
- [ ] Test on localhost: create highlights, comments, questions; verify they render, persist, and round-trip correctly
- [ ] Verify copy/quote still works
- [ ] Verify CommentsPanel displays annotations
- [ ] Update `docs/specs.md` with annotation model changes
- [ ] Update `docs/ux.md` if any visual behavior changed

## Backlog items produced by this phase

To be added to `tasks/backlog.md` after implementation:

- [ ] Bookmark migration to BooqLocator (point locator with prefix/suffix)
- [ ] New quote URL format with embedded locator (`p=...&t=prefix|text|suffix`)
- [ ] Healing implementation (see design doc in `docs/booqs-locator-design.md`)
