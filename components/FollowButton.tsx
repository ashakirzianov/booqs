'use client'
import { useState, useEffect } from 'react'
import type { GetResponse, PostResponse } from '@/app/api/users/[username]/follow/route'

export function FollowButton({ username, currentUserId }: {
    username: string
    currentUserId?: string
}) {
    const [isFollowing, setIsFollowing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingStatus, setIsCheckingStatus] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!currentUserId) {
            setIsCheckingStatus(false)
            return
        }

        // Check initial follow status
        async function checkFollowStatus() {
            try {
                const response = await fetch(`/api/users/${username}/follow`)
                if (response.ok) {
                    const data: GetResponse = await response.json()
                    setIsFollowing(data.isFollowing)
                }
            } catch (error) {
                console.error('Error checking follow status:', error)
            } finally {
                setIsCheckingStatus(false)
            }
        }

        checkFollowStatus()
    }, [username, currentUserId])

    const handleToggleFollow = async () => {
        if (!currentUserId || isLoading) return

        // Optimistic update - immediately change the UI
        const previousState = isFollowing
        setIsFollowing(!isFollowing)
        setError(null)
        setIsLoading(true)

        try {
            const method = previousState ? 'DELETE' : 'POST'
            const response = await fetch(`/api/users/${username}/follow`, {
                method,
            })

            if (response.ok) {
                const data: PostResponse = await response.json()
                // Update with server response (should match optimistic update)
                setIsFollowing(data.isFollowing)
            } else {
                // Rollback on error
                setIsFollowing(previousState)
                const errorData = await response.json()
                setError(errorData.error || 'Failed to update follow status')
                console.error('Follow operation failed:', errorData)
            }
        } catch (error) {
            // Rollback on network error
            setIsFollowing(previousState)
            setError('Network error. Please try again.')
            console.error('Error toggling follow:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Clear error after a few seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [error])

    // Don't show button if not authenticated
    if (!currentUserId) {
        return null
    }

    // Show loading state while checking status
    if (isCheckingStatus) {
        return (
            <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-md"></div>
        )
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={handleToggleFollow}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed transform ${
                    isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-[1.02]'
                        : 'bg-action text-white hover:bg-highlight hover:scale-[1.02]'
                } ${
                    isLoading 
                        ? 'opacity-90 scale-[0.98]' 
                        : 'opacity-100 scale-100'
                } ${
                    error 
                        ? 'ring-2 ring-red-500 ring-opacity-50' 
                        : ''
                }`}
            >
                <span className="flex items-center gap-1">
                    {isLoading && (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                    )}
                    {isFollowing ? (
                        <>
                            <span>✓</span>
                            <span>Following</span>
                        </>
                    ) : (
                        <>
                            <span>+</span>
                            <span>Follow</span>
                        </>
                    )}
                </span>
            </button>
            
            {/* Error message */}
            {error && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 max-w-48 text-right animate-fade-in">
                    {error}
                </div>
            )}
        </div>
    )
}