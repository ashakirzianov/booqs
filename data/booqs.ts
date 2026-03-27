'use server'
import {
    BooqPath, buildChapter,
    BooqId,
    BooqMetadata,
    BooqStyles,
    TableOfContents,
    BooqChapter,
    BooqRange,
    BooqNode,
    getExpandedRange,
    nodesForRange,
    collectReferencedStyles,
} from '@/core'
import { userForId } from '@/backend/users'
import { booqIdsInCollections } from '@/backend/collections'
import { BooqData, booqDataForIds, booqForId, booqPreview, booqQuery, booqToc, featuredBooqIds } from '@/backend/library'

export type PartialBooqData = {
    booqId: BooqId,
    chapter: BooqChapter,
    meta: BooqMetadata,
    toc: TableOfContents,
}

export type LanguageInfo = {
    code: string,
    name: string,
}

export type BooqCardData = {
    booqId: BooqId,
    title: string,
    authors: string[],
    subjects: string[],
    languages: LanguageInfo[],
    coverSrc: string | undefined,
}


export type BooqDetailedData = BooqCardData & {
    toc: TableOfContents,
}

export async function featuredIds() {
    return featuredBooqIds()
}

export async function featuredBooqCards(): Promise<BooqCardData[]> {
    const ids = await featuredIds()
    const cards = (await booqDataForIds(ids))
        .filter(card => card !== undefined)
        .map(card => buildBooqCardData(card))
    return cards
}

export async function booqCardsForQuery({
    kind, query, libraryId, limit, offset,
}: {
    kind: 'author' | 'subject' | 'language',
    libraryId: string,
    query: string,
    limit: number,
    offset?: number,
}): Promise<{ cards: BooqCardData[], hasMore: boolean, total?: number }> {
    const { cards, hasMore, total } = await booqQuery(libraryId, {
        kind,
        query,
        limit,
        offset,
    })
    return {
        cards: cards.map(card => buildBooqCardData(card)),
        hasMore,
        total,
    }
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
    const cards = (await booqDataForIds(ids))
        .filter(card => card !== undefined)
        .map(card => buildBooqCardData(card))
    return cards
}

export async function booqCard(booqId: BooqId): Promise<BooqCardData | undefined> {
    const [card] = await booqDataForIds([booqId])
    if (undefined === card) {
        return undefined
    }

    return buildBooqCardData(card)
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
    booqId, path,
}: {
    booqId: BooqId,
    path?: BooqPath,
}): Promise<PartialBooqData | undefined> {
    const [card] = await booqDataForIds([booqId])
    if (card === undefined) {
        return undefined
    }
    const booq = await booqForId(booqId)
    if (booq === undefined) {
        return undefined
    }
    const chapter = buildChapter({ booq, path })

    return {
        booqId,
        chapter,
        toc: booq.toc,
        meta: booq.metadata,
    } satisfies PartialBooqData
}

export async function fetchBooqChapter(booqId: BooqId, path?: BooqPath) {
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }
    const chapter = buildChapter({ booq, path })
    return {
        chapter,
        metadata: booq.metadata,
        toc: booq.toc,
    }
}


// Search types and utilities
export type SearchResultData = AuthorSearchResultData | BooqSearchResultData
export type AuthorSearchResultData = {
    kind: 'author',
    name: string,
}
export type BooqSearchResultData = {
    kind: 'booq',
    booqId: BooqId,
    title: string,
    authors?: string[],
    coverSrc?: string,
}

export async function booqSearch({ query, libraryId, limit = 20, offset }: { query: string, libraryId: string, limit?: number, offset?: number }): Promise<SearchResultData[]> {
    const results = await booqQuery(libraryId, {
        kind: 'search',
        query,
        limit,
        offset,
    })
    return results.cards.map(result => {
        return {
            kind: 'booq',
            booqId: result.booqId,
            title: result.title,
            authors: result.authors,
            coverSrc: result.coverSrc,
        }
    })
}

export async function fetchLanguageDisplayName(languageCode: string): Promise<string> {
    return getLanguageDisplayName(languageCode)
}

function getLanguageDisplayName(languageCode: string): string {
    const languageNames: Record<string, string> = {
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'ko': 'Korean',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
        'pl': 'Polish',
        'cs': 'Czech',
        'hu': 'Hungarian',
        'tr': 'Turkish',
        'he': 'Hebrew',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'id': 'Indonesian',
        'ms': 'Malay',
        'tl': 'Filipino',
        'uk': 'Ukrainian',
        'bg': 'Bulgarian',
        'hr': 'Croatian',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'ro': 'Romanian',
        'et': 'Estonian',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'mt': 'Maltese',
        'ga': 'Irish',
        'cy': 'Welsh',
        'is': 'Icelandic',
        'mk': 'Macedonian',
        'sq': 'Albanian',
        'sr': 'Serbian',
        'bs': 'Bosnian',
        'me': 'Montenegrin',
        'la': 'Latin',
        'eo': 'Esperanto',
    }

    return languageNames[languageCode.toLowerCase()] || languageCode
}

export type ExpandedFragment = { nodes: BooqNode[], styles: BooqStyles, range: BooqRange }

export async function fetchExpandedFragmentForRange(booqId: BooqId, range: BooqRange): Promise<ExpandedFragment | undefined> {
    const booq = await booqForId(booqId)
    if (!booq) {
        return undefined
    }

    const expandedRange = getExpandedRange(booq.nodes, range)
    const nodes = nodesForRange(booq.nodes, expandedRange)

    return {
        nodes,
        styles: collectReferencedStyles(nodes, booq.styles),
        range: expandedRange,
    }
}

export async function getExpandedFragments(booqId: BooqId, ranges: BooqRange[]): Promise<Array<ExpandedFragment | undefined>> {
    const booq = await booqForId(booqId)
    if (!booq) {
        return ranges.map(() => undefined)
    }

    return ranges.map(range => {
        const expandedRange = getExpandedRange(booq.nodes, range)
        const nodes = nodesForRange(booq.nodes, expandedRange)

        return {
            nodes,
            styles: collectReferencedStyles(nodes, booq.styles),
            range: expandedRange,
        }
    })
}

function buildBooqCardData(data: BooqData): BooqCardData {
    const languages: LanguageInfo[] = data.languages?.map(code => ({
        code,
        name: getLanguageDisplayName(code),
    })) ?? []

    return {
        booqId: data.booqId,
        title: data.title,
        authors: data.authors,
        subjects: data.subjects ?? [],
        languages,
        coverSrc: data.coverSrc,
    }
}