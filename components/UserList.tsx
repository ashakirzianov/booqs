'use client'
import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { AccountPublicData } from '@/core'
import { userHref } from '@/core/href'
import { followAction, unfollowAction } from '@/data/user'
import { ProfileBadge } from '@/components/ProfilePicture'

type UserWithFollowStatus = AccountPublicData & {
    isFollowing: boolean
}

type ButtonState = 
    | { state: 'idle' }
    | { state: 'loading' }
    | { state: 'error', error: string }

interface UserListProps {
    users: UserWithFollowStatus[]
    currentUserId: string
    followButtonContent: ReactNode
    unfollowButtonContent: ReactNode
    title: string
    emptyMessage: string
    emptySubMessage?: string
    onUserUpdate?: (users: UserWithFollowStatus[]) => void
}

export function UserList({
    users,
    currentUserId: _currentUserId,
    followButtonContent,
    unfollowButtonContent,
    title,
    emptyMessage,
    emptySubMessage,
    onUserUpdate
}: UserListProps) {
    const [usersList, setUsersList] = useState<UserWithFollowStatus[]>(users)
    const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({})

    const updateUsersList = (newUsers: UserWithFollowStatus[]) => {
        setUsersList(newUsers)
        onUserUpdate?.(newUsers)
    }

    const handleFollow = async (username: string) => {
        const currentState = buttonStates[username] || { state: 'idle' }
        if (currentState.state === 'loading') return

        // Optimistic update - immediately change the UI
        const newUsers = usersList.map(user => 
            user.username === username 
                ? { ...user, isFollowing: true }
                : user
        )
        updateUsersList(newUsers)
        setButtonStates(prev => ({
            ...prev,
            [username]: { state: 'loading' }
        }))

        try {
            const result = await followAction(username)

            if (result.success) {
                setButtonStates(prev => ({
                    ...prev,
                    [username]: { state: 'idle' }
                }))
            } else {
                // Rollback on error
                const rolledBackUsers = usersList.map(user => 
                    user.username === username 
                        ? { ...user, isFollowing: false }
                        : user
                )
                updateUsersList(rolledBackUsers)
                setButtonStates(prev => ({
                    ...prev,
                    [username]: { 
                        state: 'error', 
                        error: result.error || 'Failed to follow user' 
                    }
                }))
            }
        } catch {
            // Rollback on network error
            const rolledBackUsers = usersList.map(user => 
                user.username === username 
                    ? { ...user, isFollowing: false }
                    : user
            )
            updateUsersList(rolledBackUsers)
            setButtonStates(prev => ({
                ...prev,
                [username]: { 
                    state: 'error', 
                    error: 'Network error. Please try again.' 
                }
            }))
        }
    }

    const handleUnfollow = async (username: string) => {
        const currentState = buttonStates[username] || { state: 'idle' }
        if (currentState.state === 'loading') return

        // Optimistic update - immediately change the UI
        const newUsers = usersList.map(user => 
            user.username === username 
                ? { ...user, isFollowing: false }
                : user
        )
        updateUsersList(newUsers)
        setButtonStates(prev => ({
            ...prev,
            [username]: { state: 'loading' }
        }))

        try {
            const result = await unfollowAction(username)

            if (result.success) {
                setButtonStates(prev => ({
                    ...prev,
                    [username]: { state: 'idle' }
                }))
            } else {
                // Rollback on error
                const rolledBackUsers = usersList.map(user => 
                    user.username === username 
                        ? { ...user, isFollowing: true }
                        : user
                )
                updateUsersList(rolledBackUsers)
                setButtonStates(prev => ({
                    ...prev,
                    [username]: { 
                        state: 'error', 
                        error: result.error || 'Failed to unfollow user' 
                    }
                }))
            }
        } catch {
            // Rollback on network error
            const rolledBackUsers = usersList.map(user => 
                user.username === username 
                    ? { ...user, isFollowing: true }
                    : user
            )
            updateUsersList(rolledBackUsers)
            setButtonStates(prev => ({
                ...prev,
                [username]: { 
                    state: 'error', 
                    error: 'Network error. Please try again.' 
                }
            }))
        }
    }

    if (usersList.length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{title} (0)</h3>
                <div className="text-center py-8 text-dimmed">
                    <p>{emptyMessage}</p>
                    {emptySubMessage && <p className="text-sm mt-1">{emptySubMessage}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{title} ({usersList.length})</h3>
            <div className="space-y-3">
                {usersList.map(user => {
                    const buttonState = buttonStates[user.username] || { state: 'idle' }
                    
                    return (
                        <div key={user.id} className="flex items-center justify-between p-3 border border-dimmed rounded-lg">
                            <div className="flex items-center gap-3">
                                <Link href={userHref({ username: user.username })}>
                                    <ProfileBadge 
                                        name={user.name}
                                        picture={user.profilePictureURL}
                                        emoji={user.emoji ?? '👤'}
                                        size={2.5}
                                        border={true}
                                    />
                                </Link>
                                <div>
                                    <Link 
                                        href={userHref({ username: user.username })}
                                        className="font-medium hover:text-action transition-colors"
                                    >
                                        {user.name}
                                    </Link>
                                    <div className="text-sm text-dimmed">@{user.username}</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                                <button
                                    onClick={() => user.isFollowing ? handleUnfollow(user.username) : handleFollow(user.username)}
                                    disabled={buttonState.state === 'loading'}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed transform ${user.isFollowing
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-[1.02]'
                                        : 'bg-action text-white hover:bg-highlight hover:text-background hover:scale-[1.02]'
                                        } ${buttonState.state === 'loading'
                                            ? 'opacity-90 scale-[0.98]'
                                            : 'opacity-100 scale-100'
                                        } ${buttonState.state === 'error'
                                            ? 'ring-2 ring-red-500 ring-opacity-50'
                                            : ''
                                        }`}
                                >
                                    <span className="flex items-center gap-1">
                                        {buttonState.state === 'loading' && (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                        )}
                                        {user.isFollowing ? unfollowButtonContent : followButtonContent}
                                    </span>
                                </button>

                                {/* Error message */}
                                {buttonState.state === 'error' && (
                                    <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 max-w-48 text-right animate-fade-in">
                                        {buttonState.error}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}