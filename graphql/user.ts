import { DbUser, usersForIds } from '@/backend/users'
import { getFollowers, getFollowing, isFollowing } from '@/backend/follows'
import { getUserPasskeys, DbPasskeyData } from '@/backend/passkey'
import { getBooqsWithOwnAnnotations } from '@/backend/annotations'
import { uploadsForUserId } from '@/backend/uu'
import { BooqId } from '@/core'
import { BooqData } from '@/backend/library'
import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'
import { BooqParent } from './booq'

export type UserParent = DbUser
export const userResolver: IResolvers<UserParent, ResolverContext> = {
    User: {
        joinedAt(parent) {
            return parent.joined_at
        },
        pictureUrl(parent) {
            return parent.profile_picture_url
        },
        emoji(parent) {
            return parent.emoji
        },
        async followersCount(parent, _, { followersCountLoader }) {
            return followersCountLoader.load(parent.id)
        },
        async followingCount(parent, _, { followingCountLoader }) {
            return followingCountLoader.load(parent.id)
        },
        async followers(parent) {
            const followerIds = await getFollowers(parent.id)
            return await usersForIds(followerIds)
        },
        async following(parent) {
            const followingIds = await getFollowing(parent.id)
            return await usersForIds(followingIds)
        },
        async isFollowing(parent, _, { userId }) {
            if (!userId) {
                return false
            }
            return isFollowing(userId, parent.id)
        },
        async booqsWithAnnotations(parent, _, { userId, booqDataLoader }): Promise<BooqParent[]> {
            if (!userId || userId !== parent.id) {
                return []
            }
            const booqIds = await getBooqsWithOwnAnnotations(userId)
            const results = await booqDataLoader.loadMany(booqIds as BooqId[])
            return results.filter((r): r is BooqData => r !== undefined && !(r instanceof Error))
        },
        // Public like the web's profile uploads grid (users/[username] shows
        // any user's uploads). Backed by the uploads registry — the 'uploads'
        // collection is not written on confirmUpload, so it can't serve this.
        async uploads(parent, _, { booqDataLoader }): Promise<BooqParent[]> {
            const cards = await uploadsForUserId(parent.id)
            const booqIds = cards.map(card => `uu-${card.id}` as BooqId)
            const results = await booqDataLoader.loadMany(booqIds)
            return results.filter((r): r is BooqData => r !== undefined && !(r instanceof Error))
        },
        async passkeys(parent, _, { userId }) {
            if (!userId || userId !== parent.id) {
                return null
            }
            return getUserPasskeys(parent.id)
        },
    },
    Passkey: {
        createdAt(parent: DbPasskeyData) {
            return parent.created_at
        },
    },
}
