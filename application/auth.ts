'use client'
import {
    browserSupportsWebAuthn,
    startRegistration, startAuthentication,
} from '@simplewebauthn/browser'
import {
    initPasskeyRegistrationAcion, verifyPasskeyRegistrationAction,
    initPasskeySigninAction, verifyPasskeySigninAction,
    signOutAction,
    deleteAccountAction,
} from '@/data/auth'
import useSWR from 'swr'
import { GetResponse } from '@/app/api/me/route'
import { AccountData } from '@/core'

export function useAuth() {
    const { data, isLoading, error, mutate } = useSWR(
        '/api/me',
        async function (url: string) {
            const res = await fetch(url)
            if (res.status !== 200) {
                throw new Error('Failed to fetch user')
            }
            const data: GetResponse = await res.json()
            return data
        }
    )

    async function signOut() {
        const result = await mutate(async function () {
            const result = await signOutAction()
            if (result) {
                return {
                    user: null,
                }
            }
            throw new Error('Failed to sign out')
        }, {
            optimisticData: {
                user: null,
            },
        })
        return result?.user === null
    }
    async function deleteAccount() {
        mutate(async function () {
            const result = await deleteAccountAction()
            if (result) {
                return {
                    user: null,
                }
            }
            throw new Error('Failed to delete account')
        }, {
            optimisticData: {
                user: null,
            },
        })
    }

    const user: AccountData | undefined = data?.user
        ? {
            id: data.user.id,
            name: data.user.name ?? undefined,
            profilePictureURL: data.user.profile_picture_url ?? undefined,
            joinedAt: data.user.joined_at,
            emoji: data.user.emoji ?? undefined,
        }
        : undefined

    return {
        user,
        registerWithPasskey() {
            mutate(async function () {
                const result = await registerWithPasskey()
                if (result.success) {
                    return {
                        user: result.user,
                    }
                } else {
                    throw new Error(result.error)
                }
            }, {
                populateCache: true,
                rollbackOnError: true,
            })
        },
        signInWithPasskey() {
            mutate(async function () {
                const result = await signInWithPasskey()
                if (result.success) {
                    return {
                        user: result.user,
                    }
                } else {
                    throw new Error(result.error)
                }
            }, {
                populateCache: true,
                rollbackOnError: true,
            })
        },
        deleteAccount,
        signOut,
        isLoading,
        error,
    }
}

export async function registerWithPasskey() {
    try {
        if (!browserSupportsWebAuthn()) {
            return {
                success: false as const,
                error: 'Your browser does not support WebAuthn',
            }
        }
        const initResult = await initPasskeyRegistrationAcion()
        if (!initResult.success) {
            return {
                success: false as const,
                error: 'Failed to init passkey registration'
            }
        }
        const response = await startRegistration({
            optionsJSON: initResult.options,
        })
        const verificationResult = await verifyPasskeyRegistrationAction({
            id: initResult.id,
            response,
        })
        if (!verificationResult.success) {
            return {
                success: false as const,
                error: 'Failed to verify passkey registration'
            }
        }
        return {
            success: true as const,
            user: verificationResult.user,
        }
    } catch (err: any) {
        return {
            success: false as const,
            error: err.toString(),
        }
    }
}

export async function signInWithPasskey() {
    try {
        if (!browserSupportsWebAuthn()) {
            return {
                success: false as const,
                error: 'Your browser does not support WebAuthn',
            }
        }
        const initResult = await initPasskeySigninAction()
        if (!initResult.success) {
            return {
                success: false as const,
                error: 'Failed to init passkey registration'
            }
        }
        const response = await startAuthentication({
            optionsJSON: initResult.options,
        })
        const verificationResult = await verifyPasskeySigninAction({
            id: initResult.id,
            response,
        })
        if (!verificationResult.success) {
            return {
                success: false as const,
                error: 'Failed to verify passkey registration'
            }
        }
        return {
            success: true as const,
            user: verificationResult.user,
        }
    } catch (err: any) {
        return {
            success: false as const,
            error: err.toString(),
        }
    }
}