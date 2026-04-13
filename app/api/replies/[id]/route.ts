import { createReply, deleteReply, modifyReply } from '@/data/replies'
import { getUserIdInsideRequest } from '@/data/request'
import { getUserById } from '@/data/user'
import { NextRequest } from 'next/server'
import { ResolvedReply } from '../route'
import { z } from 'zod'

const postBodySchema = z.object({
    noteId: z.string().min(1),
    content: z.string().min(1).max(10000),
})

const patchBodySchema = z.object({
    content: z.string().min(1).max(10000),
})

type Params = {
    id: string,
}

export type PostBody = z.infer<typeof postBodySchema>
export type PostResponse = ResolvedReply
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
    const { noteId, content } = parsed.data
    const reply = await createReply({
        id,
        noteId,
        authorId: userId,
        content,
    })
    if (!reply) {
        return Response.json({ error: 'Failed to create reply' }, { status: 500 })
    }
    const result: PostResponse = {
        ...reply,
        author,
    }
    return Response.json(result)
}

export type PatchBody = z.infer<typeof patchBodySchema>
export type PatchResponse = {
    id: string,
    content: string,
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
    const { content } = parsed.data
    const reply = await modifyReply({
        id,
        authorId: userId,
        content,
    })
    if (!reply) {
        return Response.json({ error: 'Reply not found' }, { status: 404 })
    }
    const result: PatchResponse = reply
    return Response.json(result)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const success = await deleteReply({ id, authorId: userId })
    if (success) {
        return new Response(undefined, { status: 204 })
    } else {
        return Response.json({ error: 'Reply not found' }, { status: 404 })
    }
}
