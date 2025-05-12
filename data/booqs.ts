import {
    BooqPath, buildFragment,
    PartialBooqData,
    BooqId,
    BooqLibraryCard,
} from '@/core'
import { booqImageUrl, CoverSize } from '@/backend/images'
import { libraryCardsForIds, featuredBooqIds, booqsForAuthor } from '@/backend/library'
import { userForId } from '@/backend/users'
import { booqIdsInCollections } from '@/backend/collections'
import { booqForId, booqPreview } from '@/backend/booq'

export type BooqCardData = Omit<BooqLibraryCard, 'coverSrc'> & {
    coverUrl?: string
}

export async function featuredIds() {
    return featuredBooqIds()
}

export async function featuredBooqCards(coverSize: CoverSize = 210): Promise<BooqCardData[]> {
    const ids = await featuredIds()
    const cards = (await libraryCardsForIds(ids))
        .filter(card => card !== undefined)
        .map(card => buildBooqCard(card, coverSize))
    return cards
}

export async function booqCardsForAuthor(author: string): Promise<BooqCardData[]> {
    const cards = await booqsForAuthor(author)
    return cards.map(card => buildBooqCard(card, 210))
}

export async function booqCollection(collection: string, userId: string | undefined): Promise<BooqCardData[]> {
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

export async function booqCard(booqId: BooqId): Promise<BooqCardData | undefined> {
    const [card] = await libraryCardsForIds([booqId])
    if (undefined === card) {
        return undefined
    }

    return buildBooqCard(card, 210)
}

export async function fetchBooqPreview(booqId: BooqId, path: BooqPath, end?: BooqPath) {
    return booqPreview(booqId, path, end)
}

export async function booqPart({
    booqId, path, bypassCache,
}: {
    booqId: BooqId,
    path?: BooqPath,
    bypassCache?: boolean,
}): Promise<PartialBooqData | undefined> {
    const [card] = await libraryCardsForIds([booqId])
    if (card === undefined) {
        return undefined
    }
    const booq = await booqForId(booqId, bypassCache)
    if (booq === undefined) {
        return undefined
    }
    const fragment = buildFragment({ booq, path })

    return {
        id: booqId,
        fragment,
        toc: booq.toc,
        meta: booq.meta,
        length: booq.length,
    } satisfies PartialBooqData
}

function buildBooqCard(card: BooqLibraryCard, coverSize: CoverSize): BooqCardData {
    return {
        ...card,
        coverUrl: card.coverSrc
            ? booqImageUrl(card.id, card.coverSrc, coverSize)
            : undefined,
    }
}