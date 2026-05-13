# Tasks

## Active

### Layout consistency cleanup

Remaining items from the layout consistency effort (spacing and header height already unified).

- [ ] Reader grid area naming: replace numeric grid lines with named area references or named grid lines where possible; add comments for spans
- [ ] Panel width variable: check if `--panel-width` is used anywhere; remove from globals.css if unused, or move to relevant CSS module
- [ ] Button size variable: check if `--button-size` is used outside ReaderLayout.module.css; add comment if reader-specific, or move to globals.css if shared

### Post-migration follow-up

- [ ] Fix tsconfig.json warnings
- [ ] Re-enable booq-level cache (disabled during model migration; see `backend/parse.ts`)

### Bugs

- [ ] Quote links load the entire book instead of the containing fragment
- [ ] New highlight creation causes a momentary visual flicker — investigate and fix
- [ ] Visually align icons with text in the context menu

## Backlog

See [docs/backlog.md](docs/backlog.md) for detailed backlog items.

## Deferred

(empty)
