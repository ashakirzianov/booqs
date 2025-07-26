'use server'
import { generateToken, userIdFromToken } from '@/backend/token'
import { cookies } from 'next/headers'

export async function getUserIdInsideRequest() {
    const token = await getAuthToken()
    if (!token) {
        return undefined
    }
    return userIdFromToken(token)
}

export async function setUserIdInsideRequest(userId: string | undefined) {
    if (userId) {
        const token = generateToken(userId)
        await setAuthToken(token)
        return token
    } else {
        await setAuthToken(undefined)
        return undefined
    }
}

async function getAuthToken() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    return token?.value
}

async function setAuthToken(token: string | undefined) {
    const cookieStore = await cookies()
    if (token) {
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 30,
        })
    } else {
        cookieStore.delete('token')
    }
}