import { queryLibrary } from '@/backend/library'
import { BooqId } from '@/core'

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
// TODO: rename
export async function fetchSearchQuery(query: string, limit: number = 20): Promise<SearchResultData[]> {
    const results = await queryLibrary('pg', {
        kind: 'search',
        query,
        limit,
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