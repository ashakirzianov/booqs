'use client'
import { UserList, UserWithFollowStatus } from '@/app/(main)/UserList'

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
        />
    )
}