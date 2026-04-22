# shadcn/ui Adoption for Booqs

## Context

Investigated adopting Vercel's Geist Design System. Key finding: **Geist is not a component library** — it's a design language + font family. The publicly available artifacts are:
- **Geist font** (`npm i geist`) — Geist Sans + Geist Mono
- **Design reference site** (vercel.com/geist) — documents Vercel's internal components, not installable
- **Color/typography system** — documented but self-implemented

The practical path to a Geist-inspired UI is **shadcn/ui** — a component distribution system built on the same aesthetic principles.

## What is shadcn/ui

Not a dependency — a CLI that copies component source code into your project. You own everything, modify freely, no runtime dependency. Components are built on:
- **Radix UI** — headless primitives for behavior and accessibility
- **Tailwind CSS** — styling
- **CVA (class-variance-authority)** — type-safe variant definitions

```
npx shadcn@latest init          # sets up config, utils, CSS tokens
npx shadcn@latest add button    # copies button.tsx into components/ui/
npx shadcn@latest add dialog    # copies dialog.tsx, installs radix-ui
npx shadcn@latest diff          # shows upstream changes since you added
```

112k GitHub stars, actively maintained, MIT licensed.

## Dependencies

| Package | Purpose | Already in Booqs? |
|---|---|---|
| `radix-ui` | Headless UI primitives | No |
| `class-variance-authority` | Variant definitions | No |
| `tailwind-merge` | Smart class merging | No |
| `clsx` | Conditional classes | **Yes** |
| `tw-animate-css` | Animations for Tailwind v4 | No |
| `next-themes` | Dark mode toggle | No |
| `lucide-react` | Icons | No |
| `@floating-ui/react` | Positioning | **Yes** |

## Component Mapping

### Direct Replacements

| Current | shadcn Replacement | Benefit |
|---|---|---|
| `ActionButton` (3 variants) | `Button` (6 variants + sizes) | Richer variant system, CVA-based |
| `Modal` / `ModalFullScreen` | `Dialog` / `Sheet` | Proper focus trapping, accessibility |
| `Popover` (custom floating-ui) | `Popover` | Same Radix primitive, less custom code |
| `TabButton` | `Tabs` | Keyboard nav, ARIA roles built-in |
| Raw `<input>` elements | `Input` / `Textarea` | Consistent styling, focus rings |
| Search modal | `Command` (cmdk-based) | Keyboard-driven command palette |
| Pagination buttons | `Pagination` | Standard pattern with proper semantics |

### Keep As-Is (Too Specialized)

| Component | Why |
|---|---|
| `BooqCover` | Custom gradient generation, CDN logic |
| `ColorPicker` | 5-color highlight swatches, note-specific |
| `ProfileBadge` | Emoji/image/initials combo, unique |
| `NoteCard` | Complex expand/edit/reply state machine |
| `NotesFilter` | Color-based filtering, unique to domain |
| Reader layout components | Sticky panels, scroll-hide, content-centered grid |
| `Icons.tsx` (40+ icons) | Could migrate to `lucide-react` over time |

### New Components We'd Gain

- `Tooltip` — button hints (currently none)
- `Dropdown Menu` — for "more" actions menus
- `Skeleton` — loading placeholders
- `Alert` — structured error/success messages
- `Badge` — for tags (cleaner than custom BooqTags pills)
- `Drawer` (via vaul) — mobile-friendly bottom sheets
- `Sonner` — toast notifications

## Integration Challenges

### 1. Color System Reconciliation (moderate)

Current tokens → shadcn equivalents:

| Current Token | shadcn Equivalent |
|---|---|
| `--color-background` | `--background` / `--foreground` |
| `--color-primary` | `--primary` / `--primary-foreground` |
| `--color-action` | `--accent` / `--accent-foreground` |
| `--color-dimmed` | `--muted` / `--muted-foreground` |
| `--color-border` | `--border` |
| `--color-alert` | `--destructive` / `--destructive-foreground` |
| *(missing)* | `--card`, `--popover`, `--secondary`, `--ring`, `--input` |

Highlight colors (0–4) have no shadcn equivalent — they'd coexist as custom tokens.

### 2. `@theme static` → `@theme inline` (small)

One-line change in globals.css. Needed for shadcn's runtime dark mode switching.

### 3. Font Weight System (design decision)

Current ultra-light weights (200/250/300) are distinctive. shadcn assumes conventional weights (400/500/600). Options:
- Override component styles to use our weights (per-component edits)
- Accept shadcn's weights for UI chrome, keep light weights for book content only

### 4. Dark Mode Infrastructure (new)

Currently: `@media (prefers-color-scheme: dark)` (OS-based).
shadcn: class-based `.dark` with `next-themes` (user-toggleable).
Benefit: users could toggle dark mode independent of OS setting.

### 5. Font Choice

Could adopt Geist Sans for UI chrome (navigation, menus, controls) while keeping Lora for book content. Or keep Nunito Sans — it's a separate decision from component adoption.

## Adoption Phases

### Phase 1: Foundation
- Run `npx shadcn@latest init`
- Reconcile CSS tokens in globals.css (`@theme inline`, token mapping)
- Add `next-themes` provider
- Add `cn()` utility (`lib/utils.ts`)

### Phase 2: Core Replacements
- `ActionButton` → shadcn `Button`
- `Modal` → shadcn `Dialog`
- Raw inputs → shadcn `Input` / `Textarea`
- `TabButton` → shadcn `Tabs`
- `Popover` → shadcn `Popover`
- Update all call sites

### Phase 3: New Capabilities
- Replace search modal with `Command` (command palette)
- Add `Tooltip`, `Dropdown Menu`, `Sonner` (toast)

### Phase 4: Polish
- Evaluate `lucide-react` vs custom icons
- `Badge` for tags, `Skeleton` for loading states
- Consistent focus ring and animation patterns

## Geist Grid — Not Applicable

Investigated Geist Grid separately. **Not worth adopting** for Booqs.

### What It Is

A presentational CSS Grid system for marketing/landing pages. Key traits:
- **Visual guide lines are a design element** — dashed lines between cells and cross marks at intersections render as part of the UI (the Vercel marketing aesthetic)
- **Explicit row/column counts** — you declare exactly how many, not a 12-column system. Responsive via prop objects like `columns={{sm: 1, md: 2, lg: 4}}`
- **No gap/gutter concept** — spacing is cell padding; cells are edge-to-edge with guide lines as separators
- **Not publicly available** — Vercel-internal, documented as reference only

### Why It Doesn't Fit

Booqs has two **application layouts**, not content grids:

1. **Main Layout** — 3-column CSS Grid with sticky header + sticky sidebars + scrollable center. Classic app shell. Geist Grid doesn't address sticky positioning, sidebar scrolling, or header/panel interaction.
2. **Reader Layout** — Flex container + fixed overlay grid with transform-based panel animations and JS-driven auto-hide. Geist Grid has no concept of overlay grids, pointer-events management, or transform animations.

Both use named grid areas, sticky positioning, and responsive reflow — none of which Geist Grid provides or improves.

### Layout Inconsistencies Worth Fixing

The investigation did surface real inconsistencies in the current layouts (see task list below), but these are naming/consistency issues — a different grid system wouldn't address them.

## Decision

**Recommendation: adopt incrementally.** Rationale:
1. We're already building what shadcn provides, just by hand and without Radix accessibility
2. We own the code — custom weights, highlight colors, reader layouts can coexist
3. Incremental adoption is natural — add one component at a time, old and new coexist
4. Geist font + shadcn components = cohesive modern look
5. We gain capabilities (command palette, toast, tooltips) that would be significant effort from scratch
