import { searchBooqs } from '@/backend/library'

export type LibrarySearchResult = LibraryBooqSearchResult | LibraryAuthorSearchResult
export type LibraryBooqSearchResult = {
    kind: 'book',
    title: string | null,
    authors: string[],
    cover: string | null,
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
                title: result.card.title,
                authors: result.card.authors,
                cover: result.card.cover,
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