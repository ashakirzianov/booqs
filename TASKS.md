# Tasks

## Issues

- [ ] Reading-list cards mutate a phantom collection: `app/(main)/collections/page.tsx:39` passes `collection={'reading_list'}` (underscore) while every data fetch uses `READING_LIST_COLLECTION = 'reading-list'` (hyphen). Spotted during native-app testing.
- [ ] Authenticated reads fail silently when the user can't be resolved: `collection` returns `null` and `history` returns `[]` with HTTP 200 and no GraphQL error (`graphql/query.ts`). Clients can't distinguish an auth/DB blip from an empty result — the native app wiped its reading-list cache on this. Consider returning a GraphQL error (or explicit signal) for unauthenticated access to user-scoped fields.

## Active

## Backlog

See [docs/backlog.md](docs/backlog.md) for detailed backlog items.

## Deferred

(empty)
