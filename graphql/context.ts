import { issueTokenPair, TokenPair, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, revokeRefreshToken, userIdFromToken } from '@/backend/token'
import { createLoaders, GraphQLLoaders } from './loaders'

export type ResolverContext = {
    userId?: string,
    origin?: string,
    setAuthForUserId(userId: string): Promise<TokenPair>,
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
    const authHeader = ctx.getHeader('authorization')
    const userId = authHeader?.startsWith('Bearer ')
        ? userIdFromToken(authHeader.slice('Bearer '.length))
        : userIdFromToken(ctx.getCookie('access_token') ?? '')

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
            return tokenPair
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
