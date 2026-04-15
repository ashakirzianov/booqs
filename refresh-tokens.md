# Refresh/Access Token Auth

## Context

Currently the app uses a single JWT with no expiration, stored in an httpOnly cookie with 30-day maxAge. A leaked token is valid indefinitely. Moving to short-lived access tokens (1 min for testing, then 15 min) with refresh tokens reduces the exposure window.

## Design Decisions

- **Access token**: Short-lived JWT (1 min for testing, 15 min for prod), contains `userId`, stateless validation
- **Refresh token**: Long-lived opaque token (30 days), stored in Redis with TTL
- **Storage**: Both in httpOnly secure cookies
- **Refresh flow**: Next.js middleware silently refreshes when access token is expired but refresh token is valid
- **Refresh token rotation**: Each refresh issues a new refresh token (old one deleted from Redis)
- **Bearer tokens**: Also short-lived access tokens — no special long-lived token for Authorization header
- **No backward compatibility**: No migration from old `token` cookie — no live traffic

## Tasks

### 1. Backend: refresh token functions (`backend/token.ts`)
- [x] Add `expiresIn: '1m'` to `generateToken()` (rename to `generateAccessToken`)
- [x] Add `generateRefreshToken(userId): Promise<string>` — nanoid, store in Redis as `refresh:{token}` → `userId` with 30-day TTL
- [x] Add `validateRefreshToken(token): Promise<string | undefined>` — lookup in Redis, return userId
- [x] Add `revokeRefreshToken(token): Promise<void>` — delete from Redis
- [x] Add `rotateRefreshToken(oldToken): Promise<{ accessToken, refreshToken } | undefined>` — validate old, revoke old, issue new pair

### 2. Data layer: dual cookie management (`data/request.ts`)
- [x] Replace single `token` cookie with `access_token` and `refresh_token` cookies
- [x] Update `setUserIdInsideRequest(userId)` to set both cookies
- [x] Update `setUserIdInsideRequest(undefined)` to delete both cookies and revoke refresh token
- [x] Update `getUserIdInsideRequest()` to read `access_token` cookie

### 3. GraphQL context (`graphql/context.ts`)
- [x] Read `access_token` cookie instead of `token`
- [x] `setAuthForUserId` → set both cookies (access + refresh)
- [x] `clearAuth` → clear both cookies + revoke refresh token

### 4. Middleware for cookie-based rotation (`middleware.ts`)
- [x] On every request: check `access_token` cookie
- [x] If expired/missing but `refresh_token` present → rotate tokens, set new cookies on response
- [x] If both missing/invalid → proceed unauthenticated (clear stale cookies)
- [x] `getUserIdInsideRequest()` — simple read-only (no rotation, middleware handles it)
- [x] `context()` — simple read from header or cookie (no rotation, middleware handles it)

### 5. GraphQL schema + `refreshTokens` mutation
- [x] `AuthResult` type updated: `accessToken`, `refreshToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `user`
- [x] New `refreshTokens(refreshToken)` mutation for native clients
- [x] All auth mutations return full `AuthResult` with token pair and expiry timestamps

### 6. Auth flow updates
- [x] All `setAuthForUserId` callers updated to use new `AuthResult` shape
- [x] `clearAuth` revokes refresh token from Redis

### 7. Documentation
- [x] SPECS.md section 13 — token architecture, rotation flows (web vs native)
- [x] SPECS.md section 18.4 — updated GraphQL API auth docs

### 8. Verification
- [ ] `npm run build` passes
- [ ] Manual: sign in → both cookies set
- [ ] Manual: wait >1 min → access token rotates silently on next request
- [ ] Manual: sign out → both cookies cleared, refresh token deleted from Redis
- [ ] Change access token expiry from `1m` to `15m`
