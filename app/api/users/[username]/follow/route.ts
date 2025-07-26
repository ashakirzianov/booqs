import { NextRequest } from 'next/server'
import { followAction, getFollowStatus, unfollowAction } from '@/data/user'

type Params = {
    username: string
}

export type GetResponse = {
    isFollowing: boolean
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { username } = await params
    const followStatus = await getFollowStatus(username)
    if (followStatus.error) {
        return Response.json({ error: followStatus.error }, { status: 401 })
    }
    const result: GetResponse = {
        isFollowing: followStatus.isFollowing,
    }

    return Response.json(result)
}

export type PostResponse = {
    success: boolean,
    error?: string,
}

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { username } = await params
    const followResult = await followAction(username)
    const result: PostResponse = {
        success: followResult.success,
        error: followResult.error,
    }

    return Response.json(result)
}

export type DeleteResponse = {
    success: boolean,
    error?: string,
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { username } = await params
    const unfollowResult = await unfollowAction(username)
    const result: DeleteResponse = {
        success: unfollowResult.success,
        error: unfollowResult.error,
    }

    return Response.json(result)
}