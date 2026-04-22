import { NextRequest, NextResponse } from 'next/server'
import { rotateTokenPair, userIdFromAccessToken, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '@/data/tokens'

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'

const PROTECTED_ROUTES = ['/profile', '/collections', '/followers', '/history', '/notes']

export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value

    // Access token still valid — pass through
    if (accessToken && await userIdFromAccessToken(accessToken)) {
        return NextResponse.next()
    }

    // Access token expired/missing but refresh token present — rotate
    if (refreshToken) {
        const result = await rotateTokenPair(refreshToken)
        if (result) {
            const response = NextResponse.next()
            response.cookies.set(ACCESS_COOKIE, result.accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: ACCESS_TOKEN_TTL,
            })
            response.cookies.set(REFRESH_COOKIE, result.refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: REFRESH_TOKEN_TTL,
            })
            return response
        }

        // Refresh token invalid — clear stale cookies and fall through to auth check
        const response = redirectToAuthIfProtected(request)
        response.cookies.delete(ACCESS_COOKIE)
        response.cookies.delete(REFRESH_COOKIE)
        return response
    }

    // No tokens at all — redirect if protected route
    return redirectToAuthIfProtected(request)
}

function redirectToAuthIfProtected(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl
    if (PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        const returnTo = pathname + request.nextUrl.search
        const authUrl = new URL(`/auth?return_to=${encodeURIComponent(returnTo)}`, request.url)
        return NextResponse.redirect(authUrl)
    }
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt).*)',
    ],
}
