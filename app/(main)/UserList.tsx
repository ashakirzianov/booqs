'use client'
import { useState } from 'react'
import Link from 'next/link'
import { userHref } from '@/common/href'
import { AccountPublicData, followAction, unfollowAction } from '@/data/user'
import { ProfileBadge } from '@/components/ProfilePicture'
import { ActionButton } from '@/components/Buttons'
import { SmallSpinner } from '@/components/Icons'

export type UserWithFollowStatus = AccountPublicData & {
    isFollowing: boolean
}

type ButtonState =
    | { state: 'idle' }
    | { state: 'loading' }
    | { state: 'error', error: string }

interface UserListProps {
    users: UserWithFollowStatus[]
    currentUserId: string | null
    title: string
    emptyMessage: string
    emptySubMessage?: string
    onUserUpdate?: (users: UserWithFollowStatus[]) => void
}

export function UserList({
    users,
    currentUserId,
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
                        <div key={user.id} className="flex items-center justify-between p-3 shadow-sm rounded-lg">
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

                            {/* Only show follow button if user is authenticated and not viewing own profile */}
                            {currentUserId && user.id !== currentUserId && (
                                <div className="flex flex-col items-end gap-1">
                                    <FollowButton
                                        isFollowing={user.isFollowing}
                                        onClick={() => user.isFollowing ? handleUnfollow(user.username) : handleFollow(user.username)}
                                        disabled={buttonState.state === 'loading'}
                                        loading={buttonState.state === 'loading'}
                                        hasError={buttonState.state === 'error'}
                                    />

                                    {/* Error message */}
                                    {buttonState.state === 'error' && (
                                        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 max-w-48 text-right animate-fade-in">
                                            {buttonState.error}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function FollowButton({ isFollowing, onClick, disabled = false, loading = false, hasError = false }: {
    isFollowing: boolean,
    onClick?: () => void,
    disabled?: boolean,
    loading?: boolean,
    hasError?: boolean,
}) {
    return <ActionButton
        text={isFollowing ? 'Unfollow' : 'Follow'}
        variant='secondary'
        onClick={onClick}
        disabled={disabled || loading}
        hasError={hasError}
        icon={loading ? <SmallSpinner /> : null}
        width='calc(var(--spacing) * 30)' // 6rem
    />
}