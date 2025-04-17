import { config } from '@/backend/config'
import { userIdFromToken } from '@/backend/token'

export type RequestOrigin = 'production' | 'localhost'
export type ResolverContext = {
    userId?: string,
    requestOrigin?: RequestOrigin,
    setAuthToken(token: string | undefined): void,
}
type CookieOptions = {
    httpOnly?: boolean,
    secure?: boolean,
    maxAge?: number,
}
type RequestContext = {
    origin?: string,
    getCookie(name: string): string | undefined,
    setCookie(name: string, value: string, options?: CookieOptions): void,
    clearCookie(name: string, options?: CookieOptions): void,
}
export async function context(ctx: RequestContext): Promise<ResolverContext> {
    const authToken = ctx.getCookie('token') ?? ''
    const userId = userIdFromToken(authToken)
    const origins = config().origins
    // TODO: just pass the origin from the request (and rename)
    const requestOrigin: RequestOrigin = ctx.origin === origins.localhost || ctx.origin === origins.secureLocalhost
        ? 'localhost'
        : 'production'

    return {
        userId,
        requestOrigin,
        setAuthToken(token) {
            if (token) {
                ctx.setCookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 60 * 60 * 24 * 30,
                })
                ctx.setCookie('signed', 'true', {
                    httpOnly: false,
                    maxAge: 60 * 60 * 24 * 30,
                })
            } else {
                ctx.clearCookie('token', {
                    httpOnly: true,
                })
                ctx.clearCookie('signed', {
                    httpOnly: false,
                })
            }
        },
    }
}

