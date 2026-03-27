# Booqs - Application Specification

> "Your personal reading assistant" - A web application for reading, annotating, and collecting ebooks.

## 1. Overview

Booqs is a Next.js web application that provides a full-featured digital reading experience. Users can browse books from Project Gutenberg, upload their own EPUB files, read books with a rich reader interface, create highlights and notes, comment on passages, ask AI-powered questions about text, manage collections, follow other users, and track reading history.

---

## 2. Design System

### 2.1 Typography

- **UI Font (--font-main)**: Lato (sans-serif), weights: 100, 300, 400, 700. Used for all interface elements, navigation, buttons, and labels.
- **Book Font (--font-book)**: Lora (serif), weights: 400, 700, subsets: latin-ext, cyrillic-ext. Used for rendering book content in the reader.
- Font weight mapping: light=100, normal=300, bold=400, extrabold=700.

### 2.2 Color Palette

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

### 2.3 Spacing Scale

| Token | Value |
|-------|-------|
| `xs` | 0.125rem |
| `sm` | 0.25rem |
| `base` | 0.5rem |
| `lg` | 1rem |
| `xl` | 2rem |
| `2xl` | 4rem |

### 2.4 Shadows

- Default: `0px 0px 5px rgba(0, 0, 0, 0.1)`
- Hover: `0px 5px 15px rgba(0, 0, 0, 0.1)`
- Button: `0px 3px 5px rgba(0, 0, 0, 0.1)`

### 2.5 Animations

- `fade-in`: 0.3s ease-out, translateY(-8px) to 0 with opacity 0 to 1.
- Transitions: most interactive elements use 150-300ms transitions on color, opacity, transform.

### 2.6 Responsive Breakpoints

- **Desktop** (>1280px): Full 3-column layout with side panels
- **Tablet** (1025-1280px): Narrower side columns
- **Mobile** (<=1024px): Single column, side panels hidden, header spans full width
- Mobile devices with max-device-width 1024px get 120% base font size

### 2.7 Theme Viewport

- Light mode theme-color: `#FFA500` (orange)
- Dark mode theme-color: `#000000` (black)

---

## 3. Global Layout

### 3.1 Root Layout

- `<html lang="en">` with both font CSS variables applied to `<body>`
- Wrapped in `<AppProvider>` which provides application-level context (auth, theme, etc.)
- PWA manifest at `/manifest.json`

### 3.2 Main Layout (all pages except reader and auth)

**Structure**: CSS Grid with 3 columns:
```
[left-gutter (flexible)] [content (780px)] [right-gutter (flexible)]
```

**Header (fixed, top)**:
- **Left header** (in left gutter): Logo (links to home) + Search box (only shown if user has reading history)
- **Right header** (in right gutter): Upload button (signed-in users only) + Account button

**Left Panel** (fixed sidebar, below header, in left gutter):
- Navigation menu (signed-in users only) with links: Feed, Notes, Collections, Followers, History, Profile
- Each menu item has an icon and label
- Active item indicated by highlight color

**Main Content** (center column, 780px max): Page-specific content

**Right Panel** (fixed sidebar, in right gutter): Used on notes pages for book navigation

**Mobile** (<=1024px): Single column, full-width header, no side panels.

---

## 4. Pages and Routes

### 4.1 Home / Feed (`/`)

**For users with reading history:**
- "Continue reading" heading
- Shows most recent reading history entry as a `BooqPreview` card: book title, a text excerpt, and page number, linking to the reading position

**For new users (no history):**
- Centered "Explore collection" heading
- Large search input ("Search for books...") that opens the search modal on click

### 4.2 Book Details (`/booq/[booq_id]`)

Displays detailed information about a single book:
- **Cover image** (360px, left-aligned on desktop, centered on mobile)
- **Title** in large bold text (4xl)
- **Authors** as comma-separated links (each links to author browse page)
- **Tags**: Subject tags (purple, `#673AB7`) and language tags (green, `#4CAF50`), each clickable to browse
- **Action buttons**:
  - "Start Reading" or "Continue Reading" (orange action button, links to reader) - shows "Continue" if user has history for this book
  - "Add to Reading List" / "Remove" toggle (signed-in users only)
- **Table of Contents** section: "CONTENTS" heading with indented chapter links (indent based on nesting level, 1.5rem per level)

**SEO**: Dynamic Open Graph and Twitter Card meta with title, authors, and cover image.

### 4.3 Reader (`/booq/[booq_id]/content?path=...&quote=...`)

**Access**: Requires authentication. Unauthenticated users are redirected to `/auth` with return URL.

The full-screen reading interface. Described in detail in Section 5.

### 4.4 Search Results (`/search/[query]`)

- Heading: "Search results for '[query]'"
- Results split into **Authors** and **Books** sections
- **Author results**: Simple list items, each linking to author browse page
- **Book results**: Each row contains:
  - Small cover thumbnail (60px)
  - Title (bold, links to book details) and author
  - "Add" / "Remove" collection toggle (signed-in only)
  - "Read" link (bold, action color)
- Empty state: "No results found for '[query]'"

### 4.5 Library Browse (`/library/[library]/[kind]/[query]`)

Browse books by author, subject, or language within a library (e.g., Project Gutenberg `pg`).

- Kinds: `author`, `subject`, `language`
- Displays a grid of `BooqCard` components (book cover + title + author + tags + Read/Add buttons)
- Cards are 30rem wide, wrapped in a responsive flex layout
- **Pagination** at the bottom: Previous/Next buttons with page counter ("Page X of Y (Z total)")
- Page size: 24 items

### 4.6 Collections (`/collections`)

**Access**: Requires authentication.

Displays two collection sections:
1. **My Uploads**: Books the user has uploaded
2. **My Reading List**: Books added to reading list

Each section uses the `BooqCollection` component showing a card grid. Cards include cover, title, author, tags, "Read" link, and "Remove" button.

Empty state per section: "Nothing here yet"

### 4.7 Reading History (`/history`)

**Access**: Requires authentication.

- Paginated list (20 items per page) of reading history entries
- Each entry shows as a `BriefEntry` (small cover 120px) or `DetailedEntry` (card with text excerpt)
- Each entry links back to the reading position
- Entries can be removed (shows "Removed from reading history" placeholder)
- Pagination controls at bottom
- Empty state: "No reading history yet. Start reading to see your history here!"

### 4.8 Notes (`/notes` and `/notes/[booq_id]`)

**Layout**: Main content + right panel sidebar

**Index page** (`/notes`): If user has notes, auto-redirects to `/notes/[first_book_id]`. Otherwise shows: "No notes found. Start reading a book to create notes."

**Book notes page** (`/notes/[booq_id]`):
- Header: "Notes for [Book Title] by [Author]" (both linked)
- **Filter bar**: Color-coded filter buttons to show All notes, or filter by highlight color. Each button shows the highlight color as background with active indicator border.
- **Note cards**: Each note displays:
  - The highlighted/quoted text rendered with the book content nodes (showing context)
  - Overlapping notes shown together
  - Color-coded left border matching highlight color
  - Note content text
  - Edit/Delete capabilities for own notes

**Right panel sidebar**: Lists all books that have notes as navigation items, each showing:
- Small book cover (60px)
- Book title and author
- Active book has highlight-colored border

### 4.9 Profile (`/profile`)

**Access**: Requires authentication.

- **Profile card** with:
  - Profile badge (emoji or picture, 4rem, circular with border)
  - Hoverable "Edit" overlay on avatar
  - Display name, username, email, member since date
  - "Edit Profile" button
- **Edit mode**:
  - Editable fields: Display Name, Username (letters/numbers/hyphens only)
  - Emoji selector (modal with grid of available emojis, 8 columns)
  - Update Profile / Cancel buttons
  - Field-specific error display (e.g., duplicate username)
- **Passkey section**: Manage WebAuthn passkeys (add/remove)
- **Account actions** (bottom):
  - Sign Out button
  - Delete Account button (with confirmation)

### 4.10 Followers (`/followers`)

**Access**: Requires authentication.

Two sections:
1. **Following**: List of users the current user follows, with Unfollow buttons
2. **Followers**: List of users following the current user, with Follow/Unfollow buttons

### 4.11 User Profile (`/users/[username]`)

Public profile page for any user:
- **Profile card**: Avatar badge, display name, username, member since date
- **Follow button** (if viewing another user's profile while signed in)
- **Social connections**: Following list and Followers list
- **Books**: User's uploaded books displayed as a collection grid

### 4.12 Auth Pages

#### Sign In (`/auth`)

Centered layout with large logo at top.

- **Email authentication**:
  - "Sign in to Booqs" heading
  - Email input field with validation
  - "Send Link" action button (primary, full-width)
  - On success: "Check Your Email" screen with message about magic link (expires in 1 hour)
  - "Try a different email" link to go back
  - Error display in red alert box

- **Divider**: "--- or ---"

- **Passkey authentication**:
  - "Sign in with Passkey" button (secondary style, full-width, with passkey icon)
  - Error display for failed passkey attempts

#### Sign Up (`/auth/signup?email=...&secret=...`)

Reached via magic link from email. Centered layout with logo.

- Pre-validated via server-side check of email + secret
- **Form fields**:
  - Email (pre-filled, disabled)
  - Username (pre-filled from email prefix, editable, alphanumeric + hyphens)
  - Name (pre-filled with random generated name, editable, required)
  - Profile Emoji (pre-filled with random emoji, clickable to open emoji selector)
- "Complete Sign Up" action button
- Error display for validation failures

After sign-up completes, shows "Add Passkey" page to register a WebAuthn passkey.

#### Sign In Error (`/auth/signin/error`)

- "Sign-in Failed" heading (alert color)
- Error message
- "The sign-in link may have expired or been used already"
- "Try Again" button (primary) and "Continue to App" button (secondary outline)

---

## 5. Reader Interface (Detailed)

The reader is a full-screen, immersive reading experience.

### 5.1 Layout

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

### 5.2 Controls Visibility

On mobile/tablet:
- Header bar and footer bar auto-hide when scrolling (slide out with 250ms transform transition)
- Show when: scroll pauses, or when left/right panel is open, or when context menu floater is not visible
- Background bars (top/bottom) provide visual separation with box-shadow

On desktop: Controls are always visible in side gutters.

### 5.3 Header Controls

**Left buttons**:
- Back button (arrow icon, links to home/feed)
- Table of Contents button (TOC icon, toggles left navigation panel)

**Right buttons**:
- Ask button (question mark icon, only shown when AI answer is active, toggles answer visibility)
- Comments button (comment icon, toggles right comments panel)
- Theme button (font icon, opens font size popover)
- Account button (profile badge or sign-in icon)

### 5.4 Footer

- **Left footer**: Page counter "X of Y" (current page of total pages in chapter)
- **Right footer**: "N pages left" or "Last page"

### 5.5 Navigation (Previous/Next)

- Previous and Next chapter buttons displayed above and below the book content
- Each shows the chapter title (or "Previous"/"Next" fallback)
- Styled as bordered pills with hover color transition
- Links to the corresponding chapter path

### 5.6 Book Content Rendering

- Book content is rendered from a tree of `BooqNode` objects (parsed from EPUB)
- Nodes are rendered recursively with proper HTML elements
- **CSS Handling**: Stylesheets from the EPUB are deduplicated and stored once in `Booq.styles` (a `Record<string, string>` keyed by stylesheet href or synthetic key for inline styles). Each section node stores only a `styleRefs` array of keys into this map. When a fragment is built, only the referenced styles are included in `BooqFragment.styles`. At render time, CSS is hydrated on section nodes by looking up `styleRefs` in the styles map, namespacing selectors with the section's class prefix (e.g., `.booqs-Text-chapter-xhtml`), and injecting `<style>` tags. This avoids duplicating large stylesheets across sections — in image-heavy books, this can reduce the in-memory book size from ~23MB to ~4MB.
- **Augmentations** are overlaid on the content:
  - Highlight annotations (colored backgrounds matching highlight color tokens)
  - Comment indicators (transparent background but clickable)
  - Quote highlights (orange tint)
  - Selection highlight (blue tint)
- Clicking an augmentation opens the context menu for that note/highlight
- Internal book links are converted to navigation links within the reader
- Images within books are rendered inline

### 5.7 Font Scale

- Accessed via the Theme button (popover)
- Two buttons: "Abc" in small size (decrease) and "Abc" in large size (increase)
- Changes font size by 10% increments (minimum 10%)
- Applied as `fontSize` percentage on the book content wrapper
- Persisted across sessions

### 5.8 Left Panel - Navigation/Table of Contents

Slides in from the left with 250ms transition. On mobile/tablet, overlays the content.

Contents:
- "CONTENTS" heading (tracking-widest, bold, centered)
- **Navigation filter**: Toggle buttons to show/hide own notes and notes from other authors in the TOC
- **Navigation nodes**: Mixed list of:
  - **TOC entries**: Chapter titles with indent levels, linking to chapter positions
  - **Note entries**: User's highlights/notes interleaved at their position in the book, showing quoted text and note content
  - **Grouped notes**: Multiple notes at same position collapsed into a group

### 5.9 Right Panel - Comments / Context Menu Detail

Slides in from the right. Shows either:

**Comments Panel**:
- "COMMENTS" heading
- Filter tabs: "All" / "Following" (only if signed in)
- Comment items, each showing:
  - Referenced text as an italic blockquote with orange left border, clickable to scroll to position
  - Comment content text
  - Author info: emoji avatar, name (linked to profile), relative timestamp

**Context Menu Detail Panel**:
- When a note/highlight is clicked and screen is wide enough for side panel, the note detail shows here instead of a floater

### 5.10 Context Menu (Text Selection)

When user selects text in the book:

**Floater** (appears near selection on desktop, or in side panel):
- **Color picker** (for creating highlights): Row of 5 color swatches matching highlight colors. Clicking creates a highlight of that color.
- **Add comment**: Opens comment creation form
- **Ask question**: Opens AI question interface
- **Copy quote**: Copies quoted text with link to the position
- Note: Copying any selected text automatically formats it as a quote with a link

### 5.11 Note Detail Menu

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

### 5.12 Comment Creation

- Textarea: "Add a comment..." placeholder
- Cancel / Post buttons
- Comments are created with `privacy: 'public'` and include the selected text as `targetQuote`

### 5.13 AI Ask Feature

Two-step flow:

1. **Question input**: Textarea "Ask a question about this quote..." with Ask/Cancel buttons (Cmd/Ctrl+Enter submits)
2. **Answer display**:
   - Shows the question
   - Shows the note (if asking from a note context) as a styled footnote
   - Shows the streaming answer from AI (with "..." pulse animation during loading)
   - Close button
   - Error state display

The answer streams in real-time from the backend copilot service.

### 5.14 Scroll & History Tracking

- Current reading position is tracked via scroll handler
- Position is reported to the server as reading history
- When returning to a book, the reader opens at the last read position
- Quote links (`?quote=...`) scroll to and highlight the specific passage

---

## 6. Search

### 6.1 Search Modal

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

### 6.2 Header Search

Small search input (w-40) styled as a read-only input with `Cmd+K` keyboard hint badge. Clicking opens the search modal.

Only shown if user has reading history (i.e., returning users).

---

## 7. Book Upload

**Access**: Signed-in users only.

Upload button in header (upload icon, `PanelButton` style).

**Upload flow** (multi-step modal):
1. **Select file**: "Select file to upload" label, "Select .epub" button, "Dismiss" button
2. **Confirm**: Shows filename, "Upload" button, "Dismiss" button
3. **Uploading**: Shows "Uploading [filename]..." with spinner, "Dismiss" button
4. **Success**: Shows book title, cover preview (240px), "Read now" link (to reader), "Dismiss" button
5. **Error**: Shows error message, "Retry" button, "Dismiss" button

Accepts only `.epub` files (`application/epub+zip`).

**Presigned URL upload flow** (for API/native app clients):
1. Client calls `POST /api/upload/request` (or `requestUpload` GraphQL mutation) — receives `uploadId` and a presigned S3 PUT URL (15min expiry)
2. Client PUTs the file directly to the presigned URL
3. Client calls `POST /api/upload/confirm` (or `confirmUpload` GraphQL mutation) with `uploadId` — backend downloads from S3, parses EPUB, creates the book record, and returns `{ success, booqId, title, coverSrc }`

---

## 8. Collections / Reading List

- **Reading list** collection: Named `reading_list`, toggled via "Add to Reading List" / "Remove" buttons throughout the app
- **Uploads** collection: Automatically populated with user's uploaded books
- Collection buttons appear on: search results, book details page, library browse cards
- Toggle is instant (optimistic UI) with the `useCollection` hook managing state

---

## 9. Social Features

### 9.1 Follow System

- Users can follow/unfollow other users
- Follow button on user profile pages (not shown on own profile)
- Followers/Following pages show lists with follow/unfollow actions
- In the reader's comments panel, "Following" tab filters comments to only show those from followed users

### 9.2 Public Comments

- Comments are public notes attached to specific text ranges in books
- Visible to all users reading the same book
- Shown in the Comments panel in the reader
- Comment creation via context menu on selected text

---

## 10. Book Covers

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

## 11. Tags / Metadata

Books display two types of clickable tags:
- **Subject tags** (purple, `#673AB7`): Link to `/library/[lib]/subject/[subject]`
- **Language tags** (green, `#4CAF50`): Link to `/library/[lib]/language/[code]`

Tags appear as inline text with hover underline.

---

## 12. Profile Pictures / Avatars

Three display modes:
1. **Profile picture**: Circular image (background-image, cover), various sizes (1-4rem)
2. **Emoji**: Shows selected emoji character in circular container
3. **Initials**: Shows first+last name initials as fallback

Hover effect: border transitions to highlight color. Border is optional (shown on profile pages, hidden in compact contexts).

---

## 13. Authentication Flow

### 13.1 Email Magic Link

1. User enters email on `/auth`
2. Server sends magic link email (valid for 1 hour)
3. If email matches existing account: link goes to `/auth/signin` (auto-signs in)
4. If new email: link goes to `/auth/signup` (complete registration form)

### 13.2 Passkey (WebAuthn)

- **Sign in**: "Sign in with Passkey" button triggers browser WebAuthn prompt
- **Registration**: After sign-up, user is prompted to register a passkey
- **Management**: Profile page allows adding/removing passkeys

### 13.3 Protected Routes

Routes requiring auth redirect to `/auth?return_to=[current_url]`:
- `/booq/[id]/content` (reader)
- `/collections`
- `/history`
- `/profile`
- `/followers`
- `/notes`

---

## 14. SEO & Metadata

All pages generate dynamic metadata:
- `<title>` with page-specific content
- `<meta name="description">` with descriptive text
- Book pages include Open Graph and Twitter Card meta with cover images
- Quote links generate preview text from the quoted passage

---

## 15. Component Library

### 15.1 Buttons

- **PanelButton**: 2rem icon button, dimmed text, highlight on hover/selected. Used in reader controls and header.
- **ActionButton**: Full button with text + optional icon. Variants: primary (orange bg), secondary (border outline), alert (red). Sizes: small/normal/large. Optional full-width.
- **LightButton**: Text-only button in action color with optional icon. Sizes: small/normal/large.
- **RemoveButton**: Small icon button with trash icon, alert color, with loading spinner state.
- **MenuButton**: Text button with icon, dimmed color, hover underline + highlight. Used in context menus.

### 15.2 Modal

Three variants:
- **Modal**: HTML `<dialog>` element, centered, rounded, shadow, border, backdrop blur. Closes on Escape and outside click.
- **ModalFullScreen**: Full-viewport overlay with slide-up animation.
- **ModalAsDiv**: Div-based modal with semi-transparent black overlay.

Modal utilities: ModalHeader (title + close button), ModalLabel, ModalDivider, ModalButton.

### 15.3 Popover

Anchor-based popover (used for theme settings). Positioned relative to trigger element.

### 15.4 Pagination

Previous/Next buttons (secondary ActionButtons with arrow icons) + page counter. Disabled states for first/last page.

### 15.5 Logo

Image component showing `/icon.png` in two sizes: small (2rem) and large (4rem). Non-selectable.

---

## 16. Data Sources

### 16.1 Project Gutenberg (`pg`)

Pre-indexed library of public domain books with full metadata (titles, authors, subjects, languages, cover images). Searchable by title, author, subject, and language.

### 16.2 User Uploads (`uu`)

EPUB files uploaded by users. Processed server-side to extract:
- Metadata (title, authors, subjects, languages)
- Cover images (converted to WebP at multiple size variants)
- Book content (parsed into node tree for rendering)
- Table of contents

---

## 17. Key User Flows

### 17.1 New User Journey
1. Lands on home page -> sees "Explore collection" with large search
2. Searches for a book -> sees results
3. Clicks a book -> sees book details
4. Clicks "Start Reading" -> redirected to auth
5. Signs in with email magic link -> receives email
6. Clicks email link -> completes sign-up (username, name, emoji)
7. Registers passkey (optional)
8. Redirected back to reader -> starts reading

### 17.2 Returning User Journey
1. Lands on home page -> sees "Continue reading" with last book preview
2. Clicks preview -> opens reader at last position
3. Or uses search (Cmd+K) to find another book
4. Side menu provides access to: Notes, Collections, History, Profile, Followers

### 17.3 Reading & Annotating
1. Opens book in reader
2. Selects text -> context menu appears
3. Picks highlight color -> highlight created
4. Clicks highlight -> sees note detail
5. Adds note text via edit mode
6. Or selects "Add comment" -> writes public comment
7. Or selects "Ask question" -> asks AI about passage
8. Uses TOC panel to navigate chapters
9. Uses Comments panel to see others' annotations
10. Font size adjustable via Theme popover

### 17.4 Social Flow
1. Sees comment from another user in Comments panel
2. Clicks username -> views their profile
3. Clicks Follow
4. Returns to reader -> can filter Comments to "Following" only
5. Manages following/followers on dedicated page

---

## 18. API Structure

### 18.1 Pages (Server-Side Rendered)
All main pages are server components that fetch data directly from the data layer.

### 18.2 API Routes (`/app/api/`)
- `auth/` - Authentication endpoints (magic link, passkey, sign-up completion)
- `booq/` - Book data endpoints
- `collections/` - Collection management
- `copilot/` - AI question answering (streaming)
- `graphql/` - GraphQL API endpoint (graphql-yoga)
- `images/` - Image serving with size variants
- `me/` - Current user data
- `notes/` - Notes CRUD
- `search/` - Search API
- `upload/` - Presigned URL upload flow (request + confirm)
- `users/` - User data

### 18.3 Server Actions
Used for mutations from client components:
- `initiateSignAction` - Start email auth flow
- `completeSignUpAction` - Complete registration
- `updateAccountAction` - Update profile
- `reportBooqHistoryAction` - Record reading position
- `removeHistoryEntryAction` - Remove history entry
- Note operations (add, update, remove) via `useBooqNotes` hook
- Collection operations via `useCollection` hook
- Follow/Unfollow operations

### 18.4 GraphQL API

Schema-defined API at `/api/graphql` using graphql-yoga. Supports authentication via `Authorization: Bearer <jwt>` header or `token` cookie.

**Queries:**
- `ping` — Health check
- `me` — Current authenticated user
- `user(username)` — Public user profile
- `booq(id)` — Book by ID, including metadata, content nodes, fragments, table of contents, bookmarks, and notes
- `author(name)` — Author with paginated book list
- `search(query, limit)` — Full-text search returning books and authors
- `libraryBrowse(library, kind, query, limit, offset)` — Browse books by author, subject, or language within a library (kind is an enum: `search`, `author`, `subject`, `language`)
- `myNotes(booqId, limit, offset)` — Current user's notes, optionally filtered by book
- `history(limit, offset)` — Current user's reading history with pagination
- `collection(name)` — Named collection (e.g., `reading_list`) for current user
- `featured(limit)` — Featured books
- `copilot(context)` — AI assistant scoped to a text range, with sub-field `answer(question)` and `suggestions`

**Mutations — Data:**
- `addBookmark` / `removeBookmark` — Manage bookmarks
- `addNote` / `removeNote` / `updateNote` — Manage highlights, notes, and comments
- `addBooqHistory` / `removeHistory` — Record and manage reading history
- `addToCollection` / `removeFromCollection` — Manage collections
- `follow` / `unfollow` — Social follow/unfollow
- `updateUser(input)` — Update profile (name, emoji, username)
- `requestUpload` — Get a presigned S3 upload URL and upload ID
- `confirmUpload(uploadId)` — Confirm upload, parse file, and create book record

**Mutations — Authentication:**
- `initiateSign(email, returnTo)` — Send magic link email
- `completeSignIn(email, secret)` — Complete sign-in via magic link secret, returns JWT token
- `completeSignUp(email, secret, username, name, emoji)` — Complete registration via magic link secret, returns JWT token
- `initPasskeyRegistration` / `verifyPasskeyRegistration` — WebAuthn passkey registration flow
- `initPasskeyLogin` / `verifyPasskeyLogin` — WebAuthn passkey login flow
- `signout` — Clear authentication
- `deleteAccount` — Delete user account

**Subscriptions (SSE):**
- `copilotAnswerStream(context, question)` — Streams AI answer text chunks as they are generated, matching the behavior of the `/api/copilot/answer/stream` REST endpoint

---

## 19. State Management Patterns

- **Server Components**: Used for initial data fetching on all pages
- **Client Components**: Used for interactive features, marked with `'use client'`
- **Discriminated State Objects**: Mutually exclusive states combined into single objects with `state` discriminator (e.g., `{ state: 'loading' } | { state: 'error', error: string }`)
- **Optimistic Updates**: Collection adds/removes and note operations update UI immediately
- **React Context**: `AppProvider` wraps the entire app for shared state
- **Custom Hooks**: `useCollection`, `useBooqNotes`, `useFontScale`, `useSearch`, `useControlsVisibility`, etc.
- **Debouncing**: Search input debounced at 300ms via `useDebouncedValue`
