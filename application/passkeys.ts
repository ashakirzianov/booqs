'use client'
import {
    browserSupportsWebAuthn,
    startRegistration, startAuthentication,
} from '@simplewebauthn/browser'
import {
    initPasskeyRegistrationAcion, verifyPasskeyRegistrationAction,
    initPasskeySigninAction, verifyPasskeySigninAction,
    deletePasskeyActionWithUpdatedList,
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
            passkeys: verificationResult.passkeys,
        }
    } catch (err: any) {
        return {
            success: false as const,
            error: err.toString(),
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

async function deletePasskey(id: string) {
    try {
        const result = await deletePasskeyActionWithUpdatedList(id)
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
    } catch (err: any) {
        return {
            success: false as const,
            error: err.toString(),
        }
    }
}