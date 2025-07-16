'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerWithPasskey, signInWithPasskey } from '@/application/auth'
import { PasskeyIcon, Spinner } from '@/components/Icons'
import { initiateSignAction } from '@/data/auth'

export function AuthForm({ returnTo }: {
    returnTo: string,
}) {
    const router = useRouter()
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
                setPasskeyState({ state: 'error', error: result.error })
            }
        } catch (err) {
            console.error('Passkey sign-in error:', err)
            setPasskeyState({ state: 'error', error: 'Passkey sign-in failed' })
        }
    }

    const handlePasskeyRegister = async () => {
        setPasskeyState({ state: 'loading' })
        
        try {
            const result = await registerWithPasskey()
            if (result.success) {
                router.push(returnTo)
            } else {
                setPasskeyState({ state: 'error', error: result.error })
            }
        } catch (err) {
            console.error('Passkey registration error:', err)
            setPasskeyState({ state: 'error', error: 'Passkey registration failed' })
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
                
                <button
                    onClick={() => {
                        setEmailState({ state: 'idle' })
                        setEmail('')
                    }}
                    className='text-action hover:text-highlight text-sm'
                >
                    Try a different email
                </button>
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
                    
                    <button
                        type='submit'
                        disabled={emailState.state === 'loading' || !email.trim()}
                        className='w-full px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        {emailState.state === 'loading' ? (
                            <>
                                <Spinner />
                                <span>Sending...</span>
                            </>
                        ) : (
                            'Send Sign-in Link'
                        )}
                    </button>
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
                <h2 className='text-center text-lg font-medium text-secondary'>Sign in with Passkey</h2>
                
                <div className='flex flex-col gap-3'>
                    <button
                        onClick={handlePasskeySignIn}
                        disabled={passkeyState.state === 'loading'}
                        className='w-full px-6 py-3 border border-action text-action rounded-lg hover:bg-action hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
                    >
                        {passkeyState.state === 'loading' ? (
                            <Spinner />
                        ) : (
                            <PasskeyIcon />
                        )}
                        <span>Sign in with Passkey</span>
                    </button>
                    
                    <button
                        onClick={handlePasskeyRegister}
                        disabled={passkeyState.state === 'loading'}
                        className='w-full px-6 py-3 border border-dimmed text-secondary rounded-lg hover:bg-dimmed/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
                    >
                        {passkeyState.state === 'loading' ? (
                            <Spinner />
                        ) : (
                            <PasskeyIcon />
                        )}
                        <span>Register new Passkey</span>
                    </button>
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