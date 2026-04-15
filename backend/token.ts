import { sign, verify } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { config } from './config'
import { redis } from './db'
import { afterPrefix } from './utils'

const issuer = 'booqs'
const ACCESS_TOKEN_EXPIRY = '1m' // TODO: change to '15m' after verification
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30 // 30 days in seconds
const REFRESH_TOKEN_PREFIX = 'refresh:'

export function generateAccessToken(userId: string) {
    return sign({ userId }, config().jwtSecret, { issuer, expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function userIdFromHeader(header: string) {
    const token = afterPrefix(header, 'Bearer ')
    return token
        ? userIdFromToken(token) : undefined
}

export function userIdFromToken(token: string) {
    try {
        const { userId } = verify(token, config().jwtSecret, { issuer }) as any
        return userId as string
    } catch {
        return undefined
    }
}

export async function issueRefreshToken(userId: string): Promise<string> {
    const token = nanoid(64)
    await redis.set(`${REFRESH_TOKEN_PREFIX}${token}`, userId, { ex: REFRESH_TOKEN_TTL })
    return token
}

export async function validateRefreshToken(token: string): Promise<string | undefined> {
    const userId = await redis.get<string>(`${REFRESH_TOKEN_PREFIX}${token}`)
    return userId ?? undefined
}

export async function revokeRefreshToken(token: string): Promise<void> {
    await redis.del(`${REFRESH_TOKEN_PREFIX}${token}`)
}

export async function rotateRefreshToken(oldToken: string): Promise<{ accessToken: string, refreshToken: string } | undefined> {
    const userId = await validateRefreshToken(oldToken)
    if (!userId) {
        return undefined
    }
    await revokeRefreshToken(oldToken)
    const accessToken = generateAccessToken(userId)
    const refreshToken = await issueRefreshToken(userId)
    return { accessToken, refreshToken }
}