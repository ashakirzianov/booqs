'use server'
import { getUserIdInsideRequest } from './auth'
import { userForUsername, DbUser, usersForIds, userForId } from '@/backend/users'
import { followUser, unfollowUser, isFollowing, getFollowing, getFollowers } from '@/backend/follows'

export type { DbUser }

export type AccountPublicData = {
    id: string,
    username: string,
    joinedAt: string,
    name: string,
    profilePictureURL?: string,
    emoji: string,
}

export type AccountData = AccountPublicData & {
    email: string,
}
// TODO: remove this type, use AccountData instead
export type AuthorData = Pick<AccountData, 'id' | 'username' | 'name' | 'profilePictureURL' | 'emoji'>

export async function getCurrentUser(): Promise<AccountData | undefined> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return undefined
    }
    const user = await userForId(userId)
    if (!user) {
        return undefined
    }
    return accountDataFromDbUser(user)
}

// TODO: rename to `getUserByUsername`
export async function getUserByUsername(username: string): Promise<AccountPublicData | null> {
    const dbUser = await userForUsername(username)
    if (!dbUser) {
        return null
    }
    return accountPublicDataFromDbUser(dbUser)
}

export async function getUserById(userId: string): Promise<AccountPublicData | null> {
    const dbUser = await userForUsername(userId)
    if (!dbUser) {
        return null
    }
    return accountPublicDataFromDbUser(dbUser)
}

export async function followAction(username: string): Promise<{ success: boolean; error?: string }> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return {
            success: false,
            error: 'Not authenticated',
        }
    }

    const targetUser = await userForUsername(username)
    if (!targetUser) {
        return {
            success: false,
            error: 'User not found',
        }
    }

    if (userId === targetUser.id) {
        return {
            success: false,
            error: 'Cannot follow yourself',
        }
    }

    const success = await followUser(userId, targetUser.id)

    return {
        success,
    }
}

export async function unfollowAction(username: string): Promise<{ success: boolean; error?: string }> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return {
            success: false,
            error: 'Not authenticated',
        }
    }

    const targetUser = await userForUsername(username)
    if (!targetUser) {
        return {
            success: false,
            error: 'User not found',
        }
    }

    const success = await unfollowUser(userId, targetUser.id)

    return {
        success,
    }
}

export async function getFollowStatus(username: string): Promise<{ isFollowing: boolean; error?: string }> {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return {
            isFollowing: false,
            error: 'Not authenticated',
        }
    }

    const targetUser = await userForUsername(username)
    if (!targetUser) {
        return {
            isFollowing: false,
            error: 'User not found',
        }
    }

    const followingStatus = await isFollowing(userId, targetUser.id)

    return {
        isFollowing: followingStatus,
    }
}

export async function getFollowingList(userId: string): Promise<AccountPublicData[]> {
    const followingIds = await getFollowing(userId)
    const following = await usersForIds(followingIds)

    return following.map(accountPublicDataFromDbUser)
}

export async function getFollowersList(userId: string): Promise<AccountPublicData[]> {
    const followerIds = await getFollowers(userId)
    const followers = await usersForIds(followerIds)

    return followers.map(accountPublicDataFromDbUser)
}

function accountPublicDataFromDbUser(dbUser: DbUser): AccountPublicData {
    return {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        profilePictureURL: dbUser.profile_picture_url ?? undefined,
        emoji: dbUser.emoji,
        joinedAt: dbUser.joined_at,
    }
}

function accountDataFromDbUser(dbUser: DbUser): AccountData {
    return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        joinedAt: dbUser.joined_at,
        name: dbUser.name,
        profilePictureURL: dbUser.profile_picture_url ?? undefined,
        emoji: dbUser.emoji ?? undefined,
    }
}