# Layout Consistency Cleanup

Inconsistencies discovered during Geist Grid investigation. These are independent of the shadcn/ui adoption and can be done anytime.

## Spacing Variable Unification

Three different spacing scales exist for the same values:

| Value | globals.css | MainLayout | ReaderLayout |
|-------|------------|------------|--------------|
| 0.5rem | `--spacing-base` | `--spacing-regular` | `--meter-regular` |
| 1rem | `--spacing-lg` | `--spacing-large` | `--meter-large` |
| 4rem | `--spacing-2xl` | *(not defined)* | `--meter-xxlarge` |

- [x] Remove `--spacing-regular` / `--spacing-large` from MainLayout.module.css; use globals `--spacing-base` / `--spacing-lg` instead
- [x] Remove `--meter-regular` / `--meter-large` / `--meter-xxlarge` from ReaderLayout.module.css; use globals `--spacing-base` / `--spacing-lg` / `--spacing-2xl` instead
- [x] Audit both files for any remaining local spacing variables; all spacing should come from the global scale

## Header Height

Root defines `--header-height: 3rem`, but MainLayout overrides it to `4rem`. ReaderLayout uses `var(--header-height)` (gets root 3rem). This means the main app and reader have different header heights.

- [x] Unified to 3rem — removed `--header-height: 4rem` override from MainLayout.module.css; both layouts now use the root value

## Content Width

MainLayout uses `--content-width: 780px`, ReaderLayout uses `--content-width: 720px`. These are intentionally different (app content vs. reading column), but both are locally scoped with the same variable name.

- [x] Moved to globals.css as `--width-content-main: 780px` and `--width-content-reader: 720px`; both modules now reference the global tokens via local `--content-width` alias

## Reader Grid Area Naming

Reader panels use numeric grid lines (`grid-area: 2 / 1 / 4 / 2`) while everything else uses named areas (`left-btns`, `content`). This makes the CSS harder to read.

- [ ] Replace numeric grid lines with named area references or named grid lines where possible
- [ ] If numeric lines are needed for spanning multiple areas, add a comment explaining the span (e.g., `/* spans rows 2-3, column 1: covers panelc + footer */`)

## Panel Width Variable

`:root` defines `--panel-width: 420pt` but it's not referenced in either CSS module file.

- [ ] Check if `--panel-width` is used anywhere in the codebase
- [ ] If unused, remove it from globals.css
- [ ] If used in component styles, consider whether it should move to the relevant CSS module

## Button Size Variable

ReaderLayout defines `--button-size: 64px` locally. This might be better as a global token if PanelButton (2rem) and reader buttons (64px) should share a scale.

- [ ] Check if `--button-size` is used outside ReaderLayout.module.css
- [ ] If it's reader-specific, it's fine as-is — just add a comment noting it
- [ ] If it should be shared, move to globals.css spacing scale
