'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PasskeyIcon } from '@/components/Icons'
import { ActionButton } from '@/components/Buttons'
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

        const result = await registerPasskey()
        if (!result.success) {
            console.error('Failed to add passkey:', result.error)
            setPasskeyState({ state: 'error', error: result.error })
            return
        }
        router.push(returnTo)
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
                <ActionButton
                    onClick={passkeyState.state === 'error' ? handleRetryPasskey : handleAddPasskey}
                    disabled={passkeyState.state === 'loading'}
                    loading={passkeyState.state === 'loading'}
                    className='w-full px-6 py-3'
                >
                    <div className='w-5 h-5'>
                        <PasskeyIcon />
                    </div>
                    <span>
                        {passkeyState.state === 'loading'
                            ? 'Adding Passkey...'
                            : passkeyState.state === 'error'
                                ? 'Try Again'
                                : 'Add Passkey'
                        }
                    </span>
                </ActionButton>

                <ActionButton
                    onClick={handleSkipPasskey}
                    disabled={passkeyState.state === 'loading'}
                    variant="secondary"
                    className='w-full px-6 py-3'
                >
                    I&apos;ll use sign-in links
                </ActionButton>
            </div>
        </div>
    )
}