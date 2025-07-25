import {
    BooqPath, buildFragment,
    PartialBooqData,
    BooqId,
    BooqMetadata,
    TableOfContents,
} from '@/core'
import { libraryCardsForIds, featuredBooqIds, booqsForAuthor } from '@/backend/library'
import { userForId } from '@/backend/users'
import { booqIdsInCollections } from '@/backend/collections'
import { booqForId, booqPreview, booqToc } from '@/backend/booq'

export type BooqCardData = {
    booqId: BooqId,
    title: string,
    authors: string[],
    tags: Array<[string, string?]>,
    coverSrc?: string
}

export type BooqDetailedData = BooqCardData & {
    toc: TableOfContents,
}

export async function featuredIds() {
    return featuredBooqIds()
}

export async function featuredBooqCards(): Promise<BooqCardData[]> {
    const ids = await featuredIds()
    const cards = (await libraryCardsForIds(ids))
        .filter(card => card !== undefined)
        .map(card => buildBooqCardData(card.booqId, card.meta))
    return cards
}

export async function booqCardsForAuthor(author: string): Promise<BooqCardData[]> {
    const cards = await booqsForAuthor(author)
    return cards.map(card => buildBooqCardData(card.booqId, card.meta))
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
        .map(card => buildBooqCardData(card.booqId, card.meta))
    return cards
}

export async function booqCard(booqId: BooqId): Promise<BooqCardData | undefined> {
    const [card] = await libraryCardsForIds([booqId])
    if (undefined === card) {
        return undefined
    }

    return buildBooqCardData(card.booqId, card.meta)
}

export async function booqDetailedData(booqId: BooqId): Promise<BooqDetailedData | undefined> {
    const card = await booqCard(booqId)
    if (!card) {
        return undefined
    }
    const toc = await booqToc(booqId)
    if (!toc) {
        return undefined
    }
    return {
        ...card,
        toc,
    }
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
        booqId,
        fragment,
        toc: booq.toc,
        meta: booq.metadata,
    } satisfies PartialBooqData
}

function buildBooqCardData(booqId: BooqId, meta: BooqMetadata): BooqCardData {
    return {
        booqId,
        title: meta.title,
        authors: meta.authors.map(author => author.name),
        tags: meta.extra.map(e => [e.name, e.value]),
        coverSrc: meta.coverSrc,
    }
}