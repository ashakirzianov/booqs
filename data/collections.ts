import { BooqId } from '@/core'
import { addToCollection, booqIdsInCollections, removeFromCollection } from '@/backend/collections'

export async function getBooqIdsInCollection(userId: string, name: string): Promise<string[]> {
    return booqIdsInCollections(userId, name)
}

export async function addBooqToCollection({
    userId,
    booqId,
    name,
}: {
    userId: string,
    booqId: BooqId,
    name: string,
}): Promise<boolean> {
    return addToCollection({ userId, booqId, name })
}

export async function removeBooqFromCollection({
    userId,
    booqId,
    name,
}: {
    userId: string,
    booqId: BooqId,
    name: string,
}): Promise<boolean> {
    return removeFromCollection({ userId, booqId, name })
}