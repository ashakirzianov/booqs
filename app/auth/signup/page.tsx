'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { completeSignUpAction } from '@/data/auth'
import { Spinner } from '@/components/Icons'

const AVAILABLE_EMOJIS = [
    '😊', '😄', '😃', '😁', '😌', '😉', '😎', '🤓', '🤗', '😊',
    '😋', '😍', '🥰', '😘', '😗', '😙', '😚', '🤔', '🤨', '😐',
    '🙂', '😇', '🤠', '🥳', '🤡', '🤖', '👻', '👽', '🎭', '🎪',
    '🐱', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🦊',
    '🦝', '🦌', '🦄', '🐲', '🐙', '🦀', '🐠', '🐟', '🐡', '🦋',
    '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌿', '🍃', '🌱', '🌲',
    '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭',
    '🍍', '🥥', '🥑', '🍅', '🥒', '🥕', '🌽', '🥦', '🥬', '🌶️'
]

function SignUpForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const email = searchParams.get('email')
    const secret = searchParams.get('secret')
    const returnTo = searchParams.get('return_to') ?? '/'
    
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [selectedEmoji, setSelectedEmoji] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showEmojiSelector, setShowEmojiSelector] = useState(false)

    useEffect(() => {
        if (email) {
            const localPart = email.split('@')[0]
            setUsername(localPart)
        }
        
        // Select a random emoji as default
        const randomEmoji = AVAILABLE_EMOJIS[Math.floor(Math.random() * AVAILABLE_EMOJIS.length)]
        setSelectedEmoji(randomEmoji)
    }, [email])

    // If missing parameters, show error
    if (!email || !secret) {
        return (
            <main className='flex flex-col items-center justify-center h-screen gap-8 p-16'>
                <Logo style={{ fontSize: 'xxx-large' }} />
                <div className='flex flex-col items-center gap-4 max-w-md text-center'>
                    <h1 className='text-2xl font-bold text-alert'>Invalid Sign-up Link</h1>
                    <p className='text-lg'>Missing email or secret parameter</p>
                    <p className='text-sm text-secondary'>
                        The sign-up link may be malformed or incomplete.
                    </p>
                </div>
                <a 
                    href="/auth" 
                    className='px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors'
                >
                    Go to Sign In
                </a>
            </main>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name.trim()) {
            setError('Name is required')
            return
        }
        
        setIsLoading(true)
        setError('')
        
        try {
            const result = await completeSignUpAction({
                email,
                secret,
                username: username.trim(),
                name: name.trim(),
                emoji: selectedEmoji
            })
            
            if (result.success) {
                router.push(returnTo)
            } else {
                setError(result.reason)
            }
        } catch (err) {
            console.error('Sign-up error:', err)
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className='flex flex-col items-center justify-center min-h-screen gap-8 p-16'>
            <Logo style={{ fontSize: 'xxx-large' }} />
            
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='px-4 py-3 border border-dimmed rounded-lg focus:outline-none focus:ring-2 focus:ring-action focus:border-action'
                            required
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
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Enter your full name'
                            className='px-4 py-3 border border-dimmed rounded-lg focus:outline-none focus:ring-2 focus:ring-action focus:border-action'
                            required
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
                            >
                                {selectedEmoji}
                            </button>
                            <span className='text-sm text-secondary'>Click to change</span>
                        </div>
                    </div>
                    
                    {error && (
                        <div className='text-alert text-sm bg-alert/10 border border-alert/20 rounded-lg px-4 py-3'>
                            {error}
                        </div>
                    )}
                    
                    <button
                        type='submit'
                        disabled={isLoading || !name.trim()}
                        className='px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        {isLoading ? (
                            <>
                                <Spinner />
                                <span>Completing Sign Up...</span>
                            </>
                        ) : (
                            'Complete Sign Up'
                        )}
                    </button>
                </form>
            </div>
            
            {/* Emoji Selector Modal */}
            {showEmojiSelector && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
                    <div className='bg-background rounded-lg shadow-lg w-96 max-w-[90vw] mx-auto p-6'>
                        <div className='text-center mb-6'>
                            <h2 className='text-xl font-bold text-primary mb-2'>
                                Choose Your Emoji
                            </h2>
                            <p className='text-dimmed text-sm'>
                                Select an emoji to represent your profile
                            </p>
                        </div>
                        
                        <div className='grid grid-cols-8 gap-3 max-h-80 overflow-y-auto p-2'>
                            {AVAILABLE_EMOJIS.map((emoji, index) => (
                                <button
                                    key={index}
                                    type='button'
                                    className={`p-3 text-2xl rounded-md hover:bg-dimmed/20 transition-colors duration-200 min-h-[3rem] flex items-center justify-center ${
                                        emoji === selectedEmoji
                                            ? 'bg-primary/20 ring-2 ring-primary'
                                            : 'hover:bg-highlight/10'
                                    }`}
                                    onClick={() => {
                                        setSelectedEmoji(emoji)
                                        setShowEmojiSelector(false)
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        
                        <div className='flex gap-3 pt-4 mt-4 border-t border-dimmed'>
                            <button
                                type='button'
                                className='flex-1 px-4 py-2 text-dimmed font-medium border border-dimmed rounded-md hover:bg-dimmed/10 transition-colors duration-200'
                                onClick={() => setShowEmojiSelector(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default function SignUpPage() {
    return (
        <Suspense fallback={
            <main className='flex flex-col items-center justify-center min-h-screen gap-8 p-16'>
                <Logo style={{ fontSize: 'xxx-large' }} />
                <Spinner />
            </main>
        }>
            <SignUpForm />
        </Suspense>
    )
}