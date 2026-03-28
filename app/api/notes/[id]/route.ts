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
import { z } from 'zod'

const booqIdSchema = z.string().regex(/^[a-z]+-\S+$/) as z.ZodType<BooqId>
const booqPathSchema = z.array(z.number().int().min(0))

const postBodySchema = z.object({
    booqId: booqIdSchema,
    range: z.object({
        start: booqPathSchema,
        end: booqPathSchema,
    }) as z.ZodType<BooqRange>,
    kind: z.string().min(1).max(50),
    content: z.string().max(10000).optional(),
    targetQuote: z.string().max(10000),
    privacy: z.enum(['private', 'public']) as z.ZodType<NotePrivacy>,
})

const patchBodySchema = z.object({
    kind: z.string().min(1).max(50).optional(),
    content: z.string().max(10000).nullish(),
})

type Params = {
    id: string,
}

export type PostBody = z.infer<typeof postBodySchema>
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
    const parsed = postBodySchema.safeParse(await request.json())
    if (!parsed.success) {
        return Response.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }
    const { booqId, range, kind, content, targetQuote, privacy } = parsed.data
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

export type PatchBody = z.infer<typeof patchBodySchema>
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
    const parsed = patchBodySchema.safeParse(await request.json())
    if (!parsed.success) {
        return Response.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }
    const { kind, content } = parsed.data
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