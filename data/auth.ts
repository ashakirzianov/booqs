'use server'
import {
    initiatePasskeyRegistration, verifyPasskeyRegistration,
    initiatePasskeyLogin, verifyPasskeyLogin,
    getUserPasskeys, deletePasskeyCredential,
} from '@/backend/passkey'
import { generateToken, userIdFromToken } from '@/backend/token'
import { deleteUserForId, userForId, updateUser, DbUser } from '@/backend/users'
import { completeSignInRequest, completeSignUp, prevalidateSignup, initiateSignRequest } from '@/backend/sign'
import { AccountData } from '@/core'
import { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/browser'
import { cookies, headers } from 'next/headers'

export async function initPasskeyRegistrationAcion() {
    try {
        const origin = await getOrigin()
        const userId = await getUserIdInsideRequest()
        const user = userId ? await userForId(userId) : undefined
        if (!user) {
            return {
                success: false,
                error: 'User not found',
            } as const
        }
        const { id, options } = await initiatePasskeyRegistration({
            origin: origin ?? undefined,
            user,
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

export async function verifyPasskeyRegistrationAction({ id, response, label }: {
    id: string,
    response: RegistrationResponseJSON, // The credential JSON received from the client
    label?: string,
}) {
    try {
        const origin = await getOrigin()
        const ipAddress = await getClientIpAddress()
        const result = await verifyPasskeyRegistration({
            id,
            response,
            origin: origin ?? undefined,
            label,
            ipAddress,
        })
        if (result.user?.id) {
            const token = generateToken(result.user.id)
            await setAuthToken(token)
            const updatedPasskeys = await getUserPasskeys(result.user.id)
            return {
                success: true,
                user: accountDataFromDbUser(result.user),
                passkeys: updatedPasskeys,
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
        const ipAddress = await getClientIpAddress()
        const result = await verifyPasskeyLogin({
            id,
            response,
            origin: origin ?? undefined,
            ipAddress,
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
    emoji,
    username
}: {
    name?: string,
    emoji?: string,
    username?: string
}): Promise<{ success: true, user: AccountData } | { success: false, error: string }> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return { success: false, error: 'Authentication required' }
    }

    const result = await updateUser({
        id: userId,
        name,
        emoji,
        username,
    })

    if (!result.success) {
        return { success: false, error: result.reason }
    }

    return { success: true, user: accountDataFromDbUser(result.user) }
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

async function getClientIpAddress(): Promise<string | undefined> {
    const hs = await headers()
    return hs.get('x-forwarded-for') || hs.get('x-real-ip') || undefined
}

export async function fetchPasskeyData(): Promise<PasskeyData[]> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return []
    }
    return await getUserPasskeys(userId)
}

export async function deletePasskeyAction(credentialId: string): Promise<boolean> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return false
    }
    return await deletePasskeyCredential(userId, credentialId)
}

export async function deletePasskeyActionWithUpdatedList(credentialId: string): Promise<{ success: boolean, passkeys?: PasskeyData[] }> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return { success: false }
    }

    const deleteResult = await deletePasskeyCredential(userId, credentialId)
    if (!deleteResult) {
        return { success: false }
    }

    const updatedPasskeys = await getUserPasskeys(userId)
    return { success: true, passkeys: updatedPasskeys }
}

export type PasskeyData = {
    id: string
    label: string | null
    ipAddress: string | null
    createdAt: string
    updatedAt: string
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

function accountDataFromDbUser(dbUser: DbUser): AccountData {
    return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        joinedAt: dbUser.joined_at,
        name: dbUser.name,
        profilePictureURL: dbUser.profile_picture_url ?? undefined,
        emoji: dbUser.emoji ?? undefined,
    }
}