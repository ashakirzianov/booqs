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

export type AuthUser = {
    id: string,
    joined: string,
    name?: string,
    pictureUrl?: string,
}
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
    user: AuthUser,
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

    async function registerWithPasskey() {
        try {
            if (!browserSupportsWebAuthn()) {
                setData({
                    state: 'error',
                    error: 'Your browser does not support WebAuthn',
                })
                return
            }
            setData({ state: 'loading' })
            const initResult = await initPasskeyRegistrationAcion()
            if (!initResult.success) {
                setData({
                    state: 'error',
                    error: 'Failed to init passkey registration'
                })
                return
            }
            const response = await startRegistration({
                optionsJSON: initResult.options,
            })
            const verificationResult = await verifyPasskeyRegistrationAction({
                id: initResult.id,
                response,
            })
            if (!verificationResult.success) {
                setData({
                    state: 'error',
                    error: 'Failed to verify passkey registration'
                })
                return
            }
            setData({
                state: 'signed',
                user: verificationResult.user,
            })
        } catch (err: any) {
            setData({
                state: 'error',
                error: err.toString(),
            })
        }
    }

    async function signInWithPasskey() {
        try {
            if (!browserSupportsWebAuthn()) {
                setData({
                    state: 'error',
                    error: 'Your browser does not support WebAuthn',
                })
                return
            }
            setData({ state: 'loading' })
            const initResult = await initPasskeySigninAction()
            if (!initResult.success) {
                setData({
                    state: 'error',
                    error: 'Failed to init passkey registration'
                })
                return
            }
            const response = await startAuthentication({
                optionsJSON: initResult.options,
            })
            const verificationResult = await verifyPasskeySigninAction({
                id: initResult.id,
                response,
            })
            if (!verificationResult.success) {
                setData({
                    state: 'error',
                    error: 'Failed to verify passkey registration'
                })
                return
            }
            setData({
                state: 'signed',
                user: verificationResult.user,
            })
        } catch (err: any) {
            setData({
                state: 'error',
                error: err.toString(),
            })
        }
    }
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
        registerWithPasskey, signInWithPasskey,
        deleteAccount,
        signOut,
    }
}