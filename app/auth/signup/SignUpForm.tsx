'use client'
import { useState } from 'react'
import { completeSignUpAction } from '@/data/auth'
import { Spinner } from '@/components/Icons'
import { EmojiSelector } from '@/app/(main)/account/EmojiSelector'

type FormDataState = {
    username: string
    name: string
    selectedEmoji: string
    showEmojiSelector: boolean
}

type SignUpState = {
    state: 'initial'
} | {
    state: 'error'
    error: string
} | {
    state: 'loading-signup'
}

export function SignUpForm({
    email,
    secret,
    initialUsername,
    initialName,
    initialEmoji,
}: {
    email: string
    secret: string
    initialUsername: string
    initialName: string
    initialEmoji: string
    returnTo: string
}) {
    const [formData, setFormData] = useState<FormDataState>({
        username: initialUsername,
        name: initialName,
        selectedEmoji: initialEmoji,
        showEmojiSelector: false
    })
    const [signUpState, setSignUpState] = useState<SignUpState>({ state: 'initial' })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            setSignUpState({ state: 'error', error: 'Name is required' })
            return
        }

        if (!formData.username.trim()) {
            setSignUpState({ state: 'error', error: 'Username is required' })
            return
        }

        setSignUpState({ state: 'loading-signup' })

        try {
            const result = await completeSignUpAction({
                email,
                secret,
                username: formData.username.trim(),
                name: formData.name.trim(),
                emoji: formData.selectedEmoji
            })

            if (!result.success) {
                setSignUpState({ state: 'error', error: result.reason })
            }
        } catch (err) {
            console.error('Sign-up error:', err)
            setSignUpState({ state: 'error', error: 'An unexpected error occurred' })
        }
    }

    return (
        <div className='w-full max-w-md'>
            <h1 className='text-2xl font-bold text-center mb-8'>Complete Sign Up</h1>
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
                        value={formData.username}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, username: e.target.value }))
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
                        value={formData.name}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, name: e.target.value }))
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
                            onClick={() => setFormData(prev => ({ ...prev, showEmojiSelector: true }))}
                            className='w-16 h-16 text-3xl border border-dimmed rounded-lg hover:bg-dimmed/20 transition-colors flex items-center justify-center'
                            aria-label='Change profile emoji'
                        >
                            {formData.selectedEmoji}
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
                    disabled={signUpState.state === 'loading-signup' || !formData.name.trim() || !formData.username.trim()}
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
                isOpen={formData.showEmojiSelector}
                onClose={() => setFormData(prev => ({ ...prev, showEmojiSelector: false }))}
                currentEmoji={formData.selectedEmoji}
                onSelect={(emoji) => {
                    setFormData(prev => ({ ...prev, selectedEmoji: emoji, showEmojiSelector: false }))
                }}
            />
        </div>
    )
}