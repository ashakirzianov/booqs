import { BooqId, BooqRange } from '@/core'
import {
    modifyNote, deleteNote,
    NotePrivacy,
    createNote,
} from '@/data/notes'
import { getUserIdInsideRequest } from '@/data/request'
import { NextRequest } from 'next/server'
import { ResolvedNote } from '../route'
import { getUserById } from '@/data/user'

type Params = {
    id: string,
}

export type PostBody = {
    booqId: BooqId,
    range: BooqRange,
    kind: string,
    content?: string,
    targetQuote: string,
    privacy: NotePrivacy,
}
export type PostResponse = ResolvedNote
export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const author = await getUserById(userId)
    if (!author) {
        return Response.json({ error: 'User does not exist' }, { status: 401 })
    }
    const { booqId, range, kind, content, targetQuote, privacy }: PostBody = await request.json()
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

export type PatchBody = {
    kind?: string,
    content?: string | null,
}
export type PatchResponse = {
    id: string,
    kind: string,
    content?: string | null,
    targetQuote: string,
    createdAt: string,
    updatedAt: string,
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const { kind, content }: PatchBody = await request.json()
    const note = await modifyNote({
        id,
        authorId: userId,
        kind,
        content,
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
    const success = await deleteNote({
        id, authorId: userId,
    })
    if (success) {
        return new Response(undefined, { status: 204 })
    } else {
        return Response.json({ error: 'Note not found' }, { status: 404 })
    }
}