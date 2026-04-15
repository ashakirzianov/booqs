import { sign, verify } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { config } from './config'
import { redis } from './db'

const issuer = 'booqs'
export const ACCESS_TOKEN_TTL = 1 * 60 // TODO: change to '15 * 60' after verification
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30 // 30 days in seconds
const REFRESH_TOKEN_PREFIX = 'refresh:'

export type TokenPair = { accessToken: string, refreshToken: string }

export async function issueTokenPair(userId: string): Promise<TokenPair> {
    const accessToken = issueAccessToken(userId)
    const refreshToken = await issueRefreshToken(userId)
    return { accessToken, refreshToken }
}

export async function rotateTokenPair(oldRefreshToken: string): Promise<TokenPair | undefined> {
    const userId = await validateRefreshToken(oldRefreshToken)
    if (!userId) {
        return undefined
    }
    await revokeRefreshToken(oldRefreshToken)
    return issueTokenPair(userId)
}

export function userIdFromToken(token: string) {
    try {
        const { userId } = verify(token, config().jwtSecret, { issuer }) as any
        return userId as string
    } catch {
        return undefined
    }
}

export async function revokeRefreshToken(token: string): Promise<void> {
    await redis.del(`${REFRESH_TOKEN_PREFIX}${token}`)
}

function issueAccessToken(userId: string): string {
    return sign({ userId }, config().jwtSecret, { issuer, expiresIn: ACCESS_TOKEN_TTL })
}

async function issueRefreshToken(userId: string): Promise<string> {
    const token = nanoid(64)
    await redis.set(`${REFRESH_TOKEN_PREFIX}${token}`, userId, { ex: REFRESH_TOKEN_TTL })
    return token
}

async function validateRefreshToken(token: string): Promise<string | undefined> {
    const userId = await redis.get<string>(`${REFRESH_TOKEN_PREFIX}${token}`)
    return userId ?? undefined
}
