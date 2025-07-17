'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { completeSignUpAction } from '@/data/auth'
import { Spinner, PasskeyIcon } from '@/components/Icons'
import { EmojiSelector } from '@/app/(main)/account/EmojiSelector'
import { registerPasskey } from '@/application/auth'
import { browserSupportsWebAuthn } from '@simplewebauthn/browser'

type SignUpState = {
    state: 'initial'
} | {
    state: 'error'
    error: string
} | {
    state: 'loading-signup'
} | {
    state: 'signup-complete'
    supportsPasskey: boolean
} | {
    state: 'loading-passkey'
} | {
    state: 'passkey-error'
    error: string
}

export function SignUpForm({
    email,
    secret,
    initialUsername,
    initialName,
    initialEmoji,
    returnTo
}: {
    email: string
    secret: string
    initialUsername: string
    initialName: string
    initialEmoji: string
    returnTo: string
}) {
    const router = useRouter()

    const [username, setUsername] = useState(initialUsername)
    const [name, setName] = useState(initialName)
    const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji)
    const [showEmojiSelector, setShowEmojiSelector] = useState(false)
    const [signUpState, setSignUpState] = useState<SignUpState>({ state: 'initial' })

    useEffect(() => {
        // Check passkey support on mount
        const supportsPasskey = browserSupportsWebAuthn()
        setSignUpState({ state: 'initial' })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            setSignUpState({ state: 'error', error: 'Name is required' })
            return
        }

        if (!username.trim()) {
            setSignUpState({ state: 'error', error: 'Username is required' })
            return
        }

        setSignUpState({ state: 'loading-signup' })

        try {
            const result = await completeSignUpAction({
                email,
                secret,
                username: username.trim(),
                name: name.trim(),
                emoji: selectedEmoji
            })

            if (result.success) {
                const supportsPasskey = browserSupportsWebAuthn()
                if (supportsPasskey) {
                    setSignUpState({ state: 'signup-complete', supportsPasskey: true })
                } else {
                    router.push(returnTo)
                }
            } else {
                setSignUpState({ state: 'error', error: result.reason })
            }
        } catch (err) {
            console.error('Sign-up error:', err)
            setSignUpState({ state: 'error', error: 'An unexpected error occurred' })
        }
    }

    const handleAddPasskey = async () => {
        setSignUpState({ state: 'loading-passkey' })

        try {
            const result = await registerPasskey()
            if (result.success) {
                router.push(returnTo)
            } else {
                setSignUpState({ state: 'passkey-error', error: result.error })
            }
        } catch (err) {
            console.error('Passkey registration error:', err)
            setSignUpState({ state: 'passkey-error', error: 'An unexpected error occurred while adding passkey' })
        }
    }

    const handleSkipPasskey = () => {
        router.push(returnTo)
    }

    const handleRetryPasskey = () => {
        setSignUpState({ state: 'signup-complete', supportsPasskey: true })
    }

    if (signUpState.state === 'signup-complete' || signUpState.state === 'loading-passkey' || signUpState.state === 'passkey-error') {
        return (
            <div className='flex flex-col gap-6'>
                <div className='text-center space-y-4'>
                    <h2 className='text-2xl font-bold text-primary'>Account Created!</h2>
                    <p className='text-lg text-secondary'>
                        Would you like to add a passkey for faster, more secure sign-ins?
                    </p>
                    <p className='text-sm text-dimmed'>
                        Passkeys use your device&apos;s biometric authentication (fingerprint, face, etc.) or PIN for secure access.
                    </p>
                </div>

                {signUpState.state === 'passkey-error' && (
                    <div className='text-alert text-sm bg-alert/10 border border-alert/20 rounded-lg px-4 py-3' role='alert'>
                        {signUpState.error}
                    </div>
                )}

                <div className='flex flex-col gap-3'>
                    <button
                        onClick={signUpState.state === 'passkey-error' ? handleRetryPasskey : handleAddPasskey}
                        disabled={signUpState.state === 'loading-passkey'}
                        className='w-full px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
                    >
                        <div className='w-5 h-5'>
                            {signUpState.state === 'loading-passkey' ? (
                                <Spinner />
                            ) : (
                                <PasskeyIcon />
                            )}
                        </div>
                        <span>
                            {signUpState.state === 'loading-passkey'
                                ? 'Adding Passkey...'
                                : signUpState.state === 'passkey-error'
                                    ? 'Try Again'
                                    : 'Add Passkey'
                            }
                        </span>
                    </button>

                    <button
                        onClick={handleSkipPasskey}
                        disabled={signUpState.state === 'loading-passkey'}
                        className='w-full px-6 py-3 border border-dimmed text-secondary rounded-lg hover:bg-dimmed/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        I&apos;ll use sign-in links
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                {/* Email field (non-editable) */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-secondary'>Email</label>
                    <input
                        type='email'
                        value={email}
                        disabled
                        className='px-4 py-3 border border-dimmed rounded-lg bg-background text-dimmed cursor-not-allowed'
                    />
                </div>

                {/* Username field */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-secondary'>Username</label>
                    <input
                        type='text'
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                            if (signUpState.state === 'error') {
                                setSignUpState({ state: 'initial' })
                            }
                        }}
                        className='px-4 py-3 border border-dimmed rounded-lg focus:outline-none focus:ring-2 focus:ring-action focus:border-action'
                        required
                        minLength={1}
                        maxLength={50}
                    />
                </div>

                {/* Name field */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-secondary'>
                        Name <span className='text-alert'>*</span>
                    </label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            if (signUpState.state === 'error') {
                                setSignUpState({ state: 'initial' })
                            }
                        }}
                        placeholder='Enter your full name'
                        className='px-4 py-3 border border-dimmed rounded-lg focus:outline-none focus:ring-2 focus:ring-action focus:border-action'
                        required
                        minLength={1}
                        maxLength={100}
                    />
                </div>

                {/* Emoji selector */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-secondary'>Profile Emoji</label>
                    <div className='flex items-center gap-3'>
                        <button
                            type='button'
                            onClick={() => setShowEmojiSelector(true)}
                            className='w-16 h-16 text-3xl border border-dimmed rounded-lg hover:bg-dimmed/20 transition-colors flex items-center justify-center'
                            aria-label='Change profile emoji'
                        >
                            {selectedEmoji}
                        </button>
                        <span className='text-sm text-secondary'>Click to change</span>
                    </div>
                </div>

                {signUpState.state === 'error' && (
                    <div className='text-alert text-sm bg-alert/10 border border-alert/20 rounded-lg px-4 py-3' role='alert'>
                        {signUpState.error}
                    </div>
                )}

                <button
                    type='submit'
                    disabled={signUpState.state === 'loading-signup' || !name.trim() || !username.trim()}
                    className='px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {signUpState.state === 'loading-signup' ? (
                        <>
                            <div className='w-5 h-5'>
                                <Spinner />
                            </div>
                            <span>Completing Sign Up...</span>
                        </>
                    ) : (
                        'Complete Sign Up'
                    )}
                </button>
            </form>

            <EmojiSelector
                isOpen={showEmojiSelector}
                onClose={() => setShowEmojiSelector(false)}
                currentEmoji={selectedEmoji}
                onSelect={(emoji) => {
                    setSelectedEmoji(emoji)
                    setShowEmojiSelector(false)
                }}
            />
        </>
    )
}