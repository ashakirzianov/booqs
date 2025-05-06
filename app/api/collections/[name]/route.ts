import { addToCollection, booqIdsInCollections, removeFromCollection } from '@/backend/collections'
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
    const booqIds = await booqIdsInCollections(userId, name)
    const result: GetResponse = {
        booqIds,
    }
    return Response.json(result)
}

export type PostResponse = CollectionResponse
export type PostBody = {
    booqId: string
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
    await addToCollection({ userId, booqId, name })
    const booqIds = await booqIdsInCollections(userId, name)
    const result: PostResponse = {
        booqIds,
    }
    return Response.json(result)
}

export type DeleteResponse = CollectionResponse
export type DeleteBody = {
    booqId: string
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
    await removeFromCollection({ userId, booqId, name })
    const booqIds = await booqIdsInCollections(userId, name)
    const result: DeleteResponse = {
        booqIds,
    }
    return Response.json(result)
}