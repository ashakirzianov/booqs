import {
    addHighlight,
    highligtsWithAuthorForBooqId,
} from '@/backend/highlights'
import { userForId } from '@/backend/users'
import { makeId } from '@/core'
import { getUserIdInsideRequest } from '@/data/auth'
import { NextRequest } from 'next/server'

type Params = {
    library: string,
    id: string,
}
// TODO: use DbHighlight
type HighlightJson = {
    id: string,
    booqId: string,
    author: {
        id: string,
        name: string | null,
        profilePictureURL: string | null,
    },
    start: number[],
    end: number[],
    color: string,
    note: string | null,
    createdAt: string,
    updatedAt: string,
}
export type GetResponse = {
    highlights: HighlightJson[],
}
export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { library, id } = await params
    const booqId = makeId(library, id)
    const hls = await highligtsWithAuthorForBooqId(booqId)
    const result: GetResponse = {
        highlights: hls.map(h => ({
            id: h.id,
            booqId: h.booq_id,
            authorId: h.user_id,
            start: h.start_path,
            end: h.end_path,
            color: h.color,
            note: h.note,
            createdAt: h.created_at,
            updatedAt: h.updated_at,
            author: {
                id: h.author_id,
                name: h.author_name,
                profilePictureURL: h.author_profile_picture_url,
            },
        })),
    }
    return Response.json(result)
}

export type PostBody = Pick<HighlightJson, 'id' | 'start' | 'end' | 'color' | 'note'>
export type PostResponse = HighlightJson
export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { library, id: paramsId } = await params
    const booqId = makeId(library, paramsId)
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const author = await userForId(userId)
    if (!author) {
        return Response.json({ error: 'User does not exist' }, { status: 401 })
    }
    const { id, start, end, color, note }: PostBody = await request.json()
    if (!id || !booqId || !start || !end || !color) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const hl = await addHighlight({
        id,
        userId,
        booqId,
        range: { start, end },
        color: color,
        note: note ?? undefined,
    })
    const result: PostResponse = {
        id: hl.id,
        booqId: hl.booq_id,
        start: hl.start_path,
        end: hl.end_path,
        color: hl.color,
        note: hl.note,
        createdAt: hl.created_at,
        updatedAt: hl.updated_at,
        author: {
            id: author.id,
            name: author.name,
            profilePictureURL: author.profile_picture_url,
        },
    }
    return Response.json(result)
}