'use client'
import { UserList, UserWithFollowStatus } from '@/app/(main)/UserList'

export function UserFollowingList({
    following,
    profileUsername,
    currentUserId
}: {
    following: UserWithFollowStatus[]
    profileUsername: string
    currentUserId: string | null
}) {
    return (
        <UserList
            users={following}
            currentUserId={currentUserId}
            title="Following"
            emptyMessage={`${profileUsername} isn't following anyone yet.`}
        />
    )
}