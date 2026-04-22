# Booqs - Application Specification

> "Your personal reading assistant" - A web application for reading, annotating, and collecting ebooks.

> Visual design, layout, and component details are in [UX](ux.md).

## 1. Overview

Booqs is a Next.js web application that provides a full-featured digital reading experience. Users can browse books from Project Gutenberg, upload their own EPUB files, read books with a rich reader interface, create highlights and notes, comment on passages, ask AI-powered questions about text, manage collections, follow other users, and track reading history.

---

## 2. Pages and Routes

### 2.1 Home / Feed (`/`)

- **Returning users**: Shows most recent reading history entry with a link to resume reading.
- **New users**: Shows an explore prompt with a search input.

### 2.2 Book Details (`/booq/[booq_id]`)

Displays book metadata (cover, title, authors, tags), action buttons ("Start Reading" / "Continue Reading", "Add to Reading List"), and table of contents. Generates Open Graph / Twitter Card meta for SEO.

### 2.3 Reader (`/booq/[booq_id]/content?path=...&quote=...`)

**Access**: Requires authentication (redirects to `/auth` with return URL).

Full-screen reading interface with highlights, notes, comments, AI questions, font scaling, and chapter navigation. See [UX §4](ux.md) for detailed layout and interaction design.

### 2.4 Search Results (`/search/[query]`)

Shows search results split into **Authors** and **Books** sections, with collection toggles on book results. Empty state when no results.

### 2.5 Library Browse (`/library/[library]/[kind]/[query]`)

Browse books by author, subject, or language within a library (e.g., Project Gutenberg `pg`). Paginated (24 items/page).

### 2.6 Collections (`/collections`)

**Access**: Requires authentication.

Shows **My Uploads** and **My Reading List** as card grids.

### 2.7 Reading History (`/history`)

**Access**: Requires authentication.

Paginated list (20 items/page) of reading history entries. Entries link to reading position and can be removed.

### 2.8 Notes (`/notes` and `/notes/[booq_id]`)

**Access**: Requires authentication.

Index page auto-redirects to first book with notes. Book notes page shows all highlights/notes for a book with color filtering. Right panel sidebar lists all books that have notes.

### 2.9 Profile (`/profile`)

**Access**: Requires authentication.

View/edit profile (display name, username, emoji), manage passkeys, sign out, delete account.

### 2.10 Followers (`/followers`)

**Access**: Requires authentication.

Shows Following and Followers lists with follow/unfollow actions.

### 2.11 User Profile (`/users/[username]`)

Public profile page showing user info, follow button, social connections, and uploaded books.

### 2.12 Auth Pages

- **Sign In** (`/auth`): Email magic link or passkey authentication.
- **Sign Up** (`/auth/signup?email=...&secret=...`): Complete registration (username, name, emoji) after magic link, then passkey registration prompt.
- **Sign In Error** (`/auth/signin/error`): Error display with retry option.

---

## 3. Search

- Triggered via header search input, home page explore input, or `Cmd+K` / `Ctrl+K`
- Opens a modal with debounced (300ms) live search
- Results split into Authors and Books with keyboard navigation
- Enter navigates to selected result or full search results page

---

## 4. Book Upload

**Access**: Signed-in users only. Accepts `.epub` files (`application/epub+zip`).

**Web flow**: Multi-step modal — select file → confirm → uploading → success (with "Read now" link) or error (with retry).

**Presigned URL flow** (API/native clients):
1. Client calls `POST /api/upload/request` (or `requestUpload` mutation) → receives `uploadId` + presigned S3 PUT URL (15min expiry)
2. Client PUTs the file directly to the presigned URL
3. Client calls `POST /api/upload/confirm` (or `confirmUpload` mutation) with `uploadId` → backend parses EPUB, creates book record, returns `{ success, booqId, title, coverSrc }`

---

## 5. Collections / Reading List

- **Reading list** collection: Named `reading_list`, toggled via "Add to Reading List" / "Remove" buttons throughout the app
- **Uploads** collection: Automatically populated with user's uploaded books
- Toggle is instant (optimistic UI) with the `useCollection` hook managing state

---

## 6. Social Features

### 6.1 Follow System

- Users can follow/unfollow other users
- Follow button on user profile pages (not shown on own profile)
- In the reader's comments panel, "Following" tab filters to followed users' comments

### 6.2 Public Comments

- Comments are public notes attached to specific text ranges in books
- Visible to all users reading the same book
- Created via context menu on selected text

### 6.3 Replies

- Replies are responses to public comments, stored in a separate `replies` table
- Each reply has: author, content, timestamps, and a reference to the parent note
- Displayed as a flat list under the parent comment, ordered by creation date (oldest first)
- UI supports single-level replies only (no reply-to-reply), but the data model can be extended for threading
- Shown in both the reader's note detail view and the notes page
- Deleting a parent note cascades to delete all its replies

---

## 7. Authentication Flow

### 7.1 Token Architecture

Authentication uses a dual-token system with short-lived access tokens and long-lived refresh tokens.

**Access Token:**
- JWT signed with `BOOQS_AUTH_SECRET`, contains `userId`
- TTL: 15 minutes (currently 1 minute for testing)
- Stored in `access_token` httpOnly secure cookie (web) or managed by client (native)

**Refresh Token:**
- Opaque 64-character random string stored in Redis
- TTL: 30 days
- Stored in `refresh_token` httpOnly secure cookie (web) or managed by client (native)
- Single-use: each rotation issues a new refresh token and revokes the old one

**Token Pair:**
All auth operations that issue tokens return a `TokenPair` containing `accessToken`, `refreshToken`, `accessTokenExpiresAt`, and `refreshTokenExpiresAt` (absolute timestamps in milliseconds).

### 7.2 Token Rotation

**Web clients (cookie-based, implicit):**
Next.js middleware intercepts every request and checks the `access_token` cookie. If expired/missing but a valid `refresh_token` cookie is present, the middleware rotates tokens and sets updated cookies on the response before the request reaches the page or API handler. This ensures Server Components (which cannot write cookies) always see a fresh access token.

Flow:
1. Middleware reads `access_token` cookie, validates JWT
2. If valid → pass through
3. If expired/missing → read `refresh_token` cookie
4. Validate refresh token against Redis, revoke old one
5. Issue new access + refresh token pair
6. Set updated cookies on the response
7. Request proceeds with fresh tokens

**Native clients (header-based, explicit):**
Native apps send `X-Access-Token` header for authentication. When the access token expires, the client must explicitly call the `refreshTokens` GraphQL mutation:
1. Client detects expiry (via `accessTokenExpiresAt` or a failed request)
2. Client calls `refreshTokens(refreshToken)` mutation
3. Server validates and rotates, returning a new `TokenPair`
4. Client stores the new tokens and retries the original request

### 7.3 Email Magic Link

1. User enters email on `/auth`
2. Server sends magic link email (valid for 1 hour)
3. If email matches existing account: link goes to `/auth/signin` (auto-signs in)
4. If new email: link goes to `/auth/signup` (complete registration form)

### 7.4 Passkey (WebAuthn)

- **Sign in**: "Sign in with Passkey" button triggers browser WebAuthn prompt
- **Registration**: After sign-up, user is prompted to register a passkey
- **Management**: Profile page allows adding/removing passkeys

### 7.5 Protected Routes

Routes requiring auth redirect to `/auth?return_to=[current_url]`:
- `/booq/[id]/content` (reader)
- `/collections`
- `/history`
- `/profile`
- `/followers`
- `/notes`

---

## 8. SEO & Metadata

All pages generate dynamic metadata:
- `<title>` with page-specific content
- `<meta name="description">` with descriptive text
- Book pages include Open Graph and Twitter Card meta with cover images
- Quote links generate preview text from the quoted passage

---

## 9. Data Sources

### 9.1 Project Gutenberg (`pg`)

Pre-indexed library of public domain books with full metadata (titles, authors, subjects, languages, cover images). Searchable by title, author, subject, and language.

### 9.2 User Uploads (`uu`)

EPUB files uploaded by users. Processed server-side to extract:
- Metadata (title, authors, subjects, languages)
- Cover images (converted to WebP at multiple size variants)
- Book content (parsed into node tree for rendering)
- Table of contents

---

## 10. Key User Flows

### 10.1 New User Journey
1. Lands on home page → sees "Explore collection" with large search
2. Searches for a book → sees results
3. Clicks a book → sees book details
4. Clicks "Start Reading" → redirected to auth
5. Signs in with email magic link → receives email
6. Clicks email link → completes sign-up (username, name, emoji)
7. Registers passkey (optional)
8. Redirected back to reader → starts reading

### 10.2 Returning User Journey
1. Lands on home page → sees "Continue reading" with last book preview
2. Clicks preview → opens reader at last position
3. Or uses search (Cmd+K) to find another book
4. Side menu provides access to: Notes, Collections, History, Profile, Followers

### 10.3 Reading & Annotating
1. Opens book in reader
2. Selects text → context menu appears
3. Picks highlight color → highlight created
4. Clicks highlight → sees note detail
5. Adds note text via edit mode
6. Or selects "Add comment" → writes public comment
7. Or selects "Ask question" → asks AI about passage
8. Uses TOC panel to navigate chapters
9. Uses Comments panel to see others' annotations
10. Font size adjustable via Theme popover

### 10.4 Social Flow
1. Sees comment from another user in Comments panel
2. Clicks username → views their profile
3. Clicks Follow
4. Returns to reader → can filter Comments to "Following" only
5. Manages following/followers on dedicated page

---

## 11. API Structure

### 11.1 Pages (Server-Side Rendered)
All main pages are server components that fetch data directly from the data layer.

### 11.2 API Routes (`/app/api/`)
- `auth/` - Authentication endpoints (magic link, passkey, sign-up completion)
- `booq/` - Book data endpoints
- `collections/` - Collection management
- `ai.ts` - AI answer generation
- `graphql/` - GraphQL API endpoint (graphql-yoga)
- `images/` - Image serving with size variants
- `me/` - Current user data
- `notes/` - Notes CRUD
- `replies/` - Reply CRUD (replies to public comments)
- `search/` - Search API
- `upload/` - Presigned URL upload flow (request + confirm)
- `users/` - User data

### 11.3 Server Actions
Used for mutations from client components:
- `initiateSignAction` - Start email auth flow
- `completeSignUpAction` - Complete registration
- `updateAccountAction` - Update profile
- `reportBooqHistoryAction` - Record reading position
- `removeHistoryEntryAction` - Remove history entry
- Note operations (add, update, remove) via `useBooqNotes` hook
- Collection operations via `useCollection` hook
- Follow/Unfollow operations

### 11.4 GraphQL API

Schema-defined API at `/api/graphql` using graphql-yoga. Supports authentication via `X-Access-Token` header (native apps) or `access_token` cookie (web). When the access token expires, web clients get automatic rotation via cookies; native clients must call the `refreshTokens` mutation explicitly.

**Queries:**
- `ping` — Health check
- `me` — Current authenticated user
- `user(username)` — Public user profile
- `booq(id)` — Book by ID, including metadata, content nodes, styles map, chapters (with scoped fragment styles), table of contents, bookmarks, and notes
- `author(name)` — Author with paginated book list
- `search(query, limit)` — Full-text search returning books and authors
- `libraryBrowse(library, kind, query, limit, offset)` — Browse books by author, subject, or language within a library (kind is an enum: `search`, `author`, `subject`, `language`)
- `notes(username!, limit, offset)` — Notes by a specific user across all books
- `history(limit, offset)` — Current user's reading history with pagination
- `collection(name)` — Named collection (e.g., `reading_list`) for current user
- `featured(limit)` — Featured books

**Mutations — Data:**
Most data mutations return `MutationResult!` (`{ success: Boolean!, error: String }`) with a human-readable error on failure (e.g., `"Authentication required"`, `"Bookmark not found"`).
- `addBookmark` / `removeBookmark` — Manage bookmarks
- `addNote` / `removeNote` / `updateNote` — Manage highlights, notes, and comments
- `addBooqHistory` / `removeHistory` — Record and manage reading history
- `addToCollection` / `removeFromCollection` — Manage collections
- `follow` / `unfollow` — Social follow/unfollow
- `updateUser(input)` — Update profile (name, emoji, username). Returns `UpdateUserResult` with optional field-level error.
- `requestUpload` — Get a presigned S3 upload URL and upload ID. Returns `UploadRequest`.
- `confirmUpload(uploadId)` — Confirm upload, parse file, and create book record. Returns `UploadResult`.

**Mutations — Authentication:**
Auth mutations that initiate flows return `MutationResult!`. Completion mutations return `AuthResult` or `null` on failure.

`AuthResult` contains:
- `accessToken: String!` — Short-lived JWT
- `refreshToken: String!` — Opaque refresh token
- `accessTokenExpiresAt: Float!` — Absolute expiry timestamp (ms since epoch)
- `refreshTokenExpiresAt: Float!` — Absolute expiry timestamp (ms since epoch)
- `user: User` — Authenticated user

Mutations:
- `initiateSign(email, returnTo)` — Send magic link email
- `completeSignIn(email, secret)` — Complete sign-in via magic link secret
- `completeSignUp(email, secret, username, name, emoji)` — Complete registration via magic link secret
- `initPasskeyRegistration` / `verifyPasskeyRegistration` — WebAuthn passkey registration flow
- `initPasskeyLogin` / `verifyPasskeyLogin` — WebAuthn passkey login flow
- `refreshTokens(refreshToken)` — Exchange a valid refresh token for a new token pair. The old refresh token is revoked. For use by native clients that manage tokens explicitly.
- `signout` — Clear authentication (revokes refresh token)
- `deletePasskey(id)` — Delete a registered passkey
- `deleteAccount` — Delete user account (revokes refresh token)

**Subscriptions (SSE):**
- `generateReply(noteId)` — Streams the AI-generated reply for a question note, saving it on completion

---

## 12. State Management Patterns

- **Server Components**: Used for initial data fetching on all pages
- **Client Components**: Used for interactive features, marked with `'use client'`
- **Discriminated State Objects**: Mutually exclusive states combined into single objects with `state` discriminator (e.g., `{ state: 'loading' } | { state: 'error', error: string }`)
- **Optimistic Updates**: Collection adds/removes and note operations update UI immediately
- **React Context**: `AppProvider` wraps the entire app for shared state
- **Custom Hooks**: `useCollection`, `useBooqNotes`, `useFontScale`, `useSearch`, `useControlsVisibility`, etc.
- **Debouncing**: Search input debounced at 300ms via `useDebouncedValue`

---

## 13. Content Model

The internal representation of book content. These structures are serialized as JSON and exposed through the GraphQL API via the `BooqNode` scalar.

### 13.1 Identifiers and Paths

- **BooqId**: A string of the form `{library}-{id}` (e.g., `pg-55201`, `uu-abc123`). The library prefix identifies the source (`pg` = Project Gutenberg, `uu` = user uploads).
- **BooqPath**: An array of integers representing a position in the node tree. Each integer is a child index at that depth. For example, `[2, 0, 3]` means: 3rd child of root → 1st child → 4th child.
- **BooqRange**: An object `{ start: BooqPath, end: BooqPath }` representing a span of content between two paths.

### 13.2 Node Types

Book content is a tree of `BooqNode` values. A `BooqNode` is a discriminated union of four types, distinguished by their fields:

**BooqSectionNode** — A top-level structural container (typically one per XHTML file in the source document).
| Field | Type | Description |
|-------|------|-------------|
| `section` | `string` | Identifier for this section (e.g., `"Text/chapter-1.xhtml"`) |
| `styleRefs` | `string[]?` | Keys into the styles map for CSS that applies to this section |
| `children` | `BooqNode[]` | Child nodes |

**BooqElementNode** — An HTML-like element (e.g., `div`, `p`, `span`, `img`).
| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Element tag name (e.g., `"p"`, `"div"`, `"img"`) |
| `children` | `BooqNode[]` | Child nodes |
| `id` | `string?` | Element ID (for internal linking and anchor resolution) |
| `attrs` | `Record<string, string>?` | HTML attributes (e.g., `src`, `href`, `class`) |
| `ref` | `BooqPath?` | Resolved path for internal book links |
| `pph` | `boolean?` | "Paragraph-level" flag — marks nodes that are natural content boundaries for range expansion |

**BooqTextNode** — A plain string. Text nodes are represented as bare strings, not objects.

**BooqStubNode** — A placeholder for content outside the current range. Either `null` (zero-length) or `{ stub: number }` where `number` is the text length of the omitted content. Used when extracting a sub-range of the tree to preserve path alignment.

### 13.3 Discriminating Node Types

Since the union uses structural discrimination (not a `type` field), nodes are identified by checking for distinguishing fields:
- Has `section` → `BooqSectionNode`
- Has `name` → `BooqElementNode`
- Is a `string` → `BooqTextNode`
- Is `null` or has `stub` → `BooqStubNode`

### 13.4 Styles

**BooqStyles** is a `Record<string, string>` — a map from style reference keys to CSS rule strings.

Section nodes reference styles via `styleRefs`. At render time, CSS is hydrated by:
1. Looking up each ref in the styles map
2. Namespacing all selectors with the section's identifier (e.g., `.booqs-Text-chapter-1-xhtml`) to prevent cross-section style collisions
3. Injecting `<style>` tags into the rendered output

The full styles map lives on `Booq.styles`. When a chapter or fragment is built, only the styles referenced by nodes in that slice are included — this avoids sending the entire stylesheet for every fragment.

### 13.5 Booq (Complete Book)

The top-level book model:
| Field | Type | Description |
|-------|------|-------------|
| `nodes` | `BooqNode[]` | Complete content tree |
| `styles` | `BooqStyles` | Full deduplicated styles map |
| `metadata` | `BooqMetadata` | Title, authors, subjects, cover, length |
| `toc` | `TableOfContents` | Table of contents with items (title, level, path, position) |

### 13.6 BooqFragment

A renderable content slice with boundary paths and scoped styles:
| Field | Type | Description |
|-------|------|-------------|
| `start` | `BooqPath` | Start boundary of the content |
| `end` | `BooqPath` | End boundary of the content |
| `nodes` | `BooqNode[]` | Content nodes (may contain stubs outside the range) |
| `styles` | `BooqStyles` | Only styles referenced by nodes in this fragment |

Used for chapter content and note surrounding fragments.

### 13.7 BooqChapter

A navigable unit of the book (typically a chapter or large section), used by the reader:
| Field | Type | Description |
|-------|------|-------------|
| `previous` | `BooqAnchor?` | Anchor to the previous chapter |
| `current` | `BooqAnchor` | Anchor for this chapter's start |
| `next` | `BooqAnchor?` | Anchor to the next chapter |
| `fragment` | `BooqFragment` | The chapter's content |

**BooqAnchor** represents a navigation point:
| Field | Type | Description |
|-------|------|-------------|
| `path` | `BooqPath` | Position in the node tree |
| `title` | `string?` | Chapter/section title from the table of contents |
| `position` | `number` | Character offset from the start of the book |

Chapters are split at table-of-contents boundaries, with a minimum size of ~4500 characters to avoid very short chapters.

### 13.8 Position and Length

Each node has an implicit text length (the sum of its text content). **Position** is the cumulative character offset from the start of the book. Positions are used for:
- Page numbering (via a characters-per-page formula)
- Reading progress tracking
- Table of contents entries
- Anchor points in chapters
