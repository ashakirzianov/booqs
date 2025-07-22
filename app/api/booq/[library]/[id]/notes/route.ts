import {
    addNote,
    DbNote,
    DbNoteWithAuthor,
    notesWithAuthorForBooqId,
} from '@/backend/notes'
import { userForId } from '@/backend/users'
import { makeId } from '@/core'
import { getUserIdInsideRequest } from '@/data/auth'
import { NextRequest } from 'next/server'

type Params = {
    library: string,
    id: string,
}
export type GetResponse = {
    notes: DbNoteWithAuthor[],
}
export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { library, id } = await params
    const booqId = makeId(library, id)
    const notes = await notesWithAuthorForBooqId(booqId)
    const result: GetResponse = {
        notes,
    }
    return Response.json(result)
}

export type PostBody = Pick<DbNote, 'id' | 'start_path' | 'end_path' | 'kind' | 'content' | 'target_quote' | 'privacy'>
export type PostResponse = DbNoteWithAuthor
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
    const { id, start_path, end_path, kind, content, target_quote, privacy }: PostBody = await request.json()
    if (!id || !booqId || !start_path || !end_path || !kind) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const note = await addNote({
        id,
        authorId: userId,
        booqId,
        range: {
            start: start_path,
            end: end_path,
        },
        kind,
        content: content ?? undefined,
        targetQuote: target_quote,
        privacy: privacy ?? 'private',
    })
    const result: PostResponse = {
        ...note,
        author_id: userId,
        author_name: author.name,
        author_username: author.username,
        author_profile_picture_url: author.profile_picture_url,
        author_emoji: author.emoji,
    }
    return Response.json(result)
}