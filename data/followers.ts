import {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowing,
    getFollowers,
    getFollowersCount,
    getFollowingCount,
} from '@/backend/follows'
import { userForUsername, userForId, usersForIds, DbUser } from '@/backend/users'

export type { DbUser }

export async function getUserByUsername(username: string): Promise<DbUser | null> {
    return userForUsername(username)
}

export async function getUserById(id: string): Promise<DbUser | null> {
    return userForId(id)
}

export async function getUsersByIds(ids: string[]): Promise<DbUser[]> {
    return usersForIds(ids)
}

export async function followUserById(followerId: string, followingId: string): Promise<boolean> {
    return followUser(followerId, followingId)
}

export async function unfollowUserById(followerId: string, followingId: string): Promise<boolean> {
    return unfollowUser(followerId, followingId)
}

export async function checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
    return isFollowing(followerId, followingId)
}

export async function getFollowingList(userId: string, limit = 50, offset = 0): Promise<string[]> {
    return getFollowing(userId, limit, offset)
}

export async function getFollowersList(userId: string, limit = 50, offset = 0): Promise<string[]> {
    return getFollowers(userId, limit, offset)
}

export async function getFollowersCountForUser(userId: string): Promise<number> {
    return getFollowersCount(userId)
}

export async function getFollowingCountForUser(userId: string): Promise<number> {
    return getFollowingCount(userId)
}