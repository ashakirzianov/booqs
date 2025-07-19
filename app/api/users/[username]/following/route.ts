import { userForUsername, usersForIds } from '@/backend/users'
import { getFollowing } from '@/backend/follows'
import { NextRequest } from 'next/server'

type Params = {
    username: string,
}

export type GetResponse = {
    following: Array<{
        id: string,
        username: string,
        name: string,
        profile_picture_url: string | null,
        emoji: string,
    }>,
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { username } = await params
    
    const user = await userForUsername(username)
    if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }
    
    const followingIds = await getFollowing(user.id)
    const following = await usersForIds(followingIds)
    
    const result: GetResponse = {
        following: following.map(u => ({
            id: u.id,
            username: u.username,
            name: u.name,
            profile_picture_url: u.profile_picture_url,
            emoji: u.emoji,
        }))
    }
    
    return Response.json(result)
}