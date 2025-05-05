'use client'
// TODO: remove provider and use useSWR instead
import {
    browserSupportsWebAuthn,
    startRegistration, startAuthentication,
} from '@simplewebauthn/browser'
import {
    initPasskeyRegistrationAcion, verifyPasskeyRegistrationAction,
    initPasskeySigninAction, verifyPasskeySigninAction,
    signOutAction,
    fetchAuthData,
    deleteAccountAction,
} from '@/data/auth'
import { makeStateProvider } from './state'
import { useContext } from 'react'
import { AccountData } from '@/core'

export type AuthState = {
    state: 'loading',
    user?: undefined,
} | {
    state: 'not-signed',
    user?: undefined,
} | {
    state: 'error',
    error: string,
    user?: undefined,
} | {
    state: 'signed',
    user: AccountData,
}

const {
    StateProvider: AuthProvider,
    Context,
} = makeStateProvider<AuthState>({
    key: 'auth',
    initialData: {
        state: 'loading',
    },
    onMount(_, setData) {
        fetchAuthData().then(user => {
            if (user) {
                setData({
                    state: 'signed',
                    user,
                })
            } else {
                setData({
                    state: 'not-signed',
                })
            }
        }).catch(_ => {
            setData({
                state: 'error',
                error: 'Error fetching auth data',
            })
        })
    }
})

export { AuthProvider }

export function useAuth() {
    const { data, setData } = useContext(Context)

    async function signOut() {
        const current = data
        setData({ state: 'loading' })
        const result = await signOutAction()
        if (result) {
            setData({ state: 'not-signed' })
        } else {
            setData(current)
        }
    }
    async function deleteAccount() {
        setData({ state: 'loading' })
        const result = await deleteAccountAction()
        if (result) {
            setData({ state: 'not-signed' })
        } else {
            setData({
                state: 'error',
                error: 'Failed to delete account',
            })
        }
    }

    return {
        auth: data,
        registerWithPasskey() {
            setData({ state: 'loading' })
            registerWithPasskey().then(result => {
                if (result.success) {
                    setData({
                        state: 'signed',
                        user: result.user,
                    })
                } else {
                    setData({
                        state: 'error',
                        error: result.error,
                    })
                }
            }
            ).catch(err => {
                setData({
                    state: 'error',
                    error: err.toString(),
                })
            })
        },
        signInWithPasskey() {
            setData({ state: 'loading' })
            signInWithPasskey().then(result => {
                if (result.success) {
                    setData({
                        state: 'signed',
                        user: result.user,
                    })
                } else {
                    setData({
                        state: 'error',
                        error: result.error,
                    })
                }
            }
            ).catch(err => {
                setData({
                    state: 'error',
                    error: err.toString(),
                })
            })
        },
        deleteAccount,
        signOut,
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