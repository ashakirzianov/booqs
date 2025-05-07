import {
    BooqPath, buildFragment,
    PartialBooqData,
    BooqId,
    BooqLibraryCard,
} from '@/core'
import { booqImageUrl } from '@/backend/images'
import { libraryCardsForIds, featuredBooqIds, booqsForAuthor } from '@/backend/library'
import { userForId } from '@/backend/users'
import { booqIdsInCollections } from '@/backend/collections'
import { booqForId, booqPreview } from '@/backend/booq'

export async function featuredIds() {
    return featuredBooqIds()
}

export async function featuredBooqCards(coverSize: number = 210): Promise<BooqLibraryCard[]> {
    const ids = await featuredIds()
    const cards = (await libraryCardsForIds(ids))
        .filter(card => card !== undefined)
        .map(card => buildBooqCard(card, coverSize))
    return cards
}

export async function booqCardsForAuthor(author: string): Promise<BooqLibraryCard[]> {
    const cards = await booqsForAuthor(author)
    return cards.map(card => buildBooqCard(card, 210))
}

export async function booqCollection(collection: string, userId: string | undefined): Promise<BooqLibraryCard[]> {
    if (!userId) {
        return []
    }
    const user = await userForId(userId)
    if (!user) {
        return []
    }
    const ids = await booqIdsInCollections(user.id, collection)
    const cards = (await libraryCardsForIds(ids))
        .filter(card => card !== undefined)
        .map(card => buildBooqCard(card, 210))
    return cards
}

export async function booqCard(booqId: string): Promise<BooqLibraryCard | undefined> {
    const [card] = await libraryCardsForIds([booqId])
    if (undefined === card) {
        return undefined
    }

    return buildBooqCard(card, 210)
}

export async function fetchBooqPreview(booqId: BooqId, path: BooqPath, end?: BooqPath) {
    return booqPreview(booqId, path, end)
}

export async function booqPart(booqId: BooqId, path?: BooqPath) {
    const [card] = await libraryCardsForIds([booqId])
    if (card === undefined) {
        return undefined
    }
    const booq = await booqForId(booqId)
    if (booq === undefined) {
        return undefined
    }
    const fragment = buildFragment({ booq, path })

    return {
        id: booqId,
        fragment,
        toc: booq.toc,
        meta: booq.meta,
    } satisfies PartialBooqData
}

function buildBooqCard(card: BooqLibraryCard, coverSize: number): BooqLibraryCard {
    return {
        ...card,
        coverUrl: card.coverUrl
            ? booqImageUrl(card.id, card.coverUrl, coverSize)
            : undefined,
    }
}