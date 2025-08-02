import {
    NoteAuthorData,
    createNote,
    fetchNotes,
    NotePrivacy,
} from '@/data/notes'
import { getUserById } from '@/data/user'
import { BooqId, BooqRange } from '@/core'
import { NextRequest } from 'next/server'
import { getUserIdInsideRequest } from '@/data/request'

type ResolvedNote = {
    id: string,
    booqId: BooqId,
    author: NoteAuthorData,
    range: BooqRange,
    kind: string,
    content?: string | null,
    targetQuote: string,
    privacy: NotePrivacy,
    createdAt: string,
    updatedAt: string,
}
export type GetResponse = {
    notes: ResolvedNote[],
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const booq_id = searchParams.get('booq_id')
    if (!booq_id) {
        return Response.json({ error: 'Missing booq_id' }, { status: 400 })
    }
    const booqId: BooqId = booq_id as BooqId
    const notes = await fetchNotes({ booqId })
    const result: GetResponse = {
        notes,
    }
    return Response.json(result)
}

export type PostBody = {
    id: string,
    range: BooqRange,
    kind: string,
    content?: string,
    targetQuote: string,
    privacy: NotePrivacy,
}
export type PostResponse = ResolvedNote
export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const booq_id = searchParams.get('booq_id')
    if (!booq_id) {
        return Response.json({ error: 'Missing booq_id' }, { status: 400 })
    }
    const booqId: BooqId = booq_id as BooqId
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const author = await getUserById(userId)
    if (!author) {
        return Response.json({ error: 'User does not exist' }, { status: 401 })
    }
    const { id, range, kind, content, targetQuote, privacy }: PostBody = await request.json()
    if (!id || !booqId || !range || !kind) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const note = await createNote({
        id,
        authorId: userId,
        booqId,
        range,
        kind,
        content,
        targetQuote,
        privacy,
    })
    if (!note) {
        return Response.json({ error: 'Failed to create note' }, { status: 500 })
    }
    const result: PostResponse = {
        ...note,
        author,
    }
    return Response.json(result)
}