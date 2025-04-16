'use server'
import {
    initiatePasskeyRegistration, verifyPasskeyRegistration,
    initiatePasskeyLogin, verifyPasskeyLogin,
} from '@/backend/passkey'
import { generateToken, userIdFromToken } from '@/backend/token'
import { deleteUserForId, userForId } from '@/backend/users'
import { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/browser'
import { cookies, headers } from 'next/headers'

export async function initPasskeyRegistrationAcion() {
    try {
        const origin = await getOrigin()
        const { id, options } = await initiatePasskeyRegistration({
            requestOrigin: origin ?? undefined,
        })
        if (id && options) {
            return {
                success: true,
                id,
                options,
            } as const
        } else {
            return { success: false } as const
        }

    } catch {
        return {
            success: false,
        } as const
    }
}

export async function verifyPasskeyRegistrationAction({ id, response }: {
    id: string,
    response: RegistrationResponseJSON, // The credential JSON received from the client
}) {
    try {
        const origin = await getOrigin()
        const result = await verifyPasskeyRegistration({
            id,
            response,
            requestOrigin: origin ?? undefined,
        })
        if (result.user?.id) {
            const token = generateToken(result.user.id)
            await setAuthToken(token)
            return {
                success: true,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    pictureUrl: result.user.profile_picture_url,
                    joined: result.user.joined_at,
                },
            } as const
        } else {
            return {
                success: false,
            } as const
        }
    } catch {
        return {
            success: false,
        } as const
    }
}

export async function initPasskeySigninAction() {
    try {
        const origin = await getOrigin()
        const { id, options, } = await initiatePasskeyLogin({
            requestOrigin: origin ?? undefined,
        })
        if (id && options) {
            return {
                success: true,
                id,
                options,
            } as const
        } else {
            return { success: false } as const
        }
    } catch {
        return {
            success: false,
        } as const
    }
}

export async function verifyPasskeySigninAction({ id, response }: {
    id: string,
    response: AuthenticationResponseJSON, // The credential JSON received from the client
}) {
    try {
        const origin = await getOrigin()
        const result = await verifyPasskeyLogin({
            id,
            response,
            requestOrigin: origin ?? undefined,
        })
        if (result.user?.id) {
            const token = generateToken(result.user.id)
            await setAuthToken(token)
            return {
                success: true,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    pictureUrl: result.user.profile_picture_url,
                    joined: result.user.joined_at,
                },
            } as const
        } else {
            return {
                success: false,
            } as const
        }
    } catch {
        return {
            success: false,
        } as const
    }
}

export async function signOutAction() {
    await setAuthToken(undefined)
    return true
}

export async function getUserIdInsideRequest() {
    const token = await getAuthToken()
    if (!token) {
        return undefined
    }
    return userIdFromToken(token)
}

export async function fetchAuthData() {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const user = await userForId(userId)
    if (!user) {
        return undefined
    }
    return {
        id: user.id,
        name: user.name,
        pictureUrl: user.profile_picture_url,
        joined: user.joined_at,
    }
}

export async function deleteAccountAction() {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return false
    }
    const result = await deleteUserForId(userId)
    if (result) {
        setAuthToken(undefined)
    }
    return result
}

async function getOrigin() {
    const hs = await headers()
    return hs.get('origin')
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