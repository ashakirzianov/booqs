'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner, PasskeyIcon } from '@/components/Icons'
import { usePasskeys } from '@/application/passkeys'
import { browserSupportsWebAuthn } from '@simplewebauthn/browser'

type AddPasskeyState = {
    state: 'initial'
} | {
    state: 'loading'
} | {
    state: 'error'
    error: string
}

export function AddPasskeyPage({ returnTo }: { returnTo: string }) {
    const router = useRouter()
    const [passkeyState, setPasskeyState] = useState<AddPasskeyState>({ state: 'initial' })
    const { registerPasskey } = usePasskeys()

    const handleAddPasskey = async () => {
        setPasskeyState({ state: 'loading' })

        try {
            await registerPasskey()
            router.push(returnTo)
        } catch (err) {
            console.error('Passkey registration error:', err)
            setPasskeyState({ state: 'error', error: err instanceof Error ? err.message : 'An unexpected error occurred while adding passkey' })
        }
    }

    const handleSkipPasskey = () => {
        router.push(returnTo)
    }

    const handleRetryPasskey = () => {
        setPasskeyState({ state: 'initial' })
    }

    if (!browserSupportsWebAuthn()) {
        router.push(returnTo)
        return null
    }

    return (
        <div className='w-full max-w-md flex flex-col gap-6'>
            <div className='text-center space-y-4'>
                <h2 className='text-2xl font-bold text-primary'>Account Created!</h2>
                <p className='text-lg text-secondary'>
                    Would you like to add a passkey for faster, more secure sign-ins?
                </p>
                <p className='text-sm text-dimmed'>
                    Passkeys use your device&apos;s biometric authentication (fingerprint, face, etc.) or PIN for secure access.
                </p>
            </div>

            {passkeyState.state === 'error' && (
                <div className='text-alert text-sm bg-alert/10 border border-alert/20 rounded-lg px-4 py-3' role='alert'>
                    {passkeyState.error}
                </div>
            )}

            <div className='flex flex-col gap-3'>
                <button
                    onClick={passkeyState.state === 'error' ? handleRetryPasskey : handleAddPasskey}
                    disabled={passkeyState.state === 'loading'}
                    className='w-full px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
                >
                    <div className='w-5 h-5'>
                        {passkeyState.state === 'loading' ? (
                            <Spinner />
                        ) : (
                            <PasskeyIcon />
                        )}
                    </div>
                    <span>
                        {passkeyState.state === 'loading'
                            ? 'Adding Passkey...'
                            : passkeyState.state === 'error'
                                ? 'Try Again'
                                : 'Add Passkey'
                        }
                    </span>
                </button>

                <button
                    onClick={handleSkipPasskey}
                    disabled={passkeyState.state === 'loading'}
                    className='w-full px-6 py-3 border border-dimmed text-secondary rounded-lg hover:bg-dimmed/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    I&apos;ll use sign-in links
                </button>
            </div>
        </div>
    )
}