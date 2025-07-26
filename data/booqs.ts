'use server'
import {
    BooqPath, buildFragment,
    BooqId,
    BooqMetadata,
    TableOfContents,
    BooqFragment,
} from '@/core'
import { libraryCardsForIds, featuredBooqIds, queryLibrary } from '@/backend/library'
import { userForId } from '@/backend/users'
import { booqIdsInCollections } from '@/backend/collections'
import { booqForId, booqPreview, booqToc } from '@/backend/booq'
import { getExtraMetadataValues } from '@/core/meta'

export type PartialBooqData = {
    booqId: BooqId,
    fragment: BooqFragment,
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

export async function booqCardsForQuery({
    kind, query, libraryId, limit, offset,
}: {
    kind: 'author' | 'subject' | 'language',
    libraryId: string,
    query: string,
    limit: number,
    offset?: number,
}): Promise<{ cards: BooqCardData[], hasMore: boolean, total?: number }> {
    const { cards, hasMore, total } = await queryLibrary(libraryId, {
        kind,
        query,
        limit,
        offset,
    })
    return {
        cards: cards.map(card => buildBooqCardData(card.booqId, card.meta)),
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
    coverSrc: string | undefined,
}

export async function booqSearch({ query, libraryId, limit = 20, offset }: { query: string, libraryId: string, limit?: number, offset?: number }): Promise<SearchResultData[]> {
    const results = await queryLibrary(libraryId, {
        kind: 'search',
        query,
        limit,
        offset,
    })
    return results.cards.map(result => {
        return {
            kind: 'booq',
            booqId: result.booqId,
            title: result.meta.title,
            authors: result.meta.authors.map(author => author.name),
            coverSrc: result.meta.coverSrc,
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

function buildBooqCardData(booqId: BooqId, meta: BooqMetadata): BooqCardData {
    const subjects = getExtraMetadataValues('subject', meta.extra)
    const languageCodes = getExtraMetadataValues('language', meta.extra)
    const languages: LanguageInfo[] = languageCodes.map(code => ({
        code,
        name: getLanguageDisplayName(code),
    }))

    return {
        booqId,
        title: meta.title,
        authors: meta.authors.map(author => author.name),
        subjects,
        languages,
        coverSrc: meta.coverSrc,
    }
}