import { booqImageUrl } from '@/backend/images'
import { searchBooqs, LibrarySearchResult, } from '@/backend/library'
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
    coverUrl: string | undefined,
}
export async function fetchSearchQuery(query: string, limit: number = 20): Promise<SearchResultData[]> {
    const results = await searchBooqs(query, limit)
    return results.map(toClientSearchResult)
}

export function toClientSearchResult(result: LibrarySearchResult): SearchResultData {
    if (result.kind === 'booq') {
        return {
            kind: 'booq',
            booqId: result.booqId,
            title: result.meta.title,
            authors: result.meta.authors.map(author => author.name),
            coverUrl: result.meta.coverSrc
                ? booqImageUrl(result.booqId, result.meta.coverSrc)
                : undefined,
        }
    } else {
        return result
    }
}