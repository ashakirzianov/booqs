'use client'
import { useState, useEffect } from 'react'
import { followAction, unfollowAction } from '@/data/user'
import { FollowButton as FollowButtonComponent } from '@/components/Buttons'

type ButtonState =
    | { state: 'idle' }
    | { state: 'loading' }
    | { state: 'error', error: string }

export function FollowButton({ username, initialFollowStatus }: {
    username: string
    initialFollowStatus: boolean
}) {
    const [isFollowing, setIsFollowing] = useState(initialFollowStatus ?? false)
    const [buttonState, setButtonState] = useState<ButtonState>({ state: 'idle' })

    const handleToggleFollow = async () => {
        if (buttonState.state === 'loading') return

        // Optimistic update - immediately change the UI
        const previousState = isFollowing
        setIsFollowing(!isFollowing)
        setButtonState({ state: 'loading' })

        try {
            const result = previousState
                ? await unfollowAction(username)
                : await followAction(username)

            if (result.success) {
                // Update with server response
                setIsFollowing(!previousState)
                setButtonState({ state: 'idle' })
            } else {
                // Rollback on error
                setIsFollowing(previousState)
                setButtonState({
                    state: 'error',
                    error: result.error || 'Failed to update follow status'
                })
                console.error('Follow operation failed:', result.error)
            }
        } catch (error) {
            // Rollback on network error
            setIsFollowing(previousState)
            setButtonState({
                state: 'error',
                error: 'Network error. Please try again.'
            })
            console.error('Error toggling follow:', error)
        }
    }

    // Clear error after a few seconds
    useEffect(() => {
        if (buttonState.state === 'error') {
            const timer = setTimeout(() => setButtonState({ state: 'idle' }), 3000)
            return () => clearTimeout(timer)
        }
    }, [buttonState])


    return (
        <div className="flex flex-col items-end gap-1">
            <FollowButtonComponent
                isFollowing={isFollowing}
                onClick={handleToggleFollow}
                disabled={buttonState.state === 'loading'}
                loading={buttonState.state === 'loading'}
                className={buttonState.state === 'error' ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
            />

            {/* Error message */}
            {buttonState.state === 'error' && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 max-w-48 text-right animate-fade-in">
                    {buttonState.error}
                </div>
            )}
        </div>
    )
}