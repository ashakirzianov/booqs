import { NextRequest, NextResponse } from 'next/server'
import { rotateTokenPair, userIdFromAccessToken, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '@/data/tokens'

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value

    // Access token still valid or no refresh token — pass through
    if ((accessToken && await userIdFromAccessToken(accessToken)) || !refreshToken) {
        return NextResponse.next()
    }

    // Access token expired/missing but refresh token present — rotate
    const result = await rotateTokenPair(refreshToken)
    if (!result) {
        // Refresh token invalid — clear stale cookies
        const response = NextResponse.next()
        response.cookies.delete(ACCESS_COOKIE)
        response.cookies.delete(REFRESH_COOKIE)
        return response
    }

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

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt).*)',
    ],
}
