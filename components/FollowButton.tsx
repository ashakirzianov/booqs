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

        setIsLoading(true)
        try {
            const method = isFollowing ? 'DELETE' : 'POST'
            const response = await fetch(`/api/users/${username}/follow`, {
                method,
            })

            if (response.ok) {
                const data: PostResponse = await response.json()
                setIsFollowing(data.isFollowing)
            } else {
                const error = await response.json()
                console.error('Follow operation failed:', error)
            }
        } catch (error) {
            console.error('Error toggling follow:', error)
        } finally {
            setIsLoading(false)
        }
    }

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
        <button
            onClick={handleToggleFollow}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-action text-white hover:bg-highlight'
            }`}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                    {isFollowing ? 'Unfollowing...' : 'Following...'}
                </div>
            ) : (
                isFollowing ? 'Unfollow' : 'Follow'
            )}
        </button>
    )
}