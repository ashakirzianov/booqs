import { DbUser, usersForIds } from '@/backend/users'
import { getFollowersCount, getFollowingCount, getFollowers, getFollowing, isFollowing } from '@/backend/follows'
import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'

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
        async followersCount(parent) {
            return await getFollowersCount(parent.id)
        },
        async followingCount(parent) {
            return await getFollowingCount(parent.id)
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
    },
}
