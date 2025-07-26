import { addBooqToCollection, getBooqIdsInCollection, removeBooqFromCollection } from '@/data/collections'
import { BooqId } from '@/core'
import { getUserIdInsideRequest } from '@/data/auth'

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
export type PostBody = {
    booqId: BooqId
}
export async function POST(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const { booqId }: PostBody = await request.json()
    if (!booqId) {
        return new Response('Bad Request', { status: 400 })
    }
    await addBooqToCollection({ userId, booqId, name })
    const booqIds = await getBooqIdsInCollection(userId, name)
    const result: PostResponse = {
        booqIds,
    }
    return Response.json(result)
}

export type DeleteResponse = CollectionResponse
export type DeleteBody = {
    booqId: BooqId
}
export async function DELETE(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const { booqId }: DeleteBody = await request.json()
    if (!booqId) {
        return new Response('Bad Request', { status: 400 })
    }
    await removeBooqFromCollection({ userId, booqId, name })
    const booqIds = await getBooqIdsInCollection(userId, name)
    const result: DeleteResponse = {
        booqIds,
    }
    return Response.json(result)
}