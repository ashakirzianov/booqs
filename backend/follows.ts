import { sql } from './db'

export type DbFollow = {
  follower_id: string,
  following_id: string,
  created_at: string,
}

export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    if (followerId === followingId) {
      return false // Cannot follow yourself
    }

    await sql`
      INSERT INTO follows (follower_id, following_id)
      VALUES (${followerId}, ${followingId})
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `
    return true
  } catch (err) {
    console.error('Error following user:', err)
    return false
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM follows
      WHERE follower_id = ${followerId} AND following_id = ${followingId}
    `
    return result.length > 0
  } catch (err) {
    console.error('Error unfollowing user:', err)
    return false
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const [follow] = await sql`
      SELECT 1 FROM follows
      WHERE follower_id = ${followerId} AND following_id = ${followingId}
    `
    return !!follow
  } catch (err) {
    console.error('Error checking follow status:', err)
    return false
  }
}

export async function getFollowersCount(userId: string): Promise<number> {
  try {
    const [result] = await sql`
      SELECT COUNT(*)::INTEGER as count FROM follows
      WHERE following_id = ${userId}
    `
    return result?.count || 0
  } catch (err) {
    console.error('Error getting followers count:', err)
    return 0
  }
}

export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const [result] = await sql`
      SELECT COUNT(*)::INTEGER as count FROM follows
      WHERE follower_id = ${userId}
    `
    return result?.count || 0
  } catch (err) {
    console.error('Error getting following count:', err)
    return 0
  }
}

export async function getFollowers(userId: string, limit = 50, offset = 0): Promise<string[]> {
  try {
    const results = await sql`
      SELECT follower_id FROM follows
      WHERE following_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return results.map(row => row.follower_id)
  } catch (err) {
    console.error('Error getting followers:', err)
    return []
  }
}

export async function getFollowing(userId: string, limit = 50, offset = 0): Promise<string[]> {
  try {
    const results = await sql`
      SELECT following_id FROM follows
      WHERE follower_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return results.map(row => row.following_id)
  } catch (err) {
    console.error('Error getting following:', err)
    return []
  }
}