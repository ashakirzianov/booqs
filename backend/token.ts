import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'
import { config } from './config'
import { redis } from './db'

const issuer = 'booqs'
export const ACCESS_TOKEN_TTL = 15 * 1 // 15 minutes in seconds
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30 // 30 days in seconds
const REFRESH_TOKEN_PREFIX = 'refresh:'

export type TokenPair = { accessToken: string, refreshToken: string }

export async function issueTokenPair(userId: string): Promise<TokenPair> {
    const accessToken = await issueAccessToken(userId)
    const refreshToken = await issueRefreshToken(userId)
    return { accessToken, refreshToken }
}

export async function rotateTokenPair(oldRefreshToken: string): Promise<TokenPair | undefined> {
    const userId = await validateRefreshToken(oldRefreshToken)
    if (!userId) {
        return undefined
    }
    // Pipeline: revoke old + store new refresh token in one round trip
    const newRefreshToken = nanoid(64)
    const pipeline = redis.pipeline()
    pipeline.del(`${REFRESH_TOKEN_PREFIX}${oldRefreshToken}`)
    pipeline.set(`${REFRESH_TOKEN_PREFIX}${newRefreshToken}`, userId, { ex: REFRESH_TOKEN_TTL })
    const [accessToken] = await Promise.all([
        issueAccessToken(userId),
        pipeline.exec(),
    ])
    return { accessToken, refreshToken: newRefreshToken }
}

export async function userIdFromAccessToken(token: string): Promise<string | undefined> {
    try {
        const secret = new TextEncoder().encode(config().jwtSecret)
        const { payload } = await jwtVerify(token, secret, { issuer })
        return payload.userId as string
    } catch {
        return undefined
    }
}

export async function revokeRefreshToken(token: string): Promise<void> {
    await redis.del(`${REFRESH_TOKEN_PREFIX}${token}`)
}

async function issueAccessToken(userId: string): Promise<string> {
    const secret = new TextEncoder().encode(config().jwtSecret)
    return new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer(issuer)
        .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
        .sign(secret)
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
