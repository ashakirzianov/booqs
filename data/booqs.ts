import { forIds, LibraryCard } from '@/backend/library'
import { filterUndefined } from '@/core'

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
export async function featuredBooqCards(coverSize: number = 210): Promise<BooqCard[]> {
    const ids = [
        'pg/55201',
        'pg/1635',
        'pg/3207',
        'pg/2680',
        'pg/11',
        'pg/1661',
        'pg/98',
        'pg/174',
        'pg/844',
        'pg/203',
        'pg/28054',
        'pg/5740',
        'pg/135',
        'pg/1727',
        'pg/4363',
    ]
    const cards = filterUndefined(await forIds(ids))
        .map(card => ({
            id: card.id,
            title: card.title,
            author: card.author,
            cover: card.cover
                ? booqImageUrl(card.id, card.cover, coverSize)
                : undefined,
            tags: buildTags(card),
        }))
    return filterUndefined(cards)
}

const bucket = 'booqs-images'
// const coverSizes = [60, 120, 210]
function booqImageUrl(booqId: string, src: string, size?: number) {
    const base = `https://${bucket}.s3.amazonaws.com/${booqId}/${src}`
    return size ? `${base}@${size}` : base
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