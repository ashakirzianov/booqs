# Presigned URL Book Upload

Replaces direct file upload with a two-step presigned URL flow. Both the web app (API routes) and native apps (GraphQL mutations) use the same backend logic.

## Backend — Presigned URL support

- [x] Implement presigned S3 PUT URL generation (scoped to user + upload ID, 15min expiry)
- [x] Implement upload confirmation logic: download from storage, parse EPUB, create book record (extract from existing `uploadEpubAction`)

## API Routes (web app)

- [x] `POST /api/upload/request` — returns `{ uploadId, uploadUrl }`
- [x] `POST /api/upload/confirm` — returns `{ success, booqId, title, coverSrc, error }`

## GraphQL Mutations (native apps)

Tracked in [GRAPHQL-API.md](GRAPHQL-API.md) section 6.

## Notes

- No file data flows through the app server — client PUTs directly to storage
- Works with any storage backend (S3, GCS, R2)
- Supports large files without request size limits
- Upload progress is visible to the client (direct HTTP PUT)
