import { booqImageUrl } from '@/backend/images'
import { searchBooqs, } from '@/backend/library'
import { AuthorSearchResult, BooqSearchResult, SearchResult } from '@/core'

export type SearchResultClient = AuthorSearchResultClient | BooqSearchResultClient
export type AuthorSearchResultClient = AuthorSearchResult
export type BooqSearchResultClient = Omit<BooqSearchResult, 'coverSrc'> & {
    coverUrl: string | undefined,
}
export async function fetchSearchQuery(query: string, limit: number = 20): Promise<SearchResultClient[]> {
    const results = await searchBooqs(query, limit)
    return results.map(toClientSearchResult)
}

export function toClientSearchResult(result: SearchResult): SearchResultClient {
    if (result.kind === 'booq') {
        const { coverSrc, ...rest } = result
        return {
            ...rest,
            coverUrl: coverSrc
                ? booqImageUrl(rest.id, coverSrc)
                : undefined,
        }
    } else {
        return result
    }
}