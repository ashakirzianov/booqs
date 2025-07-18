'use server'
import { BooqId, BooqPath, AccountPublicData } from '@/core'
import { fetchAuthData, getUserIdInsideRequest } from './auth'
import { addBooqHistory } from '@/backend/history'
import { userForUsername, DbUser, usersForIds } from '@/backend/users'
import { followUser, unfollowUser, isFollowing, getFollowing } from '@/backend/follows'

export async function reportBooqHistory({
    booqId, path, source,
}: {
    booqId: BooqId,
    path: BooqPath,
    source: string,
}) {
    const user = await fetchAuthData()
    if (!user) {
        return {
            success: false,
            error: 'Not authenticated',
        } as const
    }
    addBooqHistory(user.id, {
        booqId, path, source,
        date: Date.now(),
    })
}

export async function userData(username: string): Promise<AccountPublicData | null> {
    const dbUser = await userForUsername(username)
    if (!dbUser) {
        return null
    }
    return accountPublicDataFromDbUser(dbUser)
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