'use client'
import {
    browserSupportsWebAuthn,
    startRegistration, startAuthentication,
} from '@simplewebauthn/browser'
import {
    initPasskeyRegistrationAcion, verifyPasskeyRegistrationAction,
    initPasskeySigninAction, verifyPasskeySigninAction,
} from '@/data/auth'
import { generatePasskeyLabel } from '@/application/utils'

export function usePasskeys() {
    async function registerPasskey() {
        const result = await registerPasskeyImpl()
        if (!result.success) {
            throw new Error(result.error)
        }
        // Ignore user data return as requested
    }

    async function signInWithPasskey() {
        const result = await signInWithPasskeyImpl()
        if (!result.success) {
            throw new Error(result.error)
        }
        return result.user
    }

    return {
        registerPasskey,
        signInWithPasskey,
    }
}

async function registerPasskeyImpl() {
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
        const label = generatePasskeyLabel()
        const verificationResult = await verifyPasskeyRegistrationAction({
            id: initResult.id,
            response,
            label,
        })
        if (!verificationResult.success) {
            return {
                success: false as const,
                error: 'Failed to verify passkey registration'
            }
        }
        return {
            success: true as const,
        }
    } catch (err: any) {
        return {
            success: false as const,
            error: err.toString(),
        }
    }
}

async function signInWithPasskeyImpl() {
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