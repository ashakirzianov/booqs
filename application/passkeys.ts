'use client'
import {
    browserSupportsWebAuthn,
    startRegistration, startAuthentication,
} from '@simplewebauthn/browser'
import {
    initPasskeyRegistration, verifyPasskeyRegistration,
    initPasskeySignin, verifyPasskeySignin,
    deletePasskeyWithUpdatedList,
} from '@/data/auth'
import { generatePasskeyLabel } from '@/application/utils'

export function usePasskeys() {
    return {
        registerPasskey,
        signInWithPasskey,
        deletePasskey,
    }
}

async function registerPasskey() {
    try {
        if (!browserSupportsWebAuthn()) {
            return {
                success: false as const,
                error: 'Your browser does not support WebAuthn',
            }
        }
        const initResult = await initPasskeyRegistration()
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
        const verificationResult = await verifyPasskeyRegistration({
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
            passkeys: verificationResult.passkeys,
        }
    } catch (err: unknown) {
        return {
            success: false as const,
            error: err instanceof Error ? err.message : String(err),
        }
    }
}

async function signInWithPasskey() {
    try {
        if (!browserSupportsWebAuthn()) {
            return {
                success: false as const,
                error: 'Your browser does not support WebAuthn',
            }
        }
        const initResult = await initPasskeySignin()
        if (!initResult.success) {
            return {
                success: false as const,
                error: 'Failed to init passkey registration'
            }
        }
        const response = await startAuthentication({
            optionsJSON: initResult.options,
        })
        const verificationResult = await verifyPasskeySignin({
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
    } catch (err: unknown) {
        return {
            success: false as const,
            error: err instanceof Error ? err.message : String(err),
        }
    }
}

async function deletePasskey(id: string) {
    try {
        const result = await deletePasskeyWithUpdatedList(id)
        if (!result.success) {
            return {
                success: false as const,
                error: 'Failed to delete passkey'
            }
        }
        return {
            success: true as const,
            passkeys: result.passkeys,
        }
    } catch (err: unknown) {
        return {
            success: false as const,
            error: err instanceof Error ? err.message : String(err),
        }
    }
}