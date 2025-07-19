'use client'
import { UserList, UserWithFollowStatus } from '@/components/UserList'

export function FollowersList({ followers, currentUserId }: {
    followers: UserWithFollowStatus[]
    currentUserId: string | null
}) {

    return (
        <UserList
            users={followers}
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