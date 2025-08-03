import { notFound } from 'next/navigation'
import { getUserByUsername, getFollowStatus, getFollowingList, getFollowersList } from '@/data/user'
import { ProfileBadge } from '@/components/ProfilePicture'
import { booqCollection } from '@/data/booqs'
import { BooqCollection } from '@/app/(main)/BooqCollection'
import { FollowButton } from './FollowButton'
import { UserFollowingList } from './UserFollowingList'
import { UserFollowersList } from './UserFollowersList'
import { getUserIdInsideRequest } from '@/data/request'
import styles from '@/app/(main)/MainLayout.module.css'
import { Metadata } from 'next'

export async function generateMetadata({
    params
}: {
    params: Promise<{ username: string }>
}): Promise<Metadata> {
    const { username } = await params
    
    const user = await getUserByUsername(username)
    if (!user) {
        return {
            title: 'User Not Found - Booqs',
            description: 'The requested user profile could not be found.',
        }
    }

    return {
        title: `${user.name} (@${user.username}) - Booqs`,
        description: `View ${user.name}'s profile, book collection, and reading activity on Booqs.`,
    }
}

export default async function UserPage({
    params
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params

    const [user, currentUserId] = await Promise.all([
        getUserByUsername(username),
        getUserIdInsideRequest()
    ])

    // Get follow status if user is authenticated and viewing someone else's profile
    let initialFollowStatus = false
    let shouldShowFollowButton = false

    if (currentUserId && user && currentUserId !== user.id) {
        shouldShowFollowButton = true
        const followStatusResult = await getFollowStatus(username)
        initialFollowStatus = followStatusResult.isFollowing
    }

    if (!user) {
        notFound()
    }

    // Get public collections and social data for this user
    const [uploads, following, followers, currentUserFollowing] = await Promise.all([
        booqCollection('uploads', user.id, 210),
        getFollowingList(user.id),
        getFollowersList(user.id),
        currentUserId ? getFollowingList(currentUserId) : Promise.resolve([])
    ])

    // Create set for fast lookup of who current user follows
    const currentUserFollowingSet = new Set(currentUserFollowing.map(u => u.id))

    // Add follow status to both lists
    const followingWithStatus = following.map(user => ({
        ...user,
        isFollowing: currentUserFollowingSet.has(user.id)
    }))

    const followersWithStatus = followers.map(user => ({
        ...user,
        isFollowing: currentUserFollowingSet.has(user.id)
    }))

    return (
        <main className={styles.mainContent}>
            <div className="space-y-8">
                {/* Public Profile Section */}
                <div className="bg-background shadow-md rounded-lg p-6">
                    <div className="flex items-center gap-4">
                        <ProfileBadge
                            name={user.name}
                            picture={user.profilePictureURL}
                            emoji={user.emoji ?? '👤'}
                            size={4}
                            border={true}
                        />
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-primary">
                                        {user.name}
                                    </h1>
                                    <div className="space-y-1 text-dimmed">
                                        <p className="text-sm">
                                            <span className="font-medium">Username:</span> {user.username}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">Member since:</span> {formatDate(user.joinedAt)}
                                        </p>
                                    </div>
                                </div>
                                {/* Only show follow button if viewing someone else's profile */}
                                {shouldShowFollowButton && (
                                    <FollowButton
                                        username={user.username}
                                        initialFollowStatus={initialFollowStatus}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Connections Section */}
                <div className="space-y-6">
                    <UserFollowingList
                        following={followingWithStatus}
                        profileUsername={user.name}
                        currentUserId={currentUserId ?? null}
                    />
                    <UserFollowersList
                        followers={followersWithStatus}
                        profileUsername={user.name}
                        currentUserId={currentUserId ?? null}
                    />
                </div>

                {/* Public Booqs Section */}
                <div className="space-y-6">
                    <BooqCollection
                        title={`${user.name}'s Books`}
                        cards={uploads}
                        signed={false}
                    />
                </div>
            </div>
        </main>
    )
}

function formatDate(date: string) {
    const d = new Date(date)
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}