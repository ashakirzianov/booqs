import {
    Booq, BooqPath, filterUndefined, previewForPath, textForRange,
    BooqFragment, buildFragment,
    TableOfContentsItem,
} from '@/core'
import { booqImageUrl } from '@/backend/images'
import { booqForId, libraryCardsForIds, LibraryCard, featuredBooqIds, booqsForAuthor } from '@/backend/library'
import { userCollection, userForId } from '@/backend/users'

export type Tag = {
    tag: string,
    value?: string,
}
export type BooqCard = {
    id: string,
    title?: string,
    author?: string,
    cover?: string,
    tags: Tag[],
}
export type BooqPreview = {
    id: string,
    title: string,
    preview: string,
}
export type BooqPartData = {
    id: string,
    length: number,
    toc: TableOfContentsItem[],
    fragment: BooqFragment,
}

export async function featuredIds() {
    return featuredBooqIds()
}

export async function featuredBooqCards(coverSize: number = 210): Promise<BooqCard[]> {
    const ids = await featuredIds()
    const cards = filterUndefined(await libraryCardsForIds(ids))
        .map(card => buildBooqCard(card, coverSize))
    return filterUndefined(cards)
}

export async function booqCardsForAuthor(author: string): Promise<BooqCard[]> {
    const cards = await booqsForAuthor(author)
    return cards.map(card => buildBooqCard(card, 210))
}

export async function booqCollection(collection: string, userId: string | undefined): Promise<BooqCard[]> {
    if (!userId) {
        return []
    }
    const user = await userForId(userId)
    if (!user) {
        return []
    }
    const ids = userCollection(user, collection)
    const cards = filterUndefined(await libraryCardsForIds(ids))
    return cards.map(card => buildBooqCard(card, 210))
}

export async function booqCard(booqId: string) {
    const [card] = await libraryCardsForIds([booqId])
    return card
}

export async function booqPreview(booqId: string, path?: BooqPath, end?: BooqPath, length: number = 500) {
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

export async function booqPart(booqId: string, path?: BooqPath) {
    const card = await booqCard(booqId)
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
        length: card.length,
        fragment,
        toc: booq.toc.items,
    } satisfies BooqPartData
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

function buildBooqCard(card: LibraryCard, coverSize: number) {
    return {
        id: card.id,
        title: card.title,
        author: card.author,
        cover: card.cover
            ? booqImageUrl(card.id, card.cover, coverSize)
            : undefined,
        tags: buildTags(card),
    }
}

function buildTags(card: LibraryCard): Tag[] {
    return filterUndefined([
        {
            tag: 'pages',
            value: Math.floor(card.length / 1500).toString(),
        },
        ...(card.subjects ?? []).map(s => ({
            tag: 'subject',
            value: s,
        })),
        card.language === undefined ? undefined :
            {
                tag: 'language',
                value: card.language,
            },
        !card.id.startsWith('pg/') ? undefined :
            {
                tag: 'pg-index',
                value: card.id.substring('pg/'.length),
            },
    ])
}