import { redirect } from 'next/navigation'
import { authHref } from '@/common/href'
import { getFollowingList, getFollowersList, getCurrentUser } from '@/data/user'
import { FollowingList } from './FollowingList'
import { FollowersList } from './FollowersList'
import styles from '@/app/(main)/MainLayout.module.css'

export default async function FollowersPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect(authHref({}))
    }

    const [following, followers, currentUserFollowing] = await Promise.all([
        getFollowingList(user.id),
        getFollowersList(user.id),
        getFollowingList(user.id), // Current user's following list for status checking
    ])

    // Create set for fast lookup of who current user follows
    const currentUserFollowingSet = new Set(currentUserFollowing.map(u => u.id))

    // Add follow status to following list (all should be true since it's user's own following list)
    const followingWithStatus = following.map(user => ({
        ...user,
        isFollowing: true // User follows everyone in their own following list
    }))

    // Add follow status to followers list
    const followersWithStatus = followers.map(user => ({
        ...user,
        isFollowing: currentUserFollowingSet.has(user.id)
    }))

    return (
        <main className={styles.mainContent}>
            <div className="space-y-8">
                {/* Following Section */}
                <FollowingList following={followingWithStatus} currentUserId={user.id} />

                {/* Followers Section */}
                <FollowersList followers={followersWithStatus} currentUserId={user.id} />
            </div>
        </main>
    )
}