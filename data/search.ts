import { searchBooqs, SearchResult } from '@/backend/library'

export async function fetchSearchQuery(query: string, limit: number = 20): Promise<SearchResult[]> {
    const results = await searchBooqs(query, limit)
    return results
}