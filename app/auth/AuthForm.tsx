'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePasskeys } from '@/application/passkeys'
import { PasskeyIcon, RetryIcon, SmallSpinner } from '@/components/Icons'
import { ActionButton, LightButton } from '@/components/Buttons'
import { initiateSignAction } from '@/data/auth'

export function AuthForm({ returnTo }: {
    returnTo: string,
}) {
    const router = useRouter()
    const { signInWithPasskey } = usePasskeys()
    const [email, setEmail] = useState('')
    const [emailState, setEmailState] = useState<{
        state: 'idle'
    } | {
        state: 'loading'
    } | {
        state: 'success',
        kind: 'signin' | 'signup'
    } | {
        state: 'error',
        error: string
    }>({ state: 'idle' })

    const [passkeyState, setPasskeyState] = useState<{
        state: 'idle'
    } | {
        state: 'loading'
    } | {
        state: 'error',
        error: string
    }>({ state: 'idle' })

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            setEmailState({ state: 'error', error: 'Email is required' })
            return
        }

        if (!isValidEmail(email)) {
            setEmailState({ state: 'error', error: 'Please enter a valid email address' })
            return
        }

        setEmailState({ state: 'loading' })

        try {
            const result = await initiateSignAction({ email: email.trim(), returnTo })

            if (result.success) {
                setEmailState({ state: 'success', kind: result.kind })
            } else {
                setEmailState({ state: 'error', error: result.error })
            }
        } catch (err) {
            console.error('Sign action error:', err)
            setEmailState({ state: 'error', error: 'An unexpected error occurred' })
        }
    }

    const handlePasskeySignIn = async () => {
        setPasskeyState({ state: 'loading' })

        try {
            const result = await signInWithPasskey()
            if (result.success) {
                router.push(returnTo)
            } else {
                setPasskeyState({ state: 'error', error: `Passkey sign-in failed: ${result.error}` })
            }
        } catch (err) {
            console.error('Passkey sign-in error:', err)
            setPasskeyState({ state: 'error', error: err instanceof Error ? err.message : 'Passkey sign-in failed' })
        }
    }

    if (emailState.state === 'success') {
        return (
            <div className='flex flex-col items-center justify-start gap-6 w-full max-w-md'>
                <div className='text-center space-y-4'>
                    <h2 className='text-2xl font-bold text-primary'>Check Your Email</h2>
                    <div className='space-y-2'>
                        <p className='text-lg'>
                            {emailState.kind === 'signin'
                                ? 'We sent a sign-in link to your email.'
                                : 'We sent a sign-up link to your email.'
                            }
                        </p>
                        <p className='text-sm text-secondary'>
                            Click the link in the email to {emailState.kind === 'signin' ? 'sign in' : 'complete your registration'}.
                        </p>
                        <p className='text-xs text-dimmed'>
                            The link will expire in 1 hour.
                        </p>
                    </div>
                </div>

                <LightButton
                    onClick={() => {
                        setEmailState({ state: 'idle' })
                        setEmail('')
                    }}
                    size='small'
                    text='Try a different email'
                    icon={<RetryIcon />}
                />
            </div>
        )
    }

    return (
        <div className='flex flex-col items-center justify-start gap-8 w-full max-w-md'>
            {/* Email-based Authentication */}
            <div className='w-full space-y-6'>
                <h1 className='text-center text-2xl font-bold'>Sign in to Booqs</h1>

                <form onSubmit={handleEmailSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <label htmlFor='email' className='block text-sm font-medium text-secondary'>
                            Email address
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (emailState.state === 'error') {
                                    setEmailState({ state: 'idle' })
                                }
                            }}
                            placeholder='Enter your email'
                            className='w-full px-4 py-3 border border-dimmed rounded-lg focus:outline-none focus:ring-2 focus:ring-action focus:border-action'
                            disabled={emailState.state === 'loading'}
                            required
                        />
                    </div>

                    {emailState.state === 'error' && (
                        <div className='text-alert text-sm bg-alert/10 border border-alert/20 rounded-lg px-4 py-3' role='alert'>
                            {emailState.error}
                        </div>
                    )}

                    <ActionButton
                        disabled={emailState.state === 'loading' || !email.trim()}
                        text={emailState.state === 'loading' ? 'Sending...' : 'Send Link'}
                        variant='primary'
                        icon={emailState.state === 'loading' ? <SmallSpinner /> : null}
                        full
                    />
                </form>
            </div>

            {/* Divider */}
            <div className='w-full flex items-center gap-4'>
                <div className='flex-1 h-px bg-dimmed'></div>
                <span className='text-sm text-secondary'>or</span>
                <div className='flex-1 h-px bg-dimmed'></div>
            </div>

            {/* Passkey Authentication */}
            <div className='w-full space-y-4'>
                <div className='flex flex-col gap-3'>
                    <ActionButton
                        onClick={handlePasskeySignIn}
                        disabled={passkeyState.state === 'loading'}
                        icon={
                            passkeyState.state === 'loading'
                                ? <SmallSpinner />
                                : <PasskeyIcon />}
                        variant="secondary"
                        text="Sign in with Passkey"
                        full
                    />
                </div>

                {passkeyState.state === 'error' && (
                    <div className='text-alert text-sm bg-alert/10 border border-alert/20 rounded-lg px-4 py-3 text-center' role='alert'>
                        {passkeyState.error}
                    </div>
                )}
            </div>
        </div>
    )
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}