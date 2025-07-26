import { NextRequest } from 'next/server'
import { followUserById, unfollowUserById, checkIsFollowing, getUserByUsername } from '@/data/followers'
import { getUserIdInsideRequest } from '@/data/auth'

type Params = {
    username: string
}

export type GetResponse = {
    isFollowing: boolean
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { username } = await params
    const currentUserId = await getUserIdInsideRequest()
    
    if (!currentUserId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetUser = await getUserByUsername(username)
    if (!targetUser) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const following = await checkIsFollowing(currentUserId, targetUser.id)
    const result: GetResponse = { isFollowing: following }
    
    return Response.json(result)
}

export type PostResponse = {
    success: boolean
    isFollowing: boolean
}

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { username } = await params
    const currentUserId = await getUserIdInsideRequest()
    
    if (!currentUserId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetUser = await getUserByUsername(username)
    if (!targetUser) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (currentUserId === targetUser.id) {
        return Response.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const success = await followUserById(currentUserId, targetUser.id)
    const result: PostResponse = { 
        success, 
        isFollowing: success ? true : await checkIsFollowing(currentUserId, targetUser.id)
    }
    
    return Response.json(result)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { username } = await params
    const currentUserId = await getUserIdInsideRequest()
    
    if (!currentUserId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetUser = await getUserByUsername(username)
    if (!targetUser) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const success = await unfollowUserById(currentUserId, targetUser.id)
    const result: PostResponse = { 
        success, 
        isFollowing: success ? false : await checkIsFollowing(currentUserId, targetUser.id)
    }
    
    return Response.json(result)
}