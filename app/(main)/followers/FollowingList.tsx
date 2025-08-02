'use client'
import { UserList, UserWithFollowStatus } from '@/app/(main)/UserList'

export function FollowingList({ following, currentUserId }: {
    following: UserWithFollowStatus[]
    currentUserId: string | null
}) {

    return (
        <UserList
            users={following}
            currentUserId={currentUserId}
            title="Following"
            emptyMessage="You're not following anyone yet."
            emptySubMessage="Find users to follow by browsing their profiles."
        />
    )
}