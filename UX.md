# Booqs - UX & UI Design

> Detailed visual design, layout, and component specifications for the Booqs application.

---

## 1. Design System

### 1.1 Typography

- **UI Font (--font-main)**: Nunito Sans (sans-serif), variable font, subsets: latin, cyrillic. Used for all interface elements, navigation, buttons, and labels.
- **Book Font (--font-book)**: Lora (serif), variable font, subsets: latin-ext, cyrillic-ext. Used for rendering book content in the reader.

**Font Weights** (defined in globals.css, overriding Tailwind defaults):

| Tailwind class | CSS variable | Value | Usage |
|---|---|---|---|
| `font-normal` | `--font-weight-normal` | 200 | Body text, labels, controls, buttons, menu items |
| `font-medium` | `--font-weight-medium` | 250 | Sub-headings (h2, h3 section titles) |
| `font-bold` | `--font-weight-bold` | 300 | Main headings (h1, page titles) |

Only these three weight classes are used. To adjust the overall weight feel, change the three values in `globals.css`.

### 1.2 Color Palette

**Light Mode:**
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `white` | Page backgrounds |
| `primary` | `black` | Main text |
| `dimmed` | `#867b6c` | Secondary text, labels |
| `action` | `#F57F17` | Interactive elements, buttons |
| `highlight` | `orange` | Hover states, active indicators |
| `border` | `#ddd` | Borders, dividers |
| `alert` | `#f00` | Errors, destructive actions |
| `light` | `#fff` | Light text on dark backgrounds |

**Dark Mode (via `prefers-color-scheme: dark`):**
| Token | Value |
|-------|-------|
| `background` | `black` |
| `primary` | `#999` |
| `dimmed` | `#aaa` |
| `action` | `#867b6c` |
| `highlight` | `white` |
| `border` | `#333` |
| `light` | `#ddd` |

**Highlight Colors (for notes/annotations):**
| Token | Value | Description |
|-------|-------|-------------|
| `highlight-0` | `rgba(255, 215, 0, 0.6)` | Gold |
| `highlight-1` | `rgba(135, 206, 235, 0.6)` | Sky blue |
| `highlight-2` | `rgba(240, 128, 128, 0.6)` | Light coral |
| `highlight-3` | `rgba(75, 0, 130, 0.6)` | Indigo |
| `highlight-4` | `rgba(34, 139, 34, 0.6)` | Forest green |

**Special Colors:**
- `quote`: `rgba(255, 165, 0, 0.6)` - Shared quote highlights
- `selection`: `rgba(180, 213, 255, 0.99)` - Text selection
- `comment`: `transparent` - Comment annotations (no visible highlight)

### 1.3 Spacing Scale

| Token | Value |
|-------|-------|
| `xs` | 0.125rem |
| `sm` | 0.25rem |
| `base` | 0.5rem |
| `lg` | 1rem |
| `xl` | 2rem |
| `2xl` | 4rem |

### 1.4 Shadows

Two levels, using Tailwind's built-in shadows:
- **`shadow`**: Cards, panels, containers (default elevation)
- **`shadow-lg`**: Modals, floating overlays, hover states (elevated)

### 1.5 Animations

- `fade-in`: 0.3s ease-out, translateY(-8px) to 0 with opacity 0 to 1.
- Transitions: most interactive elements use 150-300ms transitions on color, opacity, transform.

### 1.6 Icons

All icons use a CSS custom property `--icon-stroke-width` (default `0.75`) for stroke width. Override from any parent to adjust icon weight in context:
```css
<div style="--icon-stroke-width: 1.5"><SettingsIcon /></div>
```

### 1.7 Responsive Breakpoints

Breakpoints are derived from content width (780px) + panel space requirements:
- **Large** (>= 1140px): Full 3-column layout, side panels with icons + labels. Threshold: 780px content + ~180px per side panel.
- **Medium** (880–1139px): 3-column layout, side panels with icons only (no labels). Threshold: 780px content + ~48px per side panel.
- **Small** (< 880px): Single column, side panels hidden, bottom tab bar for navigation, header splits into two non-overlapping columns.
- Mobile devices with max-device-width 1024px get 120% base font size

### 1.8 Theme Viewport

- Light mode theme-color: `#FFA500` (orange)
- Dark mode theme-color: `#000000` (black)

---

## 2. Global Layout

### 2.1 Root Layout

- `<html lang="en">` with both font CSS variables applied to `<body>`
- Wrapped in `<AppProvider>` which provides application-level context (auth, theme, etc.)
- PWA manifest at `/manifest.json`

### 2.2 Main Layout (all pages except reader and auth)

**Structure**: CSS Grid with 3 columns:
```
[left-gutter (flexible)] [content (780px)] [right-gutter (flexible)]
```

**Header (fixed, top)**:
- **Left header** (in left gutter): Logo (links to home) + Search box (only shown if user has reading history)
- **Right header** (in right gutter): Upload button (signed-in users only) + Account button

**Left Panel** (fixed sidebar, below header, in left gutter):
- Navigation menu (signed-in users only) with links: Feed, Notes, Collections, Followers, History, Profile
- Each menu item has an icon (1.5rem, centered in a 2rem container matching the logo size) and label
- Icons are visually aligned with the logo above
- Active item indicated by highlight color

**Main Content** (center column, 780px max): Page-specific content

**Right Panel** (fixed sidebar, in right gutter): Used on notes pages for book navigation

**Bottom Tab Bar** (mobile only, signed-in users):
- Fixed at bottom of viewport, icon-only (no labels)
- Tabs: Feed, Notes, Collections, History, Profile
- Icon size: 1.5rem. Active tab in action color, inactive in dimmed
- Respects `safe-area-inset-bottom` for notched devices
- Hidden on large screens

**Mobile** (<=1024px): Single column, header splits into left (logo + search) and right (upload + account) non-overlapping columns, side panels hidden, bottom tab bar for navigation.

---

## 3. Page Layouts

### 3.1 Home / Feed

**Returning users:**
- "Continue reading" heading
- `BooqPreview` card: book title, text excerpt, page number, linking to reading position

**New users:**
- Centered "Explore collection" heading
- Large search input ("Search for books...") that opens search modal on click

### 3.2 Book Details

- **Cover image** (360px, left-aligned on desktop, centered on mobile)
- **Title** in large bold text (4xl)
- **Authors** as comma-separated links
- **Tags**: Subject tags (purple, `#673AB7`) and language tags (green, `#4CAF50`), each clickable
- **Action buttons**: "Start Reading" / "Continue Reading" (orange), "Add to Reading List" toggle
- **Table of Contents**: "CONTENTS" heading with indented chapter links (1.5rem per nesting level)

### 3.3 Search Results

- Results split into **Authors** and **Books** sections
- **Book results**: Cover thumbnail (60px), title + author, "Add"/"Remove" toggle, "Read" link
- **Author results**: Simple list items linking to author browse
- Empty state: "No results found for '[query]'"

### 3.4 Library Browse

- Grid of `BooqCard` components (30rem wide, responsive flex layout)
- Cards: book cover + title + author + tags + Read/Add buttons
- **Pagination**: Previous/Next buttons with "Page X of Y (Z total)"

### 3.5 Collections

Two sections: **My Uploads** and **My Reading List**
- Card grid with cover, title, author, tags, "Read" link, "Remove" button
- Empty state: "Nothing here yet"

### 3.6 Reading History

- Paginated list (20 items/page) with `BriefEntry` (small cover 120px) or `DetailedEntry` (card with text excerpt)
- Entries link to reading position, can be removed
- Empty state: "No reading history yet. Start reading to see your history here!"

### 3.7 Notes

**Layout**: Main content + right panel sidebar

**Index page** (`/notes`): Auto-redirects to first book with notes. If no notes exist: "No notes found. Start reading a book to create notes."

**Header**: "Notes for [Book Title] by [Author]" — title links to reader, each author name links to author browse page. Both have hover:highlight+underline.

#### Filter Bar

Horizontal row of filter buttons across the top:
```
[All (N)] [Gold] [Sky Blue] [Coral] [Indigo] [Green] [Comments]
```
- Each button's background matches its highlight color (at 70% opacity)
- **Active indicator**: 5px solid bottom border in the color's darker shade
- Clicking a filter shows only notes of that color/type; "All" shows everything
- Each button displays a count of matching notes
- **Smart filter switching**: When a note's color is changed and it would disappear from the current filter, the filter automatically switches to the new color to keep the note visible

#### Note Cards

Each note card has three sections stacked vertically:

**1. Context Fragment (expand/collapse)**
- **Collapsed** (default): Shows only the `targetQuote` (the originally highlighted text) with the note's highlight color as background
- **Expanded**: Renders the full surrounding book content using the book's actual styles and layout. All notes in the region (including overlapping notes from other highlights) appear with their respective highlight colors. Clicking any highlighted passage navigates to that position in the reader.
- Click the quote to expand; click the "Collapse" button (top-left) to collapse

**2. Control Row** (visible when expanded)
- **Left**: Collapse button
- **Right**: Color picker (5 color swatches to change the note's highlight color; selected color has a top border; hidden for comments and questions) + Remove button (trash icon)

**3. Note Content (inline edit)**
- **View mode**: Shows note text in italic. If empty, shows "Add note…" placeholder in dimmed color. Click to enter edit mode.
- **Edit mode**: Textarea (3 rows min, auto-focused) with Save (primary) and Cancel (secondary) buttons. Allows empty content (clears the note text). Keyboard shortcuts: Enter to save, Cmd/Ctrl+Enter for newline, Escape to cancel.

**4. Replies** (public comments only)
- Flat list of replies, each showing: content with dimmed left border, author badge + name (linked to profile) + relative timestamp, delete button (own replies only)
- "Reply" button (visible when signed in) toggles a reply form: textarea with Cmd/Ctrl+Enter submit, Cancel/Post buttons

#### Right Panel Sidebar — Book Navigation

Lists all books that have user notes:
- Each item shows: book cover (60px), title, author names
- **Selected book**: text and border in highlight color
- **Unselected**: text in primary, border in dimmed color
- Click to navigate to that book's notes page

#### Empty States

- **No notes for book**: "No notes yet" with "Start Reading" CTA button
- **No notes of selected color**: "No notes of selected color."
- **No books with notes** (sidebar): "No books with notes yet"

### 3.8 Profile

- **Profile card**: Badge (emoji/picture, 4rem, circular), hoverable "Edit" overlay, display name, username, email, member since
- **Edit mode**: Editable name/username, emoji selector (modal, 8-column grid), Update/Cancel buttons, field-specific errors
- **Passkey section**: Add/remove WebAuthn passkeys
- **Account actions**: Sign Out, Delete Account (with confirmation)

### 3.9 Followers

Two sections:
1. **Following**: Users with Unfollow buttons
2. **Followers**: Users with Follow/Unfollow buttons

### 3.10 User Profile

- Profile card: avatar badge, display name, username, member since
- Follow button (if viewing another user while signed in)
- Social connections: Following/Followers lists
- Books: User's uploads as collection grid

### 3.11 Auth Pages

**Sign In** (`/auth`): Centered layout, large logo at top.
- Email input → "Send Link" button (primary, full-width)
- Success: "Check Your Email" screen, magic link expires in 1 hour
- Divider: "--- or ---"
- "Sign in with Passkey" button (secondary, full-width, passkey icon)

**Sign Up** (`/auth/signup`): Centered layout, logo.
- Pre-filled fields: Email (disabled), Username, Name, Profile Emoji
- "Complete Sign Up" → then "Add Passkey" page

**Sign In Error** (`/auth/signin/error`):
- "Sign-in Failed" heading (alert color), error message
- "Try Again" (primary) and "Continue to App" (secondary outline) buttons

---

## 4. Reader Interface

The reader is a full-screen, immersive reading experience.

### 4.1 Layout

**CSS Grid** structure:
```
Desktop (>1280px):
  [left-buttons]  [content (720px)]  [right-buttons]
  [left-panel]    [content]           [right-panel]
  [left-footer]   [content]           [right-footer]

Mobile/Tablet (<=1280px):
  [left-buttons]  [right-buttons]
  [content spanning full width]
  [left-footer]   [right-footer]
```

- Content area max-width: 720px, centered
- Controls overlay is fixed position, full viewport, with `pointer-events: none` (only buttons receive events)
- Book content rendered in Lora (serif) font with configurable font scale

### 4.2 Controls Visibility

On mobile/tablet:
- Header bar and footer bar auto-hide when scrolling (slide out with 250ms transform transition)
- Show when: scroll pauses, or when left/right panel is open, or when context menu floater is not visible
- Background bars (top/bottom) provide visual separation with box-shadow

On desktop: Controls are always visible in side gutters.

### 4.3 Header Controls

**Left buttons**:
- Back button (arrow icon, links to home/feed)
- Table of Contents button (TOC icon, toggles left navigation panel)

**Right buttons**:
- Comments button (comment icon, toggles right comments panel — also opens when a question is asked or a comment is created)
- Theme button (font icon, opens font size popover)
- Account button (profile badge or sign-in icon)

### 4.4 Footer

- **Left footer**: Page counter "X of Y" (current page of total pages in chapter)
- **Right footer**: "N pages left" or "Last page"

### 4.5 Navigation (Previous/Next)

- Previous and Next chapter buttons displayed above and below the book content
- Each shows the chapter title (or "Previous"/"Next" fallback)
- Styled as bordered pills with hover color transition
- Links to the corresponding chapter path

### 4.6 Book Content Rendering

- Book content is rendered from a tree of `BooqNode` objects (parsed from EPUB)
- Nodes are rendered recursively with proper HTML elements
- **CSS Handling**: Stylesheets from the EPUB are deduplicated and stored once in `Booq.styles` (a `Record<string, string>` keyed by stylesheet href or synthetic key for inline styles). Each section node stores only a `styleRefs` array of keys into this map. When a section is built, only the referenced styles are included in the section's `BooqFragment.styles`. At render time, CSS is hydrated on section nodes by looking up `styleRefs` in the styles map, namespacing selectors with the section's class prefix (e.g., `.booqs-Text-chapter-xhtml`), and injecting `<style>` tags. This avoids duplicating large stylesheets across sections — in image-heavy books, this can reduce the in-memory book size from ~23MB to ~4MB.
- **Augmentations** are overlaid on the content:
  - Highlight annotations (colored backgrounds matching highlight color tokens)
  - Comment/question indicators (dashed underline, no background color)
  - Quote highlights (orange tint)
  - Selection highlight (blue tint)
- Clicking a highlight augmentation opens the context menu for that note
- Clicking a comment/question augmentation opens the comments panel directly (no context menu)
- Internal book links are converted to navigation links within the reader
- Images within books are rendered inline

### 4.7 Font Scale

- Accessed via the Theme button (popover)
- Two buttons: "Abc" in small size (decrease) and "Abc" in large size (increase)
- Changes font size by 10% increments (minimum 10%)
- Applied as `fontSize` percentage on the book content wrapper
- Persisted across sessions

### 4.8 Left Panel - Navigation/Table of Contents

Slides in from the left with 250ms transition. On mobile/tablet, overlays the content.

Contents:
- "CONTENTS" heading (tracking-widest, bold, centered)
- **Navigation filter**: Toggle buttons to show/hide own notes and notes from other authors in the TOC
- **Navigation nodes**: Mixed list of:
  - **TOC entries**: Chapter titles with indent levels, linking to chapter positions
  - **Note entries**: User's highlights/notes interleaved at their position in the book, showing quoted text and note content
  - **Grouped notes**: Multiple notes at same position collapsed into a group

### 4.9 Right Panel - Comments / Context Menu Detail

Slides in from the right. Shows either:

**Comments Panel** (two views):

*Comments list*:
- "COMMENTS" heading
- Filter tabs: "All" / "Following" (only if signed in)
- Comment items, each showing:
  - Referenced text as an italic blockquote with orange left border, clickable to scroll to position
  - Comment content text
  - Author info: emoji avatar, name (linked to profile), relative timestamp
- Click a comment to see its detail view

*Comment detail*:
- "All comments" back button (navigates to comments list, not close)
- Single comment with full content, edit/delete actions (own comments), and replies

**Context Menu Detail Panel**:
- When a note/highlight is clicked and screen is wide enough for side panel, the note detail shows here instead of a floater

### 4.10 Context Menu (Text Selection)

When user selects text in the book:

**Floater** (appears near selection on desktop, or in side panel):
- **Color picker** (for creating highlights): Row of 5 color swatches matching highlight colors. Clicking creates a highlight of that color.
- **Add comment**: Opens comment creation form
- **Ask question**: Opens AI question interface
- **Copy quote**: Copies quoted text with link to the position
- Note: Copying any selected text automatically formats it as a quote with a link

### 4.11 Note Detail Menu

When clicking an existing highlight/note:

- **Color picker** (own notes only): Change highlight color
- **Note content**: Display text, or "Add note" prompt if empty
- **Action buttons**:
  - Edit (own notes with content)
  - Ask (AI question about this passage + note)
  - Share (copy quote to clipboard)
  - Remove (own notes only)
- **Edit mode**: Textarea for note content, Save (Ctrl/Cmd+Enter) / Cancel buttons
- **Author info** (others' notes): Profile badge, name linked to profile, "created" or "edited" + relative time

### 4.12 Comment Creation

- Textarea: "Add a comment..." placeholder
- Cancel / Post buttons
- Comments are created with `privacy: 'public'` and include the selected text as `targetQuote`

### 4.13 AI Ask Feature

Integrated with the comments system:

1. **Question input**: Textarea floater "Ask a question about this quote..." with Ask/Cancel buttons (Cmd/Ctrl+Enter submits)
2. **Question posted as comment**: The question is saved as a public note with `kind: 'question'` and shown in the comments panel detail view
3. **AI reply streams**: The AI-generated answer streams in real-time in the comments panel, then is persisted as a reply from the sentinel AI user (`booqs-ai`)
4. **Replies visible to all**: The question and AI reply appear in the comments panel like any other comment with replies

### 4.14 Scroll & History Tracking

- Current reading position is tracked via scroll handler
- Position is reported to the server as reading history
- When returning to a book, the reader opens at the last read position
- Quote links (`?quote=...`) scroll to and highlight the specific passage

---

## 5. Book Covers

Books display covers in various sizes: 60px, 120px, 240px, 360px.

**Image covers**: Loaded from CDN as WebP images at appropriate size variants. Displayed as background-image with contain/no-repeat/center.

**Generated covers** (no cover image): Colored gradient background with book title text. Colors deterministically chosen from title+author string hash. Color palette:
- Orange gradient
- Purple gradient
- Green gradient
- Royal blue gradient
- Chocolate gradient
- Black solid

Font size auto-calculated based on title length and cover dimensions. Aspect ratio: 2:3 (width:height).

---

## 6. Profile Pictures / Avatars

Three display modes:
1. **Profile picture**: Circular image (background-image, cover), various sizes (1-4rem)
2. **Emoji**: Shows selected emoji character in circular container
3. **Initials**: Shows first+last name initials as fallback

Hover effect: border transitions to highlight color. Border is optional (shown on profile pages, hidden in compact contexts).

---

## 7. Component Library

### 7.1 Buttons

- **PanelButton**: 2rem icon button, dimmed text, highlight on hover/selected. Used in reader controls and header.
- **ActionButton**: Full button with text + optional icon. Variants: primary (orange bg), secondary (border outline), alert (red). Sizes: small/normal/large. Optional full-width.
- **LightButton**: Text-only button in action color with optional icon. Sizes: small/normal/large.
- **RemoveButton**: Small icon button with trash icon, alert color, with loading spinner state.
- **MenuButton**: Text button with icon, dimmed color, hover underline + highlight. Used in context menus.

### 7.2 Modal

Three variants:
- **Modal**: HTML `<dialog>` element, centered, rounded, shadow, border, backdrop blur. Closes on Escape and outside click.
- **ModalFullScreen**: Full-viewport overlay with slide-up animation.
- **ModalAsDiv**: Div-based modal with semi-transparent black overlay.

Modal utilities: ModalHeader (title + close button), ModalLabel, ModalDivider, ModalButton.

### 7.3 Popover

Anchor-based popover (used for theme settings). Positioned relative to trigger element.

### 7.4 Pagination

Previous/Next buttons (secondary ActionButtons with arrow icons) + page counter. Disabled states for first/last page.

### 7.5 Logo

Image component showing `/icon.png` in two sizes: small (2rem) and large (4rem). Non-selectable.

---

## 8. Search UI

### 8.1 Search Modal

Triggered by:
- Clicking the search input in the header
- Clicking the explore search on the home page
- Keyboard shortcut: `Cmd+K` / `Ctrl+K`

**Modal UI**:
- Full-height modal (40rem max, 90vh)
- Width: panel-width (420pt), max 90vw
- Auto-focused text input at top
- Debounced search (300ms) showing results as user types
- Results split into "Authors" and "Booqs" sections
- **Keyboard navigation**: Arrow Up/Down to select, Enter to navigate to selected result or to full search page
- Selected item highlighted with highlight color background
- Each book result shows: small cover (60px), title (with search term bolded), authors
- Each author result shows: name (with search term bolded)
- Loading spinner while searching
- "No results" message when empty
- Escape closes modal

### 8.2 Header Search

Compact search input (w-36, text-sm) styled as a read-only input with subtle border and `⌘K` keyboard hint badge. Clicking opens the search modal.

Only shown if user has reading history (i.e., returning users).

---

## 9. Book Upload UI

Upload button in header (upload icon, `PanelButton` style).

**Upload flow** (multi-step modal):
1. **Select file**: "Select file to upload" label, "Select .epub" button, "Dismiss" button
2. **Confirm**: Shows filename, "Upload" button, "Dismiss" button
3. **Uploading**: Shows "Uploading [filename]..." with spinner, "Dismiss" button
4. **Success**: Shows book title, cover preview (240px), "Read now" link (to reader), "Dismiss" button
5. **Error**: Shows error message, "Retry" button, "Dismiss" button

---

## 10. Tags / Metadata Display

Books display two types of clickable tags:
- **Subject tags** (purple, `#673AB7`): Link to `/library/[lib]/subject/[subject]`
- **Language tags** (green, `#4CAF50`): Link to `/library/[lib]/language/[code]`

Tags appear as inline text with hover underline.
