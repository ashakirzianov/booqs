import { addBooqToCollection, getBooqIdsInCollection, removeBooqFromCollection } from '@/data/collections'
import { BooqId } from '@/core'
import { getUserIdInsideRequest } from '@/data/request'
import { z } from 'zod'

const booqIdSchema = z.string().regex(/^[a-z]+-\S+$/) as z.ZodType<BooqId>
const booqIdBodySchema = z.object({
    booqId: booqIdSchema,
})

type Params = { name: string }
type CollectionResponse = {
    booqIds: string[]
}
export type GetResponse = CollectionResponse
export async function GET(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const booqIds = await getBooqIdsInCollection(userId, name)
    const result: GetResponse = {
        booqIds,
    }
    return Response.json(result)
}

export type PostResponse = CollectionResponse
export type PostBody = z.infer<typeof booqIdBodySchema>
export async function POST(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const parsed = booqIdBodySchema.safeParse(await request.json())
    if (!parsed.success) {
        return new Response('Bad Request', { status: 400 })
    }
    const { booqId } = parsed.data
    await addBooqToCollection({ userId, booqId, name })
    const booqIds = await getBooqIdsInCollection(userId, name)
    const result: PostResponse = {
        booqIds,
    }
    return Response.json(result)
}

export type DeleteResponse = CollectionResponse
export type DeleteBody = z.infer<typeof booqIdBodySchema>
export async function DELETE(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const parsed = booqIdBodySchema.safeParse(await request.json())
    if (!parsed.success) {
        return new Response('Bad Request', { status: 400 })
    }
    const { booqId } = parsed.data
    await removeBooqFromCollection({ userId, booqId, name })
    const booqIds = await getBooqIdsInCollection(userId, name)
    const result: DeleteResponse = {
        booqIds,
    }
    return Response.json(result)
}