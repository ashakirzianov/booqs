import { issueTokenPair, TokenPair, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, revokeRefreshToken, userIdFromAccessToken } from '@/backend/token'
import { createLoaders, GraphQLLoaders } from './loaders'

export type AuthResult = {
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresAt: number,
    refreshTokenExpiresAt: number,
}

export type ResolverContext = {
    userId?: string,
    origin?: string,
    setAuthForUserId(userId: string): Promise<AuthResult>,
    clearAuth(): Promise<void>,
} & GraphQLLoaders
type CookieOptions = {
    httpOnly?: boolean,
    secure?: boolean,
    maxAge?: number,
}
type RequestContext = {
    origin?: string,
    getCookie(name: string): string | undefined,
    getHeader(name: string): string | undefined,
    setCookie(name: string, value: string, options?: CookieOptions): void,
    clearCookie(name: string, options?: CookieOptions): void,
}
export async function context(ctx: RequestContext): Promise<ResolverContext> {
    // Try access token from header (native) or cookie (web)
    // Cookie-based rotation is handled by middleware before this runs
    const accessToken = ctx.getHeader('x-access-token')
        ?? ctx.getCookie('access_token')
    const userId = accessToken ? userIdFromAccessToken(accessToken) : undefined

    return {
        userId,
        origin: ctx.origin,
        ...createLoaders(),
        async setAuthForUserId(userId: string) {
            const tokenPair = await issueTokenPair(userId)
            ctx.setCookie('access_token', tokenPair.accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: ACCESS_TOKEN_TTL,
            })
            ctx.setCookie('refresh_token', tokenPair.refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: REFRESH_TOKEN_TTL,
            })
            return authResultFromTokenPair(tokenPair)
        },
        async clearAuth() {
            const oldRefreshToken = ctx.getCookie('refresh_token')
            if (oldRefreshToken) {
                await revokeRefreshToken(oldRefreshToken)
            }
            ctx.clearCookie('access_token', { httpOnly: true })
            ctx.clearCookie('refresh_token', { httpOnly: true })
        },
    }
}

export function authResultFromTokenPair(tokenPair: TokenPair): AuthResult {
    const now = Date.now()
    return {
        ...tokenPair,
        accessTokenExpiresAt: now + ACCESS_TOKEN_TTL * 1000,
        refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL * 1000,
    }
}
