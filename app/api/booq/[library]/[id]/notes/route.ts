import {
    addNote,
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
// TODO: use DbNote
type NotesJson = {
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
    content: string | null,
    createdAt: string,
    updatedAt: string,
}
export type GetResponse = {
    notes: NotesJson[],
}
export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { library, id } = await params
    const booqId = makeId(library, id)
    const notes = await notesWithAuthorForBooqId(booqId)
    const result: GetResponse = {
        notes: notes.map(note => ({
            id: note.id,
            booqId: note.booq_id,
            authorId: note.author_id,
            start: note.start_path,
            end: note.end_path,
            color: note.color,
            content: note.content,
            createdAt: note.created_at,
            updatedAt: note.updated_at,
            author: {
                id: note.author_id,
                name: note.author_name,
                profilePictureURL: note.author_profile_picture_url,
            },
        })),
    }
    return Response.json(result)
}

export type PostBody = Pick<NotesJson, 'id' | 'start' | 'end' | 'color' | 'content'>
export type PostResponse = NotesJson
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
    const { id, start, end, color, content }: PostBody = await request.json()
    if (!id || !booqId || !start || !end || !color) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const hl = await addNote({
        id,
        authorId: userId,
        booqId,
        range: { start, end },
        color: color,
        content: content ?? undefined,
    })
    const result: PostResponse = {
        id: hl.id,
        booqId: hl.booq_id,
        start: hl.start_path,
        end: hl.end_path,
        color: hl.color,
        content: hl.content,
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