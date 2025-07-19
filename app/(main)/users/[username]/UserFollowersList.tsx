'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AccountPublicData } from '@/core'
import { userHref } from '@/core/href'
import { getFollowStatus } from '@/data/user'
import { UserList } from '@/components/UserList'
import { ProfileBadge } from '@/components/ProfilePicture'

type FollowerUser = AccountPublicData & {
    isFollowing: boolean
}

export function UserFollowersList({ 
    followers, 
    profileUsername, 
    currentUserId 
}: {
    followers: AccountPublicData[]
    profileUsername: string
    currentUserId: string | null
}) {
    const [followersList, setFollowersList] = useState<FollowerUser[]>([])
    const [loading, setLoading] = useState(!!currentUserId)

    // Check follow status for each follower (only if current user is authenticated)
    useEffect(() => {
        async function checkFollowStatuses() {
            if (!currentUserId) {
                // If not authenticated, just show all as not followed
                setFollowersList(followers.map(user => ({ ...user, isFollowing: false })))
                setLoading(false)
                return
            }

            const followersWithStatus = await Promise.all(
                followers.map(async (user) => {
                    const { isFollowing } = await getFollowStatus(user.username)
                    return { ...user, isFollowing }
                })
            )
            setFollowersList(followersWithStatus)
            setLoading(false)
        }
        
        checkFollowStatuses()
    }, [followers, currentUserId])

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Followers</h3>
                <div className="text-center py-8 text-dimmed">
                    <div className="w-6 h-6 border-2 border-dimmed border-t-transparent animate-spin rounded-full mx-auto"></div>
                    <p className="mt-2">Loading...</p>
                </div>
            </div>
        )
    }

    // If not authenticated, don't show follow buttons
    if (!currentUserId) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Followers ({followers.length})</h3>
                {followers.length === 0 ? (
                    <div className="text-center py-8 text-dimmed">
                        <p>{profileUsername} doesn&apos;t have any followers yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {followers.map(user => (
                            <div key={user.id} className="flex items-center gap-3 p-3 border border-dimmed rounded-lg">
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <UserList
            users={followersList}
            currentUserId={currentUserId}
            title="Followers"
            emptyMessage={`${profileUsername} doesn't have any followers yet.`}
            followButtonContent={
                <>
                    <span>+</span>
                    <span>Follow</span>
                </>
            }
            unfollowButtonContent={
                <>
                    <span>✓</span>
                    <span>Following</span>
                </>
            }
        />
    )
}