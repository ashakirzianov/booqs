'use client'
import { useState, useEffect } from 'react'
import { AccountPublicData } from '@/core'
import { getFollowStatus } from '@/data/user'
import { UserList } from '@/components/UserList'

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

    // If not authenticated, show UserList without buttons
    if (!currentUserId) {
        const usersWithoutFollowStatus = followers.map(user => ({ ...user, isFollowing: false }))
        return (
            <UserList
                users={usersWithoutFollowStatus}
                currentUserId={null}
                title="Followers"
                emptyMessage={`${profileUsername} doesn't have any followers yet.`}
                followButtonContent={<span>Follow</span>}
                unfollowButtonContent={<span>Following</span>}
            />
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