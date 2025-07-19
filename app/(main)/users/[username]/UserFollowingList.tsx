'use client'
import { useState, useEffect } from 'react'
import { AccountPublicData } from '@/core'
import { getFollowStatus } from '@/data/user'
import { UserList } from '@/components/UserList'

type FollowingUser = AccountPublicData & {
    isFollowing: boolean
}

export function UserFollowingList({ 
    following, 
    profileUsername, 
    currentUserId 
}: {
    following: AccountPublicData[]
    profileUsername: string
    currentUserId: string | null
}) {
    const [followingList, setFollowingList] = useState<FollowingUser[]>([])
    const [loading, setLoading] = useState(!!currentUserId)

    // Check follow status for each user being followed (only if current user is authenticated)
    useEffect(() => {
        async function checkFollowStatuses() {
            if (!currentUserId) {
                // If not authenticated, just show all as not followed
                setFollowingList(following.map(user => ({ ...user, isFollowing: false })))
                setLoading(false)
                return
            }

            const followingWithStatus = await Promise.all(
                following.map(async (user) => {
                    const { isFollowing } = await getFollowStatus(user.username)
                    return { ...user, isFollowing }
                })
            )
            setFollowingList(followingWithStatus)
            setLoading(false)
        }
        
        checkFollowStatuses()
    }, [following, currentUserId])

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Following</h3>
                <div className="text-center py-8 text-dimmed">
                    <div className="w-6 h-6 border-2 border-dimmed border-t-transparent animate-spin rounded-full mx-auto"></div>
                    <p className="mt-2">Loading...</p>
                </div>
            </div>
        )
    }

    // If not authenticated, show UserList without buttons
    if (!currentUserId) {
        const usersWithoutFollowStatus = following.map(user => ({ ...user, isFollowing: false }))
        return (
            <UserList
                users={usersWithoutFollowStatus}
                currentUserId={null}
                title="Following"
                emptyMessage={`${profileUsername} isn't following anyone yet.`}
                followButtonContent={<span>Follow</span>}
                unfollowButtonContent={<span>Following</span>}
            />
        )
    }

    return (
        <UserList
            users={followingList}
            currentUserId={currentUserId}
            title="Following"
            emptyMessage={`${profileUsername} isn't following anyone yet.`}
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