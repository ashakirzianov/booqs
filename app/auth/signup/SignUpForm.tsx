'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeSignUpAction } from '@/data/auth'
import { Spinner } from '@/components/Icons'
import { EmojiSelector } from '@/app/(main)/account/EmojiSelector'

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
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showEmojiSelector, setShowEmojiSelector] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name.trim()) {
            setError('Name is required')
            return
        }
        
        if (!username.trim()) {
            setError('Username is required')
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
                        onChange={(e) => setUsername(e.target.value)}
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
                        onChange={(e) => setName(e.target.value)}
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
                
                {error && (
                    <div className='text-alert text-sm bg-alert/10 border border-alert/20 rounded-lg px-4 py-3' role='alert'>
                        {error}
                    </div>
                )}
                
                <button
                    type='submit'
                    disabled={isLoading || !name.trim() || !username.trim()}
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