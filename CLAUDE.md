# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build, Lint, and Test
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run https` - Run development server with HTTPS (requires mkcert setup)
- `npm run analyze` - Build with bundle analyzer
- `npm run cli` - Run CLI tools (tsx cli/index.ts)

## Coding preferences

- Always put private functions to the bottom of the public functions

- Do not access backend/* files directly from frontend code. Instead, create an indirection layer in data/* directory to abstract backend functionality.

Prefer 'function name(...) { ... }' style to 'const name = (...) => { ... }' style

## State Management

- When there's multiple mutually exclusive state of the component (such as isLoading and error -- when error is not null, isLoading should be false and vice versa) try to combine them into one state object with discriminating field (such as { state: 'loading' } and { state: 'error', error })

## CSS and Styling

- In css (and tailwind classes), only use colors defined in globals.css (like --color-primary or --color-dimmed). They can be used in tailwindcss just like any other color (so "text-dimmed" is a valid class). If you believe it is necessary, define new theme colors in globals.css and use them

## Architecture Overview

### Core Structure
This is a Next.js application for reading and managing ebooks (called "booqs"). The architecture follows a layered approach:

- **Frontend**: Next.js App Router with React components
- **Backend**: /api routes for certain operation and GraphQL API with graphql-yoga
- **Database**: PostgreSQL with Neon serverless
- **Storage**: AWS S3 for file storage
- **Authentication**: Passkey-based auth with WebAuthn

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `components/` - React components
- `backend/` - Backend logic, database, and utilities
- `graphql/` - GraphQL schema, resolvers, and types
- `core/` - Core business logic and models
- `parser/` - EPUB parsing and processing
- `reader/` - Book reading interface components
- `viewer/` - Book content rendering
- `application/` - Application state and providers
- `data/` - Data access layer
- `cli/` - Command-line tools

### Data Flow
1. **Books (Booqs)**: Uploaded EPUBs are parsed and stored
2. **Libraries**: Books come from user uploads (`uu`) or Project Gutenberg (`pg`)
3. **Reading**: Books are rendered with navigation, notes, and bookmarks
4. **Search**: Full-text search across book content and metadata
5. **Collections**: User-created book collections
6. **History**: Reading progress and history tracking

### Key Models
- **Booq**: Core book model with metadata and content
- **Fragment**: Text segments for search and navigation
- **Note**: User annotations on book content
- **Bookmark**: User bookmarks within books
- **Collection**: User-created book collections
- **User**: Authentication and user data

### Database Schema
PostgreSQL database with main tables:
- `users` - User accounts
- `uu_assets`/`uploads` - User-uploaded books
- `pg_assets`/`pg_metadata` - Project Gutenberg books
- `bookmarks` - User bookmarks
- `notes` - User notes
- `collections` - User collections
- `history` - Reading history

### GraphQL API
The API uses graphql-yoga with GraphQL schema defined in `graphql/schema.graphql`. Main operations:
- Query books, authors, search results
- Manage bookmarks and notes
- Handle user authentication
- Track reading history

### Authentication
Uses WebAuthn passkeys for authentication with registration and login flows.

### File Processing
EPUB files are processed through the `parser/` directory which handles:
- ZIP extraction
- Metadata parsing
- Content extraction
- Image processing
- Table of contents generation

### TypeScript Configuration
Uses strict TypeScript with path aliases (`@/*` maps to `./`). ESLint runs on specific directories as defined in `next.config.js`.

### Testing Structure
Tests are organized in a root `tests/` directory that mirrors the project structure:
- `tests/components/` - Component tests
- `tests/core/` - Core logic tests  
- `tests/backend/` - Backend tests
- `tests/parser/` - Parser tests
- etc.

Test files use the naming convention `[ModuleName].test.ts` or `[ModuleName].test.tsx` for React components.

## Code Architecture and Layer Guidelines

### Layer Hierarchy and Access Rules
- The codebase is organized in layers. Each directory except "@types", "tests", "public", "coverage", "certificates" and directories starting with "." correspond to a layer.
- Code from higher layers should NEVER access code from the lower layers.
- The layer hierarchy is strictly defined as: 
  - core > parser > viewer > common > backend > graphql > data > app/api > application > components > reader > app > cli
- **Special Exception**: `/app/api` is treated as its own layer between `data` and `application`, despite being physically located within the `/app` directory. This exception exists because Next.js requires API routes to live inside the `/app` directory.
- **Direct Access Restriction**: Layers below `data`, except for `cli` layer (app/api, application, components, reader, app) should NEVER directly access `parser` or `backend` or `graphql` layers. All access to these layers should be routed through the `data` layer as an abstraction.
- Any violation of these layer access rules is considered a significant architectural mistake and should be avoided.