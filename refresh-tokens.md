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
- [ ] Read `access_token` cookie instead of `token`
- [ ] `setAuthForUserId` → set both cookies (access + refresh)
- [ ] `clearAuth` → clear both cookies + revoke refresh token

### 4. Middleware (`middleware.ts` — new file)
- [ ] On every request: check `access_token` cookie
- [ ] If expired/missing but `refresh_token` present → rotate tokens, set new cookies on response
- [ ] If both missing/invalid → proceed unauthenticated

### 5. Auth flow updates
- [ ] Verify all `setUserIdInsideRequest` and `setAuthForUserId` callers work with the new dual-cookie logic (should be minimal since the abstraction handles it)

### 6. Verification
- [ ] `npm run build` passes
- [ ] Manual: sign in → both cookies set
- [ ] Manual: wait >1 min → middleware refreshes silently (new cookies appear)
- [ ] Manual: sign out → both cookies cleared, refresh token deleted from Redis
- [ ] Change access token expiry from `'1m'` to `'15m'`
