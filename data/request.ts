'use server'
import { generateAccessToken, issueRefreshToken, revokeRefreshToken, userIdFromToken } from '@/backend/token'
import { cookies } from 'next/headers'

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function getUserIdInsideRequest() {
    const token = await getAccessToken()
    if (!token) {
        return undefined
    }
    return userIdFromToken(token)
}

export async function setUserIdInsideRequest(userId: string | undefined) {
    const cookieStore = await cookies()
    if (userId) {
        const accessToken = generateAccessToken(userId)
        const refreshToken = await issueRefreshToken(userId)
        cookieStore.set(ACCESS_COOKIE, accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 60, // match access token expiry
        })
        cookieStore.set(REFRESH_COOKIE, refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: REFRESH_MAX_AGE,
        })
        return accessToken
    } else {
        const oldRefreshToken = cookieStore.get(REFRESH_COOKIE)?.value
        if (oldRefreshToken) {
            await revokeRefreshToken(oldRefreshToken)
        }
        cookieStore.delete(ACCESS_COOKIE)
        cookieStore.delete(REFRESH_COOKIE)
        return undefined
    }
}

async function getAccessToken() {
    const cookieStore = await cookies()
    return cookieStore.get(ACCESS_COOKIE)?.value
}
