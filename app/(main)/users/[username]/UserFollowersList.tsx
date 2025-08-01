'use client'
import { UserList, UserWithFollowStatus } from '@/app/(main)/UserList'

export function UserFollowersList({
    followers,
    profileUsername,
    currentUserId
}: {
    followers: UserWithFollowStatus[]
    profileUsername: string
    currentUserId: string | null
}) {
    return (
        <UserList
            users={followers}
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
                    <span>Unfollow</span>
                </>
            }
        />
    )
}