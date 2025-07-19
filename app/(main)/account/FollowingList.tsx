'use client'
import { AccountPublicData } from '@/core'
import { UserList } from '@/components/UserList'

export function FollowingList({ initialFollowing, currentUserId }: {
    initialFollowing: AccountPublicData[]
    currentUserId: string | null
}) {
    // Convert to following users (all initially followed)
    const followingUsers = initialFollowing.map(user => ({ ...user, isFollowing: true }))

    return (
        <UserList
            users={followingUsers}
            currentUserId={currentUserId}
            title="Following"
            emptyMessage="You're not following anyone yet."
            emptySubMessage="Find users to follow by browsing their profiles."
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