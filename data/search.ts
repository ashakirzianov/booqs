import { searchBooqs } from '@/backend/library'

export type LibrarySearchResult = LibraryBooqSearchResult | LibraryAuthorSearchResult
export type LibraryBooqSearchResult = {
    kind: 'book',
    id: string,
    title: string | undefined,
    authors: string[],
    coverUrl: string | undefined,
}
export type LibraryAuthorSearchResult = {
    kind: 'author',
    name: string,
}
export async function fetchSearchQuery(query: string, limit: number = 20): Promise<LibrarySearchResult[]> {
    const results = await searchBooqs(query, limit)
    return results.map(result => {
        if (result.kind === 'book') {
            return {
                kind: 'book' as const,
                id: result.card.id,
                title: result.card.title,
                authors: result.card.authors,
                coverUrl: result.card.coverUrl,
            }
        } else if (result.kind === 'author') {
            return {
                kind: 'author' as const,
                name: result.author.name,
            }
        } else {
            return undefined
        }
    }).filter(a => a !== undefined)
}