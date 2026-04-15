import {
    rotateTokenPair as rotateTokenPairBackend,
    userIdFromAccessToken as userIdFromAccessTokenBackend,
    ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL,
} from '@/backend/token'
export type { TokenPair } from '@/backend/token'

export { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL }

export async function userIdFromAccessToken(token: string) {
    return userIdFromAccessTokenBackend(token)
}

export async function rotateTokenPair(refreshToken: string) {
    return rotateTokenPairBackend(refreshToken)
}
