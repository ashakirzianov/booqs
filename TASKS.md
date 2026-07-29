# Tasks

## Issues

- [ ] Reading-list cards mutate a phantom collection: `app/(main)/collections/page.tsx:39` passes `collection={'reading_list'}` (underscore) while every data fetch uses `READING_LIST_COLLECTION = 'reading-list'` (hyphen). Spotted during native-app testing.
- [ ] Authenticated reads fail silently when the user can't be resolved: `collection` returns `null` and `history` returns `[]` with HTTP 200 and no GraphQL error (`graphql/query.ts`). Clients can't distinguish an auth/DB blip from an empty result — the native app wiped its reading-list cache on this. Consider returning a GraphQL error (or explicit signal) for unauthenticated access to user-scoped fields.

## Active

- [ ] Native API access under Vercel bot protection — direction set (2026-07-29): Option B first, per [docs/native-api-access.md](docs/native-api-access.md) §8. Path-scoped WAF bypass (`/api/graphql`, `/api/images`, `/api/upload`, AASA), no secret; Option A (secret header + rate limit) is the pre-designed escalation on evidence of GraphQL abuse. Next step: Anton's dashboard checklist (§9). Client side ships a dormant `x-booqs-client` header (Track B, future) so escalation needs no app release. Server needs no code changes.

## Backlog

See [docs/backlog.md](docs/backlog.md) for detailed backlog items.

## Deferred

(empty)
