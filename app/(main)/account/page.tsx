import { redirect } from 'next/navigation'
import { authHref } from '@/core/href'
import { fetchAuthData, fetchPasskeyData } from '@/data/auth'
import { booqCollection } from '@/data/booqs'
import { getFollowingList, getFollowersList } from '@/data/user'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { DeleteAccountButton } from './DeleteAccountButton'
import { SignoutButton } from './SignoutButton'
import { ProfileData } from './ProfileData'
import { PasskeySection } from './PasskeySection'
import { FollowingList } from './FollowingList'
import { FollowersList } from './FollowersList'

export default async function Page() {
    const user = await fetchAuthData()
    if (!user) {
        redirect(authHref({}))
    }
    const [readingList, uploads, passkeys, following, followers, currentUserFollowing] = await Promise.all([
        booqCollection(READING_LIST_COLLECTION, user.id),
        booqCollection('uploads', user.id),
        fetchPasskeyData(),
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
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 min-h-[calc(100vh-3rem)] flex flex-col">
            {/* Profile Section */}
            <ProfileData user={user} />

            {/* Passkeys Section */}
            <PasskeySection initialPasskeys={passkeys} />

            {/* Following Section */}
            <FollowingList following={followingWithStatus} currentUserId={user.id} />

            {/* Followers Section */}
            <FollowersList followers={followersWithStatus} currentUserId={user.id} />

            {/* Booqs Section */}
            <div className="space-y-6 flex-1">
                <BooqCollection
                    title='My Uploads'
                    cards={uploads}
                    signed={true}
                />
                <BooqCollection
                    title='My Reading List'
                    cards={readingList}
                    collection={'reading_list'}
                    signed={true}
                />
            </div>

            {/* Account Actions - At Bottom */}
            <div className="border-t border-dimmed pt-6 mt-8">
                <div className="flex gap-3 justify-center">
                    <SignoutButton />
                    <DeleteAccountButton account={{
                        name: user.name,
                        joinedAt: user.joinedAt,
                    }} />
                </div>
            </div>
        </div>
    )
}