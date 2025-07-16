'use server'
import {
    initiatePasskeyRegistration, verifyPasskeyRegistration,
    initiatePasskeyLogin, verifyPasskeyLogin,
} from '@/backend/passkey'
import { generateToken, userIdFromToken } from '@/backend/token'
import { deleteUserForId, userForId, updateUser, accountDataFromDbUser } from '@/backend/users'
import { completeSignInRequest, completeSignUp, prevalidateSignup, initiateSignRequest } from '@/backend/sign'
import { AccountData } from '@/core'
import { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/browser'
import { cookies, headers } from 'next/headers'

export async function initPasskeyRegistrationAcion() {
    try {
        const origin = await getOrigin()
        const { id, options } = await initiatePasskeyRegistration({
            origin: origin ?? undefined,
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
            origin: origin ?? undefined,
        })
        if (result.user?.id) {
            const token = generateToken(result.user.id)
            await setAuthToken(token)
            return {
                success: true,
                user: accountDataFromDbUser(result.user),
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
            origin: origin ?? undefined,
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
            origin: origin ?? undefined,
        })
        if (result.user?.id) {
            const token = generateToken(result.user.id)
            await setAuthToken(token)
            return {
                success: true,
                user: accountDataFromDbUser(result.user),
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

export async function fetchAuthData(): Promise<AccountData | undefined> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const user = await userForId(userId)
    if (!user) {
        return undefined
    }
    return accountDataFromDbUser(user)
}

export async function updateAccountAction({
    name,
    emoji
}: {
    name?: string,
    emoji?: string
}): Promise<AccountData | null> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return null
    }

    const result = await updateUser({
        id: userId,
        name,
        emoji,
    })

    if (!result.success) {
        return null
    }

    return accountDataFromDbUser(result.user)
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

export async function completeSignInAction({
    email,
    secret,
}: {
    email: string,
    secret: string,
}): Promise<{ success: true, user: AccountData } | { success: false, reason: string }> {
    try {
        const result = await completeSignInRequest({ email, secret })

        if (!result.success) {
            return { success: false, reason: result.reason }
        }

        await setAuthToken(result.token)

        return {
            success: true,
            user: accountDataFromDbUser(result.user),
        }
    } catch (err) {
        console.error('Error completing sign-in:', err)
        return { success: false, reason: 'An error occurred during sign-in' }
    }
}

export async function completeSignUpAction({
    email,
    secret,
    username,
    name,
    emoji,
}: {
    email: string,
    secret: string,
    username: string,
    name: string,
    emoji?: string,
}): Promise<{ success: true, user: AccountData } | { success: false, reason: string }> {
    try {
        const result = await completeSignUp({
            email,
            secret,
            username,
            name,
            emoji,
        })

        if (!result.success) {
            return { success: false, reason: result.reason }
        }

        await setAuthToken(result.token)

        return {
            success: true,
            user: accountDataFromDbUser(result.user),
        }
    } catch (err) {
        console.error('Error completing sign-up:', err)
        return { success: false, reason: 'An error occurred during sign-up' }
    }
}

export async function prevalidateSignupAction({
    email,
    secret,
}: {
    email: string,
    secret: string,
}): Promise<{ success: true } | { success: false, reason: string }> {
    try {
        return await prevalidateSignup({ email, secret })
    } catch (err) {
        console.error('Error prevalidating signup:', err)
        return { success: false, reason: 'An error occurred during validation' }
    }
}

export async function initiateSignAction({
    email,
    returnTo,
}: {
    email: string,
    returnTo?: string,
}): Promise<
    | { success: true, kind: 'signin' | 'signup' }
    | { success: false, error: string }
> {
    try {
        const result = await initiateSignRequest({
            email,
            from: returnTo ?? '/',
        })

        if (result.kind === 'error') {
            return { success: false, error: result.error }
        }

        return { success: true, kind: result.kind }
    } catch (err) {
        console.error('Error initiating sign action:', err)
        return { success: false, error: 'An error occurred while processing your request' }
    }
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