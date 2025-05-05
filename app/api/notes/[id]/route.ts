import {
    updateNote, removeNote,
} from '@/backend/notes'
import { getUserIdInsideRequest } from '@/data/auth'
import { NextRequest } from 'next/server'

type Params = {
    id: string,
}
type NoteJson = {
    id: string,
    booqId: string,
    authorId: string,
    start: number[],
    end: number[],
    color: string,
    content: string | null,
    createdAt: string,
    updatedAt: string,
}
export type PatchBody = Partial<Pick<NoteJson, 'color' | 'content'>>
export type PatchResponse = NoteJson
export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const { color, content }: PatchBody = await request.json()
    const note = await updateNote({
        id,
        authorId: userId,
        color: color,
        content: content ?? undefined,
    })
    if (!note) {
        return Response.json({ error: 'Note not found' }, { status: 404 })
    }
    const result: PatchResponse = {
        id: note.id,
        booqId: note.booq_id,
        authorId: note.author_id,
        start: note.start_path,
        end: note.end_path,
        color: note.color,
        content: note.content,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    }
    return Response.json(result)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const success = await removeNote({
        id, authorId: userId,
    })
    if (success) {
        return Response.json(null, { status: 204 })
    } else {
        return Response.json({ error: 'Note not found' }, { status: 404 })
    }
}