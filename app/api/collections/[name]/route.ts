import { addToCollection, booqIdsInCollections, removeFromCollection } from '@/backend/collections'
import { getUserIdInsideRequest } from '@/data/auth'

type Params = { name: string }
export async function GET(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const ids = await booqIdsInCollections(userId, name)
    return Response.json({ ids })
}

export async function POST(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const body = await request.json()
    const { booqId } = body
    if (!booqId) {
        return new Response('Bad Request', { status: 400 })
    }
    await addToCollection({ userId, booqId, name })
    const ids = await booqIdsInCollections(userId, name)
    return Response.json({ ids })
}

export async function DELETE(request: Request, { params }: {
    params: Promise<Params>,
}) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return new Response('Unauthorized', { status: 401 })
    }
    const { name } = await params
    const body = await request.json()
    const { booqId } = body
    if (!booqId) {
        return new Response('Bad Request', { status: 400 })
    }
    await removeFromCollection({ userId, booqId, name })
    const ids = await booqIdsInCollections(userId, name)
    return Response.json({ ids })
}