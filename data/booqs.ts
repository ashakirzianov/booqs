import {
    Booq, BooqPath, filterUndefined, previewForPath, textForRange,
    buildFragment,
    PartialBooqData,
    BooqId,
    BooqMetaTag,
    BooqCardData,
} from '@/core'
import { booqImageUrl } from '@/backend/images'
import { booqForId, libraryCardsForIds, LibraryCard, featuredBooqIds, booqsForAuthor } from '@/backend/library'
import { userForId } from '@/backend/users'
import { booqIdsInCollections } from '@/backend/collections'

export type BooqPreview = {
    id: string,
    title: string,
    preview: string,
}

export async function featuredIds() {
    return featuredBooqIds()
}

export async function featuredBooqCards(coverSize: number = 210): Promise<BooqCardData[]> {
    const ids = await featuredIds()
    const cards = filterUndefined(await libraryCardsForIds(ids))
        .map(card => buildBooqCard(card, coverSize))
    return filterUndefined(cards)
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
    const cards = filterUndefined(await libraryCardsForIds(ids))
    return cards.map(card => buildBooqCard(card, 210))
}

export async function booqCard(booqId: string): Promise<BooqCardData | undefined> {
    const [card] = await libraryCardsForIds([booqId])
    if (undefined === card) {
        return undefined
    }

    return buildBooqCard(card, 210)
}

export async function booqPreview(booqId: BooqId, path?: BooqPath, end?: BooqPath, length: number = 500) {
    const booq = await booqForId(booqId)
    if (booq?.meta.title === undefined) {
        return undefined
    }
    const preview = previewForBooq(booq, path, end, length)
    if (preview === undefined) {
        return undefined
    }
    return {
        id: booqId,
        title: booq.meta.title,
        preview: preview,
    } satisfies BooqPreview
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

function previewForBooq(booq: Booq, path?: BooqPath, end?: BooqPath, length: number = 500): string | undefined {
    if (end) {
        const preview = textForRange(booq.nodes, { start: path ?? [], end })?.trim()
        return length
            ? preview?.substring(0, length)
            : preview
    } else {
        const preview = previewForPath(booq.nodes, path ?? [], length)
        return preview?.trim()?.substring(0, length)
    }
}

function buildBooqCard(card: LibraryCard, coverSize: number): BooqCardData {
    return {
        id: card.id,
        title: card.title ?? undefined,
        authors: card.authors,
        coverUrl: card.cover
            ? booqImageUrl(card.id, card.cover, coverSize)
            : undefined,
        tags: buildTags(card),
    }
}

function buildTags(card: LibraryCard): BooqMetaTag[] {
    return filterUndefined([
        {
            name: 'pages',
            value: Math.floor(card.length / 1500).toString(),
        },
        ...(card.subjects ?? []).map(s => ({
            name: 'subject',
            value: s ?? undefined,
        })),
        card.language === undefined ? undefined :
            {
                name: 'language',
                value: card.language ?? undefined,
            },
        !card.id.startsWith('pg/') ? undefined :
            {
                name: 'pg-index',
                value: card.id.substring('pg/'.length),
            },
    ])
}