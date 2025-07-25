import { getUserByUsername, getFollowingList } from '@/data/user'
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

    const user = await getUserByUsername(username)
    if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const following = await getFollowingList(user.id)

    const result: GetResponse = {
        following: following.map(u => ({
            id: u.id,
            username: u.username,
            name: u.name,
            profile_picture_url: u.profilePictureURL ?? null,
            emoji: u.emoji,
        }))
    }

    return Response.json(result)
}