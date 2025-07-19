'use client'
import { useState, useEffect } from 'react'
import { AccountPublicData } from '@/core'
import { getFollowStatus } from '@/data/user'
import { UserList } from '@/components/UserList'

type FollowerUser = AccountPublicData & {
    isFollowing: boolean
}

export function FollowersList({ initialFollowers, currentUserId }: {
    initialFollowers: AccountPublicData[]
    currentUserId: string | null
}) {
    const [followersList, setFollowersList] = useState<FollowerUser[]>([])
    const [loading, setLoading] = useState(true)

    // Check follow status for each follower
    useEffect(() => {
        async function checkFollowStatuses() {
            const followersWithStatus = await Promise.all(
                initialFollowers.map(async (follower) => {
                    const { isFollowing } = await getFollowStatus(follower.username)
                    return { ...follower, isFollowing }
                })
            )
            setFollowersList(followersWithStatus)
            setLoading(false)
        }
        
        checkFollowStatuses()
    }, [initialFollowers])

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Followers</h3>
                <div className="text-center py-8 text-dimmed">
                    <div className="w-6 h-6 border-2 border-dimmed border-t-transparent animate-spin rounded-full mx-auto"></div>
                    <p className="mt-2">Loading followers...</p>
                </div>
            </div>
        )
    }

    return (
        <UserList
            users={followersList}
            currentUserId={currentUserId}
            title="Followers"
            emptyMessage="You don't have any followers yet."
            emptySubMessage="Share your profile to get followers!"
            followButtonContent={
                <>
                    <span>+</span>
                    <span>Follow Back</span>
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