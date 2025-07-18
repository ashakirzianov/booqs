import { DbUser } from '@/backend/users'
import { getFollowersCount, getFollowingCount } from '@/backend/follows'
import { IResolvers } from '@graphql-tools/utils'

export type UserParent = DbUser
export const userResolver: IResolvers<UserParent> = {
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
    },
}
