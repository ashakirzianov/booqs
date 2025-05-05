import {
    updateNote, removeNote,
    DbNote,
} from '@/backend/notes'
import { getUserIdInsideRequest } from '@/data/auth'
import { NextRequest } from 'next/server'

type Params = {
    id: string,
}

export type PatchBody = Partial<Pick<DbNote, 'color' | 'content'>>
export type PatchResponse = Pick<DbNote, 'id' | 'color' | 'content' | 'created_at' | 'updated_at'>
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
    const result: PatchResponse = note
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